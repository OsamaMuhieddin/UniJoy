'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function NewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      return toast({
        title: 'Invalid Link',
        description: 'No token provided.',
        variant: 'destructive',
      });
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/new-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, token }),
        }
      );

      const data = await res.json();

      toast({
        title: 'Success',
        description: data.message,
        className: 'bg-green-500 text-white',
      });

      router.push('/auth/login');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 to-blue-500 p-6'>
      {' '}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='bg-white shadow-xl rounded-lg w-full max-w-md p-8'
      >
        {' '}
        <h1 className='text-2xl font-bold text-center text-purple-700 mb-4'>
          {' '}
          🔒 Reset Your Password{' '}
        </h1>{' '}
        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          {' '}
          <Input
            type='password'
            placeholder='Enter new password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className='focus:ring-purple-500'
          />{' '}
          <Button
            type='submit'
            disabled={loading || password.length < 6}
            className='w-full bg-purple-600 hover:bg-purple-700 text-white'
          >
            {' '}
            {loading ? 'Submitting...' : 'Set New Password'}{' '}
          </Button>{' '}
        </form>{' '}
      </motion.div>{' '}
    </section>
  );
}
