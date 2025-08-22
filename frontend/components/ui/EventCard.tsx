'use client';
import { motion } from 'framer-motion';
import { EventCategory } from '@/types/type';
import Image from 'next/image';
import { ReactNode } from 'react';

const EventCard = ({
  event,
  children,
  className,
}: {
  event: EventCategory;
  children: ReactNode;
  className: string;
}) => {
  const baseURL = 'http://localhost:8080';
  const src = encodeURI(`${baseURL}/${event?.image?.replace(/\\/g, '/')}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow ${className}`}
    >
      <div className='w-full'>
        <Image
          src={src}
          alt={event?.title}
          className='w-full h-48 object-cover'
          width={400}
          height={300}
        />
      </div>
      {children}
    </motion.div>
  );
};
export default EventCard;
