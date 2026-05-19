import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Paperclip } from 'lucide-react';
import subjectIcon from '../../../../assets/subject-icon.svg';
import { listSubjects } from '../../../../api/endpoints';
import './SubjectsCard.css';

const SubjectsCard = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listSubjects();
        if (!cancelled) setSubjects((Array.isArray(data) ? data : []).slice(0, 5));
      } catch {
        if (!cancelled) setSubjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="subjects">
      <div className="card">
        <div className="card-header">
          <h3>Мои предметы</h3>
          <button className="btn-add-mini" onClick={() => navigate('/subjects')}>
            <Plus size={20} color="#fff" />
          </button>
        </div>
        <div className="scroll-area">
          {loading ? (
            <p>Загрузка...</p>
          ) : subjects.length === 0 ? (
            <p className="empty">Нет предметов. Добавьте первый!</p>
          ) : (
            subjects.map((subject) => (
              <div key={subject.id} className="subject-item">
                <div className="subject-icon-wrapper">
                  <img src={subjectIcon} alt="icon" className="subject-custom-icon" />
                </div>
                <div className="subject-info">
                  <p className="subject-name">{subject.name}</p>
                  <div className="subject-links-preview">
                    {subject.extra_links &&
                      subject.extra_links.slice(0, 2).map((link, i) => (
                        <span key={i}>
                          <Paperclip size={10} color="#547CC5" /> {link.name}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectsCard;
