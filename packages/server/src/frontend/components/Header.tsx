import Link from 'next/link';
import { FC } from 'react';
import { PropsWithClassName, cn } from '../utils';
import styles from './Header.module.css';
import { IfAuthenticated } from './IfAuthenticated';
import { NotificationsIndicator } from './Notifications';
import { Logo } from './Svg';

export const Header: FC<PropsWithClassName<{}>> = ({ className }) => {
  return (
    <header
      className={cn(
        'w-screen z-10 flex-0 bg-background flex flex-row place-content-between items-center px-2',
        className,
      )}
    >
      <Link
        href="/"
        aria-label="homepage"
        className="no-anchor-hover-styles clickable"
      >
        <span className={styles.logo_container}>
          <Logo />
        </span>
      </Link>
      <div className="flex flex-row justify-end items-center">
        <IfAuthenticated loginButton={<span />}>
          <NotificationsIndicator />
        </IfAuthenticated>
        <div className="ml-6">Login</div>
      </div>
    </header>
  );
};
