// "use client"
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Stars } from "lucide-react";

const Decorations = () => {
    const [positions, setPositions] = useState<{ left: string; top: string }[]>([]);

    useEffect(() => {
        const generatePositions = () =>
            Array.from({ length: 8 }, () => ({
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100} %`
            }));
        setPositions(generatePositions());
    }, []);

    return (
        <motion.div
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {positions.map((pos, i) => (
                <motion.div
                    key={i}
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 12 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute text-purple-400/20"
                    style={{
                        left: pos.left,
                        top: pos.top,
                    }}
                >
                    <Stars size={48} />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default Decorations;