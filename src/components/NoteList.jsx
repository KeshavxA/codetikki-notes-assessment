import NoteItem from './NoteItem';

const NoteList = ({ notes, onDeleteNote, onUpdateNote }) => {
  return (
    <div className="note-list">
      {notes.map((note) => (
        <NoteItem 
          key={note.id} 
          note={note} 
          onDelete={() => onDeleteNote(note.id)} 
          onUpdate={onUpdateNote}
        />
      ))}
    </div>
  );
};

export default NoteList;