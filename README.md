# Notify MiDoctor

A simple notification service that sends appointment reminders to patients one day before their medical consultation. Built with Node.js and running on a daily cron job at 8:00 PM (Venezuela time).

## Features

- Automated email reminders for next-day appointments
- Uses Resend for email delivery
- Connects to Supabase database
- Timezone aware (America/Caracas)

## Tech Stack

- Node.js
- Supabase
- Resend (Email service)
- Express (Health check endpoint)
- node-cron (Scheduling)
- Luxon (DateTime handling)

## Environment Variables

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
RESEND_API_KEY=
```
