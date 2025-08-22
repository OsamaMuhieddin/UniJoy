'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HostThankYouPage() {
  return (
    <motion.div
      className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 px-4 text-white text-center'
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className='bg-white/10 backdrop-blur-md p-10 rounded-xl shadow-lg max-w-xl'
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <CheckCircle
          size={64}
          className='mx-auto mb-4 text-green-300'
        />
        <h1 className='text-3xl font-bold mb-4 text-white'>
          Thanks for Signing Up!
        </h1>
        <p className='text-white/90 text-lg mb-6'>
          Your host account registration was received successfully. Please wait
          for the admin to review and approve your request.
        </p>

        <Link href='/'>
          <Button className='bg-white text-purple-700 hover:bg-gray-200 transition font-semibold'>
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
