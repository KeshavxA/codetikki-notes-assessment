import { useState } from 'react';
import ReactQuill from 'react-quill';
import TagsInput from './TagsInput';
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

const NoteForm = ({ onAddNote }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [color, setColor] = useState('default');
  const [tags, setTags] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 500 * 1024) {
        alert(`File ${file.name} is too large. Max size is 500KB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, {
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
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Error: Title cannot be empty.'); 
      return;
    }
    onAddNote(title, description, category, color, tags, dueDate, attachments);
    setTitle(''); 
    setDescription('');
    setCategory('Personal');
    setColor('default');
    setTags([]);
    setDueDate('');
    setAttachments([]);
    setError('');
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text"
          placeholder="Title (required)"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setError(''); 
          }}
        />
        {error && <p className="error-text">{error}</p>}
      </div>
      
      <ReactQuill 
        theme="snow"
        value={description}
        onChange={setDescription}
        modules={quillModules}
        placeholder="Description (optional)"
        className="rich-text-editor"
      />

      <div className="form-row">
        <div className="form-row-group">
          <input 
            type="date" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)}
            className="due-date-input"
            title="Due Date"
          />
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
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
              className={`color-btn color-${c} ${color === c ? 'selected' : ''}`}
              onClick={() => setColor(c)}
              aria-label={`Select ${c} color`}
            />
          ))}
        </div>
      </div>

      <TagsInput tags={tags} setTags={setTags} />

      <div className="attachments-section">
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
        {attachments.length > 0 && (
          <div className="attachment-previews">
            {attachments.map(att => (
              <div key={att.id} className="attachment-preview">
                {att.type.startsWith('image/') ? (
                  <img src={att.dataUrl} alt={att.name} className="attachment-thumb" />
                ) : (
                  <span className="attachment-icon">📄 {att.name}</span>
                )}
                <button type="button" onClick={() => removeAttachment(att.id)} className="remove-att-btn">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button 
        type="submit" 
        className="submit-btn" 
        disabled={!title.trim()} 
      >
        Submit
      </button>
    </form>
  );
};

export default NoteForm;