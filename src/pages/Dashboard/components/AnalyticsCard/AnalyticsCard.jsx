import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getWeeklyAnalytics } from '../../../../api/endpoints';
import './AnalyticsCard.css';

const AnalyticsCard = ({ tasksVersion = 0 }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getWeeklyAnalytics();
        if (!cancelled) setWeeklyData(data?.days || []);
      } catch {
        if (!cancelled) setWeeklyData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tasksVersion]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const day = payload[0].payload;
      return (
        <div className="analytics-tooltip">
          <p><strong>{day.day_name} {day.day_number} {day.month}</strong></p>
          <p>📋 Активных задач: {day.planned_count}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="analytics-card"><div className="card">Загрузка...</div></div>;

  return (
    <div className="analytics-card">
      <div className="card">
        <h3 className="analytics-title">Аналитика недели</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <XAxis
              dataKey="day_name"
              tickFormatter={(value, index) => {
                const day = weeklyData[index];
                return `${value}\n${day?.day_number ?? ''}`;
              }}
              tick={{ fill: '#4a5568', fontSize: 11 }}
              interval={0}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(93,135,255,0.1)' }} />
            <Bar dataKey="planned_count" radius={[8, 8, 0, 0]} barSize={35} fill="#5d87ff" />
          </BarChart>
        </ResponsiveContainer>
        <div className="bars-label">Активные задачи по дням</div>
      </div>
    </div>
  );
};

export default AnalyticsCard;
