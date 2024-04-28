import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export type PropsWithClassName<P = unknown> = P & { className?: string };

export type onCancel = () => void;

export interface WalletConfig {
  address: string
  privateKey: string
}