'use client';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  University,
  User,
  Flame,
  Rocket,
  ChevronLeft,
  ChevronRight,
  List,
  Download,
  School2Icon,
  Clock3,
  Gift,
  DollarSign,
  Search,
  Calendar1,
  Building,
  Type,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from '@/components/ui/EventCard';
import { EventCategory } from '@/types/type';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import Decorations from '@/components/ui/Decorations';

const filters = [
  { label: 'All', icon: School2Icon },
  { label: 'Upcoming', icon: Flame },
  { label: 'Past', icon: Clock3 },
  { label: 'Free', icon: Gift },
  { label: 'Price', icon: DollarSign },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3,
    },
  },
};

const AllEventsPage = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [events, setEvents] = useState<EventCategory[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  // const [isLoading, setIsLoading] = useState(true);
  // حالة Pagination الجديدة

  const [currentPage, setCurrentPage] = useState(1); // حالة Pagination الجديدة
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [eventsPerPage] = useState(6); // عدد الأحداث في كل صفحة
  //const [loading, setLoading] = useState(false);

  const generateReport = (event: EventCategory) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Booking Invoice', 20, 20);

    doc.setFontSize(12);
    doc.text(`Student Name: Test User`, 20, 40);
    doc.text(`Student Email: test@example.com`, 20, 50);

    doc.text(`Event Name: ${event.title}`, 20, 70);
    doc.text(`Location: ${event.location}`, 20, 80);
    doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 20, 90);

    doc.text(`Booking ID: #${event.registeringId || '123456'}`, 20, 110);
    doc.text('Thank you for booking with us!', 20, 130);

    doc.save(`Invoice-${event.title}.pdf`);
  };
    const fetchEvents = async () => {
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
          `http://localhost:8080/host/events?page=${currentPage}&perPage=${eventsPerPage}&type=${filterType}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await res.json();
        setEvents(data.events);
        console.log(data.events);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
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
      }
    };
    useEffect(() => {
      if (token) {
        fetchEvents();
      }
    }, [activeFilter, currentPage, token]);
  
  // تصفية الأحداث
  const currentEvents = (events || [])?.filter((event) => {
    const matchesSearch = event.title?.toLowerCase()
      .includes(debouncedQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'upcoming' && event.status === 'upcoming') ||
      (activeFilter === 'past' && event.status === 'past') ||
      (activeFilter === 'pending' && event.status === 'pending') ||
      (activeFilter === 'approved' && event.status === 'approved') ||
      (activeFilter === 'rejected' && event.status === 'rejected');

    return matchesSearch && matchesFilter;
  });

  // تغيير الصفحة
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // إعادة تعيين الصفحة إلى 1 عند تغيير الفلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);
    <main className='bg-white min-h-screen relative overflow-hidden'>
      <div className='max-w-6xl mx-auto px-4 relative'>
        {/* Controls */}
        <motion.div
          className='flex flex-col lg:flex-row gap-4 items-stretch my-8'
          variants={itemVariants}
        >
          {/* Search Input */}
          <div className='relative flex-1 max-w-full'>
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
        </motion.div>
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
            {currentEvents?.map((event) => {
              return (
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
                        <div className='flex justify-between text-center'>
                          {/* التصنيف */}
                          <div className='flex text-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-400 to-indigo-400'>
                            <span className='text-3xl font-medium'>
                              {event.category?.name}
                            </span>
                          </div>
                        </div>
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
                            <span>Hall: {event.hall?.name}</span>
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
                      </Link>
                      <div className='flex justify-between items-center text-center'>
                        <Button
                          onClick={() => generateReport(event)}
                          className='bg-purple-500 text-white'
                        >
                          <Download size={16} /> Download Report
                        </Button>
                        {/* الأسعار */}

                        {event.price && (
                          <div className='flex flex-wrap gap-2'>
                            <span className='bg-purple-50 text-purple-800 font-medium px-3 py-1 rounded-full text-sm shadow-sm'>
                              {event.price} UE
                            </span>
                          </div>
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
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Pagination Controls */}
        {totalItems >= eventsPerPage && (
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
      <Decorations />
    </main>;
};
export default AllEventsPage;
