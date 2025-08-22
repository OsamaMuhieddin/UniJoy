"use clinet"
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Link from "next/link"
import { links } from "@/constants/index";
import SocialMedia from '../ui/SocialMedia';
import { useOutSidClick } from '@/hooks/useOutsideClick';
import { useAuth } from '@/context/AuthContext'

interface Props {
  isOpen: boolean;
  onClose: () => void;
}
const Sidebar = ({ isOpen, onClose }: Props) => {
  const { userRole, isAuthenticated } = useAuth();
  const sidebarRef = useOutSidClick<HTMLDivElement>(onClose);



  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-darkColor/50 shadow-xl hoverEffect
    cursor-auto  w-full ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        ref={sidebarRef}
        className="min-w-60 max-w-72 md:min-w-72 md:max-w-96 bg-purple-700 text-white/70
        h-full p-10 border-r border-r-white-500 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <button className='hover:text-red-500 hoverEffect' onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="flex flex-col gap-3.5 text-base font-semibold tracking-wide">
          {links.map(link =>
            <Link className={`hover:text-white hoverEffect w-28 text-white}`} key={link.id} href={link.url}>
              {link?.title}
            </Link>
          )}
        </div>
        <SocialMedia className='gap-2 md:gap-3.5' />
        {/* Login and registration buttons based on role and login status */}
        <div className="flex flex-col items-start justify-between">
          {isAuthenticated ? (
            <Link
              href="/auth/logout"
              className="text-white px-6 py-3 sm:px-4 sm:py-2 text-base md:text-lg lg:text-xl font-semibold border-none rounded-lg transition-all duration-300"
            >
              Logout
            </Link>
          ) : (
            <>
              {(userRole === "host" || userRole === "user" || userRole === "admin") && (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-base md:text-sm lg:text-lg hover:text-white hoverEffect"
                >
                  Login
                </Link>
              )}
              <Link
                href="/auth/register/host"
                className="px-4 py-2 text-base md:text-sm lg:text-lg hoverEffect hover:text-white"
              >
                Register Host
              </Link>
              <Link
                href="/auth/register/user"
                className="px-4 py-2 text-base md:text-sm lg:text-lg hoverEffect hover:text-white"
              >
                Register User
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Sidebar
