import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './TasksPage.css';

const TasksCalendar = ({ isDarkMode, selectedDate, onSelectDate, tasks }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
   
    let startOffset = firstDay.getDay(); // 0 вс, 1 пн, ..., 6 сб
    startOffset = startOffset === 0 ? 6 : startOffset - 1;
    const blanks = Array(startOffset).fill(null);
    return { days, blanks };
  };

  const getTaskColor = (date) => {
    const tasksOnDate = tasks.filter(task => {
      const deadDate = new Date(task.deadline);
      return deadDate.toDateString() === date.toDateString() && task.status !== 'completed';
    });
    if (tasksOnDate.length === 0) return null;
    let priority = 'low';
    if (tasksOnDate.some(t => t.priority === 'high')) priority = 'high';
    else if (tasksOnDate.some(t => t.priority === 'medium')) priority = 'medium';
    return priority;
  };

  const changeMonth = (delta) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const handleDateClick = (date) => {
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      onSelectDate(null);
    } else {
      onSelectDate(date);
    }
  };

  const resetFilter = () => {
    onSelectDate(null);
  };

  const { days, blanks } = getDaysInMonth(currentMonth);

  return (
    <div className={`calendar-card ${isDarkMode ? 'dark' : ''}`}>
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)}><ChevronLeft size={20} /></button>
        <span>{currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => changeMonth(1)}><ChevronRight size={20} /></button>
      </div>

      {selectedDate && (
        <div className="calendar-reset">
          <button onClick={resetFilter} className="reset-filter-btn">
            <X size={14} /> Сбросить фильтр
          </button>
        </div>
      )}

      <div className="calendar-weekdays">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="calendar-grid">
        {blanks.map((_, i) => <div key={`blank-${i}`} className="calendar-day blank"></div>)}
        {days.map(date => {
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const color = getTaskColor(date);
          const today = new Date().toDateString() === date.toDateString();
          return (
            <div
              key={date.toISOString()}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${today ? 'today' : ''} priority-${color}`}
              onClick={() => handleDateClick(date)}
            >
              <span>{date.getDate()}</span>
              {color && <div className="task-dot"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksCalendar;