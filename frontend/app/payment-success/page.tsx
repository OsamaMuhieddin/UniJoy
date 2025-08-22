'use client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PaymentSuccessPage = () => {
  const { token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    const confirmPayment = async () => {
      if (!eventId) {
        toast({
          title: 'Payment succeeded',
          description: 'Missing payment session or event ID.',
          className: 'bg-red-600 text-white border-0',
        });
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8080/users/me/events/${eventId}/confirm`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentIntentId: eventId }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error('Failed to confirm registration');
        } else {
          toast({
            title: 'Payment successfully',
            description:
              data.message ||
              '✅ Your payment was successful, and you have been registered for the event!',
            className: 'bg-green-500 text-white',
          });
          //Direction according to the role
          setTimeout(() => {
            router.push('/');
          }, 1500);
        }
      } catch (error: any) {
        toast({
          title: 'Payment succeeded',
          description:
            error?.message ||
            'Payment succeeded, but registration failed. Please contact support.',
          className: 'bg-red-600 text-white border-0',
        });
      }
    };

    if (token) {
      confirmPayment();
    }
  }, [sessionId, eventId,token]);

  return (
    <div className='min-h-screen flex items-center justify-center flex-col text-center p-4'>
      <h1 className='text-3xl font-bold mb-4 text-green-600'>
        Payment Successful
      </h1>
    </div>
  );
};

export default PaymentSuccessPage;
