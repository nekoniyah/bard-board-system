import React, { useEffect, useState } from 'react';
import { Monitor, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import MouseGlowBackground from './MouseGlowBackground';

interface Particle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  duration: number;
  delay: number;
}

const MobileWarning: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // générer particules aléatoires
    const generateParticle = (id: number): Particle => {
      const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let startX, startY, endX, endY;

      // position de départ sur les bordures
      switch(side) {
        case 0: // top
          startX = Math.random() * 100;
          startY = 0;
          break;
        case 1: // right
          startX = 100;
          startY = Math.random() * 100;
          break;
        case 2: // bottom
          startX = Math.random() * 100;
          startY = 100;
          break;
        case 3: // left
          startX = 0;
          startY = Math.random() * 100;
          break;
        default:
          startX = 0;
          startY = 0;
      }

      // position finale aléatoire
      endX = 20 + Math.random() * 60; // reste au centre (20-80%)
      endY = 20 + Math.random() * 60;

      return {
        id,
        startX,
        startY,
        endX,
        endY,
        size: 3 + Math.random() * 7,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 5
      };
    };

    // créer 30 particules
    const newParticles = Array.from({ length: 30 }, (_, i) => generateParticle(i));
    setParticles(newParticles);

    // régénérer certaines particules périodiquement
    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = [...prev];
        // régénère 5 particules aléatoires
        for (let i = 0; i < 5; i++) {
          const index = Math.floor(Math.random() * updated.length);
          updated[index] = generateParticle(updated[index].id);
        }
        return updated;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MouseGlowBackground glowColor="251, 146, 60" glowIntensity={0.15} glowSize={500}>
      <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
        {/* particules animées avec framer motion */}
        <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}-${particle.startX}-${particle.startY}`}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, rgba(251, 146, 60, 0.8) 0%, rgba(220, 38, 38, 0.6) 50%, transparent 70%)`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(251, 146, 60, 0.4)`
            }}
            initial={{
              left: `${particle.startX}%`,
              top: `${particle.startY}%`,
              opacity: 0,
              scale: 0
            }}
            animate={{
              left: `${particle.endX}%`,
              top: `${particle.endY}%`,
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1.2, 0]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* particules en orbite autour du centre */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`orbit-${i}`}
            className="absolute left-1/2 top-1/2"
            style={{
              width: 4,
              height: 4,
              marginLeft: -2,
              marginTop: -2,
            }}
          >
            <motion.div
              className="absolute rounded-full bg-orange-400/60"
              style={{
                width: 4 + i,
                height: 4 + i,
                boxShadow: `0 0 ${8 + i * 2}px rgba(251, 146, 60, 0.5)`
              }}
              animate={{
                x: [0, 150, 0, -150, 0],
                y: [0, -150, 0, 150, 0],
                scale: [1, 1.5, 1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 20 + i * 3,
                delay: i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* carte principale */}
      <motion.div
        className="relative max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl border border-orange-500/30 shadow-2xl overflow-hidden">
          {/* effet gradient bordure animé */}
          <motion.div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"
            animate={{
              x: ["100%", "-100%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <div className="p-8 text-center space-y-6">
            {/* icône fixe */}
            <div className="relative mx-auto w-24 h-24">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-full blur-lg opacity-40"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full p-5 border border-orange-500/30">
                <Monitor className="w-14 h-14 text-orange-400" />
                <motion.div
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
                  animate={{
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <AlertTriangle className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </div>

            {/* titre */}
            <motion.h2
              className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Version Desktop Requise
            </motion.h2>

            {/* message */}
            <motion.p
              className="text-gray-300 leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Cette application nécessite un écran d'ordinateur pour fonctionner correctement.
              Veuillez consulter ce site depuis un ordinateur pour une expérience optimale.
            </motion.p>

            {/* détails */}
            <motion.div
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-gray-400">
                <span className="text-orange-400 font-semibold">Résolution minimale :</span> 1024 x 768 pixels
              </p>
            </motion.div>

            {/* bouton suggestion */}
            <motion.div
              className="pt-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 text-sm cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Monitor className="w-4 h-4" />
                <span>Ouvrir sur ordinateur</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      </div>
    </MouseGlowBackground>
  );
};

export default MobileWarning;