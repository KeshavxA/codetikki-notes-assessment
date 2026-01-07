import { useState } from 'react';

const NoteForm = ({ onAddNote }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty.'); 
      return;
    }
    onAddNote(title, description);
    setTitle('');
    setDescription('');
    setError('');
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text"
          placeholder="Title (Required)"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value) setError(''); 
          }}
        />
        {error && <p className="error-message">{error}</p>}
      </div>
      <textarea
        placeholder="Description (Optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit" disabled={!title.trim()}>Add Note</button>
    </form>
  );
};

export default NoteForm;