import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Paperclip } from 'lucide-react';
import Sidebar from '../Dashboard/components/Sidebar/Sidebar';
import TopBar from '../Dashboard/components/TopBar/TopBar';
import MobileNav from '../Dashboard/components/MobileNav/MobileNav';
import subjectIcon from '../../assets/subject-icon.svg';
import {
  listSubjects, createSubject, updateSubject, deleteSubject,
} from '../../api/endpoints';
import './SubjectsPage.css';

const SubjectsPage = ({ isDarkMode, setIsDarkMode }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [layout, setLayout] = useState('desktop');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    teacher_name: '',
    extra_links: [],
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) setLayout('mobile');
      else if (width <= 1858) setLayout('tablet');
      else setLayout('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await listSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch {
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', teacher_name: '', extra_links: [] });
    setEditingSubject(null);
    setShowForm(false);
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addExtraLink = () =>
    setFormData({
      ...formData,
      extra_links: [...formData.extra_links, { name: '', url: '' }],
    });

  const updateExtraLink = (index, field, value) => {
    const newLinks = [...formData.extra_links];
    newLinks[index][field] = value;
    setFormData({ ...formData, extra_links: newLinks });
  };

  const removeExtraLink = (index) => {
    setFormData({
      ...formData,
      extra_links: formData.extra_links.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: formData.name.trim(),
      teacher_name: formData.teacher_name.trim(),
      extra_links: formData.extra_links.filter((l) => l.name && l.url),
    };
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, payload);
      } else {
        await createSubject(payload);
      }
      await fetchSubjects();
      resetForm();
    } catch (err) {
      const data = err?.response?.data;
      setError(
        (data && (data.detail || JSON.stringify(data))) ||
          'Ошибка при сохранении предмета',
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить предмет?')) return;
    try {
      await deleteSubject(id);
      await fetchSubjects();
    } catch {
      /* ignore */
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      name: subject.name,
      teacher_name: subject.teacher_name || '',
      extra_links: subject.extra_links || [],
    });
    setEditingSubject(subject);
    setShowForm(true);
  };

  const renderLinks = (subject) => {
    if (!subject.extra_links || subject.extra_links.length === 0) return null;
    const validLinks = subject.extra_links.filter((link) => link.name && link.url);
    if (validLinks.length === 0) return null;
    return (
      <div className="links-list">
        {validLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-item"
          >
            <Paperclip size={14} color="#547CC5" />
            <span>{link.name}</span>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className={`subjects-container ${isDarkMode ? 'dark' : ''}`}>
      {layout === 'desktop' && <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      {layout === 'tablet' && <TopBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      {layout === 'mobile' && <MobileNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}

      <main className="subjects-content">
        <div className="subjects-header">
          <h1>Мои предметы</h1>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <Plus size={20} /> Добавить предмет
          </button>
        </div>

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <div className="subjects-grid">
            {subjects.map((subject) => (
              <div key={subject.id} className="subject-card">
                <div className="subject-card-header">
                  <div className="title-with-icon">
                    <img src={subjectIcon} alt="subject icon" className="subject-icon" />
                    <h3>{subject.name}</h3>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(subject)}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(subject.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {subject.teacher_name && (
                  <p className="teacher">Преподаватель: {subject.teacher_name}</p>
                )}
                {renderLinks(subject)}
                <div className="subject-footer">
                  <small>Добавлен: {new Date(subject.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={resetForm}>
            <div
              className="modal-content subject-form"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingSubject ? 'Редактировать предмет' : 'Новый предмет'}</h2>
                <button className="close-btn" onClick={resetForm}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Название предмета *"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="teacher_name"
                  placeholder="Преподаватель"
                  value={formData.teacher_name}
                  onChange={handleInputChange}
                />

                <label>Дополнительные ссылки:</label>
                {formData.extra_links.map((link, idx) => (
                  <div key={idx} className="extra-link-row">
                    <input
                      type="text"
                      placeholder="Название"
                      value={link.name}
                      onChange={(e) => updateExtraLink(idx, 'name', e.target.value)}
                    />
                    <input
                      type="url"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateExtraLink(idx, 'url', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeExtraLink(idx)}
                      className="remove-link-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addExtraLink} className="add-link-btn">
                  <Plus size={16} /> Добавить ссылку
                </button>

                {error && <div className="error-message">{error}</div>}

                <div className="form-buttons">
                  <button type="submit" className="primary-btn">
                    <Save size={16} /> Сохранить
                  </button>
                  <button type="button" className="text-btn" onClick={resetForm}>
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubjectsPage;
