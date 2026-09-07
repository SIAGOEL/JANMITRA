import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  status: 'Active' | 'Pending' | 'Closed';
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const styles = {
    Active: 'bg-green-100 text-green-700',
    Pending: 'bg-orange-100 text-orange-700',
    Closed: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={twMerge(clsx('px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit space-x-1', styles[status], className))}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      <span>{status}</span>
    </span>
  );
}
