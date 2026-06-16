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
  const [filterColor, setFilterColor] = useState('All');
  const [filterDueDate, setFilterDueDate] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [currentView, setCurrentView] = useState('active');
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

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const notifiedNotes = JSON.parse(localStorage.getItem('notifiedNotes') || '[]');
      let newNotified = [...notifiedNotes];
      let didNotify = false;

      notes.forEach(note => {
        if (!note.dueDate || note.status !== 'active') return;
        
        if (notifiedNotes.includes(note.id)) return; 

        const due = new Date(note.dueDate);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) {
          const title = diffDays === 0 ? `Due Today: ${note.title}` : `Overdue: ${note.title}`;
          const bodyText = note.description ? note.description.replace(/(<([^>]+)>)/gi, "").substring(0, 100) : "Check your notes app for details.";
          
          showToast(title);

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: bodyText });
          }

          newNotified.push(note.id);
          didNotify = true;
        }
      });

      if (didNotify) {
        localStorage.setItem('notifiedNotes', JSON.stringify(newNotified));
      }
    };

    const timer = setTimeout(checkReminders, 2000);
    return () => clearTimeout(timer);
  }, [notes]);

  const addNote = (title, description, category, color, tags, dueDate, attachments) => {
    const newNote = { id: Date.now(), title, description, category: category || 'Personal', color: color || 'default', tags: tags || [], dueDate: dueDate || null, attachments: attachments || [], isPinned: false, status: 'active' };
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

  const updateNote = (id, newTitle, newDescription, newCategory, newColor, newTags, newDueDate, newAttachments) => {
    setNotes(notes.map(note => {
      if (note.id === id) {
        const historySnapshot = {
          title: note.title,
          description: note.description,
          category: note.category,
          color: note.color,
          tags: note.tags,
          dueDate: note.dueDate,
          attachments: note.attachments,
          timestamp: new Date().toISOString()
        };
        const newHistory = [historySnapshot, ...(note.history || [])].slice(0, 5);
        return { 
          ...note, 
          title: newTitle, 
          description: newDescription, 
          category: newCategory, 
          color: newColor, 
          tags: newTags || [], 
          dueDate: newDueDate || null, 
          attachments: newAttachments || [],
          history: newHistory
        };
      }
      return note;
    }));
    showToast('Note updated successfully!');
  };

  const restoreNote = (id, historyItem) => {
    setNotes(notes.map(note => {
      if (note.id === id) {
        const historySnapshot = {
          title: note.title,
          description: note.description,
          category: note.category,
          color: note.color,
          tags: note.tags,
          dueDate: note.dueDate,
          attachments: note.attachments,
          timestamp: new Date().toISOString()
        };
        const newHistory = [historySnapshot, ...(note.history || [])].slice(0, 5);

        return {
          ...note,
          title: historyItem.title,
          description: historyItem.description,
          category: historyItem.category,
          color: historyItem.color,
          tags: historyItem.tags,
          dueDate: historyItem.dueDate,
          attachments: historyItem.attachments,
          history: newHistory
        };
      }
      return note;
    }));
    showToast('Note restored to previous version!');
  };

  const handleReorder = (sourceIndex, destinationIndex) => {
    const draggedNoteId = filteredNotes[sourceIndex].id;
    const targetNoteId = filteredNotes[destinationIndex].id;

    const sourceGlobalIndex = notes.findIndex(n => n.id === draggedNoteId);

    const newNotes = Array.from(notes);
    const [removed] = newNotes.splice(sourceGlobalIndex, 1);

    const newTargetGlobalIndex = newNotes.findIndex(n => n.id === targetNoteId);

    let finalIndex = newTargetGlobalIndex;
    if (sourceIndex < destinationIndex) {
      finalIndex = newTargetGlobalIndex + 1;
    }

    newNotes.splice(finalIndex, 0, removed);
    setNotes(newNotes);
  };

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Notes exported successfully!');
  };

  const importNotes = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedNotes = JSON.parse(e.target.result);
        if (Array.isArray(importedNotes)) {
          setNotes(prevNotes => {
            const existingIds = new Set(prevNotes.map(n => n.id));
            const newNotes = importedNotes.filter(n => !existingIds.has(n.id));
            return [...newNotes, ...prevNotes];
          });
          showToast(`Notes imported successfully!`);
        } else {
          showToast('Error: Invalid backup file format.');
        }
      } catch (err) {
        showToast('Error parsing the backup file.');
      }
    };
    reader.readAsText(file);
    event.target.value = null;
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
    const matchesColor = filterColor === 'All' || note.color === filterColor || (!note.color && filterColor === 'default');
    
    let matchesDueDate = true;
    if (filterDueDate !== 'All') {
      if (!note.dueDate) {
        matchesDueDate = false;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(note.dueDate);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        
        if (filterDueDate === 'Overdue' && diffDays < 0) matchesDueDate = true;
        else if (filterDueDate === 'Today' && diffDays === 0) matchesDueDate = true;
        else if (filterDueDate === 'Upcoming' && diffDays > 0) matchesDueDate = true;
        else matchesDueDate = false;
      }
    }

    return matchesSearch && matchesCategory && matchesTags && matchesColor && matchesDueDate;
  }).sort((a, b) => Number(b.isPinned || false) - Number(a.isPinned || false));

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));

  return (
    <div className="app-container">
      <div className="header-row">
        <h1>My Notes</h1>
        <div className="header-actions">
          <button className="header-btn" onClick={() => setShowInsights(true)}>📊 Insights</button>
          <button className="header-btn" onClick={exportNotes}>📤 Export</button>
          <label className="header-btn import-label">
            📥 Import
            <input 
              type="file" 
              accept=".json" 
              onChange={importNotes} 
              style={{ display: 'none' }} 
            />
          </label>
          <button
            className="theme-toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <div className="view-tabs">
        <button className={currentView === 'active' ? 'active-tab' : ''} onClick={() => setCurrentView('active')}>Notes</button>
        <button className={currentView === 'archived' ? 'active-tab' : ''} onClick={() => setCurrentView('archived')}>Archive</button>
        <button className={currentView === 'trash' ? 'active-tab' : ''} onClick={() => setCurrentView('trash')}>Trash</button>
      </div>

      {currentView === 'active' && <NoteForm onAddNote={addNote} />}

      {notes.length > 0 && currentView !== 'trash' && (
        <div className="search-and-filter">
          <div className="search-container" style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button 
              className="toggle-filters-btn" 
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Advanced Filters ⚙️'}
            </button>
          </div>

          {showFilters && (
            <div className="advanced-filters-panel">
              <div className="filter-group">
                <label>Category:</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                  <option value="All">All Categories</option>
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Ideas">Ideas</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Color:</label>
                <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)} className="filter-select">
                  <option value="All">All Colors</option>
                  <option value="default">Default</option>
                  <option value="#ffcdd2">Red</option>
                  <option value="#c8e6c9">Green</option>
                  <option value="#bbdefb">Blue</option>
                  <option value="#fff9c4">Yellow</option>
                  <option value="#e1bee7">Purple</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Due Date:</label>
                <select value={filterDueDate} onChange={(e) => setFilterDueDate(e.target.value)} className="filter-select">
                  <option value="All">Any Time</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Today">Due Today</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>

              {allTags.length > 0 && (
                <div className="filter-tags">
                  <span className="filter-tags-label">Tags:</span>
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
          onReorder={handleReorder}
          onRestoreNote={restoreNote}
        />
      )}
      <Toast message={toastMessage} />

      {showInsights && (
        <div className="insights-modal-overlay">
          <div className="insights-modal">
            <div className="insights-header">
              <h2>Statistics Dashboard</h2>
              <button className="close-insights-btn" onClick={() => setShowInsights(false)}>×</button>
            </div>
            <div className="stat-grid">
              <div className="stat-card">
                <h3>Total Notes</h3>
                <p>{notes.length}</p>
              </div>
              <div className="stat-card">
                <h3>Active</h3>
                <p>{notes.filter(n => (n.status || 'active') === 'active').length}</p>
              </div>
              <div className="stat-card">
                <h3>Pinned</h3>
                <p>{notes.filter(n => n.isPinned).length}</p>
              </div>
              <div className="stat-card">
                <h3>With Attachments</h3>
                <p>{notes.filter(n => n.attachments && n.attachments.length > 0).length}</p>
              </div>
              <div className="stat-card">
                <h3>With Voice Notes</h3>
                <p>{notes.filter(n => n.attachments && n.attachments.some(a => a.type.startsWith('audio/'))).length}</p>
              </div>
              <div className="stat-card">
                <h3>Archived</h3>
                <p>{notes.filter(n => n.status === 'archived').length}</p>
              </div>
            </div>
            
            <div className="insights-category-breakdown">
              <h3>By Category</h3>
              <ul>
                <li>Personal: {notes.filter(n => (n.category || 'Personal') === 'Personal').length}</li>
                <li>Work: {notes.filter(n => n.category === 'Work').length}</li>
                <li>Ideas: {notes.filter(n => n.category === 'Ideas').length}</li>
                <li>Other: {notes.filter(n => n.category === 'Other').length}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;