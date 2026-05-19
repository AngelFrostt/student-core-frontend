import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getMonthlyEfficiency, getInProgressCount } from '../../../../api/endpoints';
import './EfficiencyCard.css';

const EfficiencyCard = ({ tasksVersion = 0 }) => {
  const [monthlyEfficiency, setMonthlyEfficiency] = useState(0);
  const [monthlyMessage, setMonthlyMessage] = useState('');
  const [inProgressCount, setInProgressCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [monthly, progress] = await Promise.all([
          getMonthlyEfficiency(),
          getInProgressCount(),
        ]);
        if (cancelled) return;
        setMonthlyEfficiency(monthly?.efficiency ?? 0);
        setMonthlyMessage(monthly?.message ?? '');
        setInProgressCount(progress?.count ?? 0);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tasksVersion]);

  if (loading) return <div className="efficiency-card"><div className="card">Загрузка...</div></div>;

  return (
    <div className="efficiency-card">
      <div className="card">
        <h3>Эффективность</h3>
        <div className="efficiency-grid">
          <div className="monthly-block">
            <h4>За месяц</h4>
            <div className="progress-ring">
              <CircularProgressbar
                value={monthlyEfficiency}
                text={`${monthlyEfficiency}%`}
                styles={buildStyles({
                  textSize: '20px',
                  pathColor:
                    monthlyEfficiency >= 75
                      ? '#48bb78'
                      : monthlyEfficiency >= 40
                      ? '#ed8936'
                      : '#e53e3e',
                  textColor: '#2E4580',
                  trailColor: '#e2e8f0',
                  pathTransitionDuration: 0.5,
                })}
              />
            </div>
            <p className="monthly-message">{monthlyMessage}</p>
          </div>
          <div className="progress-block">
            <h4>В процессе</h4>
            <div className="stat-value">{inProgressCount}</div>
            <small>задачи</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyCard;
