import { useState } from 'react'

export default function OptionListEditor({
  label,
  placeholder,
  type = 'text',
  values,
  onChange,
}) {
  const [draft, setDraft] = useState('')

  function addValue() {
    const trimmed = draft.trim()
    if (!trimmed) return
    if (values.includes(trimmed)) {
      setDraft('')
      return
    }
    onChange([...values, trimmed])
    setDraft('')
  }

  function removeValue(val) {
    onChange(values.filter((v) => v !== val))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addValue()
    }
  }

  return (
    <div>
      <label>{label}</label>
      <div className="option-row">
        <input
          type={type}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className="btn btn-ghost" onClick={addValue}>
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="chip-list">
          {values.map((val) => (
            <span className="chip" key={val}>
              {val}
              <button type="button" onClick={() => removeValue(val)} aria-label={`Remove ${val}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
