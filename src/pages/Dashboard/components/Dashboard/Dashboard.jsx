import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../TopBar/TopBar';
import MobileNav from '../MobileNav/MobileNav';
import AnalyticsCard from '../AnalyticsCard/AnalyticsCard';
import SubjectsCard from '../SubjectsCard/SubjectsCard';
import EfficiencyCard from '../EfficiencyCard/EfficiencyCard';
import FocusCard from '../FocusCard/FocusCard';
import Calendar from '../../../../components/Calendar/Calendar';
import { listTasks } from '../../../../api/endpoints';
import './Dashboard.css';

const Dashboard = ({ isDarkMode, setIsDarkMode }) => {
  const [layout, setLayout] = useState('desktop');
  const [selectedDate, setSelectedDate] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [tasksVersion, setTasksVersion] = useState(0);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await listTasks({ status: 'active' });
      setAllTasks(Array.isArray(data) ? data : []);
    } catch {
      setAllTasks([]);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, tasksVersion]);

  useEffect(() => {
    const handler = () => setTasksVersion((v) => v + 1);
    window.addEventListener('tasksUpdated', handler);
    return () => window.removeEventListener('tasksUpdated', handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) setLayout('mobile');
      else if (width <= 1829) setLayout('tablet');
      else setLayout('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : ''}`}>
      {layout === 'desktop' && <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      {layout === 'tablet' && <TopBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      {layout === 'mobile' && <MobileNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}

      <main className="dashboard-main">
        <div className="bento-grid">
          <section className="area-analytics">
            <AnalyticsCard tasksVersion={tasksVersion} />
          </section>
          <section className="area-focus">
            <FocusCard
              selectedDate={selectedDate}
              tasks={allTasks}
              onTasksChanged={() => setTasksVersion((v) => v + 1)}
            />
          </section>
          <section className="area-calendar">
            <Calendar tasks={allTasks} onDateSelect={setSelectedDate} selectedDate={selectedDate} />
          </section>
          <section className="area-efficiency">
            <EfficiencyCard tasksVersion={tasksVersion} />
          </section>
          <section className="area-subjects">
            <SubjectsCard />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
