import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="app-shell">
      <div className="card center-text">
        <div className="eyebrow">Date Reservation</div>
        <h1>Create an invitation worth saying yes to.</h1>
        <p>Set the date, food, and place options — we'll handle the rest.</p>
        <Link to="/create" className="btn btn-primary">
          Create an invitation
        </Link>
      </div>
    </div>
  )
}
