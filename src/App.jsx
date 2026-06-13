import { useState, useEffect } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import Loader from './components/Loader';
import EmptyState from './components/EmptyState';
import './App.css';

function App() {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const addNote = (title, description) => {
    const newNote = { id: Date.now(), title, description };
    setNotes((prevNotes) => [newNote, ...prevNotes]); 
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const updateNote = (id, newTitle, newDescription) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, title: newTitle, description: newDescription } : note
    ));
  };

  if (isLoading) return <Loader />; 

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (note.description && note.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="app-container">
      <h1>My Notes</h1>
      <NoteForm onAddNote={addNote} />
      
      {notes.length > 0 && (
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {notes.length === 0 ? (
        <EmptyState /> 
      ) : filteredNotes.length === 0 ? (
        <p className="no-results">No notes found matching "{searchTerm}"</p>
      ) : (
        <NoteList notes={filteredNotes} onDeleteNote={deleteNote} onUpdateNote={updateNote} />
      )}
    </div>
  );
}

export default App;