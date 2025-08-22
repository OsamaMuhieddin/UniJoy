'use client';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  University,
  User,
  Search,
  School2Icon,
  Calendar,
  Flame,
  Clock3,
  School,
  DollarSign,
  Sparkles,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Calendar1,
  Building,
  Tag,
  Heading,
  Text,
  Type,
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from '@/components/ui/EventCard';
import { EventCategory } from '@/types/type';
import { useDebounce } from 'use-debounce';
import Link from 'next/link';
import bgImage from '@/public/bg-events.png';
import { Input } from '@/components/ui/input';
import Decorations from '@/components/ui/Decorations';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import RegisterConfirmationDialog from '@/components/dialog/RegisterConfirmationDialog';
import UnregisterConfirmationDialog from '@/components/dialog/UnregisterConfirmationDialog';

const filters = [
  { label: 'All', icon: School2Icon },
  { label: 'Upcoming', icon: Flame },
  { label: 'Past', icon: Clock3 },
  { label: 'University', icon: School },
  { label: 'Price', icon: DollarSign },
];

const FloatingBlobs = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, rotate: 0 }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          rotate: [0, 180, 360],
          x: Math.sin((i * Math.PI) / 2.5) * 100,
          y: Math.cos((i * Math.PI) / 2.5) * 100,
        }}
        transition={{
          duration: 10 + i * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute w-${40 + i * 20} h-${
          40 + i * 20
        } opacity-10 blur-xl
                bg-gradient-to-r ${
                  i % 2
                    ? 'from-pink-400 to-purple-400'
                    : 'from-cyan-400 to-indigo-400'
                }
                rounded-full`}
      />
    ))}
  </>
);

const AllEventsPage = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const { toast } = useToast();
  const { token, userRole } = useAuth();
  const [events, setEvents] = useState<EventCategory[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedEvent, setSelectedEvent] = useState<EventCategory | null>(
    null
  );

  const [isUnregisterModalOpen, setIsUnregisterModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // status new Pagination
  const [currentPage, setCurrentPage] = useState(1); // حالة Pagination الجديدة
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [eventsPerPage] = useState(6); // عدد الأحداث في كل صفحة

  const currentEvents = (events || []).filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(debouncedQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'upcoming' && event.status === 'upcoming') ||
      (activeFilter === 'past' && event.status === 'past') ||
      (activeFilter === 'price' && event.price !== 0);

    return matchesSearch && matchesFilter;
  });

  const fetchEvents = async () => {
    setLoading(true);

    const filterType =
      activeFilter === 'all'
        ? ''
        : activeFilter === 'upcoming'
        ? 'upcoming'
        : activeFilter === 'past'
        ? 'past'
        : '';
    try {
      const res = await fetch(
        `http://localhost:8080/events?page=${currentPage}&perPage=${eventsPerPage}&type=${filterType}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json();
      // تحديث isRegistered من localStorage
      const updatedEvents = data.events.map((event: EventCategory) => ({
        ...event,
        isRegistered:
          localStorage.getItem(`registered_${event._id}`) === 'true',
      }));

      setEvents(updatedEvents);

      // حساب عدد الصفحات يدويًا
      setTotalItems(data.totalItems);
      console.log(data.totalItems);
      const calculatedPages = Math.ceil(data.totalItems / eventsPerPage);
      setTotalPages(calculatedPages);
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
      setLoading(false);
    }
  };
  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [activeFilter, currentPage, token]);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset page to 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

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

      console.log("message",data.message)
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

  // state Loading
  if (loading) {
    return (
      <div className='flex items-center justify-center h-[70vh]'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500'></div>
      </div>
    );
  }

  return (
    <main className='bg-white min-h-screen relative overflow-hidden'>
      <section className='relative flex items-center justify-center h-[60vh] py-20 text-center'>
        <div className='absolute inset-0 z-0'>
          <Image
            src={bgImage}
            alt='Modern Purple Background'
            layout='fill'
            objectFit='cover'
            className='brightness-75'
          />
          <div className='absolute inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/60 to-pink-900/40' />
          <FloatingBlobs />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='relative z-10'
        >
          <motion.h1
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
            }}
            className='text-5xl md:text-7xl font-bold bg-clip-text text-transparent 
                            bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-6'
          >
            All Events
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className='text-xl text-purple-100/90 font-light max-w-2xl mx-auto px-4
                            drop-shadow-lg'
          >
            Discover curated events blending education, networking, and
            entertainment. Explore unique experiences tailored for modern
            enthusiasts.
          </motion.p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='absolute -top-20 -right-20 opacity-20'
          >
            <Sparkles
              size={200}
              className='text-cyan-400 animate-pulse'
            />
          </motion.div>
        </motion.div>
      </section>

      <div className='max-w-6xl mx-auto px-4 py-10 relative'>
        {/* Search Input */}
        <div className='relative flex-1 max-w-full my-8'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Search className='h-5 w-5 text-purple-400' />
          </div>
          <Input
            placeholder='Search events...'
            className='pl-10 pr-4 py-2 rounded-full border border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className='flex flex-wrap justify-center gap-4 mb-14 relative'>
          {filters.map(({ label, icon: Icon }, index) => {
            const filterKey = label.toLowerCase() as typeof activeFilter;
            return (
              <motion.button
                key={label}
                whileHover={{
                  scale: 1.05,
                  background: 'linear-gradient(45deg, #9333ea, #4f46e5)',
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filterKey)}
                className={`relative flex items-center gap-3 px-6 py-3 rounded-full
                                            border-2 backdrop-blur-lg transition-all duration-300
                                            ${
                                              activeFilter === filterKey
                                                ? 'border-purple-500/30 bg-purple-600/20 text-white'
                                                : 'border-white/10 bg-black/95 text-purple-100 hover:bg-purple-500/20'
                                            }`}
                style={{
                  boxShadow:
                    activeFilter === filterKey
                      ? '0 4px 24px -2px rgba(165, 180, 252, 0.3)'
                      : 'none',
                }}
              >
                <Icon
                  size={20}
                  className='text-cyan-400'
                />
                <span className='text-sm font-medium tracking-wide'>
                  {label}
                </span>
                {activeFilter === filterKey && (
                  <motion.div
                    className='absolute -bottom-2 h-1 bg-cyan-400 rounded-full'
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        <div className='flex justify-center text-center'>
          <h1 className='text-3xl font-bold mb-4'>Total events 100</h1>
        </div>
        <motion.div
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
          initial='hidden'
          animate='visible'
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
        >
          <AnimatePresence>
            {currentEvents.map((event, index) => (
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
                <EventCard
                  event={event}
                  className='transition-all duration-300 group-hover:shadow-xl
                                        group-hover:shadow-purple-500/20 group-hover:border-cyan-400/30'
                >
                  {/* محتوى البطاقة */}
                  <div className='p-6 bg-white shadow-xl rounded-2xl space-y-4 hover:shadow-purple-200 transition-all duration-300'>
                    <Link href={`events/${event._id}`}>
                      {/* التصنيف */}
                      <div className='flex items-center gap-2 text-purple-600'>
                        <Tag className='w-4 h-4' />
                        <span className='text-sm font-medium'>
                          {event.category?.name}
                        </span>
                      </div>

                      {/* العنوان والقسم والوقت */}
                      <div className='flex justify-between items-center gap-4'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-gray-800'>
                            <Type className='w-4 h-4 text-purple-600' />
                            <h3 className='text-lg font-bold text-purple-700'>
                              {event.title}
                            </h3>
                          </div>
                        </div>
                        <div className='flex flex-col items-center'>
                          <span className='text-sm text-gray-500'>Time</span>
                          <span className='text-xl font-bold text-purple-600'>
                            {event.time}
                          </span>
                        </div>
                      </div>

                      {/* description */}
                      <p className='text-sm my-4 text-gray-600 leading-relaxed'>
                        {event.description}
                      </p>

                      {/* History */}
                      <div className='flex items-center gap-2'>
                        <Calendar1 className='w-4 h-4 text-purple-500' />
                        <span>{event.date}</span>
                      </div>
                      {/* name Hall */}
                      <div className='flex my-2 items-center gap-2'>
                        <Building className='w-4 h-4 text-purple-500' />
                        <span>
                          <span className='text-purple-600'>Name Hall :</span>{' '}
                          {event.hall?.name}
                        </span>
                      </div>
                      {/* Capacity */}
                      <div className='flex my-2 items-center gap-2'>
                        <University className='w-4 h-4 text-purple-500' />
                        <span>
                          <span className='text-purple-600'>
                            Hall Capacity:
                          </span>{' '}
                          {event.capacity}/50
                        </span>
                      </div>
                      {/* location */}
                      <div className='flex my-2 items-center gap-2'>
                        <MapPin className='w-4 h-4 text-purple-500' />
                        <span>{event.location}</span>
                      </div>
                    </Link>
                    <div className='flex justify-between items-center text-center mt-4'>
                      {userRole === 'user' && (
                        <Button
                          variant='outline'
                          className={`flex items-center gap-2 text-white ${
                            event.isRegistered ? 'bg-red-600' : 'bg-purple-500'
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
                </EventCard>
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
        </motion.div>

        {/* Pagination Controls */}
        {currentEvents?.length >= eventsPerPage && (
          <div className='flex justify-center mt-12'>
            <nav className='flex items-center gap-2'>
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${
                  currentPage === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-purple-500/20'
                }`}
              >
                <ChevronLeft className='text-purple-400' />
              </button>

              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center
                                                ${
                                                  currentPage === index + 1
                                                    ? 'bg-purple-600 text-white'
                                                    : 'text-purple-400 hover:bg-purple-500/20'
                                                } `}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full ${
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-purple-500/20'
                } `}
              >
                <ChevronRight className='text-purple-400' />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Decorations */}
      <Decorations />
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
    </main>
  );
};
export default AllEventsPage;
