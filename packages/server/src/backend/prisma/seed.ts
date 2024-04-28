import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const main = async () => {
  await prisma.$transaction([
    prisma.dapp.deleteMany({}),
    prisma.workerJob.deleteMany({}),
    prisma.notification.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.setting.deleteMany({}),
  ])

  await prisma.dapp.create({
    data: {
      name: 'Test Dapp 1',
      key: 'test-dapp-1',
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(-1)
  })
