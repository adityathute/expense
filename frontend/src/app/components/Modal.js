"use client";

import { motion, AnimatePresence } from "framer-motion";
import "../styles/components/modal.css";

export default function Modal({ isOpen, onClose, onReset, children, title = "Add Service" }) {
  const handleClose = () => {
    if (onReset) onReset(); // call resetForm
    onClose();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              <motion.button
                className="modal-close"
                onClick={handleClose}
                whileHover={{
                  rotate: 90,
                  color: "#ef4444",
                }}
                whileTap={{
                  scale: 0.95,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                &times;
              </motion.button>
            </div>

            <div className="modal-body">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
