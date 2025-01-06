require('dotenv').config();
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { Settings, DateTime } = require('luxon');
const { Resend } = require('resend');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

Settings.defaultLocale = 'es';

async function getSchedules() {
  try {
    const now = DateTime.now().setZone('America/Caracas');
    const tomorrow = now.plus({ days: 1 }).toISODate();

    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('professional_date', tomorrow)
      .eq('status', 0);

    if (error) throw error;
    return data;
  } catch (error) {
    console.log('ERROR: ', error);
  }
}

async function sendNotification(schedule) {
  try {
    const { name, email, client_time, professional_id } = schedule;
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', professional_id)
      .single();

    const clientTimeStartAt = DateTime.fromISO(client_time.start_at);

    await resend.emails.send({
      from: 'MiDoctor <info@midoctor.io>',
      to: email,
      subject: 'Recordatorio: Mañana es tu consulta',
      html: `
      <div>
		  <h1 style="color: #1FBEB8">MiDoctor</h1>
      <p style="fontSize: 1rem; color: #020617">Sr./Sra. ${name}, le recordamos que tiene una consulta programada para mañana ${clientTimeStartAt.toFormat(
        'DDDD'
      )} a las ${clientTimeStartAt.toFormat('HH:mm')} con ${
        data ? data.full_name : ''
      }.</p>
      <p style="fontSize: 1rem; color: #020617">
      ¡Saludos!
      <br />
      El equipo de MiDoctor
			</p>
      </div>
      `,
    });
  } catch (error) {
    console.log('ERROR SENDING NOTIFICATION: ', error);
    throw error;
  }
}

(async function runCronJob() {
  try {
    const schedules = await getSchedules();

    if (schedules.length > 0) {
      for (const schedule of schedules) {
        await sendNotification(schedule);
      }
    }

    console.log('NUMBERS OF NOTIFICATIONS SENT: ', schedules.length);
  } catch (error) {
    console.log('ERROR RUNNING TASK: ', error);
  }
})();
