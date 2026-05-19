import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, isArchived, onEdit, onStatusChange, onResourceChanged }) => {
  if (tasks.length === 0) {
    return <div className="empty-tasks">Нет задач в этом разделе</div>;
  }
  return (
    <div className="tasks-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isArchived={isArchived}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          onResourceChanged={onResourceChanged}
        />
      ))}
    </div>
  );
};

export default TaskList;
