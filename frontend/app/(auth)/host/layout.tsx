'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './dashboard/Header';
import HostSidebar from '@/components/sidebars/HostSidebar';

const HostLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* السايدبار */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="w-64 relative bg-gradient-to-r from-purple-800 to-pink-700 text-white shadow-xl"
                    >
                        <HostSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* المحتوى الرئيسي */}
            <div className="flex-1 overflow-y-auto">
                <Header sidebarOpen={sidebarOpen}  setSidebarOpen={setSidebarOpen}/>
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
};

export default HostLayout;