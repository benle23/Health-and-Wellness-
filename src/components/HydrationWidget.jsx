import { useEffect, useState } from "react";
import { toDateKey } from "../date";
import "./HydrationWidget.css";

const GLASS_ML = 250;
const GOAL_ML = 3785;
const GOAL_GLASSES = Math.ceil(GOAL_ML / GLASS_ML);

function HydrationWidget() {
  const storageKey = `still-hydration-${toDateKey()}`;
  const [amount, setAmount] = useState(() => Number(localStorage.getItem(storageKey)) || 0);

  useEffect(() => {
    localStorage.setItem(storageKey, amount);
  }, [amount, storageKey]);

  const glasses = amount / GLASS_ML;
  const progress = Math.min((glasses * GLASS_ML) / GOAL_ML, 1);
  const fill = `${progress * 100}%`;

  return (
    <section className="card hydration">
      <div className="hydration-copy">
        <p className="eyebrow">Hydration</p>
        <p className="hydration-value">
          {glasses}
          <span> / {GOAL_GLASSES} glasses</span>
        </p>
        <p className="hydration-note">({amount.toLocaleString()} ml)</p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setAmount((current) => current + GLASS_ML)}
        >
          + {GLASS_ML} ml
        </button>
      </div>
      <button
        className="water-vessel"
        type="button"
        onClick={() => setAmount((current) => current + GLASS_ML)}
        aria-label={`Add ${GLASS_ML} milliliters of water`}
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
