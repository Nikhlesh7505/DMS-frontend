import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable FormField component
 * Integrates with react-hook-form
 */
const FormField = ({
  label,
  name,
  type = 'text',
  register,
  error,
  placeholder,
  icon: Icon,
  disabled = false,
  className = '',
  required = false,
  multiline = false,
  rows = 3,
  ...props
}) => {
  const registration = register ? register(name) : {}
  const fieldClassName = `form-input w-full ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500/50 focus:border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]' : ''}`

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label inline-flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
        
        <div className="relative">
          {Icon && (
            <div className={`absolute left-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}

          {multiline ? (
            <textarea
              id={name}
              disabled={disabled}
              placeholder={placeholder}
              rows={rows}
              className={`${fieldClassName} resize-none`}
              {...registration}
              {...props}
            />
          ) : (
            <input
              id={name}
              type={type}
              disabled={disabled}
              placeholder={placeholder}
              className={fieldClassName}
              {...registration}
              {...props}
            />
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormField;
