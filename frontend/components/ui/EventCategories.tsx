// components/EventCategories.tsx
"use client";
import { Music, Code, Microscope, Theater, Mic2, PartyPopper, CalendarDays, Gamepad } from 'lucide-react';
const categories = [
    { icon: <Music size={28} />, label: "Music Events" },
    { icon: <Code size={28} />, label: "Coding" },
    { icon: <Microscope size={28} />, label: "Science" },
    { icon: <Theater size={28} />, label: "Cultural" }
];

export default function EventCategories() {
    return (
        <section className="py-8 bg-gradient-to-br from-purple-50 to-blue-50"
            style={{ backgroundImage: 'linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)' }}
        >
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"> {categories.map((cat, index) => (<div key={index} className="flex flex-col items-center text-purple-700 hover:text-purple-900 cursor-pointer">
                <div className="mb-2">{cat.icon}</div>
                <p className="font-semibold">{cat.label}</p> </div>
            ))}
            </div>
            <div className="container my-6 mx-auto">
                <div className={`w-full max-w-7xl mx-auto flex flex-wrap justify-center gap-2 sm:gap-4`}>
                    <div className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-200">
                        <Music className="w-5 h-5 text-purple-600 mr-2" />
                        <span>Music Events</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-200">
                        <Mic2 className="w-5 h-5 text-blue-600 mr-2" />
                        <span>Conferences</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-200">
                        <CalendarDays className="w-5 h-5 text-pink-600 mr-2" />
                        <span>Workshops</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-200">
                        <PartyPopper className="w-5 h-5 text-pink-600 mr-2" />
                        <span>Annual Celebration</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-200">
                        <Gamepad className="w-5 h-5 text-pink-600 mr-2" />
                        <span>Games</span>
                    </div>
                </div >
            </div>
        </section >
    );
}