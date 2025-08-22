'use client';
import { Button } from '@/components/ui/button';
import { CalendarDays, Locate, Ticket } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { EventCategory } from '@/types/type';
import { useToast } from '@/hooks/use-toast';
import EventDetails from '@/components/ui/eventDetials';
const EventDetailsPage = () => {
  const params = useParams();
  const { token, userRole } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventCategory>();
  const eventId = params.eventId;

  const fetchEvents = async () => {
    try {
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
    }
  };
  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token]);  
  if (!event) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Event not found
      </div>
    );
  }

  return (
    <EventDetails event={event} userRole={userRole} />
  );
};

export default EventDetailsPage;
