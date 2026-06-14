import NoteItem from './NoteItem';

const NoteList = ({ notes, currentView, onChangeStatus, onDeleteForever, onUpdateNote, onTogglePin }) => {
  return (
    <div className="note-list">
      {notes.map((note) => (
        <NoteItem 
          key={note.id} 
          note={note} 
          currentView={currentView}
          onChangeStatus={(newStatus) => onChangeStatus(note.id, newStatus)}
          onDeleteForever={() => onDeleteForever(note.id)}
          onUpdate={onUpdateNote}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
};

export default NoteList;