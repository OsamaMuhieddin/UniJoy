'use client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Ticket,
  Users,
  DollarSign,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  List,
  Flame,
  History,
  Sparkles,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock as PendingIcon,
  Delete,
  Plus,
  Download,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComp } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { EventCategory } from '@/types/type';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/context/AuthContext';

// تعريفات الحركات
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

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
  { label: 'Active', icon: Flame, value: 'active' },
  { label: 'Past', icon: History, value: 'past' },
  { label: 'Pending', icon: PendingIcon, value: 'pending' },
  { label: 'Approved', icon: CheckCircle, value: 'approved' },
  { label: 'Rejected', icon: XCircle, value: 'rejected' },
];

const HostDashboard = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [flag, setFlag] = useState(false);
  const [events, setEvents] = useState<EventCategory[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [eventsPerPage] = useState(6);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventCategory | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [downloadingReportPdf, setdownloadingReportPdfPdf] = useState<string | null>(
    null
  );

  // Function to download invoice
  const downloadingReport = async (eventId: string) => {
    if (!token) return;

    setdownloadingReportPdfPdf(eventId);
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
      setdownloadingReportPdfPdf(null);
    }
  };

  const fetchEvents = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const filterType =
        activeFilter === 'all'
          ? ''
          : activeFilter === 'upcoming'
          ? 'upcoming'
          : activeFilter === 'past'
          ? 'past'
          : '';
      const response = await fetch(
        `http://localhost:8080/host/events?page=${currentPage}&perPage=${eventsPerPage}&type=${filterType}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setEvents(data.events);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);

      if (response.ok) {
        toast({
          title: 'Fetch event Successfully',
          description: data.message || 'Failed to load events',
          className: 'bg-green-500 text-white',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Fetch Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEvents();
      setFlag(true);
    }
  }, [activeFilter, token, currentPage]);

  // تصفية الأحداث
  const currentEvents = events?.filter((event) => {
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

  // إعادة تعيين الصفحة إلى 1 عند تغيير الفلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // تغيير الصفحة
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // إحصائيات الأحداث
  const stats = {
    totalEvents: events?.length || 0,
    upcomingEvents:
      events?.filter((e) => new Date(e.date) > new Date()).length || 0,
    pendingEvents: events?.filter((e) => e.status === 'pending').length || 0,
  };

  const handleCardClick = (event: EventCategory) => {
    setSelectedEvent(event);
  };

  const handleDelete = async () => {
    setLoading(true);
    if (!selectedEvent) return;
    try {
      const response = await fetch(
        `http://localhost:8080/host/events/${selectedEvent._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setEvents(data.events);
      toast({
        title: 'Event Deleted',
        description: data.message,
        className: 'bg-blue-600 text-white border-0',
      });
      const updateEvents = events?.filter((e) => e._id !== selectedEvent._id);
      setEvents(updateEvents);
      setSelectedEvent(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'An unexpected error occurred.',
        className: 'bg-red-500 text-white border-0',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[70vh]'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500'></div>
      </div>
    );
  }

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={containerVariants}
      className='p-4 md:p-6 space-y-6 max-w-7xl mx-auto'
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card className='bg-gradient-to-r from-purple-800 to-pink-700 text-white shadow-xl'>
          <div className='p-6'>
            <motion.h2 className='text-2xl md:text-3xl font-bold mb-2'>
              Welcome back, Host!
            </motion.h2>
            <p className='opacity-90 text-purple-100'>
              Here's what's happening with your events today.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
        variants={containerVariants}
      >
        {[
          {
            title: 'Total Events',
            value: stats.totalEvents,
            icon: Ticket,
            trend: '+12%',
          },
          {
            title: 'Upcoming',
            value: stats.upcomingEvents,
            icon: Calendar,
            trend: '+2',
          },
          {
            title: 'Pending',
            value: stats.pendingEvents,
            icon: PendingIcon,
            trend: '+3',
          },
          {
            title: 'Total Revenue',
            icon: DollarSign,
            trend: '+15%',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
          >
            <Card className='hover:shadow-lg transition-shadow h-full'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-gray-500'>
                  {stat.title}
                </CardTitle>
                <stat.icon className='h-5 w-5 text-purple-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
                <p className='text-xs text-muted-foreground'>
                  {stat.trend} from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Controls */}
      <motion.div
        className='flex flex-col lg:flex-row gap-4 items-stretch my-15'
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

      {/* Events Grid */}
      {currentEvents?.length > 0 ? (
        <>
          <motion.div
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
            variants={containerVariants}
          >
            <AnimatePresence>
              {currentEvents?.map((event) => (
                <motion.div
                  key={event._id}
                  variants={itemVariants}
                  whileHover='hover'
                  className='relative group'
                >
                  <Card className='bg-gradient-to-r from-purple-800 to-pink-700 hover:shadow-lg transition-shadow'>
                    <CardHeader className='pb-3'>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg font-bold'>
                          {event.title}
                        </CardTitle>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            event.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : event.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className='space-y-2'>
                      {/* التاريخ والموقع */}
                      <div className='flex items-center gap-2 text-sm text-white'>
                        <Calendar className='h-4 w-4' />
                        <span>{event.date}</span>
                        <span>{event.time}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-white'>
                        <MapPin className='h-4 w-4' />
                        <span>{event.location}</span>
                      </div>

                      {/* الإجراءات */}
                      <div className='pt-4 flex gap-2 flex-wrap'>
                        <Button
                          className='bg-purple-500 border-none hover:bg-purple-600'
                          variant='outline'
                          size='sm'
                          asChild
                        >
                          <Link href={`/host/events/${event._id}`}>
                            <Eye className='h-4 w-4 mr-2' />
                            View
                          </Link>
                        </Button>

                        <Button
                          variant='outline'
                          size='sm'
                          asChild
                        >
                          <Link href={`/host/events/${event._id}/edit`}>
                            <Edit className='h-4 w-4 mr-2' />
                            Edit
                          </Link>
                        </Button>

                        {/* Download Invoice Button - Only for approved paid events */}
                        {event.status === 'approved' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => downloadingReport(event._id)}
                            disabled={downloadingReportPdf === event._id}
                          >
                            {downloadingReportPdf === event._id ? (
                              'Downloading...'
                            ) : (
                              <>
                                <Download className='h-4 w-4 mr-2' />
                                Report
                              </>
                            )}
                          </Button>
                        )}

                        {/* Delete Button */}
                        <Dialog
                          onOpenChange={(isOpen) =>
                            !isOpen && setSelectedEvent(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() => setSelectedEvent(event)}
                            >
                              <Delete className='h-4 w-4 mr-2' />
                              Delete
                            </Button>
                          </DialogTrigger>

                          <DialogContent className='max-w-md'>
                            <DialogTitle className='text-red-600'>
                              Confirm deletion
                            </DialogTitle>
                            <DialogDescription className='text-gray-600'>
                              Are you sure you want to delete the event{' '}
                              <strong> {selectedEvent?.title}</strong> ?
                              <br />
                              <span className='text-sm text-red-500'>
                                This action cannot be undone once executed ⚠️
                              </span>
                            </DialogDescription>

                            <div className='flex justify-end space-x-2 mt-4'>
                              <DialogClose asChild>
                                <Button variant='outline'>Cancel</Button>
                              </DialogClose>
                              <Button
                                variant='destructive'
                                onClick={handleDelete}
                                disabled={loading}
                              >
                                {loading ? 'Deleting...' : 'Confirm deletion'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {totalItems >= eventsPerPage && (
            <div className='flex justify-center mt-6'>
              <div className='flex items-center gap-1'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }).map(
                  (_, index) => {
                    const pageNumber =
                      totalPages <= 5
                        ? index + 1
                        : currentPage <= 3
                        ? index + 1
                        : currentPage >= totalPages - 2
                        ? totalPages - 4 + index
                        : currentPage - 2 + index;

                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? 'default' : 'outline'
                        }
                        size='sm'
                        onClick={() => paginate(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  }
                )}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className='px-2'>...</span>
                )}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => paginate(totalPages)}
                  >
                    {totalPages}
                  </Button>
                )}

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </>
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
            <Link href='/host/events/create'>Create New Event</Link>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HostDashboard;
