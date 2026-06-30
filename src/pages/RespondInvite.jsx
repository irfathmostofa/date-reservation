import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getRandomCompliment } from "../lib/compliments";
import Countdown from "../components/Countdown.jsx";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const STEP_LABELS = ["Yes or no", "Date & Time", "Food", "Place"];

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

function formatFriendlyDate(date) {
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeString) {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

export default function RespondInvite() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState(0);
  const [compliment, setCompliment] = useState("");
  const [choice, setChoice] = useState({
    date: null,
    time: "",
    foods: [],
    place: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const fetchInvite = useCallback(async () => {
    setLoading(true);
    setNotFound(false);

    const { data, error: fetchError } = await supabase
      .from("invitations")
      .select("*")
      .eq("slug", slug)
      .in("status", ["pending", "confirmed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error(fetchError);
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (!data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (data.status === "confirmed" && data.confirmed_date) {
      const isPast =
        new Date(data.confirmed_date) < new Date(new Date().toDateString());
      if (isPast) {
        await supabase
          .from("invitations")
          .update({ status: "completed" })
          .eq("id", data.id);
        setNotFound(true);
        setLoading(false);
        return;
      }
    }

    setInvite(data);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchInvite();
  }, [fetchInvite]);

  function showComplimentFor(gender) {
    setCompliment(getRandomCompliment(gender));
  }

  async function handleYes() {
    showComplimentFor(invite.receiver_gender);
    setStep(1);
    await supabase
      .from("invitations")
      .update({ said_yes: true })
      .eq("id", invite.id);
  }

  async function handleNo() {
    setError("");
    setSubmitting(true);
    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        said_yes: false,
        status: "declined",
        responded_at: new Date().toISOString(),
      })
      .eq("id", invite.id);
    setSubmitting(false);
    if (updateError) {
      console.error(updateError);
      setError("Something went wrong. Please try again.");
      return;
    }
    setInvite((prev) => ({ ...prev, status: "declined" }));
  }

  function handleDateChange(date) {
    setChoice((prev) => ({ ...prev, date }));
  }

  function handleTimeSelect(time) {
    setChoice((prev) => ({ ...prev, time }));
  }

  function toggleFoodSelection(food) {
    setChoice((prev) => {
      const foods = prev.foods.includes(food)
        ? prev.foods.filter((f) => f !== food)
        : [...prev.foods, food];
      return { ...prev, foods };
    });
  }

  function confirmDateTime() {
    if (!choice.date || !choice.time) return;
    showComplimentFor(invite.receiver_gender);
    setStep(2);
  }

  function confirmFoods() {
    if (choice.foods.length === 0) return;
    showComplimentFor(invite.receiver_gender);
    setStep(3);
  }

  function selectPlace(val) {
    setChoice((prev) => ({ ...prev, place: val }));
    showComplimentFor(invite.receiver_gender);
    setStep(4);
  }

  async function handleFinalSubmit() {
    setError("");
    setSubmitting(true);

    const dateStr = choice.date.toISOString().split("T")[0];
    const foodsString = choice.foods.join(", ");

    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        confirmed_date: dateStr,
        confirmed_time: choice.time,
        confirmed_food: foodsString,
        confirmed_place: choice.place,
        status: "confirmed",
        responded_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (updateError) {
      console.error(updateError);
      setError("Something went wrong saving your response. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    // Update the invite with confirmed data
    setInvite((prev) => ({
      ...prev,
      status: "confirmed",
      confirmed_date: dateStr,
      confirmed_time: choice.time,
      confirmed_food: foodsString,
      confirmed_place: choice.place,
    }));
    setIsConfirmed(true);
  }

  // If confirmed, show the confirmation page
  if (
    isConfirmed ||
    (invite && invite.status === "confirmed" && invite.confirmed_date)
  ) {
    const displayInvite = isConfirmed
      ? {
          ...invite,
          confirmed_date: choice.date?.toISOString().split("T")[0],
          confirmed_time: choice.time,
          confirmed_food: choice.foods.join(", "),
          confirmed_place: choice.place,
        }
      : invite;

    return (
      <div className="app-shell">
        <div className="floaties" aria-hidden="true">
          <span>♡</span>
          <span>✿</span>
          <span>♡</span>
          <span>✿</span>
          <span>♡</span>
        </div>
        <div className="card reveal">
          <div className="step-header">
            <span className="step-icon">🎉</span>
            <div className="eyebrow">It's a date</div>
            <h2>
              {displayInvite.sender_name} <span className="heart">♡</span>{" "}
              {displayInvite.receiver_name}
            </h2>
            <p>You're all set! Here's the plan:</p>
          </div>

          {/* Countdown Timer */}
          <Countdown
            targetDate={displayInvite.confirmed_date}
            targetTime={displayInvite.confirmed_time}
            onExpire={fetchInvite}
          />

          <div className="detail-list">
            <div className="detail-row">
              <span>📅 Date</span>
              <span>
                {formatFriendlyDate(
                  new Date(displayInvite.confirmed_date + "T00:00:00"),
                )}
              </span>
            </div>
            <div className="detail-row">
              <span>⏰ Time</span>
              <span>{formatTime(displayInvite.confirmed_time)}</span>
            </div>
            <div className="detail-row">
              <span>🍽️ Food</span>
              <span>{displayInvite.confirmed_food}</span>
            </div>
            <div className="detail-row">
              <span>📍 Place</span>
              <span>{displayInvite.confirmed_place}</span>
            </div>
          </div>

          <div className="confirmation-message">
            <p>✨ Can't wait to see you! ✨</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="card">
          <p className="loading-text">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="app-shell">
        <div className="card">
          <div className="step-header">
            <span className="step-icon">🤍</span>
            <div className="eyebrow">Date Reservation</div>
            <h2>No active invitation right now</h2>
            <p>
              There's nothing waiting for this link at the moment. Check back
              later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (invite.status === "declined") {
    return (
      <div className="app-shell">
        <div className="card">
          <div className="step-header">
            <span className="step-icon">🌧️</span>
            <div className="eyebrow">Date Reservation</div>
            <h2>No worries.</h2>
            <p>
              Thanks for letting {invite.sender_name} know. Maybe next time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="floaties" aria-hidden="true">
        <span>♡</span>
        <span>✿</span>
        <span>♡</span>
        <span>✿</span>
        <span>♡</span>
      </div>
      <div className="card reveal">
        <div className="step-progress">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={`step-dot ${i < step ? "done" : i === step ? "active" : ""}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="step-body">
            <div className="step-header">
              <span className="step-icon">💌</span>
              <div className="eyebrow">An invitation for you</div>
              <h2>
                Will you date {invite.sender_name}?{" "}
                <span className="heart">♡</span>
              </h2>
              <p>
                {invite.receiver_name}, no pressure — just an honest yes or no.
              </p>
            </div>
            <div className="btn-row">
              <button
                className="btn btn-ghost"
                onClick={handleNo}
                disabled={submitting}
              >
                No
              </button>
              <button
                className="btn btn-primary"
                onClick={handleYes}
                disabled={submitting}
              >
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
              <p>
                Pick whatever day and time works for you — totally your call, no
                influence from {invite.sender_name}.
              </p>
            </div>

            <div className="date-time-selector">
              <div className="calendar-container">
                <label className="section-label">Select Date</label>
                <Calendar
                  onChange={handleDateChange}
                  value={choice.date}
                  minDate={new Date()}
                  className="react-calendar-full"
                  tileDisabled={({ date }) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </div>

              {choice.date && (
                <div className="time-selector-wrapper">
                  <label className="section-label">Select Time</label>
                  <div className="time-chips-grid">
                    {invite.time_options &&
                      invite.time_options.map((time) => (
                        <button
                          key={time}
                          className={`time-chip ${choice.time === time ? "selected" : ""}`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {formatTime(time)}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {choice.date && choice.time && (
              <div className="date-picked-banner">
                {formatFriendlyDate(choice.date)} at {formatTime(choice.time)} ✦
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={confirmDateTime}
              disabled={!choice.date || !choice.time}
            >
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
              <p>Select one or more options that sound good to you.</p>
            </div>

            <div className="food-selection-grid">
              {invite.food_options.map((food) => (
                <button
                  key={food}
                  className={`food-option-btn ${choice.foods.includes(food) ? "selected" : ""}`}
                  onClick={() => toggleFoodSelection(food)}
                >
                  <span className="food-name">{food}</span>
                  {choice.foods.includes(food) && (
                    <span className="check-mark">✓</span>
                  )}
                </button>
              ))}
            </div>

            {choice.foods.length > 0 && (
              <div className="selected-count-banner">
                <span className="count-badge">{choice.foods.length}</span>
                <span className="count-text">
                  {choice.foods.length === 1
                    ? "option selected"
                    : "options selected"}
                </span>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={confirmFoods}
              disabled={choice.foods.length === 0}
            >
              Continue
            </button>
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
                <button
                  key={p}
                  className="option-btn"
                  onClick={() => selectPlace(p)}
                >
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
              <h3>
                That's everything <span className="heart">♡</span>
              </h3>
            </div>
            <div className="detail-list">
              <div className="detail-row">
                <span>📅 Date</span>
                <span>
                  {choice.date ? formatFriendlyDate(choice.date) : ""}
                </span>
              </div>
              <div className="detail-row">
                <span>⏰ Time</span>
                <span>{formatTime(choice.time)}</span>
              </div>
              <div className="detail-row">
                <span>🍽️ Food</span>
                <span>{choice.foods.join(", ")}</span>
              </div>
              <div className="detail-row">
                <span>📍 Place</span>
                <span>{choice.place}</span>
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button
              className="btn btn-primary"
              onClick={handleFinalSubmit}
              disabled={submitting}
            >
              {submitting ? "Confirming..." : "Confirm ♡"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
