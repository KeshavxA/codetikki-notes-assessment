import { useState } from 'react';
import ReactQuill from 'react-quill';
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';

const NoteItem = ({ note, onDelete, onUpdate, onTogglePin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editDescription, setEditDescription] = useState(note.description);
  const [editCategory, setEditCategory] = useState(note.category || 'Personal');

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(note.id, editTitle, editDescription, editCategory);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="note-card editing">
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
          className="edit-rich-text"
          placeholder="Note Description"
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
        <div className="note-actions">
          <button className="save-btn" onClick={handleSave}>Save</button>
          <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`note-card ${note.isPinned ? 'pinned-card' : ''}`}>
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
        <div className="note-description-container">
          <strong>Description: </strong>
          {note.description ? (
            <div 
              className="note-description-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.description) }} 
            />
          ) : (
            <span>No description provided</span>
          )}
        </div>
      </div>
      <div className="note-actions">
        <button className="pin-btn" onClick={() => onTogglePin(note.id)}>
          {note.isPinned ? 'Unpin' : 'Pin'}
        </button>
        <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
        <button className="delete-btn" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
};

export default NoteItem;