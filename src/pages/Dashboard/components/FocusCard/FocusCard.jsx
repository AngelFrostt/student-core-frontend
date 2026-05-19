import React, { useMemo } from 'react';
import { Plus, Flame, Puzzle, ShieldCheck, PlayCircle, Circle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateTask } from '../../../../api/endpoints';
import './FocusCard.css';

const statusOptions = [
  { value: 'not_started', label: 'Не начато', icon: <Circle size={14} /> },
  { value: 'in_progress', label: 'В процессе', icon: <PlayCircle size={14} /> },
  { value: 'completed', label: 'Выполнено', icon: <CheckCircle size={14} /> },
];

const FocusCard = ({ selectedDate, tasks = [], onTasksChanged }) => {
  const navigate = useNavigate();

  const focusTasks = useMemo(() => {
    if (!selectedDate) {
      return tasks.filter((task) => {
        const daysLeft = (new Date(task.deadline) - new Date()) / (1000 * 3600 * 24);
        return daysLeft <= 7;
      });
    }
    const selectedStr = selectedDate.toLocaleDateString('en-CA');
    return tasks.filter((task) => {
      const taskDateStr = new Date(task.deadline).toLocaleDateString('en-CA');
      return taskDateStr === selectedStr;
    });
  }, [selectedDate, tasks]);

  const sortedTasks = useMemo(
    () =>
      [...focusTasks].sort((a, b) => {
        const aDeadline = new Date(a.deadline);
        const bDeadline = new Date(b.deadline);
        const aDays = Math.ceil((aDeadline - new Date()) / (1000 * 3600 * 24));
        const bDays = Math.ceil((bDeadline - new Date()) / (1000 * 3600 * 24));
        if (aDays < 0 && bDays >= 0) return -1;
        if (bDays < 0 && aDays >= 0) return 1;
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        return aDeadline - bDeadline;
      }),
    [focusTasks],
  );

  const getDaysLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Просрочено';
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Завтра';
    return `${days} дн.`;
  };

  const renderIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <Flame size={20} className="task-icon-svg" />;
      case 'medium':
        return <Puzzle size={20} className="task-icon-svg" />;
      case 'low':
        return <ShieldCheck size={20} className="task-icon-svg" />;
      default:
        return null;
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { progress_status: newStatus });
      onTasksChanged?.();
      window.dispatchEvent(new CustomEvent('tasksUpdated'));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="focus">
      <div className="card">
        <div className="card-header">
          <h3>Сфокусироваться сегодня</h3>
          <button className="btn-add-mini" onClick={() => navigate('/tasks')}>
            <Plus size={20} color="#fff" />
          </button>
        </div>
        <div className="scroll-area">
          {sortedTasks.length === 0 ? (
            <p className="empty-focus">Нет активных задач</p>
          ) : (
            sortedTasks.map((task) => (
              <div key={task.id} className={`task-item ${task.priority}`}>
                <div className="task-icon-container">{renderIcon(task.priority)}</div>
                <div className="task-info">
                  <p className="task-title">{task.title}</p>
                  <span className="task-subtitle">
                    {getDaysLeft(task.deadline)} · {task.subject?.name || 'Без предмета'}
                  </span>
                </div>
                <select
                  className="task-status-select-focus"
                  value={task.progress_status || 'not_started'}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusCard;
