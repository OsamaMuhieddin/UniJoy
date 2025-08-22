'use client';
import Head from "next/head";
import { ArrowRight, ArrowLeft, Star, Users, Calendar, Ticket, Search, MoveRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import universityImage from "@/public/images/1 (16).jpg";
import bgImage from "@/public/bg-about.png"

const testimonials = [
    {
        name: "Dr. Ahmed Al-Masri",
        date: "15 June 2024",
        comment: "UniJoy revolutionized how we manage university events. The platform is intuitive and saved us countless hours of organization.",
        rating: 5
    },
    {
        name: "Prof. Sarah Johnson",
        date: "2 July 2024",
        comment: "Our student engagement increased by 40% after using UniJoy for event management. Highly recommended for academic institutions.",
        rating: 4
    },
    {
        name: "Mohammed Kareem",
        date: "10 August 2024",
        comment: "As a student, I love how easy it is to discover and register for events. The interface is clean and user-friendly.",
        rating: 5
    }
];

const About = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const nextTestimonial = () => {
        setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

    const prevTestimonial = () => {
        setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <>
            <Head>
                <title>UniJoy | About Us</title>
                <meta name="description" content="Discover how UniJoy is transforming university event management across Syria." />
                <meta name="keywords" content="university events, event management, Yarmouk Private University, UniJoy" />
                <meta property="og:title" content="About Us | UniJoy" />
                <meta property="og:description" content="Discover how UniJoy is transforming university event management across Syria." />
                <meta property="og:url" content="https://unijoy.com/about" />
            </Head>

            <main className="bg-white text-gray-800">
                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative h-[500px] flex items-center justify-center text-white"
                >
                    {/* الخلفية مع الطبقة الشفافة */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={bgImage}
                            alt="Modern Purple Background"
                            layout="fill"
                            objectFit="cover"
                            className="brightness-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-indigo-900/40" />
                    </div>
                    <div>

                    </div>
                    <div className="max-w-4xl mx-auto px-4 absolute z-1">
                        <motion.h1
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl font-bold mb-4"
                        >
                            About UniJoy
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-lg max-w-2xl mx-auto"
                        >
                            The ultimate platform for exploring and managing university events at Yarmouk Private University and beyond.
                        </motion.p>
                    </div>
                </motion.section>

                {/* What We Offer */}
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto px-4 py-16"
                >
                    <motion.h2 variants={fadeIn} className="text-3xl font-bold text-center mb-12 text-gray-900">
                        Our Platform Features
                    </motion.h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <motion.div
                            variants={fadeIn}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                        >
                            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="text-indigo-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">Event Discovery</h3>
                            <p className="text-gray-600">
                                Explore hundreds of academic, cultural, and social events from Yarmouk and other universities.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={fadeIn}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                        >
                            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <Ticket className="text-purple-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">Easy Registration</h3>
                            <p className="text-gray-600">
                                Secure your spot with just a few clicks. Get instant confirmation and reminders.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={fadeIn}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                        >
                            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <Users className="text-pink-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">Community Building</h3>
                            <p className="text-gray-600">
                                Connect with like-minded students and faculty across different departments.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={fadeIn}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                        >
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <Search className="text-blue-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">Smart Search</h3>
                            <p className="text-gray-600">
                                Advanced filters to find exactly what you're looking for by date, category, or location.
                            </p>
                        </motion.div>
                    </div>
                </motion.section>

                {/* University Partners */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-gray-50 py-16"
                >
                    <div className="max-w-6xl mx-auto px-4">
                        <motion.h2
                            initial={{ y: 20 }}
                            whileInView={{ y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-3xl font-bold text-center mb-12 text-gray-900"
                        >
                            Our University Partners
                        </motion.h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((item) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: item * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white p-6 rounded-xl shadow-md flex items-center gap-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                        <Image
                                            src={universityImage}
                                            alt="Yarmouk Private University"
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Yarmouk Private University</h3>
                                        <p className="text-gray-600 text-sm">Premier educational institution in Syria</p>
                                        <div className="flex mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Testimonials */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="py-16 px-4 max-w-4xl mx-auto"
                >
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">What People Say</h2>

                    <motion.div
                        key={currentTestimonial}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white p-8 rounded-xl shadow-lg relative"
                    >
                        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
                            <button
                                onClick={prevTestimonial}
                                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                            >
                                <ArrowLeft className="text-gray-600" />
                            </button>
                        </div>

                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 italic mb-6 text-lg">
                                "{testimonials[currentTestimonial].comment}"
                            </p>
                            <div>
                                <p className="font-semibold">{testimonials[currentTestimonial].name}</p>
                                <p className="text-gray-500 text-sm">{testimonials[currentTestimonial].date}</p>
                            </div>
                        </div>

                        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
                            <button
                                onClick={nextTestimonial}
                                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                            >
                                <ArrowRight className="text-gray-600" />
                            </button>
                        </div>
                    </motion.div>

                    <div className="flex justify-center mt-6 space-x-2">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentTestimonial(index)}
                                className={`w-3 h-3 rounded-full ${currentTestimonial === index ? 'bg-indigo-600' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                </motion.section>

                {/* CTA Section */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white"
                >
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-6">Ready to Transform Your University Experience?</h2>
                        <p className="text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of students and faculty already using UniJoy to discover and manage university events.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full inline-flex items-center gap-2"
                        >
                            Get Started Now <MoveRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.section>
            </main>
        </>
    );
};

export default About;