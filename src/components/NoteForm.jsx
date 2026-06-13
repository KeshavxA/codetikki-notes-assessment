import { useState } from 'react';

const NoteForm = ({ onAddNote }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Error: Title cannot be empty.'); 
      return;
    }
    onAddNote(title, description, category);
    setTitle(''); 
    setDescription('');
    setCategory('Personal');
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
      
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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