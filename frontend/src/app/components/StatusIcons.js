// components/StatusIcons.js
import { motion } from "framer-motion";

export function ActiveIcon({ className = "w-5 h-5 text-green-400" }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      initial={{ scale: 0.8, opacity: 0.7 }}
      animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        fill="currentColor"
        d="M9 16.2l-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4z"
      />
    </motion.svg>
  );
}

export function InactiveIcon({ className = "w-5 h-5 text-red-400" }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      initial={{ rotate: 0 }}
      animate={{ rotate: [-5, 5, -5] }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        fill="currentColor"
        d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.18 12 2.89 5.71 4.3 4.29l6.29 6.29L16.89 4.3z"
      />
    </motion.svg>
  );
}
