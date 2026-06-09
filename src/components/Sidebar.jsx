import CalorieRing from "./CalorieRing";
import MacroBars from "./MacroBars";
import "./Sidebar.css";

function Sidebar({ totals, settings, onLogFood, onOpenSettings }) {
  return (
    <aside className="sidebar">
      <div>
        <a className="wordmark" href="#" aria-label="Still home">
          still<span>.</span>
        </a>
        <p className="sidebar-kicker">Daily health journal</p>
      </div>

      <CalorieRing calories={totals.calories} goal={settings.calorie_goal} />
      <MacroBars totals={totals} settings={settings} />

      <nav className="sidebar-nav" aria-label="Primary navigation">
        <button className="nav-link active" type="button">
          <span>01</span> Today
        </button>
        <button className="nav-link" type="button" onClick={onLogFood}>
          <span>02</span> Log food
        </button>
        <button className="nav-link" type="button" onClick={onOpenSettings}>
          <span>03</span> Settings
        </button>
      </nav>

      <button className="primary-button sidebar-log-button" type="button" onClick={onLogFood}>
        Log food
      </button>
    </aside>
  );
}

export default Sidebar;
