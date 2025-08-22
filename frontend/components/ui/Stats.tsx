'use client';
import { User2, UserCheck, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '@/app/(auth)/admin/users/page';

type StatsProps = {
  users: User[];
};

export const Stats = ({ users }: StatsProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-8'
      >
        <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='bg-blue-100 p-3 rounded-full mr-4'>
              <User2 className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <p className='text-gray-500'>Total Users</p>
              <p className='text-2xl font-bold'>{users?.length}</p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='bg-green-100 p-3 rounded-full mr-4'>
              <UserCheck className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <p className='text-gray-500'>Approved Users</p>
              <p className='text-2xl font-bold'>
                {users?.filter((u) => u.hostStatus === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='bg-purple-100 p-3 rounded-full mr-4'>
              <UserX className='h-6 w-6 text-purple-600' />
            </div>
            <div>
              <p className='text-gray-500'>Rejected Users</p>
              <p className='text-2xl font-bold'>
                {users?.filter((u) => u.hostStatus === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
