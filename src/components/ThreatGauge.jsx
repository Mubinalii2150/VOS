

export default function ThreatGauge({ score = 0 }) {
  const safeScore = Math.max(0, Math.min(100, score));
  const angle = -90 + (safeScore * 180) / 100;

  return (
    <div className="gauge">
      <div className="gauge-arc"></div>

      <div
        className="gauge-needle"
        style={{ transform: `rotate(${angle}deg)` }}
      />

      <div className="gauge-center"></div>
    </div>
  );
}