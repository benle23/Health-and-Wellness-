import DailySummary from "@/components/DailySummary";
import "@/styles/Sidebar.css";

function Sidebar({ totals, settings, onToday, onHistory, onSettings }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); onToday(); }}>
        nourish
      </a>
      <nav aria-label="Primary navigation">
        <button type="button" className="active" onClick={onToday}>
          <span className="nav-icon today-icon" aria-hidden="true" /> Today
        </button>
        <button type="button" onClick={onHistory}>
          <span className="nav-icon history-icon" aria-hidden="true" /> History
        </button>
        <button type="button" onClick={onSettings}>
          <span className="nav-icon settings-icon" aria-hidden="true" /> Settings
        </button>
      </nav>
      <DailySummary totals={totals} settings={settings} />
    </aside>
  );
}

export default Sidebar;
