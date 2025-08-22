'use client';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className='bg-gradient-to-br from-purple-600 to-blue-500 text-white min-h-screen p-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='text-center mb-12'
      >
        <h1 className='text-4xl md:text-5xl font-bold mb-2'>Get in Touch</h1>
        <p className='text-lg md:text-xl text-white/80'>
          We'd love to hear from you!
        </p>
      </motion.div>

      {/* Contact Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className='grid md:grid-cols-4 gap-6 mb-12'
      >
        <InfoCard
          icon={<Phone />}
          title='Phone'
          text='+963 996 171 681'
        />
        <InfoCard
          icon={<Mail />}
          title='Email'
          text='contact@unijoy.com'
        />
        <InfoCard
          icon={<MapPin />}
          title='Location'
          text='Damascus, Syria'
        />
        <InfoCard
          icon={<Clock />}
          title='Hours'
          text='Sun - Thu, 9AM - 4PM'
        />
      </motion.div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className='bg-white rounded-xl p-6 md:p-10 max-w-4xl mx-auto shadow-lg text-black'
      >
        <h2 className='text-2xl font-bold mb-6 text-center text-purple-700'>
          Send us a Message
        </h2>
        <form className='grid gap-6'>
          <Input
            placeholder='Your Name'
            className='bg-gray-100'
          />
          <Input
            type='email'
            placeholder='Your Email'
            className='bg-gray-100'
          />
          <Textarea
            placeholder='Your Message...'
            className='bg-gray-100'
            rows={5}
          />
          <Button className='bg-gradient-to-r from-purple-600 to-blue-500 text-white w-full hover:opacity-90'>
            Send Message
          </Button>
        </form>
      </motion.div>

      {/* Map + Social Media */}
      <div className='grid md:grid-cols-2 gap-8 mt-16'>
        {/* Map */}
        <div className='rounded-xl overflow-hidden shadow-lg'>
          <iframe
            title='Location'
            src='https://maps.google.com/maps?q=damascus&t=&z=13&ie=UTF8&iwloc=&output=embed'
            className='w-full h-80 border-0'
            loading='lazy'
          ></iframe>
        </div>

        {/* Social Links */}
        <div className='flex flex-col items-center justify-center space-y-6'>
          <h3 className='text-2xl font-semibold'>Follow Us</h3>
          <div className='flex gap-6'>
            <a
              href='#'
              target='_blank'
              className='hover:text-blue-300'
            >
              <Facebook size={28} />
            </a>
            <a
              href='#'
              target='_blank'
              className='hover:text-pink-400'
            >
              <Instagram size={28} />
            </a>
            <a
              href='#'
              target='_blank'
              className='hover:text-blue-400'
            >
              <Twitter size={28} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoCard = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className='bg-white text-black rounded-lg shadow-md p-6 flex flex-col items-center text-center'
  >
    <div className='bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full text-white mb-4'>
      {icon}
    </div>
    <h3 className='font-bold text-lg'>{title}</h3>
    <p className='text-gray-700'>{text}</p>
  </motion.div>
);