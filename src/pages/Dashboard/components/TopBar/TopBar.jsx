import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, User, Moon, Sun, LogOut, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import './TopBar.css';

const TopBar = ({ isDarkMode, setIsDarkMode }) => {
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

  const handleNav = (path) => {
    navigate(path);
  };

  return (
    <header className={`topbar ${isDarkMode ? 'dark-topbar' : ''}`}>
      <div className="topbar-logo">Student Core</div>
      <nav className="topbar-nav">
        <div className="topbar-item" onClick={() => handleNav('/dashboard')}>
          <LayoutDashboard size={20} /><span>Дашборд</span>
        </div>
        <div className="topbar-item" onClick={() => handleNav('/subjects')}>
          <BookOpen size={20} /><span>Мои предметы</span>
        </div>
        <div className="topbar-item" onClick={() => handleNav('/tasks')}>
          <ClipboardList size={20} /><span>Задачи</span>
        </div>
        <div className="topbar-item" onClick={() => handleNav('/profile')}>
          <User size={20} /><span>Профиль</span>
        </div>
        <div className="topbar-divider"></div>
        <div className="topbar-item" onClick={toggleTheme}>
          {isDarkMode ? (
            <Sun size={20} className={animate ? 'icon-animate' : ''} />
          ) : (
            <Moon size={20} className={animate ? 'icon-animate' : ''} />
          )}
          <span>Сменить тему</span>
        </div>
        <div className="topbar-item" onClick={handleLogout}>
          <LogOut size={20} /><span>Выйти</span>
        </div>
      </nav>
    </header>
  );
};

export default TopBar;