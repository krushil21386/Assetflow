import nodemailer from "nodemailer";

// Create transporter only if environment variables are set
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Sends an email notification to a user.
 * @param {string} toEmail - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} textContent - Plain text body content
 * @param {string} htmlContent - Optional HTML formatted content
 */
export const sendEmailNotification = async (toEmail, subject, textContent, htmlContent = null) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("\n========================================================");
    console.log(`[Email Service Mock Output]`);
    console.log(`To:      ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${textContent}`);
    console.log("========================================================\n");
    return { mock: true, sent: true };
  }

  const mailOptions = {
    from: `"AssetFlow Notifications" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: subject,
    text: textContent,
    html: htmlContent || textContent.replace(/\n/g, "<br>"),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent successfully to ${toEmail}: ${info.messageId}`);
    return { mock: false, sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${toEmail}:`, error);
    return { mock: false, sent: false, error };
  }
};
