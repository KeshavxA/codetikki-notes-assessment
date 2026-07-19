import { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import TagsInput from './TagsInput';
import 'react-quill/dist/quill.snow.css';

const NOTE_COLORS = ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'check'}],
    ['link', 'image', 'code-block'],
    ['clean']
  ]
};

const NoteForm = ({ onAddNote }) => {
  const [title, setTitle] = useState(() => localStorage.getItem('draft_title') || '');
  const [description, setDescription] = useState(() => localStorage.getItem('draft_description') || '');
  const [category, setCategory] = useState(() => localStorage.getItem('draft_category') || 'Personal');
  const [color, setColor] = useState(() => localStorage.getItem('draft_color') || 'default');
  const [tags, setTags] = useState(() => JSON.parse(localStorage.getItem('draft_tags') || '[]'));
  const [dueDate, setDueDate] = useState(() => localStorage.getItem('draft_dueDate') || '');
  const [attachments, setAttachments] = useState(() => JSON.parse(localStorage.getItem('draft_attachments') || '[]'));
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('draft_title', title);
    localStorage.setItem('draft_description', description);
    localStorage.setItem('draft_category', category);
    localStorage.setItem('draft_color', color);
    localStorage.setItem('draft_tags', JSON.stringify(tags));
    localStorage.setItem('draft_dueDate', dueDate);
    localStorage.setItem('draft_attachments', JSON.stringify(attachments));
  }, [title, description, category, color, tags, dueDate, attachments]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 500 * 1024) {
        alert(`File ${file.name} is too large. Max size is 500KB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          dataUrl: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments(prev => [...prev, {
            id: Date.now() + Math.random(),
            name: `Voice_Note_${new Date().toLocaleTimeString().replace(/:/g, '-')}.webm`,
            type: 'audio/webm',
            dataUrl: reader.result
          }]);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      timerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000); 
    } catch (err) {
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearTimeout(timerRef.current);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Error: Title cannot be empty.'); 
      return;
    }
    onAddNote(title, description, category, color, tags, dueDate, attachments);
    setTitle(''); 
    setDescription('');
    setCategory('Personal');
    setColor('default');
    setTags([]);
    setDueDate('');
    setAttachments([]);
    setError('');

    ['draft_title', 'draft_description', 'draft_category', 'draft_color', 'draft_tags', 'draft_dueDate', 'draft_attachments'].forEach(key => localStorage.removeItem(key));
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const getEditorStats = () => {
    const plainText = description.replace(/<[^>]*>?/gm, '');
    const charCount = plainText.length;
    const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
    return { charCount, wordCount };
  };

  const { charCount, wordCount } = getEditorStats();

  return (
    <form className="note-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className="input-group">
        <input
          type="text"
          placeholder="Title (required)"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setError(''); 
          }}
          className={title.length > 60 ? 'warning-border' : ''}
        />
        {title.length > 60 && (
          <small className="warning-text" style={{ color: '#f57c00', marginTop: '5px', display: 'block' }}>
            Title is getting long ({title.length}/60 recommended).
          </small>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
      
      <div className="quill-wrapper" style={{ marginBottom: '10px' }}>
        <ReactQuill 
          theme="snow"
          value={description}
          onChange={setDescription}
          modules={quillModules}
          placeholder="Description (optional)"
          className="rich-text-editor"
        />
        <div className="editor-stats" style={{ textAlign: 'right', fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
          {wordCount} word{wordCount !== 1 ? 's' : ''} | {charCount} character{charCount !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="form-row">
        <div className="form-row-group">
          <input 
            type="date" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)}
            className="due-date-input"
            title="Due Date"
          />
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Ideas">Ideas</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="color-picker">
          {NOTE_COLORS.map(c => (
            <button
              key={c}
              type="button"
              className={`color-btn color-${c} ${color === c ? 'selected' : ''}`}
              onClick={() => setColor(c)}
              aria-label={`Select ${c} color`}
            />
          ))}
        </div>
      </div>

      <TagsInput tags={tags} setTags={setTags} />

      <div className="attachments-section">
        <div className="attachment-actions">
          <label className="attachment-btn">
            📎 Attach Files
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </label>
          {!isRecording ? (
            <button type="button" className="attachment-btn record-btn" onClick={startRecording}>
              🎤 Record Audio
            </button>
          ) : (
            <button type="button" className="attachment-btn stop-record-btn" onClick={stopRecording}>
              🛑 Stop Recording
            </button>
          )}
        </div>
        {attachments.length > 0 && (
          <div className="attachment-previews">
            {attachments.map(att => (
              <div key={att.id} className="attachment-preview">
                {att.type.startsWith('image/') ? (
                  <img src={att.dataUrl} alt={att.name} className="attachment-thumb" />
                ) : att.type.startsWith('audio/') ? (
                  <div className="audio-preview">
                    <span className="attachment-icon">🎵 {att.name.length > 15 ? att.name.substring(0, 15) + '...' : att.name}</span>
                    <audio controls src={att.dataUrl} className="audio-player" />
                  </div>
                ) : (
                  <span className="attachment-icon">📄 {att.name.length > 15 ? att.name.substring(0, 15) + '...' : att.name}</span>
                )}
                <button type="button" onClick={() => removeAttachment(att.id)} className="remove-att-btn">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button 
        type="submit" 
        className="submit-btn" 
        disabled={!title.trim()} 
      >
        Submit
      </button>
    </form>
  );
};

export default NoteForm;