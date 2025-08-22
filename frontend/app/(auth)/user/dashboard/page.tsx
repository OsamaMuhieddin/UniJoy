'use client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCategory } from '@/types/type';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Download,
  Flame,
  Gift,
  Rocket,
  School2Icon,
  Search,
} from 'lucide-react';
import EventCard from '@/components/ui/EventCard';
import Link from 'next/link';
import UnregisterConfirmationDialog from '@/components/dialog/UnregisterConfirmationDialog';
import { useAuth } from '@/context/AuthContext';
import RegisterConfirmationDialog from '@/components/dialog/RegisterConfirmationDialog';

const filters = [
  { label: 'All', icon: School2Icon },
  { label: 'Upcoming', icon: Flame },
  { label: 'Past', icon: Clock3 },
  { label: 'Free', icon: Gift },
  { label: 'Price', icon: DollarSign },
];

const UserDashboard = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [events, setEvents] = useState<EventCategory[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [selectedEvent, setSelectedEvent] = useState<EventCategory | null>(
    null
  );
  const [isUnregisterModalOpen, setIsUnregisterModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [eventsPerPage] = useState(6);
  const [loading, setLoading] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(
    null
  );

  const generateInvoice = async (eventId: string) => {
    if (!token) return;

    setDownloadingInvoice(eventId);
    try {
      const response = await fetch(
        `http://localhost:8080/events/${eventId}/invoice`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${eventId}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Report downloaded',
        description: 'The invoice has been successfully downloaded.',
        className: 'bg-green-500 text-white',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to download invoice',
        className: 'bg-red-600 text-white border-0',
      });
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Filter events
  const currentEvents = (events || []).filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
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
        `http://localhost:8080/users/me/registered-events?page=${currentPage}&perPage=${eventsPerPage}&type=${filterType}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json();

      const updatedEvents = data.events.map((event: EventCategory) => ({
        ...event,
        isRegistered:
          localStorage.getItem(`registered_${event._id}`) === 'true',
      }));

      setEvents(updatedEvents);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      toast({
        title: 'Fetch successfully',
        description: data.message,
        className: 'bg-green-500 text-white',
      });
    } catch (error: any) {
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

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
      if (res.ok) {
        localStorage.removeItem(`registered_${selectedEvent._id}`);
        setEvents((prev) =>
          prev.map((e) =>
            e._id === selectedEvent._id ? { ...e, isRegistered: false } : e
          )
        );
      }
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
    <section className='px-12 py-12'>
      <h1 className='text-2xl font-bold mb-6 text-center text-purple-800'>
        🎉 My Booked Events
      </h1>
      <div className='flex flex-col md:flex-row gap-4 justify-between items-center mb-6'>
        <div className='relative w-full md:w-1/3 my-6'>
          <div className='absolute inset-y-0 left-0 pl-3 py-3 flex items-center pointer-events-none'>
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

        <div className='flex flex-wrap gap-2 justify-center'>
          {filters.map(({ label, icon: Icon }) => {
            const key = label.toLowerCase();
            const isActive = activeFilter === key;
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors
                                ${
                                  isActive
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-purple-700 hover:bg-purple-100'
                                }`}
              >
                <Icon size={18} /> {label}
              </motion.button>
            );
          })}
        </div>
      </div>
      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              className='h-[300px] w-full rounded-xl'
            />
          ))}
        </div>
      ) : currentEvents?.length === 0 ? (
        <p className='text-center text-gray-500 mt-10'>
          You haven't booked any events yet.
        </p>
      ) : (
        <AnimatePresence>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {currentEvents.map((event, index) => (
              <EventCard
                key={event._id}
                event={event}
                className=' relative'
              >
                <div className='p-4 space-y-2'>
                  <Link
                    href={`events/${event._id}`}
                    key={index}
                  >
                    <div className='flex justify-between items-center'>
                      <h3 className='text-xl font-semibold text-purple-700'>
                        {event.title}
                      </h3>
                      {event.price && (
                        <div className='flex gap-2 my-2'>
                          <span className='bg-purple-50 text-purple-800 font-medium px-3 py-1 rounded-full text-sm shadow-sm'>
                            {event.price} UE
                          </span>
                        </div>
                      )}
                    </div>

                    <p className='text-sm text-gray-600'>{event.description}</p>
                    <div className='p-2'>
                      <p className='text-sm text-gray-500'>
                        📅 {new Date(event.date).toLocaleDateString()}
                      </p>
                      <p className='text-sm text-gray-500'>
                        📍 {event.location}
                      </p>
                    </div>
                  </Link>
                  <div className='flex justify-between items-center text-center'>
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
                    {event.price && event.isRegistered ? (
                      <>
                        <Button
                          onClick={() => generateInvoice(event._id)}
                          className='mt-3 bg-purple-500 text-white'
                          disabled={downloadingInvoice === event._id}
                        >
                          {downloadingInvoice === event._id ? (
                            'Downloading...'
                          ) : (
                            <>
                              <Download size={16} /> Download Invoice
                            </>
                          )}
                        </Button>

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
                      </>
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
                </div>
              </EventCard>
            ))}
          </div>
        </AnimatePresence>
      )}
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
      {/* Unregister Confirmation Modal */}
      <UnregisterConfirmationDialog
        open={isUnregisterModalOpen}
        onOpenChange={setIsUnregisterModalOpen}
        onConfirm={() => UnregisterUser()}
        event={selectedEvent}
      />
      <RegisterConfirmationDialog
        open={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
        onConfirm={() => RegisterUser()}
        event={selectedEvent}
      />
    </section>
  );
};

export default UserDashboard;
