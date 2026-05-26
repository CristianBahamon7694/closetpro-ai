import React from 'react';

export const GlassCard = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 ${
        hoverable ? 'glass-panel-hover cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassCard;
