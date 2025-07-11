import React from 'react';

interface HorizontalProgressBarProps {
  label: string;
  value: number; // 0-100
  colorClass?: string; // Tailwind CSS 颜色类，例如 'bg-blue-500'
}

const HorizontalProgressBar: React.FC<HorizontalProgressBarProps> = ({ label, value, colorClass = 'bg-blue-500' }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${colorClass}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
};

export default HorizontalProgressBar;