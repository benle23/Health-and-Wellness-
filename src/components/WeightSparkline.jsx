import "./WeightSparkline.css";

function WeightSparkline({ weights }) {
  if (weights.length < 2) {
    return <p className="sparkline-empty">Add two days to reveal a trend.</p>;
  }

  const values = weights.map((item) => item.weight_kg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = weights
    .map((item, index) => {
      const x = (index / (weights.length - 1)) * 220;
      const y = 54 - ((item.weight_kg - min) / range) * 42;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="sparkline-wrap">
      <svg viewBox="0 0 220 64" role="img" aria-label="Fourteen day weight trend">
        <line x1="0" x2="220" y1="54" y2="54" />
        <polyline points={points} />
      </svg>
      <div className="sparkline-labels">
        <span>{weights[0].logged_at.slice(5)}</span>
        <strong>{weights.at(-1).weight_kg} kg</strong>
        <span>{weights.at(-1).logged_at.slice(5)}</span>
      </div>
    </div>
  );
}

export default WeightSparkline;
