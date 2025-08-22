'use client';
import { Button } from '@/components/ui/button';
import { CalendarDays, Locate, Ticket } from 'lucide-react';
import Image from 'next/image';
import { EventCategory } from '@/types/type';
import { UserRole } from '@/context/AuthContext';
const EventDetails = ({
  event,
  userRole,
}: {
  event: EventCategory;
  userRole: UserRole;
  }) => {
  const src = `/${event?.image?.replace(/\\/g, '/')}`;
  return (
    <div className='min-h-screen bg-white'>
      {/* القسم العلوي */}
      <section className='bg-gradient-to-r from-pink-500 to-purple-700 text-white py-10 px-6'>
        <div className='max-w-7xl mx-auto flex flex-col lg:flex-row items-center'>
          <div className='w-full lg:w-1/2'>
            <Image
              src={`${src}`}
              alt={event.title}
              width={600}
              height={400}
              className='rounded-md'
              priority
            />
            {!event.price && (
              <span className='inline-block mt-4 bg-purple-800 text-white text-xs px-3 py-1 rounded'>
                FREE
              </span>
            )}
          </div>
          <div className='w-full lg:w-1/2 mt-6 lg:mt-0 lg:pl-12'>
            <h1 className='text-3xl font-bold mb-4'>{event.title}</h1>
            <p className='mb-4 text-sm'>{event.description}</p>
            <ul className='space-y-2 mb-6 text-sm'>
              <li className='flex items-center'>
                <Locate className='w-4 h-4 mr-2' />
                Location: {event.location}
              </li>
              <li className='flex items-center'>
                <CalendarDays className='w-4 h-4 mr-2' />
                Date: {event.date}
              </li>
              <li className='flex items-center'>
                <Ticket className='w-4 h-4 mr-2' />
                Entry:{' '}
                {!event.price ? 'Absolutely FREE for all!' : 'Paid Entry'}
              </li>
            </ul>

            {userRole === 'user' && (
              <div className='flex gap-4'>
                <Button variant='default'>Register Event</Button>
                <Button className='bg-purple-700 hover:bg-purple-800'>
                  Learn More
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* تفاصيل الحدث */}
      <section className='px-6 py-12 max-w-4xl mx-auto'>
        <h2 className='text-2xl font-bold mb-6'>More Details</h2>
      </section>
    </div>
  );
};

export default EventDetails;
