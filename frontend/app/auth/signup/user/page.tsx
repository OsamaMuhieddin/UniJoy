'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, University, Lock, User, IdCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const studentSchema = z.object({
  name: z.string().min(3, 'Name must contain at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const UserRegisterForm = () => {
  const { toast } = useToast();
  const {setUserId } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (values: z.infer<typeof studentSchema>) => {
    setIsSubmitting(true);
    console.log(values);
    try {
      const response = await fetch(`http://localhost:8080/auth/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify({ ...values, role: 'user' }),
      });

      const data = await response.json();
    
      if (response.ok) {
        toast({
          title: '🎉 Registration Successful!',
          description: data.message,
          className: 'bg-emerald-600 text-white border-0',
        });
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // state Loading
  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[70vh]'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden'>
      {/* Animated background elements */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
        className='absolute w-96 h-96 bg-purple-500/20 rounded-full -top-48 -right-48'
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className='absolute w-64 h-64 bg-pink-500/20 rounded-full -bottom-32 -left-32'
      />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className='flex items-center justify-center min-h-screen'
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className='w-full max-w-md my-14 px-8 py-12 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-xl'
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='flex flex-col items-center mb-10'
            >
              <University className='h-16 w-16 text-white mb-4' />
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='text-3xl font-bold text-white mb-2'
              >
                Student Registration
              </motion.h1>
              <p className='text-white/80'>Join our academic community</p>
            </motion.div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-white/80'>Name</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              placeholder={'Enter your Name'}
                              {...field}
                              className='pl-10 bg-white/5 border-white/20 text-white'
                            />
                            <User className='absolute left-3 top-3 h-4 w-4 text-white/50' />
                          </div>
                        </FormControl>
                        <FormMessage className='text-red-400' />
                      </FormItem>
                    )}
                  />
                </motion.div>

                {['email', 'password'].map((fieldName, index) => (
                  <motion.div
                    key={fieldName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <FormField
                      control={form.control}
                      name={fieldName as keyof typeof studentSchema._type}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-white/80'>
                            {fieldName === 'email'
                              ? 'University Email'
                              : 'Password'}
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Input
                                type={
                                  fieldName === 'password'
                                    ? 'password'
                                    : 'email'
                                }
                                placeholder={
                                  fieldName === 'email'
                                    ? 'student@university.edu'
                                    : '••••••••'
                                }
                                {...field}
                                className='pl-10 bg-white/5 border-white/20 text-white'
                              />
                              {fieldName === 'email' ? (
                                <Mail className='absolute left-3 top-3 h-4 w-4 text-white/50' />
                              ) : (
                                <Lock className='absolute left-3 top-3 h-4 w-4 text-white/50' />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className='text-red-400' />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                ))}

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type='submit'
                    className='w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg font-semibold rounded-xl transition-all'
                  >
                    {form.formState.isSubmitting ? (
                      <div className='flex items-center gap-2'>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className='h-5 w-5 border-2 border-white/50 border-t-transparent rounded-full'
                        />
                        Processing...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </motion.div>

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-white/20'></div>
                  </div>
                  <div className='relative flex justify-center'>
                    <span className='px-4 bg-transparent text-white/60 text-sm'>
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant='outline'
                      className='w-full flex gap-2 items-center'
                      type='button'
                    >
                      <Mail className='h-4 w-4' />
                      <span>Google</span>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant='outline'
                      className='w-full flex gap-2 items-center'
                      type='button'
                    >
                      <Mail className='h-4 w-4' />
                      <span>Gmail</span>
                    </Button>
                  </motion.div>
                </div>

                <p className='text-center text-white/70 text-sm'>
                  Already have an account?{' '}
                  <motion.a
                    href='/auth/login'
                    className='text-purple-400 hover:text-purple-300 underline underline-offset-4'
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign in here
                  </motion.a>
                </p>
                <p className='text-center text-white/70 text-sm'>
                  Are you Host ?{' '}
                  <motion.a
                    href='/auth/signup/host'
                    className='text-purple-400 hover:text-purple-300 underline underline-offset-4'
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign up here
                  </motion.a>
                </p>
              </form>
            </Form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default UserRegisterForm;
