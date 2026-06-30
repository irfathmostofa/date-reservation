import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { slugify } from "../lib/slugify";
import OptionListEditor from "../components/OptionListEditor.jsx";

const initialState = {
  senderName: "",
  senderEmail: "",
  receiverName: "",
  receiverGender: "",
  receiverEmail: "",
};

// Generate time slots from 9:00 AM to 10:00 PM in 30-minute increments
function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      const displayMinute = minute === 0 ? "00" : minute;
      const timeString = `${displayHour}:${displayMinute} ${ampm}`;
      const valueString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      slots.push({ label: timeString, value: valueString });
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

export default function CreateInvite() {
  const [form, setForm] = useState(initialState);
  const [foodOptions, setFoodOptions] = useState([]);
  const [placeOptions, setPlaceOptions] = useState([]);
  const [timeOptions, setTimeOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resultLink, setResultLink] = useState("");
  const [copied, setCopied] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.senderName.trim()) return "Your name is required.";
    if (!form.senderEmail.trim()) return "Your email is required.";
    if (!form.receiverName.trim()) return "Her/his name is required.";
    if (!form.receiverGender) return "Please select a gender.";
    if (!form.receiverEmail.trim()) return "Receiver email is required.";
    if (foodOptions.length === 0) return "Add at least one food option.";
    if (placeOptions.length === 0) return "Add at least one place option.";
    if (timeOptions.length === 0) return "Add at least one time option.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitting(true);

    const slug = slugify(form.receiverName);

    try {
      const { error: insertError } = await supabase
        .from("invitations")
        .insert({
          slug,
          sender_name: form.senderName.trim(),
          sender_email: form.senderEmail.trim(),
          receiver_name: form.receiverName.trim(),
          receiver_gender: form.receiverGender,
          receiver_email: form.receiverEmail.trim(),
          food_options: foodOptions,
          place_options: placeOptions,
          time_options: timeOptions,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const link = `${window.location.origin}/${slug}`;
      setResultLink(link);
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong creating the invitation. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(resultLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      const textArea = document.createElement("textarea");
      textArea.value = resultLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (resultLink) {
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
            <span className="step-icon">💌</span>
            <div className="eyebrow">Invitation created</div>
            <h2>
              It's live <span className="heart">♡</span>
            </h2>
            <p>
              Share this link with {form.receiverName} — their response will
              show up right here in the link.
            </p>
          </div>
          <div className="link-box">
            {resultLink}
            <button
              type="button"
              className="btn btn-copy"
              onClick={copyToClipboard}
              aria-label="Copy link to clipboard"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setForm(initialState);
              setFoodOptions([]);
              setPlaceOptions([]);
              setTimeOptions([]);
              setResultLink("");
              setCopied(false);
            }}
          >
            Create another invitation
          </button>
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
        <div className="step-header">
          <span className="step-icon">💌</span>
          <div className="eyebrow">Create invitation</div>
          <h2>Set up your invite</h2>
          <p>
            Fill in the details — they'll get a sweet, step-by-step way to
            respond, and they'll pick their own date and time freely.
          </p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="senderName">Your name</label>
            <input
              id="senderName"
              type="text"
              placeholder="Your name"
              value={form.senderName}
              onChange={(e) => updateField("senderName", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="senderEmail">Your email</label>
            <input
              id="senderEmail"
              type="email"
              placeholder="you@example.com"
              value={form.senderEmail}
              onChange={(e) => updateField("senderEmail", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="receiverName">Their name</label>
            <input
              id="receiverName"
              type="text"
              placeholder="e.g. Mahmoda"
              value={form.receiverName}
              onChange={(e) => updateField("receiverName", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="receiverGender">Gender</label>
            <select
              id="receiverGender"
              value={form.receiverGender}
              onChange={(e) => updateField("receiverGender", e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="receiverEmail">Their email</label>
            <input
              id="receiverEmail"
              type="email"
              placeholder="receiver@example.com"
              value={form.receiverEmail}
              onChange={(e) => updateField("receiverEmail", e.target.value)}
            />
          </div>

          <OptionListEditor
            label="Food options"
            placeholder="e.g. Italian"
            values={foodOptions}
            onChange={setFoodOptions}
          />

          <OptionListEditor
            label="Place options"
            placeholder="e.g. Riverside Cafe"
            values={placeOptions}
            onChange={setPlaceOptions}
          />

          <OptionListEditor
            label="Time options"
            placeholder="e.g. 7:00 PM"
            values={timeOptions}
            onChange={setTimeOptions}
          />

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create invitation"}
          </button>
        </form>
      </div>
    </div>
  );
}
