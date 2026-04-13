// Spinning architectural compass

import { motion } from "framer-motion";

export function RotatingCompass() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      style={{
        width: '100px',
        height: '100px',
        border: '3px solid #0096FF',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold'
      }}
    >
      N
    </motion.div>
  );
}