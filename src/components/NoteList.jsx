import NoteItem from './NoteItem';

const NoteList = ({ notes, onDeleteNote, onUpdateNote, onTogglePin }) => {
  return (
    <div className="note-list">
      {notes.map((note) => (
        <NoteItem 
          key={note.id} 
          note={note} 
          onDelete={() => onDeleteNote(note.id)} 
          onUpdate={onUpdateNote}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
};

export default NoteList;