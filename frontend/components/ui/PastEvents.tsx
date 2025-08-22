'use client';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import EventCard from './EventCard';
import { EventCategory } from '@/types/type';
import { Building, Calendar1, MapPin, Rocket, Type, University, User } from "lucide-react";
import { events } from "@/constants/events";

const PastEvents = () => {

    const [event, setEvents] = useState<EventCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { toast } = useToast();


    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events?type=last`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                const data = await res.json();            
                setEvents(data.event);
            } catch (error: any) {
                // Handle connection errors or unexpected errors.
                toast({
                    title: "Error",
                    description: error?.message || "An unexpected error occurred.",
                    className: "bg-red-600 text-white border-0",
                });
                return;
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* The title and filter buttons  */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Past Events</h2>
                </div>

                {/* Loading or error states */}
                {/* {loading && <p className="text-center text-gray-500">Loading events...</p>}
                {error && <p className="text-center text-red-500">{error}</p>} */}

                {/* Card Network */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* {!loading &&
                        !error && */}
                    <AnimatePresence>
                        {events.slice(3, 6).map((event) =>
                            <motion.div
                                key={event.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                whileHover={{
                                    y: -5,
                                    transition: { type: 'spring', stiffness: 300 }
                                }}
                                className="relative group"
                            >
                                <Link href={`events/${event.id}`}>
                                    <EventCard
                                        event={event}
                                        className="transition-all duration-300 group-hover:shadow-xl
                                        group-hover:shadow-purple-500/20 group-hover:border-cyan-400/30"
                                    >
                                        {/* محتوى البطاقة */}
                                        <div className="p-6 bg-white shadow-xl rounded-2xl space-y-4 hover:shadow-purple-200 transition-all duration-300">

                                            <div className="flex justify-between text-center">
                                                {/* التصنيف */}
                                                <div className="flex text-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-400 to-indigo-400">
                                                    <span className="text-3xl font-medium">{event.category}</span>
                                                </div>
                                            </div>
                                            {/* العنوان والقسم والوقت */}
                                            <div className="flex justify-between items-start gap-4 my-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-800">
                                                        <Type className="w-4 h-4 text-purple-600" />
                                                        <h3 className="text-lg font-bold text-purple-700">{event.title}</h3>
                                                    </div>
                                                    <p className="text-sm text-gray-500">By {event.department}</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm text-gray-500">Time</span>
                                                    <span className="text-xl font-bold text-purple-600">{event.time}</span>
                                                </div>
                                            </div>

                                            {/* الوصف */}
                                            <p className="text-sm my-3 text-gray-600 leading-relaxed">{event.description}</p>

                                            {/* التاريخ والموقع */}
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <Calendar1 className="w-4 h-4 text-purple-500" />
                                                    <span>{event.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-purple-500" />
                                                    <span>Hall: {event.hall}</span>
                                                </div>
                                                {event.status === "approved" ?
                                                    <div className="flex items-center gap-2">
                                                        <University className="w-4 h-4 text-purple-500" />
                                                        <span>Capacity: 10/{event.capacity}</span>
                                                    </div>
                                                    : event.status === "pending" ?
                                                        <div className="flex items-center gap-2">
                                                            <University className="w-4 h-4 text-purple-500" />
                                                            <span>Capacity: {event.capacity}</span>
                                                        </div>
                                                        : <></>

                                                }
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-purple-500" />
                                                    <span>{event.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </EventCard>
                                </Link>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 p-2 bg-purple-600/80 rounded-full
                                    backdrop-blur-sm"
                                >
                                    <Rocket size={18} className="text-cyan-400" />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* زر عرض الكل */}
                <div className="text-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium"
                    >
                        <Link href="/events">See All Events</Link>
                    </motion.button>
                </div>
            </div>
        </section >
    );
};

export default PastEvents;