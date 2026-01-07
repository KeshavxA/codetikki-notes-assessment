const NoteItem = ({ note, onDelete }) => (
    <div className="note-card">
      <div className="note-content">
        <h3>Title: {note.title}</h3>
        <p>Description: {note.description || 'No description provided'}</p>
      </div>
      <button className="delete-btn" onClick={onDelete}>Delete</button>
    </div>
  );
  
  export default NoteItem;