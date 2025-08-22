import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon | React.ReactNode;
    delay?: number;
}

export const StatCard = ({ title, value, change, icon: Icon, delay = 0 }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold mt-2">{value}</p>
                <span className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                </span>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
                {typeof Icon === 'function' ? <Icon className="w-6 h-6 text-indigo-600" /> : Icon}
            </div>
        </div>
    </motion.div >
);