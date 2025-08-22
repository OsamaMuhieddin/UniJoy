'use client';
import Link from 'next/link';
import Image from 'next/image';
import Container from './Container';
import HeaderMenu from '../home/HeaderMenu';
import MobileMenu from '../home/MobileMenu';
import srcImage from '@/public/images/logo.jpg';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ProfileDropdown } from './ProfileDropdown';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const [profileInfo, setProfileInfo] = useState({});
  const { toast } = useToast();
  const { token, userRole } = useAuth();

  const fetchProfileInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8080/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setProfileInfo(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };
  
  useEffect(() => {
    //fetchProfileInfo();
  }, [profileInfo]);
  return (
    <>
      <div className='bg-white border-b border-b-gray-400 pb-2 relative z-999'>
        <div className='px-4 md:px-11 p-2 h-auto md:h-18 bg-gradient-to-r from-purple-700 to-blue-600 text-black flex flex-wrap items-center justify-between gap-5'>
          <div>
            <Search className='w-5' />
          </div>
          {!token && (
            <Link
              href='/auth/login'
              className='p-3 font-sans font-semibold border-none outline-none rounded-sm hidden md:block'
            >
              Login
            </Link>
          )}
          {userRole == 'admin' && (
            <Link
              href='/admin/dashboard'
              className='p-3 text-base hover:duration-300 font-sans font-semibold hidden md:block'
            >
              Dashboard Admin
            </Link>
          )}
          {userRole == 'host' && (
            <Link
              href='/host/dashboard'
              className='p-3 text-base text-gray-400 hover:text-white hover:duration-300 font-sans font-semibold hidden md:block'
            >
              Dashboard Host
            </Link>
          )}
          {userRole == 'user' && (
            <Link
              href='/user/dashboard'
              className='p-3 text-base text-gray-400 hover:text-white hover:duration-300 font-sans font-semibold hidden md:block'
            >
              Dashboard User
            </Link>
          )}
          <p className='text-base font-sans font-normal text-gray-300 hover:text-white hover:duration-300 flex-1 text-center md:text-start'>
            Booke an event now
          </p>
          <h1 className='text-base font-sans font-normal text-gray-300 text-center md:text-start'>
            Welcome to our platform ...{' '}
            <span className='hover:text-white hover:duration-300 font-semibold'>
              {' '}
              Do you want to know the latest events ?
            </span>
          </h1>
        </div>

        {/* القائمة الرئيسية */}
        <Container className='flex flex-wrap items-center justify-between gap-5 text-lightColor'>
          {/* Logo */}
          <div className='flex justify-center md:justify-start items-center ms-2 lg:ms-4'>
            <Image
              width={90}
              height={50}
              src={srcImage}
              alt='logo'
            />
            <h1 className='text-purple-800 font-bold text-xl lg:text-3xl text-center md:text-end'>
              UniJoy
              <br />
            </h1>
          </div>

          {/* قائمة التنقل الرئيسية */}
          <div className='w-full md:w-auto flex flex-1 justify-center md:justify-end lg:gap-4'>
            <HeaderMenu />
          </div>

          {/* القائمة الجانبية للجوال */}
          <div className='block md:hidden'>
            <MobileMenu />
          </div>
          {/* Login and registration buttons based on role and login status */}
          <div className='w-auto flex items-center justify-end md:gap-5 lg:gap-6'>
            {token ? (
              <ProfileDropdown
                user={{ name: 'John Doe' }}
                userRole={`${userRole}`}
                //user={{ name: profileInfo.name, profileImage: '/avatar.jpg' }}
              />
            ) : (
              <>
                <Link
                  href='/auth/login'
                  className=' hidden md:block bg-gradient-to-r from-blue-500 to-purple-600 text-white md:px-6 py-3 px-4 sm:py-2 text-base md:text-sm lg:text-lg border-none rounded-lg transition-all duration-300'
                >
                  Login
                </Link>
                <Link
                  href='/auth/signup/user'
                  className=' hidden md:block bg-white px-4 py-2 text-base md:text-sm lg:text-lg font-semibold border-2 rounded-lg hover:bg-gray-200 text-black/80 transition-all duration-300'
                >
                  Register User
                </Link>
              </>
            )}
          </div>
        </Container>
      </div>
    </>
  );
};
export default Header;
