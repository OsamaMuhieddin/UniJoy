

"use client"
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, MapPin, Calendar, Ticket, ClipboardList, Monitor, Info, Settings } from 'lucide-react';
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* الصف العلوي */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* شعار ووصف */}
          <div className="lg:col-span-2">
            <div>
              <h1 className="text-3xl font-bold mb-4">Unilevents</h1>
              <p className="text-gray-400 max-w-lg">
                EventsC is a global self-service ticketing platform for live experiences that allows anyone to create, share, find and attend events that fuel their passions and enrich their lives.
              </p>
            </div>
            {/* قسم الخريطة */}
            <div className="mt-10 mb-6">
              <h3 className="flex items-center text-xl font-bold mb-4 text-amber-400">
                <MapPin className="mr-2" /> Our location is in Damascus, Syria
              </h3>

              <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-amber-500/20">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26792.22157071386!2d36.291583!3d33.510583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1518e6dc413cc6a7%3A0x6b9f66ebd1e394f2!2sDamascus%2C%20Syria!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                  aria-label="خريطة دمشق، سوريا"
                />
              </div>
              <p className="mt-2 text-gray-400 text-sm text-center">
                The Syrian capital - the heart of the Middle East
              </p>
            </div>

            {/* حقوق النشر */}

          </div>

          {/* قسم Plan Events */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Plan Events
            </h2>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white flex items-center transition">
                  <Settings className="w-4 h-4 mr-2" />
                  Create and Set Up
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white flex items-center transition">
                  <Ticket className="w-4 h-4 mr-2" />
                  Sell Tickets
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white flex items-center transition">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Online RSVP
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white flex items-center transition">
                  <Monitor className="w-4 h-4 mr-2" />
                  Online Events
                </Link>
              </li>
            </ul>
            {/*SocialMedia icom */}
            <div className="mt-8 flex space-x-4">
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter />
              </Link>
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Facebook />
              </Link>
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram />
              </Link>
            </div>
          </div>

          {/* قسم Eventick */}
          <div>
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Eventick
            </h2>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Press
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Terms
                </Link>
              </li>
              </ul>
            </div>
            {/* قسم Stay In The Loop */}
            <div className="lg:col-start-4 mt-12">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Stay In The Loop
              </h2>
              <p className="text-gray-400 mb-4">
                Join our mailing list to stay in the loop with our newest for Event and concert.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-r-md transition"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* حقوق النشر */}
        <div className="border-t border-gray-800 pt-6 text-center text-gray-400">
          <p>Copyright © 2025 Uni Events</p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;