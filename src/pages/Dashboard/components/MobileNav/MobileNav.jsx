import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, User, Moon, Sun, LogOut, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import './MobileNav.css';

const MobileNav = ({ isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleNavClick = (path) => {
    navigate(path);
    closeMenu();
  };

  const toggleTheme = () => {
    setAnimate(true);
    setIsDarkMode(!isDarkMode);
    setTimeout(() => setAnimate(false), 300);
    closeMenu();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      closeMenu();
      navigate('/', { replace: true });
    }
  };

  return (
    <>
      <div className="mobile-header">
        <div className="mobile-logo">Student Core</div>
        <button className={`burger-btn ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <div className="burger-icon">
            <span className="line line1"></span>
            <span className="line line2"></span>
            <span className="line line3"></span>
          </div>
        </button>
      </div>

      <div className={`menu-overlay ${isOpen ? 'active' : ''}`} onClick={closeMenu}></div>

      <div className={`mobile-slide-menu ${isOpen ? 'open' : ''}`}>
        <div className="slide-menu-inner">
          <div className="menu-item" onClick={() => handleNavClick('/dashboard')}>
            <LayoutDashboard size={24} /> <span>Дашборд</span>
          </div>

          <div className="menu-item" onClick={() => handleNavClick('/subjects')}>
            <BookOpen size={24} /> <span>Мои предметы</span>
          </div>

          <div className="menu-item" onClick={() => handleNavClick('/tasks')}>
            <ClipboardList size={24} /> <span>Задачи</span>
          </div>

          <div className="menu-item" onClick={() => handleNavClick('/profile')}>
            <User size={24} /> <span>Профиль</span>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-item" onClick={toggleTheme}>
            {isDarkMode ? (
              <Sun size={24} className={animate ? 'icon-animate' : ''} />
            ) : (
              <Moon size={24} className={animate ? 'icon-animate' : ''} />
            )}
            <span>Сменить тему</span>
          </div>

          <div className="menu-item" onClick={handleLogout}>
            <LogOut size={24} /> <span>Выйти</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;