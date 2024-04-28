import { FC, useMemo } from 'react';
import { PropsWithClassName, cn } from '../utils';

export const ErrorMessageBox: FC<PropsWithClassName<{ children: any }>> = ({
  className,
  children,
}) => {
  const msg: any = useMemo(() => {
    const c = children as any
    if (c.stack) {
      return <pre>c.stack</pre>
    } else if (c.message) {
      return c.message
    } else {
      return c
    }
  }, [children])

  return (
    <div className={cn('bg-red-300 text-black p-4 rounded-md', className)}>
      {msg}
    </div>
  );
};
