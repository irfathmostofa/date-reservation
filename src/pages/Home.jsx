import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="app-shell">
      <div className="floaties" aria-hidden="true">
        <span>♡</span><span>✿</span><span>♡</span><span>✿</span><span>♡</span>
      </div>
      <div className="card reveal">
        <div className="step-header">
          <span className="step-icon">💌</span>
          <div className="eyebrow">Date Reservation</div>
          <h1>Create an invitation worth saying yes to <span className="heart">♡</span></h1>
          <p>Set the food and place options, she picks her own date and replies in a few sweet taps.</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          Create an invitation
        </Link>
      </div>
    </div>
  )
}
