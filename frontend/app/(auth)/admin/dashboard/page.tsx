'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { JSX, useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    Settings,
    LayoutDashboard,
    School,
    CalendarCheck
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { LineChartComponent } from '@/components/ui/LineChartComponent';

interface Notification {
    id: number;
    message: string;
    time: string;
    read: boolean;
}

interface StatItem {
    title: string;
    value: string;
    change: string;
    icon: JSX.Element;
}

interface EventItem {
    id: number;
    name: string;
    date: string;
    organizer: string;
    status: string;
}
const sidebarItems =
    [
        { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, tab: 'dashboard' },
        { name: 'Events', icon: <CalendarCheck className="w-5 h-5" />, tab: 'events' },
        { name: 'Users', icon: <Users className="w-5 h-5" />, tab: 'users' },
        { name: 'Settings', icon: <Settings className="w-5 h-5" />, tab: 'settings' }
    ]
const AdminDashboard = () => {

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const stats: StatItem[] = [
        { title: 'Total Users', value: '2,543', change: '+12%', icon: <Users className="w-5 h-5" /> },
        { title: 'Events This Month', value: '84', change: '+23%', icon: <Calendar className="w-5 h-5" /> },
        { title: 'Universities', value: '12', change: '+2', icon: <School className="w-5 h-5" /> },
        { title: 'Pending Approvals', value: '17', change: '-5', icon: <CalendarCheck className="w-5 h-5" /> }
    ];

    const recentEvents: EventItem[] = [
        { id: 1, name: 'Tech Conference', date: '2023-11-15', organizer: 'Yarmouk University', status: 'Approved' },
        { id: 2, name: 'Art Exhibition', date: '2023-11-20', organizer: 'Damascus University', status: 'Pending' },
        { id: 3, name: 'Science Fair', date: '2023-11-25', organizer: 'Aleppo University', status: 'Approved' }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);


    return (
        <>
            <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                            <div className="p-6">
                                                <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
                                                <p className="opacity-90">Here's what's happening with your platform today.</p>
                                            </div>
                                        </Card>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                                    >
                                        {stats.map((stat, index) => (
                                            <StatCard
                                                key={stat.title}
                                                title={stat.title}
                                                value={stat.value}
                                                change={stat.change}
                                                icon={stat.icon}
                                                delay={index * 0.1}
                                            />
                                        ))}
                                    </motion.div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="lg:col-span-2"
                                        >
                                            <Card>
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-lg mb-4">Event Registrations</h3>
                                                    <div className="h-64">
                                                        <LineChartComponent />
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <Card>
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-lg mb-4">Recent Events</h3>
                                                    <DataTable
                                                        headers={['Event', 'Date', 'Organizer', 'Status']}
                                                        data={recentEvents}
                                                        loading={isLoading}
                                                    />
                                                </div>
                                            </Card>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div >
        </>
    );
};

export default AdminDashboard;