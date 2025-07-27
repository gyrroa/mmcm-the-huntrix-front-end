'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 1.1 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [displayedValue, setDisplayedValue] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        let start = 0;
        const end = value;
        const range = end - start;
        const increment = Math.ceil(range / (duration * 60));
        let frame = 0;

        const animate = () => {
            frame++;
            const newVal = Math.min(start + increment * frame, end);
            setDisplayedValue(newVal);
            if (newVal < end) requestAnimationFrame(animate);
        };

        animate();
    }, [isInView, value, duration]);

    return (
        <motion.span
            ref={ref}
            className="inline-block"
            initial={{ y: 10, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            {displayedValue.toLocaleString()}
        </motion.span>
    );
};

export default AnimatedNumber;
