'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';

interface InteractiveLogoProps {
  className?: string;
}

export function InteractiveLogo({ className = '' }: InteractiveLogoProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-15, 15]), springConfig);
  
  const eyeX = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), springConfig);
  const eyeY = useSpring(useTransform(mouseY, [-300, 300], [-5, 5]), springConfig);
  
  const distance = useMotionValue(1000);
  const scale = useSpring(useTransform(distance, [0, 300], [1.1, 1]), springConfig);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      mouseX.set(deltaX);
      mouseY.set(deltaY);
      distance.set(dist);
    };
    
    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
      distance.set(1000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, distance]);
  
  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)',
          opacity: useTransform(distance, [0, 400], [0.6, 0.2]),
        }}
      />
      
      <div 
        className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl glow-tinder relative"
        style={{ 
          background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        
        <motion.div
          style={{
            x: eyeX,
            y: eyeY,
            transformStyle: 'preserve-3d',
          }}
        >
          <Lock className="w-10 h-10 text-white drop-shadow-lg" />
        </motion.div>
        
        <div className="absolute top-2 left-4 w-4 h-4 rounded-full bg-white/30 blur-sm" />
      </div>
    </motion.div>
  );
}
