import React, { useEffect, useRef, useState } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface MouseGlowBackgroundProps {
  children: React.ReactNode;
  glowSize?: number;
  glowIntensity?: number;
  glowColor?: string;
}

const MouseGlowBackground: React.FC<MouseGlowBackgroundProps> = ({
  children,
  glowSize = 600,
  glowIntensity = 0.15,
  glowColor = "64, 64, 64"
}) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [delayedMousePosition, setDelayedMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isMouseInside, setIsMouseInside] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMousePosition({ x, y });

        const isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
        setIsMouseInside(isInside);
      }
    };

    const handleMouseLeave = () => {
      setIsMouseInside(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // effet de délai fluide pour la lueur
  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      setDelayedMousePosition(prev => ({
        x: lerp(prev.x, mousePosition.x, 0.08), // facteur de lissage (plus petit = plus de délai)
        y: lerp(prev.y, mousePosition.y, 0.08)
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,20,20,0.5),transparent_50%)]" />

        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-neutral-800/20 rounded-full filter blur-3xl animate-pulse"
                 style={{ animationDelay: '0s', animationDuration: '8s' }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neutral-800/20 rounded-full filter blur-3xl animate-pulse"
                 style={{ animationDelay: '2s', animationDuration: '8s' }} />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neutral-800/10 rounded-full filter blur-3xl animate-pulse"
                 style={{ animationDelay: '4s', animationDuration: '8s' }} />
          </div>
        </div>

        <div
          className="absolute pointer-events-none"
          style={{
            left: `${delayedMousePosition.x}px`,
            top: `${delayedMousePosition.y}px`,
            transform: 'translate(-50%, -50%)',
            opacity: isMouseInside ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <div
            className="rounded-full filter blur-3xl animate-pulse"
            style={{
              width: `${glowSize}px`,
              height: `${glowSize}px`,
              background: `radial-gradient(circle, rgba(${glowColor}, ${glowIntensity}) 0%, transparent 70%)`,
              animation: 'glow 2s ease-in-out infinite'
            }}
          />
        </div>

        <div
          className="absolute pointer-events-none"
          style={{
            left: `${delayedMousePosition.x}px`,
            top: `${delayedMousePosition.y}px`,
            transform: 'translate(-50%, -50%)',
            opacity: isMouseInside ? 0.5 : 0,
            transition: 'opacity 0.5s ease-in-out'
          }}
        >
          <div
            className="rounded-full filter blur-2xl"
            style={{
              width: `${glowSize * 0.5}px`,
              height: `${glowSize * 0.5}px`,
              background: `radial-gradient(circle, rgba(${glowColor}, ${glowIntensity * 0.5}) 0%, transparent 70%)`
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MouseGlowBackground;