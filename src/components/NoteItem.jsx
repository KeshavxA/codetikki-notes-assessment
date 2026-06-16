import { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import TagsInput from './TagsInput';
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';

const NOTE_COLORS = ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'check'}],
    ['link', 'image', 'code-block'],
    ['clean']
  ]
};

const NoteItem = ({ note, currentView, onChangeStatus, onDeleteForever, onUpdate, onTogglePin, onRestoreNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editDescription, setEditDescription] = useState(note.description);
  const [editCategory, setEditCategory] = useState(note.category || 'Personal');
  const [editColor, setEditColor] = useState(note.color || 'default');
  const [editTags, setEditTags] = useState(note.tags || []);
  const [editDueDate, setEditDueDate] = useState(note.dueDate || '');
  const [editAttachments, setEditAttachments] = useState(note.attachments || []);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 500 * 1024) {
        alert(`File ${file.name} is too large. Max size is 500KB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAttachments(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          dataUrl: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const removeAttachment = (id) => {
    setEditAttachments(prev => prev.filter(att => att.id !== id));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditAttachments(prev => [...prev, {
            id: Date.now() + Math.random(),
            name: `Voice_Note_${new Date().toLocaleTimeString().replace(/:/g, '-')}.webm`,
            type: 'audio/webm',
            dataUrl: reader.result
          }]);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      timerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000); 
    } catch (err) {
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearTimeout(timerRef.current);
    }
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(note.id, editTitle, editDescription, editCategory, editColor, editTags, editDueDate, editAttachments);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`note-card editing bg-${editColor}`}>
        <input 
          type="text" 
          value={editTitle} 
          onChange={(e) => setEditTitle(e.target.value)} 
          className="edit-input"
          placeholder="Note Title"
        />
        <ReactQuill 
          theme="snow"
          value={editDescription} 
          onChange={setEditDescription} 
          modules={quillModules}
          className="edit-rich-text"
          placeholder="Note Description"
        />
        <div className="form-row">
          <div className="form-row-group">
            <input 
              type="date" 
              value={editDueDate} 
              onChange={(e) => setEditDueDate(e.target.value)}
              className="due-date-input"
              title="Due Date"
            />
            <select 
              value={editCategory} 
              onChange={(e) => setEditCategory(e.target.value)}
              className="category-select"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Ideas">Ideas</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="color-picker">
            {NOTE_COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`color-btn color-${c} ${editColor === c ? 'selected' : ''}`}
                onClick={() => setEditColor(c)}
                aria-label={`Select ${c} color`}
              />
            ))}
          </div>
        </div>

        <TagsInput tags={editTags} setTags={setEditTags} />

        <div className="attachments-section">
          <div className="attachment-actions">
            <label className="attachment-btn">
              📎 Attach Files
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </label>
            {!isRecording ? (
              <button type="button" className="attachment-btn record-btn" onClick={startRecording}>
                🎤 Record Audio
              </button>
            ) : (
              <button type="button" className="attachment-btn stop-record-btn" onClick={stopRecording}>
                🛑 Stop Recording
              </button>
            )}
          </div>
          {editAttachments.length > 0 && (
            <div className="attachment-previews">
              {editAttachments.map(att => (
                <div key={att.id} className="attachment-preview">
                  {att.type.startsWith('image/') ? (
                    <img src={att.dataUrl} alt={att.name} className="attachment-thumb" />
                  ) : att.type.startsWith('audio/') ? (
                    <div className="audio-preview">
                      <span className="attachment-icon">🎵 {att.name.length > 15 ? att.name.substring(0, 15) + '...' : att.name}</span>
                      <audio controls src={att.dataUrl} className="audio-player" />
                    </div>
                  ) : (
                    <span className="attachment-icon" title={att.name}>📄 {att.name.length > 15 ? att.name.substring(0, 15) + '...' : att.name}</span>
                  )}
                  <button type="button" onClick={() => removeAttachment(att.id)} className="remove-att-btn">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="note-actions">
          <button className="save-btn" onClick={handleSave}>Save</button>
          <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  const getDueDateStatus = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'due-soon';
    return 'upcoming';
  };

  const dueStatus = getDueDateStatus(note.dueDate);

  return (
    <div className={`note-card bg-${note.color || 'default'} ${note.isPinned ? 'pinned-card' : ''}`}>
      <div className="note-content">
        <div className="note-header">
          <h3>
            {note.isPinned && <span className="pin-icon">📌</span>}
            Title: {note.title}
          </h3>
          <span className={`category-badge cat-${(note.category || 'Personal').toLowerCase()}`}>
            {note.category || 'Personal'}
          </span>
        </div>
        
        {note.dueDate && (
          <div className={`due-date-display ${dueStatus}`}>
            📅 {new Date(note.dueDate).toLocaleDateString()} 
            {dueStatus === 'overdue' && ' (Overdue!)'}
            {dueStatus === 'due-soon' && ' (Due soon)'}
          </div>
        )}

        <div className="note-description-container">
          <strong>Description: </strong>
          {note.description ? (
            <div 
              className="note-description-content ql-editor"
              style={{ padding: 0 }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.description, { ADD_ATTR: ['data-list', 'target'] }) }} 
            />
          ) : (
            <span>No description provided</span>
          )}
        </div>
        
        {note.attachments && note.attachments.length > 0 && (
          <div className="note-attachments-view">
            <strong>Attachments: </strong>
            <div className="attachment-previews">
              {note.attachments.map(att => (
                <div key={att.id} className="attachment-preview view-only">
                  {att.type.startsWith('image/') ? (
                    <a href={att.dataUrl} download={att.name} title={`Download ${att.name}`}>
                      <img src={att.dataUrl} alt={att.name} className="attachment-thumb" />
                    </a>
                  ) : att.type.startsWith('audio/') ? (
                    <div className="audio-preview">
                      <span className="attachment-icon">🎵 {att.name.length > 15 ? att.name.substring(0, 15) + '...' : att.name}</span>
                      <audio controls src={att.dataUrl} className="audio-player" />
                      <a href={att.dataUrl} download={att.name} className="attachment-link" title={`Download ${att.name}`}>⬇️ Download</a>
                    </div>
                  ) : (
                    <a href={att.dataUrl} download={att.name} className="attachment-link" title={`Download ${att.name}`}>
                      📄 {att.name.length > 15 ? att.name.substring(0, 15) + '...' : att.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {note.tags && note.tags.length > 0 && (
          <div className="note-tags">
            {note.tags.map(tag => (
              <span key={tag} className="tag-chip readonly">#{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div className="note-actions">
        {currentView === 'active' && (
          <>
            <button className="pin-btn" onClick={() => onTogglePin(note.id)}>{note.isPinned ? 'Unpin' : 'Pin'}</button>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="history-btn" onClick={() => setShowHistory(!showHistory)}>🕒 History</button>
            <button className="archive-btn" onClick={() => onChangeStatus('archived')}>Archive</button>
            <button className="delete-btn" onClick={() => onChangeStatus('trash')}>Delete</button>
          </>
        )}
        {currentView === 'archived' && (
          <>
            <button className="pin-btn" onClick={() => onTogglePin(note.id)}>{note.isPinned ? 'Unpin' : 'Pin'}</button>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="history-btn" onClick={() => setShowHistory(!showHistory)}>🕒 History</button>
            <button className="archive-btn" onClick={() => onChangeStatus('active')}>Unarchive</button>
            <button className="delete-btn" onClick={() => onChangeStatus('trash')}>Delete</button>
          </>
        )}
        {currentView === 'trash' && (
          <>
            <button className="save-btn" onClick={() => onChangeStatus('active')}>Restore</button>
            <button className="delete-btn" onClick={onDeleteForever}>Delete Forever</button>
          </>
        )}
      </div>

      {showHistory && (
        <div className="note-history-section">
          <h4>Version History</h4>
          {note.history && note.history.length > 0 ? (
            <ul className="history-list">
              {note.history.map((h, i) => (
                <li key={i} className="history-item">
                  <span className="history-timestamp">{new Date(h.timestamp).toLocaleString()}</span>
                  <button 
                    className="restore-btn" 
                    onClick={() => {
                      onRestoreNote(h);
                      setShowHistory(false);
                    }}
                  >
                    Revert
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-history-text">No previous versions available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteItem;