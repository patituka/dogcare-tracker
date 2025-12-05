import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { WeightEntry } from '../types';

interface WeightChartProps {
  data: WeightEntry[];
  isDark?: boolean;
}

export const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-black text-xl font-bold">
        <span>NO_DATA</span>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const formattedData = sortedData.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#000" strokeOpacity={0.2} />
        <XAxis 
          dataKey="displayDate" 
          stroke="#000"
          tick={{fontSize: 12, fill: '#000', fontFamily: 'VT323'}} 
          tickLine={true}
          axisLine={true}
          dy={10}
        />
        <YAxis 
          stroke="#000" 
          tick={{fontSize: 12, fill: '#000', fontFamily: 'VT323'}} 
          tickLine={true} 
          axisLine={true}
          domain={['auto', 'auto']}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '0px', 
            border: '2px solid #000', 
            backgroundColor: '#fff',
            color: '#000',
            boxShadow: '4px 4px 0 0 #000',
            fontFamily: 'VT323'
          }}
          labelStyle={{ color: '#000', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}
          itemStyle={{ color: '#000', fontWeight: 'bold' }}
          cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '2 2' }}
        />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="#000000" 
          strokeWidth={2} 
          dot={{ r: 3, fill: '#000', strokeWidth: 0 }} 
          activeDot={{ r: 5, fill: '#fff', stroke: '#000', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};