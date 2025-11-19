const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async (email, token, jobGroupTitle = "our recruitment group") => {
  try {
    const inviteLink = `${process.env.FRONTEND_URL}/candidate/invite?token=${token}`;
    const expiryDays = 7;

    const mailOptions = {
      from: `"SkillHire AI Recruitment" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `🚀 You're Invited to Join: ${jobGroupTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recruitment Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">You're Invited! 🎉</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Join ${jobGroupTitle}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin-top: 0;">Welcome to Our Recruitment Process</h2>
              
              <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
                We're excited to invite you to join our exclusive recruitment group. This is your opportunity to showcase your skills and be considered for amazing opportunities.
              </p>

              <!-- Instructions Card -->
              <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px; margin: 25px 0;">
                <h3 style="color: #333; margin-top: 0;">📋 Next Steps:</h3>
                <ol style="color: #555; line-height: 1.8; padding-left: 20px;">
                  <li><strong>Accept Invitation:</strong> Click the button below to join</li>
                  <li><strong>Complete Profile:</strong> Fill in your professional details</li>
                  <li><strong>Showcase Skills:</strong> Add your technical & soft skills</li>
                  <li><strong>Get Evaluated:</strong> Our AI will match you with opportunities</li>
                </ol>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; 
                              padding: 16px 32px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              font-weight: 600; 
                              font-size: 16px; 
                              display: inline-block;
                              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                      Accept Invitation & Join Group
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Important Notes -->
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #856404; margin-top: 0;">⚠️ Important Information</h4>
                <ul style="color: #856404; line-height: 1.6; padding-left: 20px; margin: 0;">
                  <li>This invitation expires in <strong>${expiryDays} days</strong></li>
                  <li>Ensure your profile is complete for better matching</li>
                  <li>Keep your skills and experience updated</li>
                </ul>
              </div>

              <!-- Support Info -->
              <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="margin: 5px 0;">Need help? Contact our support team or reply to this email</p>
                <p style="margin: 5px 0;">
                  <a href="${process.env.FRONTEND_URL}/support" style="color: #667eea; text-decoration: none;">Support Center</a> • 
                  <a href="${process.env.FRONTEND_URL}/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #2d3748; padding: 25px 30px; text-align: center;">
              <p style="color: #a0aec0; margin: 0 0 10px 0; font-size: 14px;">
                Powered by <strong style="color: #fff;">SkillHire AI</strong>
              </p>
              <p style="color: #718096; margin: 0; font-size: 12px;">
                Transforming recruitment with intelligent matching
              </p>
            </td>
          </tr>
        </table>

        <!-- Bottom Text -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="color: #718096; font-size: 12px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color: #667eea; word-break: break-all;">${inviteLink}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Modern email sent to ${email} for job group: ${jobGroupTitle}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${email}`, err.message);
    throw err; // Re-throw to handle in calling function
  }
};

module.exports = sendEmail;