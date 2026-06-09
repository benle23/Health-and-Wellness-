import "./EntryRow.css";

function EntryRow({ entry, onDelete }) {
  return (
    <div className="entry-row">
      <div className="entry-name-wrap">
        <span className="entry-marker" />
        <div>
          <p className="entry-name">{entry.name}</p>
          <p className="entry-meta">
            {Math.round(entry.quantity_g)}g · P {entry.protein_total} · C {entry.carbs_total} · F{" "}
            {entry.fat_total}
          </p>
        </div>
      </div>
      <div className="entry-calorie-wrap">
        <span className="entry-calories">{Math.round(entry.calories)}</span>
        <button type="button" onClick={() => onDelete(entry.id)} aria-label={`Remove ${entry.name}`}>
          Remove
        </button>
      </div>
    </div>
  );
}

export default EntryRow;
