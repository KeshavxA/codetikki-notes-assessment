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
  const [filterCategory, setFilterCategory] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const addNote = (title, description, category) => {
    const newNote = { id: Date.now(), title, description, category: category || 'Personal' };
    setNotes((prevNotes) => [newNote, ...prevNotes]); 
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const updateNote = (id, newTitle, newDescription, newCategory) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, title: newTitle, description: newDescription, category: newCategory } : note
    ));
  };

  if (isLoading) return <Loader />; 

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (note.description && note.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || note.category === filterCategory || (!note.category && filterCategory === 'Personal');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-container">
      <div className="header-row">
        <h1>My Notes</h1>
        <button 
          className="theme-toggle-btn" 
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
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
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Ideas">Ideas</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}

      {notes.length === 0 ? (
        <EmptyState /> 
      ) : filteredNotes.length === 0 ? (
        <p className="no-results">No notes found matching your filters</p>
      ) : (
        <NoteList notes={filteredNotes} onDeleteNote={deleteNote} onUpdateNote={updateNote} />
      )}
    </div>
  );
}

export default App;