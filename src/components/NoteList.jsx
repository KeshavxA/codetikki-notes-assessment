import NoteItem from './NoteItem';

const NoteList = ({ notes, onDeleteNote }) => {
  return (
    <div className="note-list">
      {notes.map((note) => (
        <NoteItem 
          key={note.id} 
          note={note} 
          onDelete={() => onDeleteNote(note.id)} 
        />
      ))}
    </div>
  );
};

export default NoteList;