
import React from 'react';
import styles from '../styles/Dashboard.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string; // Allow passing extra classes
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.card} ${className}`}>
      {children}
    </div>
  );
};

export default Card;