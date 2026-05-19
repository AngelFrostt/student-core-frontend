import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './Calendar.css';

const Calendar = ({ tasks = [], onDateSelect, selectedDate: externalSelectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState(null);
  const selectedDate = externalSelectedDate !== undefined ? externalSelectedDate : internalSelectedDate;

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTaskColor = (date) => {
    const selectedStr = date.toLocaleDateString('en-CA');
    const tasksOnDate = tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDateStr = new Date(task.deadline).toLocaleDateString('en-CA');
      return taskDateStr === selectedStr && task.status !== 'completed';
    });
    if (tasksOnDate.length === 0) return null;
    let priority = 'low';
    if (tasksOnDate.some(t => t.priority === 'high')) priority = 'high';
    else if (tasksOnDate.some(t => t.priority === 'medium')) priority = 'medium';
    return priority;
  };

  const handleDateClick = (day) => {
    if (selectedDate && isSameDay(day, selectedDate)) {
      if (onDateSelect) onDateSelect(null);
      setInternalSelectedDate(null);
    } else {
      setInternalSelectedDate(day);
      if (onDateSelect) onDateSelect(day);
    }
  };

  const resetFilter = () => {
    if (onDateSelect) onDateSelect(null);
    setInternalSelectedDate(null);
  };

  const dateFormat = "LLLL yyyy";

  return (
    <div className="calendar-widget">
      <header className="calendar-header">
        <button onClick={prevMonth} className="nav-btn"><ChevronLeft size={20} /></button>
        <h3>{format(currentMonth, dateFormat, { locale: ru })}</h3>
        <button onClick={nextMonth} className="nav-btn"><ChevronRight size={20} /></button>
      </header>

      {selectedDate && (
        <div className="calendar-reset">
          <button onClick={resetFilter} className="reset-filter-btn">
            <X size={14} /> Сбросить фильтр
          </button>
        </div>
      )}

      <div className="days-of-week">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="dow-item">{day}</div>
        ))}
      </div>

      <div className="days-grid">
        {days.map(day => {
          const color = getTaskColor(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          return (
            <div
              key={day}
              className={`day-item ${!isCurrentMonth ? "disabled" : ""} ${isSelected ? "selected" : ""} ${color ? `priority-${color}` : ""}`}
              onClick={() => handleDateClick(day)}
            >
              {format(day, "d")}
              {color && <div className="task-dot"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;