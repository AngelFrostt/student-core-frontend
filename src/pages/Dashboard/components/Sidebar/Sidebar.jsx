
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, User, Moon, Sun, LogOut, ClipboardList } from 'lucide-react';
import { useAuth } from '../../../../auth/AuthContext';

import './Sidebar.css';

const Sidebar = ({ isDarkMode, setIsDarkMode }) => {
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleTheme = () => {
    setAnimate(true);
    setIsDarkMode(!isDarkMode);
    setTimeout(() => setAnimate(false), 300);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  return (
    <aside className={`sidebar ${isDarkMode ? 'dark-sidebar' : ''}`}>
      <div className="sidebar-top">
        <div className="logo">Student Core</div>
        <nav className="menu">
      
          <NavLink to="/dashboard" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Дашборд</span>
          </NavLink>
          
          <NavLink to="/subjects" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <BookOpen size={20} />
            <span>Мои предметы</span>
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
  <ClipboardList size={20} />
  <span>Задачи</span>
</NavLink>
          
          <NavLink to="/profile" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <User size={20} />
            <span>Профиль</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>Сменить тему</span>
        </div>
        <div className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Выйти</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;