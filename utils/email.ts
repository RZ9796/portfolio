import nodemailer from "nodemailer";

interface EmailPayload {
  name: string;
  lastname: string;
  email: string;
  subject: string;
  message: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const escapeHtml = (str: string) =>
  str.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c] || c));

export const sendEmail = async ({
  name,
  lastname,
  email,
  subject,
  message,
}: EmailPayload): Promise<void> => {
  const from = process.env.FROM_EMAIL;
  const fullName = `${name} ${lastname}`.trim();
  const safeName = escapeHtml(fullName);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

  // Modern, responsive HTML template for clients / recruiters
  const clientHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #050117; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background: #0c0728; border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #1e0b4b 0%, #0c0728 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
              <span style="font-size: 20px; font-weight: 700; color: #c084fc; letter-spacing: -0.5px;">&lt;Rushikesh Zalte /&gt;</span>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Full Stack &amp; Frontend Developer</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: #ffffff;">Thank you for reaching out, ${escapeHtml(name)}!</h1>
              
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                I have received your message regarding <strong style="color: #c084fc;">"${safeSubject}"</strong>. Thank you for considering my profile and taking the time to write.
              </p>
              
              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                I usually review inquiries and reply within <strong>24 to 48 hours</strong>. If your inquiry is urgent, feel free to connect with me directly on LinkedIn.
              </p>

              <!-- Message Recap Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a855f7; font-weight: 600;">Summary of your message</p>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #94a3b8;"><strong>Subject:</strong> <span style="color: #f1f5f9;">${safeSubject}</span></p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border-left: 3px solid #a855f7;">${safeMessage}</p>
                  </td>
                </tr>
              </table>

              <!-- Action Links -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); padding: 10px 22px;">
                    <a href="https://www.linkedin.com/in/rushikesh-zalte-ab23a2248/" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; display: inline-block;">Connect on LinkedIn &rarr;</a>
                  </td>
                  <td style="padding-left: 12px;">
                    <a href="https://github.com/RZ9796" target="_blank" style="font-size: 14px; color: #cbd5e1; text-decoration: none; padding: 10px 18px; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; display: inline-block;">GitHub</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: rgba(0, 0, 0, 0.4); border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">
                Best regards,<br/>
                <strong style="color: #ffffff;">Rushikesh Zalte</strong> — Full Stack &amp; Frontend Developer
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                This is an automated confirmation verifying that your message reached my inbox.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  // Notification email to the portfolio owner (Rushikesh)
  const ownerHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #050117; color: #f1f5f9; padding: 24px;">
  <div style="max-width: 580px; margin: auto; background: #0c0728; border: 1px solid #7c3aed; border-radius: 12px; padding: 24px;">
    <h2 style="color: #c084fc; margin-top: 0;">🚀 New Portfolio Inquiry</h2>
    <p><strong>From:</strong> ${safeName} &lt;<a href="mailto:${email}" style="color: #38bdf8;">${email}</a>&gt;</p>
    <p><strong>Subject:</strong> ${safeSubject}</p>
    <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #a855f7;">
      <p style="margin: 0; line-height: 1.6;">${safeMessage}</p>
    </div>
    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="background: #7c3aed; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Reply to ${escapeHtml(name)}</a>
  </div>
</body>
</html>
`;

  await Promise.all([
    // 1. Notification to portfolio owner
    transporter.sendMail({
      from,
      replyTo: email,
      to: from,
      subject: `Portfolio Contact from ${fullName}: ${subject}`,
      text: `Sender: ${fullName} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: ownerHtml,
    }),
    // 2. Polished confirmation email to client / recruiter
    transporter.sendMail({
      from,
      to: email,
      subject: `Thank you for reaching out: ${subject}`,
      text: `Dear ${fullName},\n\nThank you for reaching out regarding "${subject}". I have received your message and will get back to you within 24 to 48 hours.\n\nBest regards,\nRushikesh Zalte\nFull Stack Developer`,
      html: clientHtml,
    }),
  ]);
};

export default sendEmail;
