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

    const qrData = encodeURIComponent(`CINEVAULT:${bookingRef}:${toEmail}:${seats.join(',')}`);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}&bgcolor=ffffff&color=09090b&margin=6`;

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [toEmail],
      subject: `🎟️ Confirmed: ${movieTitle} (${bookingRef}) - CineVault Entry Pass`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 24px;">
          <div style="max-width: 520px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 20px 24px; text-align: center;">
              <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 1px;">CINEVAULT PASS</h2>
              <p style="margin: 4px 0 0; color: #fecdd3; font-size: 12px; font-weight: 600;">BOOKING CONFIRMED & VERIFIED</p>
            </div>

            <div style="padding: 24px;">
              <!-- Movie Details -->
              <div style="border-bottom: 1px dashed #3f3f46; padding-bottom: 16px; margin-bottom: 16px;">
                <span style="display: inline-block; background: #27272a; color: #fb7185; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; margin-bottom: 6px;">ADMIT ONE / GROUP</span>
                <h1 style="color: #ffffff; margin: 4px 0; font-size: 22px; font-weight: 800;">${movieTitle}</h1>
                <p style="color: #a1a1aa; margin: 4px 0 0; font-size: 13px;">${theaterName} • ${screenName}</p>
              </div>

              <!-- Ticket Info Grid -->
              <table style="width: 100%; font-size: 13px; color: #d4d4d8; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #71717a; width: 40%;">Booking Reference:</td>
                  <td style="padding: 8px 0; font-weight: 800; font-family: monospace; color: #fbbf24; text-align: right; font-size: 14px;">${bookingRef}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Show Schedule:</td>
                  <td style="padding: 8px 0; font-weight: 700; color: #ffffff; text-align: right;">${formattedDate} • ${formattedTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Reserved Seats:</td>
                  <td style="padding: 8px 0; font-weight: 800; font-family: monospace; color: #34d399; text-align: right; font-size: 14px;">${seats.join(', ')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Total Paid:</td>
                  <td style="padding: 8px 0; font-weight: 800; color: #ffffff; text-align: right; font-size: 15px;">₹${totalAmount}</td>
                </tr>
              </table>

              <!-- QR Pass Box -->
              <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 16px;">
                <p style="margin: 0 0 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa;">Scan At Cinema Turnstile</p>
                <img src="${qrCodeUrl}" alt="Ticket QR Code" width="160" height="160" style="display: block; margin: 0 auto; border-radius: 8px; border: 4px solid #ffffff; background: #ffffff;" />
                <p style="margin: 10px 0 0; font-size: 11px; font-family: monospace; color: #71717a;">Token: ${bookingRef}</p>
              </div>

              <p style="text-align: center; margin: 0; font-size: 11px; color: #71717a;">
                Please arrive 15 minutes prior to showtime. Carry this digital pass or mention your booking reference at the box office.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('[RESEND EMAIL SENT WITH QR CODE SUCCESS]:', response);
    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error('Failed to send ticket email with QR:', error);
    return { success: false, error };
  }
}