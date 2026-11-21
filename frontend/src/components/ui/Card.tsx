import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl shadow-xs transition-shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`p-6 border-b border-slate-100 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div
    className={`p-6 bg-slate-50/60 border-t border-slate-100 rounded-b-xl ${className}`}
    {...props}
  >
    {children}
  </div>
);
