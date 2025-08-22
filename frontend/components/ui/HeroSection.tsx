"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SearchFilter from "@/components/ui/SearchFilter";
import Slider from "../home/Slider";
import { Stars, MoveRight, Ticket } from "lucide-react";
import ImgSrc from "@/public/bg-home.png";
import { useAuth } from "@/context/AuthContext";

export default function HeroSection() {
    const { userRole } = useAuth();
    return (
        <section className="relative h-auto min-h-screen md:h-[80vh] overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -left-[10%] -top-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 blur-xl"
                />

                <motion.div
                    animate={{
                        rotate: [360, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -right-[15%] -bottom-[15%] w-[50%] h-[50%] rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-xl"
                />
            </div>

            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={ImgSrc}
                    alt="Concert Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-blue-900/40" />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col md:flex-row items-center pt-24 md:pt-0 pb-32 md:pb-0">
                {/* Text Content - Left Side */}
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 lg:w-2/3 xl:w-1/2 py-12 md:py-24"
                    >
                        <div className="space-y-4 md:space-y-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-2 text-blue-200"
                            >
                                <Stars className="h-5 w-5 md:h-6 md:w-6" />
                                <span className="text-xs md:text-sm font-semibold tracking-wide">
                                    PREMIUM EVENT EXPERIENCE
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                            >
                                Create Unforgettable
                                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    {" "}Event Experiences
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-base sm:text-lg md:text-xl text-gray-200 max-w-xl"
                            >
                                Discover and organize the most exciting university events. From concerts to workshops - we make event planning magical.
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="flex flex-col sm:flex-row gap-3 sm:gap-4 my-6 md:mt-8"
                            >
                                <Link
                                    href="/events"
                                    className="flex items-center justify-center px-2 py-3 sm:px-8 sm:py-4 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-all duration-300 group text-sm sm:text-base"
                                >
                                    <Ticket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Explore Events
                                    <MoveRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                {userRole === "host" ?
                                    <Link
                                        href="/host/events/create"
                                        className="flex items-center justify-center px-2 py-3 sm:px-8 sm:py-4 bg-transparent border rounded-full text-white transition-all duration-300 group text-sm sm:text-base"
                                    >                                        
                                        Create Event                                        
                                    </Link> :<></>}
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Slider - Right Side (Hidden on mobile) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="hidden md:block absolute right-0 -bottom-20 w-full md:w-1/2 lg:w-1/3 xl:w-1/2 border-transparent h-1/2 md:h-full z-0"
                >
                    <Slider />
                </motion.div>
            </div>

            {/* Search Filter - Positioned differently on mobile vs desktop */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -bottom-5 lg:bottom-0 my-10  left-0 right-0 z-20 px-4"
            >
                <div className="container mx-auto">
                    <SearchFilter className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl rounded-full" />
                </div>
            </motion.div>
        </section>
    );
}