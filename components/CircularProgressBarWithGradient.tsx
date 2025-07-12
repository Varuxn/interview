import React from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from '../styles/Dashboard.module.css'; // 引入新的样式文件

interface CircularProgressBarWithGradientProps {
  value: number; // 0-100
  gradientColors: string[]; // 例如: ['#10B981', '#6EE7B7']
}

const CircularProgressBarWithGradient: React.FC<CircularProgressBarWithGradientProps> = ({ value, gradientColors }) => {
  // 渐变ID，确保唯一性。使用一个固定的ID即可，因为每个组件实例都有自己的SVG定义域。
  const gradientId = `circular-progress-gradient`;

  return (
    // 移除固定的 width 和 height，让它填充父容器
    <div style={{ width: '100%', height: '100%' }}> 
      <CircularProgressbarWithChildren
        value={value}
        styles={buildStyles({
          rotation: 0.25,
          strokeLinecap: 'round',
          // 使用与新设计一致的颜色
          pathColor: `url(#${gradientId})`,
          textColor: '#111827', // 对应 --text-primary
          trailColor: '#E5E7EB', // 对应 --border-color
          backgroundColor: '#3e98c7', // 这个颜色通常不可见
        })}
      >
        {/* SVG Defs for gradient (功能保留) */}
        <svg style={{ height: 0, width: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientColors.map((color, index) => (
                <stop key={index} offset={`${(index / (gradientColors.length - 1)) * 100}%`} stopColor={color} />
              ))}
            </linearGradient>
          </defs>
        </svg>

        {/* 使用 CSS Modules 替换 Tailwind 类名 */}
        <div className={styles.circularProgressContent}>
          <strong className={styles.circularProgressValue}>{value}</strong>
          {/* 根据新设计，label 已被移到外部，此处不再需要 */}
        </div>
      </CircularProgressbarWithChildren>
    </div>
  );
};

export default CircularProgressBarWithGradient;