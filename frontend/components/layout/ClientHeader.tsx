'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/ui/Header';

const ClientHeader = () => {
  const pathname = usePathname();
  const hiddeHeaderPaths = ['/admin', '/host'];
  const shouldhideHeader = hiddeHeaderPaths.some((path) =>
    pathname.startsWith(path)
  );
  if (shouldhideHeader) return null;

  return <Header />;
};

export default ClientHeader;
