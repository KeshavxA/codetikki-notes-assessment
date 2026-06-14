import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NOTE_COLORS = ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

const NoteForm = ({ onAddNote }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [color, setColor] = useState('default');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Error: Title cannot be empty.'); 
      return;
    }
    onAddNote(title, description, category, color);
    setTitle(''); 
    setDescription('');
    setCategory('Personal');
    setColor('default');
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
        placeholder="Description (optional)"
        className="rich-text-editor"
      />

      <div className="form-row">
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