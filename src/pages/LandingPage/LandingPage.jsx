import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Moon, Sun, LayoutDashboard, Calendar, CheckCircle,
  BarChart, Bell, Zap, Shield, Users, ArrowRight, Smartphone,
} from 'lucide-react';
import landingHero from '../../assets/lading-hero.png';
import { useAuth } from '../../auth/AuthContext';
import './LandingPage.css';

const LandingPage = ({ isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, bootstrapping } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  // Если уже залогинен — сразу на дашборд.
  useEffect(() => {
    if (!bootstrapping && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [bootstrapping, isAuthenticated, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 },
    );
    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setInfo('');
  };

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Ошибка соединения с сервером';
    if (typeof data === 'string') return data;
    if (data.detail) return Array.isArray(data.detail) ? data.detail.join(' ') : data.detail;
    if (data.username) return data.username[0];
    if (data.email) return data.email[0];
    if (data.password) return data.password[0];
    return 'Не удалось выполнить запрос';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      await login(formData.username.trim(), formData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await register(formData.username.trim(), formData.email.trim(), formData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToForm = () =>
    document.querySelector('.hero-right')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="landing">
      <div className="parallax-bg" />

      <header className="landing-header">
        <div className="logo">StudentCore</div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-container">
          <div className="hero-left animate-on-scroll">
            <h1>Управляй своим будущим сегодня.</h1>
            <p>
              Единая платформа для студентов, которые хотят организовать учёбу,
              сдавать дедлайны вовремя и видеть свой прогресс.
            </p>
            <button className="btn-primary" onClick={scrollToFeatures}>
              Узнать больше <ArrowRight size={18} />
            </button>
          </div>
          <div className="hero-right animate-on-scroll">
            <div className="form-card">
              <div className="form-tabs">
                <button className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
                  Вход
                </button>
                <button className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
                  Регистрация
                </button>
              </div>
              <form onSubmit={isLogin ? handleLogin : handleRegister}>
                <div className="input-group">
                  <label>Логин</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Ваш логин"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                  />
                </div>
                {!isLogin && (
                  <div className="input-group">
                    <label>Почта</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="example@mail.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                )}
                <div className="input-group">
                  <label>Пароль</label>
                  <div className="password-wrapper">
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      placeholder="Пароль"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {!isLogin && (
                  <div className="input-group">
                    <label>Повторите пароль</label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Повторите пароль"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                      >
                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
                {error && <div className="error-message">{error}</div>}
                {info && <div className="info-message">{info}</div>}
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Подождите…' : isLogin ? 'Войти' : 'Создать аккаунт'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="features" ref={featuresRef}>
        <div className="container">
          <h2 className="section-title animate-on-scroll">Ключевые преимущества</h2>
          <div className="features-grid">
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon"><LayoutDashboard size={32} /></div>
              <h3>Интуитивный интерфейс</h3>
              <p>Создавай предметы и задачи, загружай файлы — всё в пару кликов.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon"><Calendar size={32} /></div>
              <h3>Умный календарь</h3>
              <p>Цветные точки подсветят срочные дела. Кликни на дату — увидишь все задачи на день.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon"><CheckCircle size={32} /></div>
              <h3>Система статусов задач</h3>
              <p>«Не начато», «В процессе», «Выполнено». Прозрачный прогресс по каждой работе.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon"><BarChart size={32} /></div>
              <h3>Аналитика эффективности</h3>
              <p>Графики покажут, сколько задач закрыто вовремя, и помогут скорректировать нагрузку.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon"><Bell size={32} /></div>
              <h3>Email-напоминания</h3>
              <p>Ни один дедлайн не будет забыт. Письма приходят за указанное число дней до срока.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon"><Moon size={32} /></div>
              <h3>Тёмная тема</h3>
              <p>Учись в любое время суток без нагрузки на глаза.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="why-us">
        <div className="container">
          <h2 className="section-title animate-on-scroll">Почему выбирают нас?</h2>
          <div className="why-grid">
            <div className="why-item animate-on-scroll">
              <Zap size={32} className="why-icon" />
              <h3>Высокая скорость</h3>
              <p>Мгновенная синхронизация данных между всеми твоими устройствами.</p>
            </div>
            <div className="why-item animate-on-scroll">
              <Shield size={32} className="why-icon" />
              <h3>Безопасность</h3>
              <p>Авторизация на httpOnly cookie с CSRF-защитой и ротацией refresh-токенов.</p>
            </div>
            <div className="why-item animate-on-scroll">
              <Users size={32} className="why-icon" />
              <h3>Создано студентами</h3>
              <p>Мы сами проходим сессии — знаем, что нужно.</p>
            </div>
            <div className="why-item animate-on-scroll">
              <Smartphone size={32} className="why-icon" />
              <h3>Доступ отовсюду</h3>
              <p>Веб-версия адаптирована под любой экран.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mission">
        <div className="container">
          <div className="mission-content animate-on-scroll">
            <h2>Больше, чем просто учебный портал</h2>
            <ul>
              <li><CheckCircle size={18} /> Планирование задач с дедлайнами и приоритетами</li>
              <li><CheckCircle size={18} /> Хранение конспектов, ссылок, файлов и фото</li>
              <li><CheckCircle size={18} /> Календарь с цветовой индикацией срочности</li>
              <li><CheckCircle size={18} /> Аналитика твоей эффективности</li>
              <li><CheckCircle size={18} /> Настраиваемые напоминания по почте</li>
            </ul>
          </div>
          <div className="mission-image animate-on-scroll">
            <img src={landingHero} alt="Интерфейс StudentCore" style={{ width: '100%', borderRadius: '16px' }} />
          </div>
        </div>
      </section>

      <section className="cta" ref={ctaRef}>
        <div className="container">
          <h2 className="animate-on-scroll">Готов учиться продуктивнее?</h2>
          <p className="animate-on-scroll">
            Присоединяйся к Student Core бесплатно и начни организовывать учёбу уже сегодня.
          </p>
          <button className="btn-primary-large animate-on-scroll" onClick={scrollToForm}>
            Присоединиться
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Student Core. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
