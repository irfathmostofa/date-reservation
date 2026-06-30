import { useEffect, useState } from "react";

function getTimeParts(targetDate, targetTime) {
  // Combine date and time
  let targetDateTime;
  if (targetTime) {
    const [hours, minutes] = targetTime.split(":");
    targetDateTime = new Date(targetDate);
    targetDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  } else {
    targetDateTime = new Date(targetDate + "T23:59:59");
  }

  const diff = targetDateTime.getTime() - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function Countdown({ targetDate, targetTime, onExpire }) {
  const [parts, setParts] = useState(() =>
    getTimeParts(targetDate, targetTime),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getTimeParts(targetDate, targetTime);
      setParts(next);
      if (!next && onExpire) onExpire();
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime, onExpire]);

  if (!parts) return null;

  return (
    <div className="countdown-grid">
      <div className="countdown-cell">
        <span className="countdown-num">
          {String(parts.days).padStart(2, "0")}
        </span>
        <span className="countdown-label">Days</span>
      </div>
      <div className="countdown-cell">
        <span className="countdown-num">
          {String(parts.hours).padStart(2, "0")}
        </span>
        <span className="countdown-label">Hours</span>
      </div>
      <div className="countdown-cell">
        <span className="countdown-num">
          {String(parts.minutes).padStart(2, "0")}
        </span>
        <span className="countdown-label">Mins</span>
      </div>
      <div className="countdown-cell">
        <span className="countdown-num">
          {String(parts.seconds).padStart(2, "0")}
        </span>
        <span className="countdown-label">Secs</span>
      </div>
    </div>
  );
}
