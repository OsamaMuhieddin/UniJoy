'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import {
  CalendarDays,
  MapPin,
  Clock3,
  Users2,
  Download,
  DollarSign,
  Layers3,
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { EventCategory } from '@/types/type';

export default function EventDetailsPage() {
  const params = useParams();
  const { token, userRole } = useAuth();
  const [loading, setLoading]=useState(false);
  const { toast } = useToast();
  const [event, setEvent] = useState<EventCategory>();
  const eventId = params.eventId;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8080/admin/events/${eventId}?`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json();
      setEvent(data.event);
      toast({
        title: 'Fetch successfully',
        description: data.message,
        className: 'bg-green-500 text-white',
      });
    } catch (error: any) {
      // Handle connection errors or unexpected errors.
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred.',
        className: 'bg-red-600 text-white border-0',
      });
    } finally {
      setLoading(false)
    }
  };
    const fetchEventInvoice = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/invoice`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setEvent(data.event);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load event.',
          variant: 'destructive',
        });
      }
  };
  
  useEffect(() => {
    if (token) {
      fetchEvents();
      fetchEventInvoice();
    }
  }, [token]);  


  const generateInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Event Booking Invoice', 20, 20);

    doc.setFontSize(12);
    doc.text(`Event: ${event?.title}`, 20, 40);
    doc.text(`Category: ${event?.category}`, 20, 50);
    doc.text(`Location: ${event?.location}`, 20, 60);
    doc.text(`Start Date: ${event?.startDate}`, 20, 70);
    doc.text(`End Date: ${event?.endDate}`, 20, 80);
    doc.text(`Time: ${event?.time}`, 20, 90);
    doc.text(`Hall: ${event?.hall}`, 20, 100);
    doc.text(`Capacity: ${event?.capacity}`, 20, 110);
    doc.text(`Price: ${event?.price ?? 0} $`, 20, 120);
    doc.text('Thank you for your registration!', 20, 140);

    doc.save(`Invoice-${event?.title}.pdf`);
  };

  if (loading) return <Skeleton className='`h-[70vh] w-full rounded-xl' />;
  if (!event)
    return (
      <p className='text-center mt-10 text-red-600'>
        Event not found or unauthorized access.
      </p>
    );

  return (
    <motion.section
      className='max-w-5xl mx-auto p-6 rounded-xl bg-gradient-to-br from-purple-50 via-white to-purple-100 shadow-xl mt-8 mb-16'
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {' '}
      <motion.div
        className='overflow-hidden rounded-lg mb-8'
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.03 }}
      >
        {' '}
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            width={1200}
            height={600}
            className='rounded-xl w-full max-h-[400px] object-cover'
          />
        ) : (
          <div className='bg-gray-200 w-full h-[300px] flex items-center justify-center'>
            {' '}
            <ImageIcon className='w-10 h-10 text-gray-500' />{' '}
          </div>
        )}{' '}
      </motion.div>
      <h1 className='text-3xl font-bold text-purple-800 mb-2'>{event.title}</h1>
      <p className='text-sm text-gray-600 italic mb-4'>
        Category: {event.category?.name}
      </p>
      <p className='text-gray-700 text-lg mb-6 leading-relaxed'>
        {event.description}
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
        <p className='flex items-center gap-2'>
          <CalendarDays className='text-purple-500' /> Start: {event.startDate}
        </p>
        <p className='flex items-center gap-2'>
          <CalendarDays className='text-purple-500' /> End: {event.endDate}
        </p>
        <p className='flex items-center gap-2'>
          <Clock3 className='text-purple-500' /> Time: {event.time}
        </p>
        <p className='flex items-center gap-2'>
          <MapPin className='text-purple-500' /> Location: {event.location}
        </p>
        <p className='flex items-center gap-2'>
          <Users2 className='text-purple-500' /> Capacity: {event.capacity}
        </p>
        <p className='flex items-center gap-2'>
          <DollarSign className='text-purple-500' /> Price: {event.price ?? 0} $
        </p>
        <p className='flex items-center gap-2'>
          <Layers3 className='text-purple-500' /> Hall: {event.hall?.name}
        </p>
      </div>
      <div className='flex justify-end'>
        <Button
          onClick={generateInvoice}
          className='bg-purple-600 text-white hover:bg-purple-700 gap-2'
        >
          <Download size={18} /> Download Invoice
        </Button>
      </div>
    </motion.section>
  );
}
