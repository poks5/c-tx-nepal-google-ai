
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`p-4 md:p-6 border-b border-gray-200 ${className}`}>{children}</div>;
};

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`p-4 md:p-6 ${className}`}>{children}</div>;
};

const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
    return <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>{children}</h3>;
};

const CardDescription: React.FC<CardProps> = ({ children, className = '' }) => {
    return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
};

export { Card, CardHeader, CardContent, CardTitle, CardDescription };
