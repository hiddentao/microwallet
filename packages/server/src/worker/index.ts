import { jobs } from './generated/mappings';
import { JobParams } from './types';
import { bootstrap } from '@/backend/bootstrap';
import { ONE_MINUTE, ONE_SECOND, dateBefore } from '@/shared/date';
import {
  scheduleCronJob,
  getNextPendingJob,
  getTotalPendingJobs,
  markJobAsFailed,
  markJobAsStarted,
  markJobAsSucceeded,
  rescheduleCronJob,
  rescheduleFailedJob,
} from '@/backend/db';
import { serverConfig } from '@/config/server';

const setupDefaultJobs = async (db: any) => {
  // remove old jobs
  await scheduleCronJob(
    db,
    {
      type: 'removeOldWorkerJobs',
      userId: 0,
      autoRescheduleOnFailure: true,
      autoRescheduleOnFailureDelay: ONE_MINUTE,
    },
    '0 * * * * *', // every minute
  );
};

const handleJob = async (params: JobParams): Promise<object | undefined> => {
  if (!jobs[params.job.type]) {
    throw new Error(`Unknown job type: ${params.job.type}`);
  } else {
    return await jobs[params.job.type].run(params);
  }
};

const main = async () => {
  const app = bootstrap({
    processName: 'worker',
    logLevel: serverConfig.WORKER_LOG_LEVEL,
  });
  const { db, log } = app;

  await setupDefaultJobs(db);

  while (true) {
    log.debug('Start next cycle');

    log.debug('Count pending jobs');

    // get total pending jobs
    const pendingJobs = await getTotalPendingJobs(db);

    log.debug(`Pending jobs: ${pendingJobs}`);

    if (pendingJobs) {
      log.debug('Fetch next job');

      const job = await getNextPendingJob(db);

      if (job) {
        if (dateBefore(job.due, Date.now())) {
          const joblog = log.create(
            `job[${job.id} - ${job.type}]${job.cronSchedule ? ' (cron)' : ''}`,
          );

          joblog.debug(`Executing for [user ${job.userId}]`);
          joblog.debug(job.data);

          await markJobAsStarted(db, job.id);

          try {
            const result = await handleJob({ app, log: joblog, job });

            await markJobAsSucceeded(db, job.id, result);

            joblog.debug(`...Finished executing job #${job.id}`);

            if (job.cronSchedule) {
              joblog.debug(`Scheduling next cron job`);

              const newJob = await rescheduleCronJob(db, job);

              joblog.debug(
                `...rescheduled as job #${newJob.id} due at ${newJob.due}`,
              );
            }
          } catch (err: any) {
            joblog.error(`...Error executing job`);
            joblog.error(err);

            await markJobAsFailed(db, job.id, { error: err.message });

            // reschedule?
            if (job.autoRescheduleOnFailure) {
              joblog.debug(`Rescheduling failed job`);

              const newJob = await rescheduleFailedJob(db, job);

              joblog.debug(
                `...rescheduled as job #${newJob.id} due at ${newJob.due}`,
              );
            }
          }
        } else {
          log.debug(
            `Next job is #${job.id} - ${job.type} for user ${job.userId} due at ${job.due}`,
          );
        }
      }
    }

    // wait before next loop
    await new Promise((resolve) => setTimeout(resolve, ONE_SECOND));
  }
};

main().catch((err: any) => {
  console.error(err);
  process.exit(1);
});
