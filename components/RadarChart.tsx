// components/RadarChart.tsx
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RadarDataItem {
  subject: string;
  A: number;
  fullMark: number;
}

interface RadarChartProps {
  data: RadarDataItem[];
}

const RadarChartComponent: React.FC<RadarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fontSize: 12, fill: '#64748b' }} 
          tickLine={false}
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="能力值"
          dataKey="A"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartComponent;