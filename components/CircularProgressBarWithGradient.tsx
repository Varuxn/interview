import React, { useState, useEffect, useRef } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from '../styles/Dashboard.module.css';

interface CircularProgressBarWithGradientProps {
  value: number;
  gradientColors: string[];
  hideText?: boolean;
  animationDuration?: number; // 新增动画时长参数
}

const CircularProgressBarWithGradient: React.FC<CircularProgressBarWithGradientProps> = ({ 
  value, 
  gradientColors, 
  hideText = false,
  animationDuration = 1000 // 默认1秒动画时长
}) => {
  const gradientId = `circular-progress-gradient`;
  const [animatedValue, setAnimatedValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  // 动画逻辑
  useEffect(() => {
    // 清除已有动画
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    startValueRef.current = animatedValue; // 记录当前值作为动画起点
    startTimeRef.current = performance.now();

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) return;
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // 使用缓动函数使动画更平滑
      const easedProgress = easeOutCubic(progress);
      const newValue = startValueRef.current + (value - startValueRef.current) * easedProgress;
      
      setAnimatedValue(Math.round(newValue * 10) / 10); // 保留一位小数
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animationDuration]);

  // 缓动函数（三次方缓出）
  const easeOutCubic = (t: number) => {
    return 1 - Math.pow(1 - t, 3);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <CircularProgressbarWithChildren
        value={animatedValue} // 使用动画值替代原始值
        styles={buildStyles({
          rotation: 0.25,
          strokeLinecap: 'round',
          pathTransition: 'stroke-dashoffset 0.1s linear', // 添加路径过渡效果
          pathColor: `url(#${gradientId})`,
          textColor: '#111827',
          trailColor: '#E5E7EB',
          backgroundColor: '#3e98c7',
        })}
      >
        <svg style={{ height: 0, width: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientColors.map((color, index) => (
                <stop key={index} offset={`${(index / (gradientColors.length - 1)) * 100}%`} stopColor={color} />
              ))}
            </linearGradient>
          </defs>
        </svg>

        {!hideText && (
          <div className={styles.circularProgressContent}>
            <strong className={styles.circularProgressValue}>{animatedValue}</strong>
          </div>
        )}
      </CircularProgressbarWithChildren>
    </div>
  );
};

export default CircularProgressBarWithGradient;