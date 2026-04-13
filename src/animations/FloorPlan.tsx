// SVG path animation - draws floor plan lines

import { motion } from 'framer-motion';
import { useState } from 'react';
export function FloorPlanDraw() {
  return (
    <svg width="500" height="500" viewBox="0 0 500 500">
      <motion.path
        d="M 50 50 L 450 50 L 450 450 L 430 450 M 390 450 L 340 450 M 220 450 L 180 450 M 70 450 L 50 450 L 50 290 M 50 220 L 50 200 M 50 150 L 50 50"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 6 }}
        stroke="#0096FF"
        strokeWidth="10"
        fill="none"
      />
      <motion.text x="70" y="100" fontSize="16" fill="#0096FF" 
                fontFamily="Arial, sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{duration: 1, delay: 2}}
                >
        Bathroom
      </motion.text>

      <motion.text initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{duration: 1, delay: 2}}
      x="130" y="180" fontSize="16" fill="#0096FF" fontFamily="Arial, sans-serif">
        Hall
      </motion.text>

      <motion.text initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{duration: 1, delay: 2}}
      x="280" y="140" fontSize="16" fill="#0096FF" fontFamily="Arial, sans-serif">
        Kitchen
      </motion.text>

      <motion.text initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{duration: 1, delay: 2}}
      x="80" y="260" fontSize="16" fill="#0096FF" fontFamily="Arial, sans-serif">
        Bedroom
      </motion.text>

      <motion.text initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{duration: 1, delay: 2}}
      x="80" y="380" fontSize="16" fill="#0096FF" fontFamily="Arial, sans-serif">
        Bedroom
      </motion.text>

      <motion.text initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{duration: 1, delay: 2}}
      x="270" y="330" fontSize="16" fill="#0096FF" fontFamily="Arial, sans-serif">
        Living Room
      </motion.text>

        {/* window room 2 */}
        <motion.path
        d="M 48 290 L 48 220"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1 }}
        stroke="#0096FF"
        strokeWidth="2"
        fill="none"
      />

      <motion.path
        d="M 54 290 L 54 220"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1 }}
        stroke="#0096FF"
        strokeWidth="1"
        fill="none"
      />

      {/* window room 3 */}
      <motion.path
        d="M 180 453 L 70 453"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1 }}
        stroke="#0096FF"
        strokeWidth="2"
        fill="none"
      />

        <motion.path
        d="M 180 447 L 70 447"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1 }}
        stroke="#0096FF"
        strokeWidth="1"
        fill="none"
      />

      {/* window big room */}
      <motion.path
        d="M 340 453 L 220 453"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1 }}
        stroke="#0096FF"
        strokeWidth="2"
        fill="none"
      />

        <motion.path
        d="M 340 447 L 220 447"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1 }}
        stroke="#0096FF"
        strokeWidth="1"
        fill="none"
      />

      <motion.path
        d="M 50 150 L 90 150 A 40 40 0 0 1 50 200"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1 }}
        stroke="#0096FF"
        strokeWidth="2"
        fill="none"
      />


      <motion.path
        d="M 50 140 L 130 140 M 170 140 L 180 140 L 180 50"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, delay: 1 }}
        stroke="#0096FF"
        strokeWidth="5"
        fill="none"
      />

      <motion.path
        d="M 170 140 L 170 100 A 40 40 0 0 0 130 140"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1 }}
        stroke="#0096FF"
        strokeWidth="2"
        fill="none"
      />

      <motion.path
        className="second-room"
        d="M 50 210 L 200 210 L 200 260 M 200 290 L 200 300 L 50 300"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, delay: 2 }}
        stroke="#0096FF"
        strokeWidth="5"
        fill="none"
      />

        <motion.path
        d="M 200 290 L 160 290 A 40 40 0 0 1 200 260"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 2 }}
        stroke="#0096FF"
        strokeWidth="2"
        fill="none"
      />

      <motion.path
        className="third-room"
        d="M 200 300 L 200 310 M 200 350 L 200 450"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, delay: 3 }}
        stroke="#0096FF"
        strokeWidth="5"
        fill="none"
      />
      <motion.path
        d="M 200 310 L 160 310 A 40 40 0 0 0 200 350"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 3 }}
        stroke="#0096FF"
        strokeWidth="2"
        fill="none"
      />

        {/* door big room */}
      <motion.path
        d="M 430 450 L 430 410 A 40 40 0 0 0 390 450"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 4 }}
        stroke="#0096FF"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export function FloorPlanOverlay() {
    const [isVisible, setIsVisible] = useState(true);
    const animationTime=8000;
    return(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(26, 26, 46, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
        <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => {
          // After drawing finishes, wait then fade out
          setTimeout(() => {
            setIsVisible(false);
          }, animationTime + 500);
        }}
      >
        <FloorPlanDraw />
      </motion.div>
    </motion.div>
    );
}