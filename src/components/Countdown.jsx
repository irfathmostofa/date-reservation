import { useEffect, useState } from 'react'

function getTimeParts(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

export default function Countdown({ targetDate, onExpire }) {
  const [parts, setParts] = useState(() => getTimeParts(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getTimeParts(targetDate)
      setParts(next)
      if (!next && onExpire) onExpire()
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate, onExpire])

  if (!parts) return null

  return (
    <div className="countdown-grid">
      <div className="countdown-cell">
        <span className="countdown-num">{parts.days}</span>
        <span className="countdown-label">Days</span>
      </div>
      <div className="countdown-cell">
        <span className="countdown-num">{parts.hours}</span>
        <span className="countdown-label">Hours</span>
      </div>
      <div className="countdown-cell">
        <span className="countdown-num">{parts.minutes}</span>
        <span className="countdown-label">Mins</span>
      </div>
      <div className="countdown-cell">
        <span className="countdown-num">{parts.seconds}</span>
        <span className="countdown-label">Secs</span>
      </div>
    </div>
  )
}
