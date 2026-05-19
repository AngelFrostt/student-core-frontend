import React, { useState } from 'react';
import {
  Edit2, Calendar, Flag, CheckCircle, Circle, PlayCircle,
  Image as ImageIcon, File as FileIcon, Link as LinkIcon,
  X, Download, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { deleteResource } from '../../api/endpoints';
import api, { mediaUrl } from '../../api/client';
import './TasksPage.css';

const TaskCard = ({ task, isArchived, onEdit, onStatusChange, onResourceChanged }) => {
  const [modalType, setModalType] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const priorityLabels = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
  const priorityColors = { high: '#BE4141', medium: '#C5B454', low: '#439E31' };
  const statusOptions = [
    { value: 'not_started', label: 'Не начато', icon: <Circle size={14} /> },
    { value: 'in_progress', label: 'В процессе', icon: <PlayCircle size={14} /> },
    { value: 'completed', label: 'Выполнено', icon: <CheckCircle size={14} /> },
  ];

  const getDaysLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Просрочено';
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Завтра';
    return `${days} дн.`;
  };

  const handleStatusChange = (e) => onStatusChange(task.id, e.target.value);
  const showStatusSelect = !isArchived && task.progress_status !== 'completed';

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
  };

  const photoResources =
    task.resources?.filter(
      (r) =>
        r.resource_type === 'photo' ||
        (r.resource_type === 'file' && r.file && isImageFile(r.file)),
    ) || [];
  const linkResources =
    task.resources?.filter((r) => r.resource_type === 'link' && r.url) || [];
  const fileResources =
    task.resources?.filter(
      (r) => r.resource_type === 'file' && r.file && !isImageFile(r.file),
    ) || [];

  const downloadFile = async (fileUrl, fileName) => {
    try {
      const res = await api.get(fileUrl, { responseType: 'blob', baseURL: '' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      /* ignore */
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Удалить этот файл? Он будет удалён безвозвратно.')) return;
    try {
      await deleteResource(resourceId);
      onResourceChanged?.();
      window.dispatchEvent(new CustomEvent('tasksUpdated'));
    } catch {
      /* ignore */
    }
  };

  const PhotoModal = () => {
    const currentPhoto = photoResources[currentPhotoIndex];
    const currentUrl = currentPhoto ? mediaUrl(currentPhoto.file) : null;
    const fileName =
      currentPhoto?.name || currentPhoto?.file?.split('/').pop() || 'photo';

    const goPrev = () =>
      setCurrentPhotoIndex((prev) =>
        prev > 0 ? prev - 1 : photoResources.length - 1,
      );
    const goNext = () =>
      setCurrentPhotoIndex((prev) =>
        prev < photoResources.length - 1 ? prev + 1 : 0,
      );

    return (
      <div className="modal-overlay" onClick={() => setModalType(null)}>
        <div className="resource-modal photo-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Фото ({currentPhotoIndex + 1} / {photoResources.length})</h3>
            <button className="close-btn" onClick={() => setModalType(null)}>
              <X size={20} />
            </button>
          </div>
          <div className="photo-viewer">
            <button
              className="nav-btn left"
              onClick={goPrev}
              disabled={photoResources.length <= 1}
            >
              <ChevronLeft size={24} />
            </button>
            <div className="photo-container">
              {currentUrl && <img src={currentUrl} alt={fileName} />}
            </div>
            <button
              className="nav-btn right"
              onClick={goNext}
              disabled={photoResources.length <= 1}
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <div className="photo-actions">
            <button className="action-btn" onClick={() => downloadFile(currentUrl, fileName)}>
              <Download size={16} /> Скачать
            </button>
            <button
              className="action-btn delete"
              onClick={() => handleDeleteResource(currentPhoto.id)}
            >
              <Trash2 size={16} /> Удалить
            </button>
          </div>
          <div className="photo-thumbnails">
            {photoResources.map((res, idx) => (
              <div
                key={res.id}
                className={`thumbnail ${idx === currentPhotoIndex ? 'active' : ''}`}
                onClick={() => setCurrentPhotoIndex(idx)}
              >
                <img src={mediaUrl(res.file)} alt="thumb" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const LinksModal = () => (
    <div className="modal-overlay" onClick={() => setModalType(null)}>
      <div className="resource-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ссылки ({linkResources.length})</h3>
          <button className="close-btn" onClick={() => setModalType(null)}>
            <X size={20} />
          </button>
        </div>
        <div className="links-list-modal">
          {linkResources.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-item-modal"
            >
              <LinkIcon size={16} /> {link.name || link.url}
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  const FilesModal = () => (
    <div className="modal-overlay" onClick={() => setModalType(null)}>
      <div className="resource-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Файлы ({fileResources.length})</h3>
          <button className="close-btn" onClick={() => setModalType(null)}>
            <X size={20} />
          </button>
        </div>
        <div className="files-list-modal">
          {fileResources.map((file) => {
            const fileUrl = mediaUrl(file.file);
            if (!fileUrl) return null;
            const fileName = file.name || file.file.split('/').pop();
            return (
              <div key={file.id} className="file-item-modal">
                <FileIcon size={16} />
                <span>{fileName}</span>
                <button
                  className="download-btn"
                  onClick={() => downloadFile(fileUrl, fileName)}
                >
                  Скачать
                </button>
                <button
                  className="delete-resource-btn"
                  onClick={() => handleDeleteResource(file.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const FullImageView = () => (
    <div className="modal-overlay full-image" onClick={() => setSelectedImage(null)}>
      <div className="full-image-container" onClick={(e) => e.stopPropagation()}>
        <img src={selectedImage} alt="full" />
        <button className="close-full" onClick={() => setSelectedImage(null)}>
          <X size={24} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className={`task-card ${isArchived ? 'archived' : ''}`}>
        <div
          className="task-card-header"
          style={{ borderLeftColor: priorityColors[task.priority] }}
        >
          <h3>{task.title}</h3>
          <div className="task-actions">
            {!isArchived && (
              <button onClick={() => onEdit(task)}>
                <Edit2 size={16} />
              </button>
            )}
          </div>
        </div>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          {task.subject && <span className="subject-tag">{task.subject.name}</span>}
          <span className="deadline">
            <Calendar size={12} /> {new Date(task.deadline).toLocaleString()}
          </span>
          <span className="priority" style={{ background: priorityColors[task.priority] }}>
            <Flag size={12} /> {priorityLabels[task.priority]}
          </span>
        </div>

        <div className="task-resource-buttons">
          {photoResources.length > 0 && (
            <button
              className="resource-btn"
              onClick={() => {
                setCurrentPhotoIndex(0);
                setModalType('photos');
              }}
            >
              <ImageIcon size={16} /> Фото ({photoResources.length})
            </button>
          )}
          {linkResources.length > 0 && (
            <button className="resource-btn" onClick={() => setModalType('links')}>
              <LinkIcon size={16} /> Ссылки ({linkResources.length})
            </button>
          )}
          {fileResources.length > 0 && (
            <button className="resource-btn" onClick={() => setModalType('files')}>
              <FileIcon size={16} /> Файлы ({fileResources.length})
            </button>
          )}
        </div>

        <div className="task-footer">
          {!isArchived && (
            <>
              {showStatusSelect ? (
                <select
                  className="task-status-select"
                  value={task.progress_status}
                  onChange={handleStatusChange}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="task-status-completed">
                  <CheckCircle size={14} /> Выполнено
                </div>
              )}
              <div className="task-deadline-warning">{getDaysLeft(task.deadline)}</div>
            </>
          )}
          {isArchived && (
            <button
              className="delete-forever-btn"
              onClick={() => onStatusChange(task.id, 'delete')}
            >
              Удалить навсегда
            </button>
          )}
        </div>
      </div>

      {modalType === 'photos' && <PhotoModal />}
      {modalType === 'links' && <LinksModal />}
      {modalType === 'files' && <FilesModal />}
      {selectedImage && <FullImageView />}
    </>
  );
};

export default TaskCard;
