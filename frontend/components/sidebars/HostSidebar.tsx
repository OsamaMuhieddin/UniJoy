'use client';
import Link from 'next/link';
import { AdminSidebarProps } from './AdminSidebar';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const HostSidebar = ({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) => {
  const navItems = [
    { href: '/host/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { href: '/host/events', icon: <CalendarCheck />, label: 'Events' },
  ];
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
    <div className='h-full flex flex-col'>
      {/* العنوان */}
      <div className='p-4 border-b'>
        <h1 className='text-xl font-bold'>UniJoy Host</h1>
      </div>

      {/* عناصر التنقل */}
      <nav className='flex-1 p-4 space-y-2'>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='flex items-center gap-3 p-3 hover:bg-purple-700 rounded-lg'
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* قسم الخروج */}
      <div className='p-4 border-t'>
        <button className='w-full flex items-center gap-3 p-3 hover:bg-purple-700 rounded-lg'>
          <LogOut className='w-5 h-5' />
          <span onClick={handleLogout}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default HostSidebar;
