'use client';
import Link from 'next/link';
import {
    LayoutDashboard,
    CalendarCheck,
    Users,
    Settings,
    LogOut,
    Building2,
    University,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface AdminSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) => {
    const navItems = [
        { href: '/admin/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
        { href: '/admin/events', icon: <CalendarCheck />, label: 'Events' },
        { href: '/admin/hostCategories', icon: <Building2 />, label: 'Host Categories' },
        { href: '/admin/users', icon: <Users />, label: 'Users' },
        { href: '/admin/hall', icon: <University />, label: 'Hall' },
        { href: '/admin/settings', icon: <Settings />, label: 'Settings' }
    ];
      const { logout } = useAuth();
      const handleLogout = () => {
        logout();
      };

    return (
      <div className='h-full flex flex-col'>
        {/* العنوان */}
        <div className='p-4 border-b'>
          <h1 className='text-xl font-bold'>UniJoy Admin</h1>
        </div>

        {/* عناصر التنقل */}
        <nav className='flex-1 p-4 space-y-2'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='flex items-center gap-3 p-3 hover:bg-blue-700 rounded-lg'
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* قسم الخروج */}
        <div className='p-4 border-t'>
          <button className='w-full flex items-center gap-3 p-3 hover:bg-blue-700 rounded-lg'>
            <LogOut className='w-5 h-5' />
            <span onClick={handleLogout}>Logout</span>
          </button>
        </div>
      </div>
    );
};

export default AdminSidebar;