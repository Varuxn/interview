import React from 'react';
import styles from '../styles/Dashboard.module.css'; // 引入新的样式文件

interface HorizontalProgressBarProps {
  label: string;
  value: number; // 0-100
  color: string; // 将 colorClass 替换为 color，直接接收颜色值
}

const HorizontalProgressBar: React.FC<HorizontalProgressBarProps> = ({ label, value, color }) => {
  return (
    // 使用 CSS Modules 替换 Tailwind 类名
    <div className={styles.horizontalProgressWrapper}>
      <div className={styles.horizontalProgressHeader}>
        <span className={styles.horizontalProgressLabel}>{label}</span>
        <span className={styles.horizontalProgressValue}>{value}</span>
      </div>
      <div className={styles.horizontalProgressTrack}>
        <div
          className={styles.horizontalProgressFill}
          style={{
            width: `${value}%`,
            backgroundColor: color, // 直接使用 color prop 设置背景色
          }}
        ></div>
      </div>
    </div>
  );
};

export default HorizontalProgressBar;