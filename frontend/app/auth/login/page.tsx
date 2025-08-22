'use client';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import bgImage from '@/public/bg-login.png';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const Login = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth(); // استخدام دالة login من سياق المصادقة
  const [isHovered, setIsHovered] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    try {
      const response = await fetch(`http://localhost:8080/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Login Successful',
          description: data.message || " Thank you for Login",
          className: 'bg-green-600 text-white border-0',
        });
        // Call the login function to update the context
        login(data.role, data.token, data.userId);
        //Direction according to the role
        setTimeout(() => {
          if (data.role === 'user') {
            router.push('/user/dashboard');
          } else if (data.role === 'host') {
            router.push('/host/dashboard');
          } else {
            router.push('/');
          }
        }, 500);
      } else {
        throw Error();
      }
    } catch (error : any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  if (form.formState.isSubmitting) {
    return (
      <div className='flex items-center justify-center h-[70vh]'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500'></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className='flex justify-center items-center min-h-screen px-4'
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className='flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-6xl h-[600px]'
      >
        {/* Left Side - Form */}
        <motion.div
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
          className='w-full md:w-1/2 p-10 flex flex-col justify-center'
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className='text-3xl font-bold text-center text-purple-600 mb-8'>
              Welcome Back
            </h1>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className='relative'
                        >
                          <Mail className='absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400' />
                          <Input
                            placeholder='your@email.com'
                            className='w-full rounded-lg p-3 pr-10 border-2 border-purple-100 focus:border-purple-500 transition-all'
                            {...field}
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className='relative'
                        >
                          <Lock className='absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400' />
                          <Input
                            type='password'
                            placeholder='••••••••'
                            className='w-full rounded-lg p-3 pr-10 border-2 border-purple-100 focus:border-purple-500 transition-all'
                            {...field}
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <motion.button
                  type='submit'
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg transition-all ${
                    form.formState.isSubmitting
                      ? 'opacity-80'
                      : 'hover:shadow-lg'
                  }`}
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <div className='flex items-center justify-center'>
                      <Loader2 className='animate-spin mr-2' />
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </form>
            </Form>

            <div className='mt-6 text-center space-y-3'>
              <motion.div whileHover={{ scale: 1.05 }}>
                <p className='text-sm text-gray-400 mt-4 text-center'>
                  Forgot your password?{' '}
                  <Link
                    href='/auth/reset-password'
                    className='text-purple-400 hover:underline hover:text-purple-500 transition'
                  >
                    Reset it here
                  </Link>
                </p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href='signup/user'
                  className='text-gray-600 hover:text-purple-600 transition-colors text-sm'
                >
                  Don't have an account?{' '}
                  <span className='font-semibold'>Register now</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Image */}
        <motion.div
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
          className='hidden md:block w-1/2 relative overflow-hidden'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            animate={{
              scale: isHovered ? 1.05 : 1,
              opacity: isHovered ? 0.9 : 1,
            }}
            transition={{ duration: 0.5 }}
            className='absolute inset-0'
          >
            <Image
              src={bgImage}
              alt='Modern Purple Background'
              fill
              className='brightness-90 object-cover'
            />
          </motion.div>
          <motion.div
            animate={{
              opacity: isHovered ? 0.7 : 0.8,
            }}
            className='absolute inset-0 bg-gradient-to-br from-purple-900/70 to-indigo-800/70'
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className='absolute inset-0 flex items-center justify-center p-10 text-white'
          >
            <div className='text-center'>
              <motion.h2
                animate={{
                  y: isHovered ? -10 : 0,
                }}
                className='text-4xl font-bold mb-4'
              >
                Welcome
              </motion.h2>
              <motion.p
                animate={{
                  y: isHovered ? 10 : 0,
                }}
                className='text-xl'
              >
                Sign in to discover exciting events
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
