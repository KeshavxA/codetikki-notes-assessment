import { useState, useEffect } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import Loader from './components/Loader';
import EmptyState from './components/EmptyState';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const addNote = (title, description) => {
    const newNote = {
      id: Date.now(),
      title,
      description
    };
    setNotes([newNote, ...notes]);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id)); 
  };

  return (
    <div className="app-container">
      <h1>My Notes</h1>
      <NoteForm onAddNote={addNote} />
      
      {isLoading ? (
        <Loader />
      ) : notes.length === 0 ? (
        <EmptyState />
      ) : (
        <NoteList notes={notes} onDeleteNote={deleteNote} />
      )}
    </div>
  );
}

export default App;
