import { useState } from 'react';

const TagsInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase().replace(/^#/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="tags-input-container">
      {tags.length > 0 && (
        <div className="tags-list">
          {tags.map(tag => (
            <span key={tag} className="tag-chip">
              #{tag} <button type="button" className="remove-tag-btn" onClick={() => removeTag(tag)}>&times;</button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        placeholder="Add tags (press Enter or comma)"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="tag-input"
      />
    </div>
  );
};

export default TagsInput;
