"use client";
import { ChevronDown, Mic2, School} from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';

const SearchFilter = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`"bg-white rounded-xl shadow-lg overflow-hidden text-sm hover:shadow-xl transition-shadow" ${className}`}
            >
                <div className="max-w-3xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Date Selector */}
                    <motion.div whileHover={{ scale: 1.02 }} className="relative">
                        <div className="flex items-center bg-white rounded-lg px-4 py-3 border-gray-200">
                            <input type='date' placeholder='Select Event Month' className="w-full appearance-none bg-transparent focus:outline-none" />
                        </div>
                    </motion.div>

                    {/* University Selector */}
                    <motion.div whileHover={{ scale: 1.02 }} className="relative">
                        <div className="flex items-center bg-white rounded-lg px-4 py-3 border-gray-200">
                            <School className="w-5 h-5 text-blue-600 mr-2" />
                            <select className="w-full appearance-none bg-transparent focus:outline-none">
                                <option value="">Select University</option>
                                <option className="flex items-center">University of Mountain</option>
                                <option className="flex items-center">Tech Valley Institute</option>
                                <option className="flex items-center">Metropolitan College</option>
                            </select>
                            <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
                        </div>
                    </motion.div>

                    {/* Event Type Selector */}
                    <motion.div whileHover={{ scale: 1.02 }} className="relative">
                        <div className="flex items-center bg-white rounded-lg px-4 py-3 border-gray-200">
                            <Mic2 className="w-5 h-5 text-pink-600 mr-2" />
                            <select className="w-full appearance-none bg-transparent focus:outline-none">
                                <option value="" className=''>Find Event Type</option>
                                <option className="flex items-center">Music Event</option>
                                <option className="flex items-center">Conference</option>
                                <option className="flex items-center">Workshop</option>
                                <option className="flex items-center">Exhibition</option>
                            </select>
                            <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
                        </div>
                    </motion.div>

                    {/* Search Button */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='flex justify-center'
                    >
                        <button className="w-[70%] h-full text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg px-3 py-1 font-semibold hover:shadow-lg transition-all flex items-center justify-center">
                            Search Events
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}
export default SearchFilter;