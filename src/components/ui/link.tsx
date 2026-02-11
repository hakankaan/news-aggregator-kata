import { cn } from '@/lib/utils';
import { Link as RouterLink, type LinkProps } from 'react-router';



export const Link = ({ className, children, ...props }: LinkProps) => {
  return (
    <RouterLink
      className={cn('text-primary/80 hover:text-primary', className)}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
