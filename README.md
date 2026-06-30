# Date Reservation App

React + Vite + Supabase + EmailJS app for creating and responding to date invitations.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a Supabase project, then run `supabase_schema.sql` in the Supabase SQL editor to create the `invitations` table.

3. Set up EmailJS (https://www.emailjs.com):
   - Create an Email Service (e.g. Gmail) -> note the Service ID
   - Create two Email Templates:
     - Invite created -- sent when an invitation is made. Suggested variables: to_email, to_name, sender_name, invite_link
     - Invite confirmed -- sent after she completes the steps. Suggested variables: to_email, to_name, sender_name, receiver_name, confirmed_date, confirmed_food, confirmed_place, invite_link
   - Note your Public Key from Account settings

4. Copy .env.example to .env and fill in your Supabase and EmailJS values:
   ```
   cp .env.example .env
   ```

5. Run the dev server:
   ```
   npm run dev
   ```

## Routes

- /create -- Portal A, where the sender fills in their details, the receiver's details, and the date/food/place options. Generates a shareable link like /mahmoda.
- /:slug -- Portal B, the link sent to the receiver. Shows a step-by-step yes/no -> date -> food -> place flow with a compliment after each step, then a countdown once confirmed.

## Notes

- The link slug is based on the receiver's name. The app always shows the most recent pending or confirmed invitation for that name -- once a confirmed date passes, it's marked completed and the name becomes available for a new invitation.
- RLS is enabled but left open (using (true)) since there's no authentication system. Tighten this later if needed.
- Deploy to Netlify: connect the repo, set the build command to `npm run build`, publish directory `dist`, and add the same environment variables in Netlify's site settings. The included `_redirects` file makes client-side routing work for /:slug URLs.
# date-reservation
