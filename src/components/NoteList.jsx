import NoteItem from './NoteItem';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const NoteList = ({ notes, currentView, onChangeStatus, onDeleteForever, onUpdateNote, onTogglePin, onReorder }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    
    if (onReorder) {
      onReorder(result.source.index, result.destination.index);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="notes-list">
        {(provided) => (
          <div 
            className="note-list" 
            {...provided.droppableProps} 
            ref={provided.innerRef}
          >
            {notes.map((note, index) => (
              <Draggable key={note.id.toString()} draggableId={note.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`draggable-note-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.9 : 1,
                    }}
                  >
                    <NoteItem 
                      note={note} 
                      currentView={currentView}
                      onChangeStatus={(newStatus) => onChangeStatus(note.id, newStatus)}
                      onDeleteForever={() => onDeleteForever(note.id)}
                      onUpdate={onUpdateNote}
                      onTogglePin={onTogglePin}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default NoteList;