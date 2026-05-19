import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Calendar, ShieldCheck, Key, Trash2 } from 'lucide-react';
import Sidebar from '../Dashboard/components/Sidebar/Sidebar';
import TopBar from '../Dashboard/components/TopBar/TopBar';
import MobileNav from '../Dashboard/components/MobileNav/MobileNav';
import {
  getProfile, updateProfile, changePassword, deleteAccount,
} from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import './ProfilePage.css';

const AVATARS = [
  'avatar1.png', 'avatar2.png', 'avatar3.png',
  'avatar4.png', 'avatar5.png', 'avatar6.png',
];

const ProfilePage = ({ isDarkMode, setIsDarkMode }) => {
  const [profile, setProfile] = useState(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState('desktop');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordInfo, setPasswordInfo] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [genericError, setGenericError] = useState('');

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) setLayout('mobile');
      else if (width <= 1354) setLayout('tablet');
      else setLayout('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getProfile();
        if (cancelled) return;
        setProfile(data);
        if (data?.email_notifications_enabled !== undefined) {
          setNotificationsEnabled(data.email_notifications_enabled);
        }
      } catch {
        if (!cancelled) setGenericError('Ошибка загрузки профиля');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    try {
      await updateProfile({ avatar_url: selectedAvatar });
      setProfile((prev) => ({ ...prev, avatar_url: selectedAvatar }));
      setIsAvatarModalOpen(false);
    } catch {
      setGenericError('Ошибка при сохранении аватара');
    }
  };

  const extractError = (err, fallback) => {
    const data = err?.response?.data;
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    return (
      data.detail ||
      data.error ||
      data.old_password?.[0] ||
      data.new_password?.[0] ||
      data.password?.[0] ||
      fallback
    );
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordInfo('');
    if (oldPassword === newPassword) {
      setPasswordError('Новый пароль должен отличаться от старого');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Пароль должен быть не менее 8 символов');
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordInfo('Пароль успешно изменён. Войдите снова.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // backend очистил cookies — выходим
      setTimeout(async () => {
        await logout();
        navigate('/', { replace: true });
      }, 1000);
    } catch (err) {
      setPasswordError(extractError(err, 'Ошибка при смене пароля'));
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    try {
      await deleteAccount(deletePassword);
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(extractError(err, 'Неверный пароль'));
    }
  };

  const handleNotificationsToggle = async () => {
    try {
      await updateProfile({ email_notifications_enabled: !notificationsEnabled });
      setNotificationsEnabled(!notificationsEnabled);
    } catch {
      setGenericError('Ошибка при обновлении настроек');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'недавно';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={`profile-container ${isDarkMode ? 'dark' : ''}`}>
        {layout === 'desktop' && <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
        {layout === 'tablet' && <TopBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
        {layout === 'mobile' && <MobileNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
        <main className="profile-content">
          <div className="loading-spinner">Загрузка профиля...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={`profile-container ${isDarkMode ? 'dark' : ''}`}>
      {layout === 'desktop' && <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      {layout === 'tablet' && <TopBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      {layout === 'mobile' && <MobileNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}

      <main className="profile-content">
        <div className="welcome-header">
          <h1>Привет, {profile?.username || 'Студент'}!</h1>
        </div>

        {genericError && <div className="error-message">{genericError}</div>}

        <div className="profile-grid">
          <div className="glass-card profile-main">
            <div className="profile-info-block">
              <div className="avatar-wrapper">
                <img
                  src={`/assets/avatars/${profile?.avatar_url || 'avatar1.png'}`}
                  alt="Avatar"
                  className="main-avatar"
                />
                <button
                  className="edit-avatar-btn"
                  onClick={() => setIsAvatarModalOpen(true)}
                >
                  <Edit2 size={18} />
                </button>
              </div>

              <div className="data-fields">
                <div className="field-group">
                  <span className="label">Логин</span>
                  <span className="value">{profile?.username || ''}</span>
                </div>
                <div className="field-group">
                  <span className="label">Почта</span>
                  <span className="value">{profile?.email || ''}</span>
                </div>
              </div>
            </div>

            <div className="date-joined">
              <Calendar size={16} />
              <span>На платформе с {formatDate(profile?.date_joined)}</span>
            </div>
          </div>

          <div className="glass-card profile-settings">
            <h3>
              <ShieldCheck size={20} /> Безопасность
            </h3>
            <div className="settings-list">
              <div className="settings-item">
                <p>
                  <Key size={16} /> Сменить пароль
                </p>
                <button className="text-btn" onClick={() => setIsPasswordModalOpen(true)}>
                  Сменить
                </button>
              </div>
              <div className="settings-item">
                <p>📧 Уведомления на почту</p>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={handleNotificationsToggle}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="settings-item danger">
                <p>
                  <Trash2 size={16} /> Удалить аккаунт
                </p>
                <button
                  className="text-btn-danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>

        {isAvatarModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAvatarModalOpen(false)}>
            <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Выберите стиль</h2>
              <div className="avatar-options">
                {AVATARS.map((img) => (
                  <img
                    key={img}
                    src={`/assets/avatars/${img}`}
                    className={`avatar-option ${selectedAvatar === img ? 'active' : ''}`}
                    onClick={() => setSelectedAvatar(img)}
                    alt="Option"
                  />
                ))}
              </div>
              <button className="primary-btn" onClick={handleSaveAvatar}>
                Применить
              </button>
              <button className="text-btn" onClick={() => setIsAvatarModalOpen(false)}>
                Отмена
              </button>
            </div>
          </div>
        )}

        {isPasswordModalOpen && (
          <div className="modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Смена пароля</h2>
              <input
                type="password"
                placeholder="Старый пароль"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                autoComplete="current-password"
              />
              <input
                type="password"
                placeholder="Новый пароль (мин. 8 символов)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Подтвердите новый пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordInfo && <div className="info-message">{passwordInfo}</div>}
              <div className="modal-buttons">
                <button className="primary-btn" onClick={handleChangePassword}>
                  Сохранить
                </button>
                <button
                  className="text-btn"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Удаление аккаунта</h2>
              <p>Введите пароль для подтверждения:</p>
              <input
                type="password"
                placeholder="Ваш пароль"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoComplete="current-password"
              />
              {deleteError && <div className="error-message">{deleteError}</div>}
              <div className="modal-buttons">
                <button className="danger-btn" onClick={handleDeleteAccount}>
                  Удалить навсегда
                </button>
                <button className="text-btn" onClick={() => setIsDeleteModalOpen(false)}>
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
