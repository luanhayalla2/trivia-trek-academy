import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {isVisible && achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-1 shadow-2xl">
            {/* Animated background shine */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            
            <div className="relative bg-background rounded-lg p-4 pr-12">
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 500);
                }}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                {/* Trophy icon with animation */}
                <motion.div
                  initial={{ rotate: -15, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                    delay: 0.2
                  }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Floating stars */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                        y: [-10, -30],
                        x: [0, (i - 1) * 20]
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.5 + i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="absolute top-0 left-1/2"
                    >
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  ))}
                </motion.div>

                <div className="flex flex-col">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-semibold uppercase tracking-wider text-amber-500"
                  >
                    Conquista Desbloqueada!
                  </motion.span>
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-bold text-foreground"
                  >
                    {achievement.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-muted-foreground"
                  >
                    {achievement.description}
                  </motion.p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementNotification;
