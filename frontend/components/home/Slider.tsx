'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react';
import image0 from '@/public/bg-0.png';
import image1 from '@/public/bg-10.png';
import image2 from '@/public/bg-9.png';
import image3 from '@/public/bg-home.png';
import image4 from '@/public/bg-login.png';

const images = [
    image0,
    image1,
    image2,
    image3,
    image4,
];

const Slider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute z-10 inset-0 overflow-hidden">
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000
                        ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <Image
                        src={image}
                        alt={`Slide ${index + 1}`}
                        width={900}
                        height={600}
                        className="z-20 border border-transparent h-[400px] rounded-xl mx-auto my-10"
                        priority // أولوية التحميل
                    />
                </div>
            ))}
        </div>
    );
}

export default Slider;
