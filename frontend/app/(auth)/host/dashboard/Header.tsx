'use client';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { ChevronDown, Bell, Search } from 'lucide-react';
import { AdminSidebarProps } from "@/components/sidebars/AdminSidebar";
interface Notification {
    id: number;
    message: string;
    time: string;
    read: boolean;
}

interface HostUser {
    name: string;
    email: string;
    // أضف حقول حسب ما يعيد الباكند
}
const Header = ({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) => {
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hostUser, setHostUser] = useState<HostUser | null>(null);

    // useEffect(() => {
    //     const fetchHostUser = async () => {
    //         try {
    //             const res = await fetch('http://localhost:5000/api/host/me', {
    //                 method: 'GET',
    //                 credentials: 'include', // ضروري لإرسال الكوكي
    //             });

    //             if (!res.ok) {
    //                 throw new Error(`Error ${res.status}`);
    //             }

    //             const data = await res.json();
    //             setHostUser(data);
    //         } catch (error) {
    //             toast({
    //                 title: "Error",
    //                 description: "Something went wrong. Please try again.",
    //                 variant: "destructive",
    //             });
    //         }
    //     };

    //     fetchHostUser();

    //     const timer = setTimeout(() => {
    //         setIsLoading(false);
    //         setNotifications([
    //             { id: 1, message: 'New event needs approval', time: '2 mins ago', read: false },
    //             { id: 2, message: '3 new users registered', time: '1 hour ago', read: true }
    //         ]);
    //     }, 1500);

    //     return () => clearTimeout(timer);
    // }, []);

    return (
        <header className="bg-white shadow-sm z-10 m-4">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 mr-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="relative ml-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <button className="p-2 rounded-full hover:bg-gray-100 relative">
                            <Bell className="text-gray-600 w-5 h-5" />
                            {notifications.some(n => !n.read) && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button></div>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-800 font-medium">
                                {hostUser?.name?.[0] ?? 'H'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {hostUser?.name ?? 'Host'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {hostUser?.email ?? 'YARMOUK'}
                            </p>
                        </div>
                        <ChevronDown className="text-gray-500 w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    )
}
export default Header
