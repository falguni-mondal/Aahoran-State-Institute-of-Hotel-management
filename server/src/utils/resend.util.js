import { Resend } from 'resend';
import 'dotenv/config';

let resendInstance = null;

/**
 * Lazily initializes the Resend SDK client if RESEND_API_KEY is configured.
 */
const getResendClient = () => {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
};

/**
 * Sends an official SIHM Durgapur Alumni Welcome & Credential Email via Resend.
 *
 * @param {Object} alumnus - Newly registered alumnus document
 * @returns {Promise<{ sent: boolean, id?: string, error?: string }>}
 */
export const sendAlumniWelcomeEmail = async (alumnus) => {
  const client = getResendClient();
  const fromAddress =
    process.env.RESEND_FROM_EMAIL ||
    'SIHM Durgapur Alumni Network <onboarding@resend.dev>';
  const portalUrl = `${
    process.env.CLIENT_URL || 'http://localhost:5173'
  }/alumni?tab=portal`;

  if (!client) {
    console.warn(
      '[Resend Info] RESEND_API_KEY is not set in environment variables. Skipping email dispatch for:',
      alumnus.email
    );
    return { sent: false, error: 'RESEND_API_KEY not configured' };
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Welcome to the SIHM Durgapur Alumni Network</title>
      </head>
      <body style="margin:0;padding:0;background-color:#F7F5F0;font-family:'Inter',Arial,sans-serif;color:#303030;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F5F0;padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width:620px;background-color:#FFFFFF;border:1px solid #E6E2D8;padding:40px 36px;">
                <tr>
                  <td style="border-bottom:1px solid #E6E2D8;padding-bottom:20px;">
                    <span style="font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#E85D04;display:block;">
                      State Institute of Hotel Management, Durgapur
                    </span>
                    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin:8px 0 0;color:#303030;">
                      Once a Student, Always a Part of SIHM Family
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding-top:24px;font-size:15px;line-height:1.65;color:#303030;">
                    <p style="margin:0 0 16px;">Dear <strong>${alumnus.fullName}</strong>,</p>
                    <p style="margin:0 0 20px;color:#555555;">
                      Welcome to the official <strong>AAHORAN — SIHM Durgapur Alumni Network</strong>. Your alumni account has been created, and your lifelong institutional Registration ID is ready for use.
                    </p>

                    <div style="background-color:#EFECE6;border-left:4px solid #E85D04;padding:20px 24px;margin:24px 0;">
                      <span style="font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#E85D04;display:block;">
                        Your Official Alumni Registration ID
                      </span>
                      <div style="font-family:monospace;font-size:24px;font-weight:700;letter-spacing:0.08em;color:#303030;margin-top:6px;">
                        ${alumnus.registrationId}
                      </div>
                      <p style="margin:8px 0 0;font-size:12px;color:#707884;">
                        You can sign in anytime using either this Registration ID or your registered email address (<strong>${alumnus.email}</strong>) along with your password.
                      </p>
                    </div>

                    <table width="100%" cellpadding="8" cellspacing="0" style="border-top:1px solid #E6E2D8;border-bottom:1px solid #E6E2D8;font-size:13px;margin:20px 0;">
                      <tr>
                        <td style="color:#707884;width:40%;">Academic Batch:</td>
                        <td style="font-weight:600;color:#303030;">${alumnus.yearOfAdmission} – ${alumnus.yearOfPassing}</td>
                      </tr>
                      <tr>
                        <td style="color:#707884;">Course Completed:</td>
                        <td style="font-weight:600;color:#303030;">${alumnus.courseCompleted}</td>
                      </tr>
                      <tr>
                        <td style="color:#707884;">Current Designation:</td>
                        <td style="font-weight:600;color:#303030;">${alumnus.currentDesignation} at ${alumnus.organisation}</td>
                      </tr>
                      <tr>
                        <td style="color:#707884;">Directory Status:</td>
                        <td style="font-weight:600;color:#E85D04;">Pending Administrative Approval</td>
                      </tr>
                    </table>

                    <p style="margin:20px 0;font-size:13px;color:#707884;line-height:1.6;">
                      While your public directory card is queued for administrative verification, your account is already active. You can log in immediately to RSVP for upcoming reunions with a single click, post reflections on the Testimonials Wall, and explore career opportunities.
                    </p>

                    <div style="margin-top:28px;">
                      <a href="${portalUrl}" style="display:inline-block;background-color:#303030;color:#F7F5F0;text-decoration:none;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">
                        Open SIHM Alumni Portal →
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding-top:32px;margin-top:32px;border-top:1px solid #E6E2D8;font-size:11px;color:#707884;">
                    State Institute of Hotel Management, Fuljhore, Durgapur - 713206, West Bengal, India.<br/>
                    Official Helpline: sihmdurgapur@gmail.com | +91 892 759 6669
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const response = await client.emails.send({
      from: fromAddress,
      to: [alumnus.email],
      subject: `Welcome to SIHM Durgapur Alumni Network — ID: ${alumnus.registrationId}`,
      html: htmlTemplate,
    });

    return {
      sent: true,
      id: response?.data?.id || response?.id,
    };
  } catch (error) {
    console.error('[Resend Error] Failed to send welcome email:', error.message);
    return {
      sent: false,
      error: error.message,
    };
  }
};

export default sendAlumniWelcomeEmail;