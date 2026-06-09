import { useEffect, useState } from "react";
import "./CalorieRing.css";

const radius = 70;
const circumference = 2 * Math.PI * radius;

function CalorieRing({ calories, goal }) {
  const targetPercent = Math.min((calories / goal) * 100 || 0, 100);
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    let frame;

    const animate = (now) => {
      const progress = Math.min((now - startedAt) / 300, 1);
      setDisplayPercent(Math.round(targetPercent * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [targetPercent]);

  const offset = circumference - (targetPercent / 100) * circumference;

  return (
    <div className="calorie-ring-wrap" aria-label={`${Math.round(calories)} of ${goal} calories`}>
      <svg className="calorie-ring" viewBox="0 0 168 168" role="img">
        <title>Daily calorie progress</title>
        <circle className="calorie-ring-track" cx="84" cy="84" r={radius} />
        <circle
          className="calorie-ring-progress"
          cx="84"
          cy="84"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="calorie-ring-copy">
        <span className="calorie-ring-value">{displayPercent}%</span>
        <span className="calorie-ring-label">of daily goal</span>
      </div>
      <div className="calorie-ring-detail">
        <span>{Math.round(calories).toLocaleString()} kcal</span>
        <span>{Math.max(goal - calories, 0).toLocaleString()} left</span>
      </div>
    </div>
  );
}

export default CalorieRing;
