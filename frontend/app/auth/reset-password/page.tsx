'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('email', typeof email);
  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || ' Thank you for Login',
          className: 'bg-green-600 text-white border-0',
        });
      } else {
        throw Error();
      }
    } catch (error: any) {
      toast({
        title: 'Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className='max-w-md mx-auto my-20 bg-white p-8 rounded-lg shadow-xl border'
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className='text-2xl font-bold mb-6 text-center text-purple-700'>
        Reset Your Password
      </h1>
      <Input
        type='email'
        placeholder='Enter your email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='mb-4'
      />
      <Button
        onClick={handleReset}
        disabled={loading || !email}
        className='w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white'
      >
        {loading ? 'Sending...' : 'Send Reset Email'}
      </Button>
    </motion.div>
  );
}
