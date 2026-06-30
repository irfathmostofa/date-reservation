import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { getRandomCompliment } from '../lib/compliments'
import Countdown from '../components/Countdown.jsx'

const STEP_LABELS = ['Yes or no', 'Date', 'Food', 'Place']

function todayISO() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().split('T')[0]
}

function formatFriendlyDate(isoDate) {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function RespondInvite() {
  const { slug } = useParams()

  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const [step, setStep] = useState(0)
  const [compliment, setCompliment] = useState('')
  const [choice, setChoice] = useState({ date: '', food: '', place: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchInvite = useCallback(async () => {
    setLoading(true)
    setNotFound(false)

    const { data, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('slug', slug)
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      console.error(fetchError)
      setNotFound(true)
      setLoading(false)
      return
    }

    if (!data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    if (data.status === 'confirmed' && data.confirmed_date) {
      const isPast = new Date(data.confirmed_date) < new Date(new Date().toDateString())
      if (isPast) {
        await supabase.from('invitations').update({ status: 'completed' }).eq('id', data.id)
        setNotFound(true)
        setLoading(false)
        return
      }
    }

    setInvite(data)
    setLoading(false)
  }, [slug])

  useEffect(() => {
    fetchInvite()
  }, [fetchInvite])

  function showComplimentFor(gender) {
    setCompliment(getRandomCompliment(gender))
  }

  async function handleYes() {
    showComplimentFor(invite.receiver_gender)
    setStep(1)
    await supabase.from('invitations').update({ said_yes: true }).eq('id', invite.id)
  }

  async function handleNo() {
    setError('')
    setSubmitting(true)
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ said_yes: false, status: 'declined', responded_at: new Date().toISOString() })
      .eq('id', invite.id)
    setSubmitting(false)
    if (updateError) {
      console.error(updateError)
      setError('Something went wrong. Please try again.')
      return
    }
    setInvite((prev) => ({ ...prev, status: 'declined' }))
  }

  function handleDateChange(val) {
    setChoice((prev) => ({ ...prev, date: val }))
  }

  function confirmDate() {
    if (!choice.date) return
    showComplimentFor(invite.receiver_gender)
    setStep(2)
  }

  function selectFood(val) {
    setChoice((prev) => ({ ...prev, food: val }))
    showComplimentFor(invite.receiver_gender)
    setStep(3)
  }

  function selectPlace(val) {
    setChoice((prev) => ({ ...prev, place: val }))
    showComplimentFor(invite.receiver_gender)
    setStep(4)
  }

  async function handleFinalSubmit() {
    setError('')
    setSubmitting(true)

    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        confirmed_date: choice.date,
        confirmed_food: choice.food,
        confirmed_place: choice.place,
        status: 'confirmed',
        responded_at: new Date().toISOString(),
      })
      .eq('id', invite.id)

    if (updateError) {
      console.error(updateError)
      setError('Something went wrong saving your response. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setInvite((prev) => ({
      ...prev,
      status: 'confirmed',
      confirmed_date: choice.date,
      confirmed_food: choice.food,
      confirmed_place: choice.place,
    }))
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="card">
          <p className="loading-text">Loading your invitation...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="app-shell">
        <div className="card">
          <div className="step-header">
            <span className="step-icon">🤍</span>
            <div className="eyebrow">Date Reservation</div>
            <h2>No active invitation right now</h2>
            <p>There's nothing waiting for this link at the moment. Check back later.</p>
          </div>
        </div>
      </div>
    )
  }

  if (invite.status === 'declined') {
    return (
      <div className="app-shell">
        <div className="card">
          <div className="step-header">
            <span className="step-icon">🌧️</span>
            <div className="eyebrow">Date Reservation</div>
            <h2>No worries.</h2>
            <p>Thanks for letting {invite.sender_name} know. Maybe next time.</p>
          </div>
        </div>
      </div>
    )
  }

  if (invite.status === 'confirmed' && invite.confirmed_date) {
    return (
      <div className="app-shell">
        <div className="floaties" aria-hidden="true">
          <span>♡</span><span>✿</span><span>♡</span><span>✿</span><span>♡</span>
        </div>
        <div className="card reveal">
          <div className="step-header">
            <span className="step-icon">🎉</span>
            <div className="eyebrow">It's a date</div>
            <h2>
              {invite.sender_name} <span className="heart">♡</span> {invite.receiver_name}
            </h2>
          </div>

          <Countdown targetDate={invite.confirmed_date} onExpire={fetchInvite} />

          <div className="detail-list">
            <div className="detail-row">
              <span>📅 Date</span>
              <span>{formatFriendlyDate(invite.confirmed_date)}</span>
            </div>
            <div className="detail-row">
              <span>🍽️ Food</span>
              <span>{invite.confirmed_food}</span>
            </div>
            <div className="detail-row">
              <span>📍 Place</span>
              <span>{invite.confirmed_place}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="floaties" aria-hidden="true">
        <span>♡</span><span>✿</span><span>♡</span><span>✿</span><span>♡</span>
      </div>
      <div className="card reveal">
        <div className="step-progress">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className={`step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="step-body">
            <div className="step-header">
              <span className="step-icon">💌</span>
              <div className="eyebrow">An invitation for you</div>
              <h2>Will you date {invite.sender_name}? <span className="heart">♡</span></h2>
              <p>{invite.receiver_name}, no pressure — just an honest yes or no.</p>
            </div>
            <div className="btn-row">
              <button className="btn btn-ghost" onClick={handleNo} disabled={submitting}>
                No
              </button>
              <button className="btn btn-primary" onClick={handleYes} disabled={submitting}>
                Yes ♡
              </button>
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>
        )}

        {step === 1 && (
          <div className="step-body">
            {compliment && <div className="compliment">{compliment}</div>}
            <div className="step-header">
              <span className="step-icon">📅</span>
              <h3>When are you free?</h3>
              <p>Pick whatever day works for you — totally your call, no influence from {invite.sender_name}.</p>
            </div>
            <input
              type="date"
              min={todayISO()}
              value={choice.date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
            {choice.date && (
              <div className="date-picked-banner">{formatFriendlyDate(choice.date)} ✦</div>
            )}
            <button className="btn btn-primary" onClick={confirmDate} disabled={!choice.date}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-body">
            {compliment && <div className="compliment">{compliment}</div>}
            <div className="step-header">
              <span className="step-icon">🍽️</span>
              <h3>What sounds good to eat?</h3>
            </div>
            <div className="option-grid">
              {invite.food_options.map((f) => (
                <button key={f} className="option-btn" onClick={() => selectFood(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-body">
            {compliment && <div className="compliment">{compliment}</div>}
            <div className="step-header">
              <span className="step-icon">📍</span>
              <h3>Where should we meet?</h3>
            </div>
            <div className="option-grid">
              {invite.place_options.map((p) => (
                <button key={p} className="option-btn" onClick={() => selectPlace(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-body">
            {compliment && <div className="compliment">{compliment}</div>}
            <div className="step-header">
              <span className="step-icon">🎉</span>
              <h3>That's everything <span className="heart">♡</span></h3>
            </div>
            <div className="detail-list">
              <div className="detail-row">
                <span>📅 Date</span>
                <span>{formatFriendlyDate(choice.date)}</span>
              </div>
              <div className="detail-row">
                <span>🍽️ Food</span>
                <span>{choice.food}</span>
              </div>
              <div className="detail-row">
                <span>📍 Place</span>
                <span>{choice.place}</span>
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn-primary" onClick={handleFinalSubmit} disabled={submitting}>
              {submitting ? 'Confirming...' : 'Confirm ♡'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
