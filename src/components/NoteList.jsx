import React from 'react';
import NoteItem from './NoteItem';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const NoteList = ({ notes, currentView, onChangeStatus, onDeleteForever, onUpdateNote, onTogglePin, onReorder, onRestoreNote, onDuplicateNote, searchTerm, onTagClick }) => {
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
            {notes.map((note, index) => {
              const isFirstPinned = currentView === 'active' && note.isPinned && index === 0;
              const isFirstUnpinned = currentView === 'active' && !note.isPinned && (index === 0 || notes[index - 1].isPinned);
              
              return (
                <React.Fragment key={note.id.toString() + '-frag'}>
                  {isFirstPinned && <div className="list-section-header">📌 Pinned</div>}
                  {isFirstUnpinned && (index !== 0 || notes.some(n => n.isPinned)) && <div className="list-section-header" style={{ marginTop: index === 0 ? '0' : '20px' }}>📝 Others</div>}
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
                      searchTerm={searchTerm}
                      onChangeStatus={(newStatus) => onChangeStatus(note.id, newStatus)}
                      onDeleteForever={() => onDeleteForever(note.id)}
                      onUpdate={onUpdateNote}
                      onTogglePin={() => onTogglePin(note.id)}
                      onRestoreNote={onRestoreNote}
                      onDuplicate={() => onDuplicateNote(note.id)}
                      onTagClick={onTagClick}
                    />
                  </div>
                )}
              </Draggable>
                </React.Fragment>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default NoteList;