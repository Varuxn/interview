import React from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface CircularProgressBarWithGradientProps {
  value: number; // 0-100
  label: string;
  gradientColors: string[]; // 例如: ['#4CAF50', '#8BC34A']
}

const CircularProgressBarWithGradient: React.FC<CircularProgressBarWithGradientProps> = ({ value, label, gradientColors }) => {
  // 创建渐变 ID，确保唯一性
  const gradientId = `gradient-${label.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div style={{ width: '120px', height: '120px' }}>
      <CircularProgressbarWithChildren
        value={value}
        styles={buildStyles({
          // Rotation of path and trail, in number of turns (0-1)
          rotation: 0.25,

          // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
          strokeLinecap: 'round',

          // Text size
          textSize: '16px',

          // Colors
          pathColor: `url(#${gradientId})`, // 应用渐变色
          textColor: '#1D2B3A',
          trailColor: '#d6d6d6',
          backgroundColor: '#3e98c7',
        })}
      >
        {/* SVG Defs for gradient */}
        <svg style={{ height: 0, width: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientColors.map((color, index) => (
                <stop key={index} offset={`${(index / (gradientColors.length - 1)) * 100}%`} stopColor={color} />
              ))}
            </linearGradient>
          </defs>
        </svg>
        {/* Content in the middle */}
        <div className="flex flex-col items-center justify-center">
          <strong className="text-2xl font-bold text-[#1D2B3A]">{value}</strong>
          <span className="text-sm text-gray-500">{label}</span>
        </div>
      </CircularProgressbarWithChildren>
    </div>
  );
};

export default CircularProgressBarWithGradient;