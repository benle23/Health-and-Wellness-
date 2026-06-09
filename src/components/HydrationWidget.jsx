import { useEffect, useState } from "react";
import { toDateKey } from "../date";
import "./HydrationWidget.css";

const goal = 2000;

function HydrationWidget() {
  const storageKey = `still-hydration-${toDateKey()}`;
  const [amount, setAmount] = useState(() => Number(localStorage.getItem(storageKey)) || 0);

  useEffect(() => {
    localStorage.setItem(storageKey, amount);
  }, [amount, storageKey]);

  const fill = `${Math.min((amount / goal) * 100, 100)}%`;

  return (
    <section className="card hydration">
      <div className="hydration-copy">
        <p className="eyebrow">Hydration</p>
        <p className="hydration-value">
          {amount.toLocaleString()}
          <span> ml</span>
        </p>
        <p className="hydration-note">
          {amount >= goal ? "Daily intention met." : `${goal - amount} ml to your intention.`}
        </p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setAmount((current) => current + 250)}
        >
          + 250 ml
        </button>
      </div>
      <button
        className="water-vessel"
        type="button"
        onClick={() => setAmount((current) => current + 250)}
        aria-label="Add 250 milliliters of water"
      >
        <span className="water-fill" style={{ height: fill }} />
        <span className="water-mark water-mark-one" />
        <span className="water-mark water-mark-two" />
        <span className="water-mark water-mark-three" />
      </button>
    </section>
  );
}

export default HydrationWidget;
