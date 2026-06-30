import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const TEMPLATE_CREATED = import.meta.env.VITE_EMAILJS_TEMPLATE_CREATED
const TEMPLATE_CONFIRMED = import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRMED

function send(templateId, params) {
  if (!SERVICE_ID || !PUBLIC_KEY || !templateId) {
    console.warn('EmailJS env vars are missing, skipping email send.')
    return Promise.resolve(null)
  }
  return emailjs.send(SERVICE_ID, templateId, params, { publicKey: PUBLIC_KEY })
}

// Sent to sender + receiver right after an invite is created in Portal A
export function sendInviteCreatedEmail({ toEmail, toName, senderName, link }) {
  return send(TEMPLATE_CREATED, {
    to_email: toEmail,
    to_name: toName,
    sender_name: senderName,
    invite_link: link,
  })
}

// Sent to sender + receiver after she completes the step flow in Portal B
export function sendInviteConfirmedEmail({
  toEmail,
  toName,
  senderName,
  receiverName,
  confirmedDate,
  confirmedFood,
  confirmedPlace,
  link,
}) {
  return send(TEMPLATE_CONFIRMED, {
    to_email: toEmail,
    to_name: toName,
    sender_name: senderName,
    receiver_name: receiverName,
    confirmed_date: confirmedDate,
    confirmed_food: confirmedFood,
    confirmed_place: confirmedPlace,
    invite_link: link,
  })
}
