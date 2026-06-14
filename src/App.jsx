import { useState, useEffect } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import Loader from './components/Loader';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';
import './App.css';

function App() {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterTags, setFilterTags] = useState([]);
  const [currentView, setCurrentView] = useState('active'); // active, archived, trash
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

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

  const addNote = (title, description, category, color, tags) => {
    const newNote = { id: Date.now(), title, description, category: category || 'Personal', color: color || 'default', tags: tags || [], isPinned: false, status: 'active' };
    setNotes((prevNotes) => [newNote, ...prevNotes]); 
    showToast('Note added successfully!');
  };

  const changeNoteStatus = (id, newStatus) => {
    setNotes(notes.map(note => note.id === id ? { ...note, status: newStatus } : note));
    if (newStatus === 'trash') showToast('Note moved to trash.');
    else if (newStatus === 'archived') showToast('Note archived.');
    else if (newStatus === 'active') showToast('Note restored.');
  };

  const deleteNoteForever = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    showToast('Note permanently deleted!');
  };

  const updateNote = (id, newTitle, newDescription, newCategory, newColor, newTags) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, title: newTitle, description: newDescription, category: newCategory, color: newColor, tags: newTags || [] } : note
    ));
    showToast('Note updated successfully!');
  };

  const togglePin = (id) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  if (isLoading) return <Loader />; 

  const filteredNotes = notes.filter(note => {
    const noteStatus = note.status || 'active';
    if (noteStatus !== currentView) return false;
    
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (note.description && note.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || note.category === filterCategory || (!note.category && filterCategory === 'Personal');
    const matchesTags = filterTags.length === 0 || filterTags.every(tag => note.tags && note.tags.includes(tag));
    return matchesSearch && matchesCategory && matchesTags;
  }).sort((a, b) => Number(b.isPinned || false) - Number(a.isPinned || false));

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));

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

      <div className="view-tabs">
        <button className={currentView === 'active' ? 'active-tab' : ''} onClick={() => setCurrentView('active')}>Notes</button>
        <button className={currentView === 'archived' ? 'active-tab' : ''} onClick={() => setCurrentView('archived')}>Archive</button>
        <button className={currentView === 'trash' ? 'active-tab' : ''} onClick={() => setCurrentView('trash')}>Trash</button>
      </div>

      {currentView === 'active' && <NoteForm onAddNote={addNote} />}
      
      {notes.length > 0 && currentView !== 'trash' && (
        <div className="search-and-filter">
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
          {allTags.length > 0 && (
            <div className="filter-tags">
              <span className="filter-tags-label">Filter by Tags:</span>
              {allTags.map(tag => (
                <button 
                  key={tag} 
                  className={`tag-chip ${filterTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => {
                    if (filterTags.includes(tag)) {
                      setFilterTags(filterTags.filter(t => t !== tag));
                    } else {
                      setFilterTags([...filterTags, tag]);
                    }
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {notes.filter(n => (n.status || 'active') === currentView).length === 0 ? (
        currentView === 'active' ? <EmptyState /> : <p className="no-results">No notes in {currentView}.</p>
      ) : filteredNotes.length === 0 ? (
        <p className="no-results">No notes found matching your filters</p>
      ) : (
        <NoteList 
          notes={filteredNotes} 
          currentView={currentView}
          onChangeStatus={changeNoteStatus}
          onDeleteForever={deleteNoteForever}
          onUpdateNote={updateNote} 
          onTogglePin={togglePin} 
        />
      )}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;