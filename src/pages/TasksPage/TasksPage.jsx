import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../Dashboard/components/Sidebar/Sidebar';
import TopBar from '../Dashboard/components/TopBar/TopBar';
import MobileNav from '../Dashboard/components/MobileNav/MobileNav';
import TasksCalendar from './TasksCalendar';
import TaskDrawer from './TaskDrawer';
import TaskList from './TaskList';
import { listSubjects, listTasks, updateTask, deleteTask } from '../../api/endpoints';
import './TasksPage.css';

const TasksPage = ({ isDarkMode, setIsDarkMode }) => {
  const [activeView, setActiveView] = useState('active');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) setLayout('mobile');
      else if (width <= 2050) setLayout('tablet');
      else setLayout('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await listSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch {
      setSubjects([]);
    }
  }, []);

  const fetchAllTasks = useCallback(async () => {
    try {
      const [active, completed] = await Promise.all([
        listTasks({ status: 'active' }),
        listTasks({ status: 'completed' }),
      ]);
      setTasks(Array.isArray(active) ? active : []);
      setArchivedTasks(Array.isArray(completed) ? completed : []);
    } catch {
      setTasks([]);
      setArchivedTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
    fetchAllTasks();
  }, [fetchSubjects, fetchAllTasks]);

  const notifyDashboard = () => {
    window.dispatchEvent(new CustomEvent('tasksUpdated'));
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setSelectedDate(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleTaskSuccess = () => {
    fetchAllTasks();
    notifyDashboard();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (newStatus === 'delete') {
      if (!window.confirm('Удалить задачу навсегда?')) return;
      try {
        await deleteTask(taskId);
        await fetchAllTasks();
        notifyDashboard();
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      await updateTask(taskId, { progress_status: newStatus });
      await fetchAllTasks();
      notifyDashboard();
    } catch {
      /* ignore */
    }
  };

  const getFilteredTasks = (tasksList) => {
    if (!selectedDate) return tasksList;
    const selectedStr = selectedDate.toLocaleDateString('en-CA');
    return tasksList.filter((task) => {
      const taskDateStr = new Date(task.deadline).toLocaleDateString('en-CA');
      return taskDateStr === selectedStr;
    });
  };

  const tasksToShow =
    activeView === 'active' ? getFilteredTasks(tasks) : getFilteredTasks(archivedTasks);

  return (
    <div className={`tasks-container ${isDarkMode ? 'dark' : ''}`}>
      {layout === 'desktop' && <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      {layout === 'tablet' && <TopBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      {layout === 'mobile' && <MobileNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}

      <main className="tasks-content">
        <div className="tasks-header">
          <h1>Задачи</h1>
          <button className="btn-add-task" onClick={() => setShowForm(true)}>
            + Добавить задачу
          </button>
        </div>

        <div className="tasks-view-switch">
          <button
            className={`view-btn ${activeView === 'active' ? 'active' : ''}`}
            onClick={() => handleViewChange('active')}
          >
            Сейчас
          </button>
          <button
            className={`view-btn ${activeView === 'archived' ? 'active' : ''}`}
            onClick={() => handleViewChange('archived')}
          >
            Архив задач
          </button>
        </div>

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <div className="tasks-layout">
            <div className="tasks-calendar-col">
              <TasksCalendar
                isDarkMode={isDarkMode}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                tasks={tasks.concat(archivedTasks)}
              />
            </div>
            <div className="tasks-list-col">
              <TaskList
                tasks={tasksToShow}
                isArchived={activeView === 'archived'}
                onEdit={handleEditTask}
                onStatusChange={handleStatusChange}
                onResourceChanged={handleTaskSuccess}
              />
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <TaskDrawer
          isDarkMode={isDarkMode}
          subjects={subjects}
          initialTask={editingTask}
          onClose={handleFormClose}
          onSuccess={handleTaskSuccess}
        />
      )}
    </div>
  );
};

export default TasksPage;
