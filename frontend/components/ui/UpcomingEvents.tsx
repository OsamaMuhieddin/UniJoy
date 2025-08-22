'use client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import EventCard from './EventCard';
import { EventCategory } from '@/types/type';
import {
  Building,
  Calendar1,
  MapPin,
  Rocket,
  Type,
  University,
  User,
} from 'lucide-react';
import { Button } from './button';
import { useAuth } from '@/context/AuthContext';
import RegisterConfirmationDialog from '@/components/dialog/RegisterConfirmationDialog';
import UnregisterConfirmationDialog from '@/components/dialog/UnregisterConfirmationDialog';

const UpcomingEvents = () => {
  const [events, setEvents] = useState<EventCategory[]>([]);
  const {userRole} = useAuth();
  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const [isUnregisterModalOpen, setIsUnregisterModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventCategory | null>(
    null
  );

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/events`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      // تحديث isRegistered من localStorage
      const updatedEvents = data.events.map((event: EventCategory) => ({
        ...event,
        isRegistered:
          localStorage.getItem(`registered_${event._id}`) === 'true',
      }));

      setEvents(updatedEvents);
    } catch (error: any) {
      // Handle connection errors or unexpected errors.
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred.',
        className: 'bg-red-600 text-white border-0',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  const RegisterUser = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(
        `http://localhost:8080/users/me/events/${selectedEvent._id}/register`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json();
      toast({
        title: 'Registration successful',
        description: data?.message || 'An unexpected error occurred.',
        className: 'bg-green-500 text-white border-0',
      });
      if (res.ok) {
        localStorage.setItem(`registered_${selectedEvent._id}`, 'true');
        setEvents((prev) =>
          prev.map((e) =>
            e._id === selectedEvent._id ? { ...e, isRegistered: true } : e
          )
        );

        console.log('data url ', data.url);
        // Status events paid
        if (selectedEvent.price !== 0) {
          window.location.href = data.url;
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred.',
        className: 'bg-red-500 text-white border-0',
      });
    }

    setIsRegisterModalOpen(false);
    setSelectedEvent(null);
  };
  const UnregisterUser = async () => {
    if (!selectedEvent) return;

    try {
      const res = await fetch(
        `http://localhost:8080/users/me/events/${selectedEvent._id}/unregister`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await res.json();
      toast({
        title: 'Unregistration successful',
        description: data?.message || 'An unexpected error occurred.',
        className: 'bg-green-500 text-white border-0',
      });

      localStorage.removeItem(`registered_${selectedEvent._id}`);
      setEvents((prev) =>
        prev.map((e) =>
          e._id === selectedEvent._id ? { ...e, isRegistered: false } : e
        )
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred.',
        className: 'bg-red-500 text-white border-0',
      });
    }

    setIsUnregisterModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <section className='py-12 bg-gray-50'>
      <div className='container mx-auto px-4'>
        {/* The title and filter buttons  */}
        <div className='flex flex-col md:flex-row justify-between items-center mb-8'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4 md:mb-0'>
            Upcoming Events
          </h2>
        </div>

        {/* Card Network */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
          {/* {!loading &&
                        !error && */}
          <AnimatePresence>
            {events.slice(0, 6).map((event, index) => (
              <motion.div
                key={event._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{
                  y: -5,
                  transition: { type: 'spring', stiffness: 300 },
                }}
                className='relative group'
              >
                <Link href={`events/${index}`}>
                  <EventCard
                    event={event}
                    className='transition-all duration-300 group-hover:shadow-xl
                                        group-hover:shadow-purple-500/20 group-hover:border-cyan-400/30'
                  >
                    {/* محتوى البطاقة */}
                    <div className='p-6 bg-white shadow-xl rounded-2xl space-y-4 hover:shadow-purple-200 transition-all duration-300'>
                      <div className='flex justify-between text-center'></div>
                      {/* العنوان والقسم والوقت */}
                      <div className='flex justify-between items-start gap-4 my-6'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-gray-800'>
                            <Type className='w-4 h-4 text-purple-600' />
                            <h3 className='text-lg font-bold text-purple-700'>
                              {event.title}
                            </h3>
                          </div>
                        </div>
                        <div className='flex flex-col items-end'>
                          <span className='text-sm text-gray-500'>Time</span>
                          <span className='text-xl font-bold text-purple-600'>
                            {event.time}
                          </span>
                        </div>
                      </div>

                      {/* الوصف */}
                      <p className='text-sm my-3 text-gray-600 leading-relaxed'>
                        {event.description}
                      </p>

                      {/* التاريخ والموقع */}
                      <div className='grid grid-cols-2 gap-2 text-sm text-gray-700'>
                        <div className='flex items-center gap-2'>
                          <Calendar1 className='w-4 h-4 text-purple-500' />
                          <span>{event.date}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Building className='w-4 h-4 text-purple-500' />
                          <span>Hall: 4012</span>
                        </div>
                        {event.status === 'approved' ? (
                          <div className='flex items-center gap-2'>
                            <University className='w-4 h-4 text-purple-500' />
                            <span>Capacity: 10/{event.capacity}</span>
                          </div>
                        ) : event.status === 'pending' ? (
                          <div className='flex items-center gap-2'>
                            <University className='w-4 h-4 text-purple-500' />
                            <span>Capacity: {event.capacity}</span>
                          </div>
                        ) : (
                          <></>
                        )}
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-4 h-4 text-purple-500' />
                          <span>{event.location}</span>
                        </div>
                        <div className='flex justify-between items-center text-center mt-4'>
                          {userRole === 'user' && (
                            <Button
                              variant='outline'
                              className={`flex items-center gap-2 text-white ${
                                event.isRegistered
                                  ? 'bg-red-600'
                                  : 'bg-purple-500'
                              }`}
                              onClick={() => {
                                setSelectedEvent(event);
                                if (event.isRegistered) {
                                  setIsUnregisterModalOpen(true);
                                } else {
                                  setIsRegisterModalOpen(true);
                                }
                              }}
                            >
                              {event.isRegistered ? 'Unregister' : 'Register'}
                            </Button>
                          )}

                          {/* الأسعار */}
                          {event.price && (
                            <div className='flex flex-wrap gap-2'>
                              <span className='bg-purple-50 text-purple-800 font-medium px-3 py-1 rounded-full text-sm shadow-sm'>
                                {event.price} UE
                              </span>
                            </div>
                          )}
                          {event.price ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -15 }}
                              animate={{ scale: 1, rotate: -15 }}
                              className='absolute top-2 left-2 px-3 py-1 bg-red-500/90 rounded-md
                                          backdrop-blur-sm transform skew-x-12 shadow-lg'
                            >
                              <span className='text-white font-bold italic'>
                                PAID
                              </span>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0, rotate: -15 }}
                              animate={{ scale: 1, rotate: -15 }}
                              className='absolute top-2 left-2 px-3 py-1 bg-green-500/90 rounded-md
                              backdrop-blur-sm transform skew-x-12 shadow-lg'
                            >
                              <span className='text-white font-bold italic'>
                                FREE
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </EventCard>
                </Link>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className='absolute top-2 right-2 p-2 bg-purple-600/80 rounded-full
                                    backdrop-blur-sm'
                >
                  <Rocket
                    size={18}
                    className='text-cyan-400'
                  />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* زر عرض الكل */}
        <div className='text-center'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='bg-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium'
          >
            <Link href='/events'>See All Events</Link>
          </motion.button>
        </div>
      </div>
      <RegisterConfirmationDialog
        open={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
        onConfirm={RegisterUser}
        event={selectedEvent}
      />
      <UnregisterConfirmationDialog
        open={isUnregisterModalOpen}
        onOpenChange={setIsUnregisterModalOpen}
        onConfirm={UnregisterUser}
        event={selectedEvent}
      />
    </section>
  );
};

export default UpcomingEvents;
