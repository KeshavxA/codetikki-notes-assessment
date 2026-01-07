const NoteItem = ({ note, onDelete }) => (
    <div className="note-item">
      <h3>{note.title}</h3>
      <p>{note.description}</p>
      <button onClick={onDelete} className="delete-btn">Delete</button>
    </div>
  );
  
  export default NoteItem;