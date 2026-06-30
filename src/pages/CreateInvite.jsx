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

export default function CreateInvite() {
  const [form, setForm] = useState(initialState);
  const [dateOptions, setDateOptions] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [placeOptions, setPlaceOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resultLink, setResultLink] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.senderName.trim()) return "Your name is required.";
    if (!form.senderEmail.trim()) return "Your email is required.";
    if (!form.receiverName.trim()) return "Her/his name is required.";
    if (!form.receiverGender) return "Please select a gender.";
    if (!form.receiverEmail.trim()) return "Receiver email is required.";
    if (dateOptions.length === 0) return "Add at least one date option.";
    if (foodOptions.length === 0) return "Add at least one food option.";
    if (placeOptions.length === 0) return "Add at least one place option.";
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
      const { data, error: insertError } = await supabase
        .from("invitations")
        .insert({
          slug,
          sender_name: form.senderName.trim(),
          sender_email: form.senderEmail.trim(),
          receiver_name: form.receiverName.trim(),
          receiver_gender: form.receiverGender,
          receiver_email: form.receiverEmail.trim(),
          date_options: dateOptions,
          food_options: foodOptions,
          place_options: placeOptions,
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

  if (resultLink) {
    return (
      <div className="app-shell">
        <div className="card center-text">
          <div className="eyebrow">Invitation created</div>
          <h2>It's live.</h2>
          <p>
            Share this link with {form.receiverName} — her response will show up
            right here in the link.
          </p>
          <div className="link-box">{resultLink}</div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setForm(initialState);
              setDateOptions([]);
              setFoodOptions([]);
              setPlaceOptions([]);
              setResultLink("");
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
      <div className="card">
        <div className="eyebrow">Create invitation</div>
        <h2>Set up your invite</h2>
        <p>
          Fill in the details — she'll get a simple, step-by-step way to
          respond.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="senderName">Your name</label>
          <input
            id="senderName"
            type="text"
            placeholder="Your name"
            value={form.senderName}
            onChange={(e) => updateField("senderName", e.target.value)}
          />

          <label htmlFor="senderEmail">Your email</label>
          <input
            id="senderEmail"
            type="email"
            placeholder="you@example.com"
            value={form.senderEmail}
            onChange={(e) => updateField("senderEmail", e.target.value)}
          />

          <label htmlFor="receiverName">Her / his name</label>
          <input
            id="receiverName"
            type="text"
            placeholder="e.g. Mahmoda"
            value={form.receiverName}
            onChange={(e) => updateField("receiverName", e.target.value)}
          />

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

          <label htmlFor="receiverEmail">Her / his email</label>
          <input
            id="receiverEmail"
            type="email"
            placeholder="receiver@example.com"
            value={form.receiverEmail}
            onChange={(e) => updateField("receiverEmail", e.target.value)}
          />

          <OptionListEditor
            label="Date options"
            type="date"
            placeholder="Pick a date"
            values={dateOptions}
            onChange={setDateOptions}
          />

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
