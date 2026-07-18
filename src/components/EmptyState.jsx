const EmptyState = ({ icon = '📭', message = 'No notes yet', subtext = 'Create your first note to get started!' }) => (
  <div className="empty-state-container">
    <div className="empty-state-icon">{icon}</div>
    <h3>{message}</h3>
    <p>{subtext}</p>
  </div>
);
export default EmptyState;