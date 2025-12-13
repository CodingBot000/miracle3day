import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';
import { ReactNode, MouseEvent } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  newWindow?: boolean;
  className?: string;
  onClick?: () => void;
}

export const NavLink = ({
  href,
  children,
  newWindow = false,
  className,
  onClick
}: NavLinkProps) => {
  const { navigate } = useNavigation();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.();
    navigate(href, { newWindow });
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
};
