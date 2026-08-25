'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendTicketEmailParams {
  toEmail: string;
  bookingRef: string;
  movieTitle: string;
  theaterName: string;
  screenName: string;
  startTime: Date | string;
  seats: string[];
  totalAmount: number;
}

export async function sendTicketConfirmationEmail({
  toEmail,
  bookingRef,
  movieTitle,
  theaterName,
  screenName,
  startTime,
  seats,
  totalAmount,
}: SendTicketEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV EMAIL SIMULATION] No RESEND_API_KEY set. To: ${toEmail}, Ref: ${bookingRef}`);
    return { success: true, simulated: true };
  }

  try {
    const formattedDate = new Date(startTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const formattedTime = new Date(startTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [toEmail],
      subject: `Your Movie Ticket: ${movieTitle} (${bookingRef})`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 24px; border-radius: 12px; max-width: 500px; margin: auto;">
          <div style="border-bottom: 1px solid #27272a; padding-bottom: 16px; margin-bottom: 16px;">
            <span style="color: #f43f5e; font-weight: bold; font-size: 12px; text-transform: uppercase;">Official Entry Pass</span>
            <h1 style="color: #ffffff; margin: 4px 0 0 0; font-size: 22px;">${movieTitle}</h1>
            <p style="color: #a1a1aa; margin: 4px 0 0 0; font-size: 13px;">${theaterName} • ${screenName}</p>
          </div>

          <table style="width: 100%; font-size: 13px; color: #d4d4d8; margin-bottom: 16px;">
            <tr>
              <td style="padding: 6px 0; color: #71717a;">Booking Ref:</td>
              <td style="font-weight: bold; color: #fbbf24; text-align: right;">${bookingRef}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #71717a;">Date & Time:</td>
              <td style="font-weight: bold; color: #ffffff; text-align: right;">${formattedDate} at ${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #71717a;">Seats:</td>
              <td style="font-weight: bold; color: #34d399; text-align: right;">${seats.join(', ')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #71717a;">Total Paid:</td>
              <td style="font-weight: bold; color: #ffffff; text-align: right;">₹${totalAmount}</td>
            </tr>
          </table>

          <div style="text-align: center; padding: 16px; background-color: #18181b; border-radius: 8px; border: 1px dashed #3f3f46;">
            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">Present this pass or your Booking ID at the cinema entrance.</p>
          </div>
        </div>
      `,
    });

    console.log('[RESEND EMAIL SENT SUCCESS]:', response);
    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error('Failed to send ticket email:', error);
    return { success: false, error };
  }
}