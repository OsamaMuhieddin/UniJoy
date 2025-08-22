'use client';
import { useToast } from '@/hooks/use-toast';
import { getStatusStyle } from './buttonStatus';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle,
  XCircle,
  Clock as PendingIcon,
  Search,
  MapPin,
  University,
  Flame,
  Rocket,
  Stars,
  ChevronLeft,
  ChevronRight,
  Type,
  Calendar1,
  Building,
  List,
  Calendar,
  ShieldCheck,
  Clock,
  X,
  Download,
  Plus,
  Eye,
  Edit,
  Delete,
  Trash2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from '@/components/ui/EventCard';
import { EventCategory } from '@/types/type';
import { useDebounce } from 'use-debounce';
import Link from 'next/link';
import { Calendar as CalendarComp } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jsPDF } from 'jspdf';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/context/AuthContext';
import Decorations from '@/components/ui/Decorations';
import DeleteConfirmationDialog from '@/components/dialog/DeleteConfirmationDialog';

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
// تسميات الفلاتر
const filterLabels = [
  { label: 'All', icon: List, value: 'all' },
  { label: 'Upcoming', icon: Flame, value: 'upcoming' },
  { label: 'Past', icon: History, value: 'past' },
  { label: 'Pending', icon: PendingIcon, value: 'pending' },
  { label: 'Approved', icon: CheckCircle, value: 'approved' },
  { label: 'Rejected', icon: XCircle, value: 'rejected' },
];

const AllEventsPage = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [events, setEvents] = useState<EventCategory[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); // حالة Pagination الجديدة
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [eventsPerPage] = useState(6); // عدد الأحداث في كل صفحة

  const [loading, setLoading] = useState(false);
  const [statusButton, setStatusButton] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventCategory | null>(
    null
  );
  const [downloadingReportpdf, setDownloadingReportpdf] = useState<
    string | null
  >(null);

  // Function to download invoice
  const downloadingReport = async (eventId: string) => {
    if (!token) return;

    setDownloadingReportpdf(eventId);
    try {
      const response = await fetch(
        `http://localhost:8080/reports/event/${eventId}`,
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
        title: 'Invoice downloaded',
        description: 'The invoice has been successfully downloaded.',
        className: 'bg-green-500 text-white',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to download invoice',
        className: 'bg-red-600 text-white border-0',
      });
      console.log(error.message);
    } finally {
      setDownloadingReportpdf(null);
    }
  };

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
        `http://localhost:8080/admin/events?page=${currentPage}&perPage=${eventsPerPage}&type=${filterType}`,
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
      console.log('data.events', data.events);
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
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [activeFilter, currentPage, token]);

  // تصفية الأحداث
  const currentEvents = events?.filter((event) => {
    const matchesSearch = event?.title
      ?.toLowerCase()
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

  const handleStatusChange = async ({
    url,
    method = 'PATCH',
    successMessage = 'Updated successfully',
    onSuccess,
  }: {
    url: string;
    method?: 'PATCH' | 'POST' | 'DELETE';
    successMessage?: string;
    onSuccess?: () => void;
  }) => {
    try {
      setLoading(true);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      toast({
        title: successMessage,
        description: data.message,
        className: 'bg-green-500 text-white',
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };
  const onApprove = () => {
    if (!selectedEvent) return;

    handleStatusChange({
      url: `http://localhost:8080/admin/events/${selectedEvent._id}/approve`,
      method: 'PATCH',
      successMessage: 'The event has been approved.',
      onSuccess: () => {
        setEvents((prev) =>
          prev.map((e) =>
            e._id === selectedEvent._id ? { ...e, status: 'approved' } : e
          )
        );
        setSelectedEvent(null);
      },
    });
  };
  const onReject = () => {
    if (!selectedEvent) return;

    handleStatusChange({
      url: `http://localhost:8080/admin/events/${selectedEvent._id}/reject`,
      method: 'PATCH',
      successMessage: 'The event has been rejected.',
      onSuccess: () => {
        setEvents((prev) =>
          prev.map((e) =>
            e._id === selectedEvent._id ? { ...e, status: 'rejected' } : e
          )
        );
        setSelectedEvent(null);
      },
    });
  };
  // Handle delete
  const handleDelete = (event: EventCategory) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!selectedEvent) return;

    try {
      const res = await fetch(
        `http://localhost:8080/host/events/${selectedEvent._id}`,
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
        title: 'Event Deleted',
        description: data.message,
        className: 'bg-green-600 text-white border-0',
      });
      setEvents((prev) =>
        prev.filter((event) => event._id !== selectedEvent._id)
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred.',
        className: 'bg-red-500 text-white border-0',
      });
    }

    setIsDeleteModalOpen(false);
    setSelectedEvent(null);
  };

  // إعادة تعيين الصفحة إلى 1 عند تغيير الفلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  return (
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

          {/* Filters Tabs */}
          <div className='flex-1 overflow-x-auto'>
            <Tabs
              value={activeFilter}
              onValueChange={(val) => {
                setActiveFilter(val);
                setCurrentPage(1);
              }}
              className='w-full'
            >
              <TabsList className='bg-transparent gap-1 p-1 flex-wrap justify-start w-full'>
                {filterLabels.map(({ label, icon: Icon, value }) => (
                  <TabsTrigger
                    value={value}
                    key={value}
                    className='data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-full px-3 py-1 text-xs md:text-sm md:px-4 md:py-2 transition-all whitespace-nowrap'
                  >
                    <div className='flex items-center gap-1 md:gap-2'>
                      <Icon className='h-3 w-3 md:h-4 md:w-4' />
                      {label}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Calendar Popover */}
          <Popover
            open={isCalendarOpen}
            onOpenChange={setIsCalendarOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='rounded-full gap-2'
              >
                <Calendar className='h-4 w-4' />
                <span>Select Date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='w-auto p-0'
              align='end'
            >
              <CalendarComp
                mode='single'
                selected={date}
                onSelect={(selectedDate) => {
                  setDate(selectedDate);
                  setIsCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {/* Create Event */}
          <Button className='bg-gradient-to-r from-purple-800 to-pink-700'>
            <Plus className='text-white'></Plus>
            <Link href='/create'>Create Events</Link>
          </Button>
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
            {currentEvents?.length > 0 ? (
              currentEvents.map((event) => {
                const statusInfo = getStatusStyle(event.status);
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
                            <div
                              className={`flex items-center gap-2 px-3 text-sm font-medium h-8 rounded-full ${statusInfo.className}`}
                            >
                              {statusInfo.icon}
                              <span>{statusInfo.label}</span>
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
                              <span className='text-sm text-gray-500'>
                                Time
                              </span>
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
                        <div className='flex justify-between text-center mt-4'>
                          {/* Button Approve or Rejected */}
                          <Dialog
                            onOpenChange={(isOpen) =>
                              !isOpen && setSelectedEvent(null)
                            }
                          >
                            <DialogTrigger asChild>
                              {event.status === 'pending' ? (
                                <div className='flex gap-2'>
                                  <Button
                                    size='lg'
                                    asChild
                                    variant='ghost'
                                    onClick={() => setSelectedEvent(event)}
                                  >
                                    <div
                                      className='flex items-center border-1 border-gray-300 gap-2'
                                      onClick={() => setStatusButton('approve')}
                                    >
                                      <X className='h-4 w-4 text-red-600' />
                                      <span>Reject</span>
                                    </div>
                                  </Button>
                                  <Button
                                    size='lg'
                                    asChild
                                    variant='ghost'
                                    onClick={() => setSelectedEvent(event)}
                                  >
                                    <div
                                      className='flex items-center border-1 border-gray-300 gap-2'
                                      onClick={() => setStatusButton('reject')}
                                    >
                                      <ShieldCheck className='h-4 w-4 text-green-700' />
                                      <span>Approve</span>
                                    </div>
                                  </Button>
                                </div>
                              ) : event.status === 'approved' ? (
                                <Button
                                  size='lg'
                                  asChild
                                  variant='ghost'
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  <div className='flex items-center border-1 border-gray-300 gap-2'>
                                    <X className='h-4 w-4 text-red-600' />
                                    <span>Reject</span>
                                  </div>
                                </Button>
                              ) : (
                                <Button
                                  size='lg'
                                  asChild
                                  variant='ghost'
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  <div className='flex items-center border-1 border-gray-300 gap-2'>
                                    <ShieldCheck className='h-4 w-4 text-green-700' />
                                    <span>Approve</span>
                                  </div>
                                </Button>
                              )}
                            </DialogTrigger>

                            <DialogContent className='max-w-md'>
                              <DialogTitle className='text-purple-700 text-lg'>
                                {event.status === 'pending'
                                  ? 'Manage Pending Event'
                                  : 'Confirm status change'}
                              </DialogTitle>

                              <DialogDescription className='text-gray-600 mt-1'>
                                {statusButton === 'approve' ||
                                event.status === 'approved' ? (
                                  <>
                                    Are you sure you want to{' '}
                                    <strong>Rejecte</strong> the event:
                                    <span className='font-semibold text-black'>
                                      {' '}
                                      {selectedEvent?.title}
                                    </span>
                                    ?
                                    <br />
                                    <span className='text-sm text-red-500'>
                                      This action cannot be undone ⚠️
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    Are you sure you want to{' '}
                                    <strong>Approve</strong> the event:
                                    <span className='font-semibold text-black'>
                                      {' '}
                                      {selectedEvent?.title}
                                    </span>
                                    ?
                                    <br />
                                    <span className='text-sm text-green-600'>
                                      This action cannot be undone ⚠️
                                    </span>
                                  </>
                                )}
                              </DialogDescription>

                              <div className='flex justify-end gap-2 mt-4'>
                                <DialogClose asChild>
                                  <Button variant='outline'>Cancel</Button>
                                </DialogClose>

                                {statusButton === 'reject' ||
                                event.status === 'rejected' ? (
                                  <>
                                    <Button
                                      variant='default'
                                      onClick={() => onApprove()}
                                      disabled={loading}
                                    >
                                      {loading ? 'Approving...' : 'Approve'}
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant='destructive'
                                      onClick={() => onReject()}
                                      disabled={loading}
                                    >
                                      {loading ? 'Rejecting...' : 'Reject'}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className='flex justify-between items-center text-center'>
                          {/* Download Invoice Button - Only for approved paid events */}
                          {event.status === 'approved' && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => downloadingReport(event._id)}
                              disabled={downloadingReportpdf === event._id}
                            >
                              {downloadingReportpdf === event._id ? (
                                'Downloading...'
                              ) : (
                                <>
                                  <Download className='h-4 w-4 mr-2' />
                                  Report
                                </>
                              )}
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
                        </div>
                        {/* الإجراءات */}
                        <div className='pt-4 flex gap-2'>
                          <Button
                            className='bg-purple-500 border-none hover:bg-purple-600'
                            variant='outline'
                            size='sm'
                            asChild
                          >
                            <Link href={`/admin/events/${event._id}`}>
                              <Eye className='h-4 w-4 mr-2' />
                              View
                            </Link>
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            asChild
                          >
                            <Link href={`/admin/events/${event._id}/edit`}>
                              <Edit className='h-4 w-4 mr-2' />
                              Edite
                            </Link>
                          </Button>

                          {/* Button Delete with confirm  */}
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleDelete(event)}
                            className='ml-2 text-red-600 hover:bg-red-50'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
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
              })
            ) : (
              <motion.div
                className='text-center py-12 space-y-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className='text-xl font-bold'>No events found</div>
                <p className='text-muted-foreground'>
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create your first event to get started'}
                </p>
                <Button asChild>
                  <Link href='/admin/events/create'>Create New Event</Link>
                </Button>
              </motion.div>
            )}
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

      {/* Decorations */}
      <Decorations />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        user={selectedEvent}
      />
    </main>
  );
};
export default AllEventsPage;
