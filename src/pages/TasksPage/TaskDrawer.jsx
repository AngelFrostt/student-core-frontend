import React, { useState, useRef, useEffect } from 'react';
import {
  X, Plus, Trash2, Paperclip, Image as ImageIcon, File as FileIcon,
} from 'lucide-react';
import {
  createTask, updateTask, deleteResource,
} from '../../api/endpoints';
import './TasksPage.css';

const TaskDrawer = ({ isDarkMode, subjects, initialTask, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    subject_id: initialTask?.subject?.id || '',
    deadline: initialTask?.deadline
      ? new Date(initialTask.deadline).toISOString().slice(0, 16)
      : '',
    priority: initialTask?.priority || 'medium',
    auto_priority: initialTask?.auto_priority || false,
    reminder_days_before: initialTask?.reminder_days_before || 3,
  });

  const [links, setLinks] = useState(() =>
    initialTask?.resources
      ? initialTask.resources
          .filter((r) => r.resource_type === 'link')
          .map((r) => ({ id: r.id, name: r.name, url: r.url }))
      : [],
  );

  const [existingFiles, setExistingFiles] = useState(() =>
    initialTask?.resources
      ? initialTask.resources.filter(
          (r) => r.resource_type === 'file' || r.resource_type === 'photo',
        )
      : [],
  );

  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => onClose(), 300);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addLink = () => setLinks([...links, { name: '', url: '' }]);
  const updateLink = (index, field, value) => {
    const next = [...links];
    next[index][field] = value;
    setLinks(next);
  };
  const removeLink = async (index) => {
    const linkToDelete = links[index];
    if (linkToDelete.id) {
      try {
        await deleteResource(linkToDelete.id);
      } catch {
        /* ignore */
      }
    }
    setLinks(links.filter((_, i) => i !== index));
  };

  const removeExistingFile = async (resource) => {
    try {
      await deleteResource(resource.id);
      setExistingFiles((prev) => prev.filter((f) => f.id !== resource.id));
    } catch {
      /* ignore */
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...selected]);
  };
  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    const payload = { ...formData };
    if (payload.deadline) {
      const d = new Date(payload.deadline);
      if (!isNaN(d)) payload.deadline = d.toISOString();
    }
    if (payload.subject_id === '') payload.subject_id = null;

    const newLinks = links
      .filter((l) => !l.id && (l.name || l.url))
      .map((l) => ({ resource_type: 'link', name: l.name, url: l.url }));

    try {
      if (initialTask) {
        await updateTask(initialTask.id, payload, {
          files: newFiles,
          resources: newLinks,
          replaceResources: false,
        });
      } else {
        await createTask(payload, { files: newFiles, resources: newLinks });
      }
      onSuccess?.();
      handleClose();
      window.dispatchEvent(new CustomEvent('tasksUpdated'));
    } catch (err) {
      const data = err?.response?.data;
      setError(
        (data && (data.detail || JSON.stringify(data))) ||
          'Ошибка при сохранении задачи',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`drawer-overlay ${animate ? 'visible' : ''}`} onClick={handleClose} />
      <div className={`task-drawer ${isDarkMode ? 'dark' : ''} ${animate ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>{initialTask ? 'Редактировать задачу' : 'Новая задача'}</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>
        <div className="drawer-body">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Название задачи *"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              placeholder="Описание"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
            <select name="subject_id" value={formData.subject_id} onChange={handleChange}>
              <option value="">Без предмета</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="auto_priority"
                checked={formData.auto_priority}
                onChange={handleChange}
              />
              Авто-приоритет
            </label>
            {!formData.auto_priority && (
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            )}
            <div>
              <label>Напомнить за дней до дедлайна:</label>
              <input
                type="number"
                name="reminder_days_before"
                value={formData.reminder_days_before}
                onChange={handleChange}
                min="1"
                max="30"
              />
            </div>

            <div className="resources-section">
              <label>Ссылки (название + URL)</label>
              {links.map((link, idx) => (
                <div key={idx} className="resource-row">
                  <input
                    type="text"
                    placeholder="Название"
                    value={link.name}
                    onChange={(e) => updateLink(idx, 'name', e.target.value)}
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateLink(idx, 'url', e.target.value)}
                  />
                  <button type="button" onClick={() => removeLink(idx)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addLink} className="add-link-btn">
                <Plus size={16} /> Добавить ссылку
              </button>
            </div>

            {existingFiles.length > 0 && (
              <div className="file-upload-section">
                <label>Прикреплённые файлы</label>
                <div className="selected-files">
                  {existingFiles.map((file) => {
                    const fileName =
                      file.name || (file.file?.split('/').pop()) || 'Файл';
                    const isImg =
                      file.resource_type === 'photo' ||
                      (file.file && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.file));
                    return (
                      <div key={file.id} className="file-item">
                        {isImg ? <ImageIcon size={16} /> : <FileIcon size={16} />}
                        <span>{fileName}</span>
                        <button type="button" onClick={() => removeExistingFile(file)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="file-upload-section">
              <label>Добавить файлы (изображения, документы)</label>
              <button
                type="button"
                className="add-file-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={16} /> Выбрать файлы
              </button>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {newFiles.length > 0 && (
                <div className="selected-files">
                  {newFiles.map((file, idx) => (
                    <div key={idx} className="file-item">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon size={16} />
                      ) : (
                        <FileIcon size={16} />
                      )}
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removeNewFile(idx)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-buttons">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button type="button" className="text-btn" onClick={handleClose}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TaskDrawer;
