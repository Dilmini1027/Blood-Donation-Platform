import nodemailer from 'nodemailer';

// Email templates
const emailTemplates = {
  emailVerification: (data) => {
    return {
      subject: 'Verify Your Email - Blood Donation Platform',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626;">🩸 Blood Donation Platform</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 10px;">
            <h2 style="color: #374151; margin-bottom: 20px;">Welcome, ${data.name}!</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining our blood donation community. You're one step away from making a difference!
            </p>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" 
                 style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, you can also click this link:<br>
              <a href="${data.verificationUrl}" style="color: #dc2626; word-break: break-all;">
                ${data.verificationUrl}
              </a>
            </p>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
              This verification link will expire in 24 hours for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>
              If you didn't create this account, please ignore this email.
            </p>
            <p>
              © 2025 Blood Donation Platform. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
  },

  passwordReset: (data) => {
    return {
      subject: 'Password Reset - Blood Donation Platform',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626;">🩸 Blood Donation Platform</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 10px;">
            <h2 style="color: #374151; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello ${data.name},
            </p>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password. If you made this request, click the button below to set a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, you can also click this link:<br>
              <a href="${data.resetUrl}" style="color: #dc2626; word-break: break-all;">
                ${data.resetUrl}
              </a>
            </p>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
              This password reset link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            <p>
              © 2025 Blood Donation Platform. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
  },

  appointmentConfirmation: (data) => {
    return {
      subject: 'Appointment Confirmation - Blood Donation Platform',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626;">🩸 Blood Donation Platform</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 10px;">
            <h2 style="color: #374151; margin-bottom: 20px;">Appointment Confirmed</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Dear ${data.donorName},
            </p>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Your blood donation appointment has been confirmed. Thank you for your commitment to saving lives!
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Appointment Details:</h3>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${data.appointmentDate}</p>
              <p style="margin: 10px 0;"><strong>Time:</strong> ${data.appointmentTime}</p>
              <p style="margin: 10px 0;"><strong>Location:</strong> ${data.bloodBankName}</p>
              <p style="margin: 10px 0;"><strong>Address:</strong> ${data.address}</p>
              <p style="margin: 10px 0;"><strong>Donation Type:</strong> ${data.donationType}</p>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <h4 style="color: #92400e; margin-top: 0;">Pre-donation Reminders:</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Get a good night's sleep before your appointment</li>
                <li>Eat a healthy meal and stay well-hydrated</li>
                <li>Bring a valid photo ID</li>
                <li>Avoid alcohol for 24 hours before donation</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>
              Thank you for being a hero in someone's story! 🦸‍♂️
            </p>
            <p>
              © 2025 Blood Donation Platform. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
  },

  donationThankYou: (data) => {
    return {
      subject: 'Thank You for Your Life-Saving Donation!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626;">🩸 Blood Donation Platform</h1>
            <h2 style="color: #16a34a; margin-top: 10px;">Thank You, Hero! 🎉</h2>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 10px;">
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Dear ${data.donorName},
            </p>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Congratulations on completing your blood donation! Your generosity has the power to save up to 3 lives. 💪
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Donation Summary:</h3>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${data.donationDate}</p>
              <p style="margin: 10px 0;"><strong>Blood Type:</strong> ${data.bloodType}</p>
              <p style="margin: 10px 0;"><strong>Quantity:</strong> ${data.quantity}ml</p>
              <p style="margin: 10px 0;"><strong>Bag Number:</strong> ${data.bagNumber}</p>
              <p style="margin: 10px 0;"><strong>Location:</strong> ${data.bloodBankName}</p>
            </div>
            
            <div style="background-color: #dcfdf7; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <h4 style="color: #047857; margin-top: 0;">Post-Donation Care:</h4>
              <ul style="color: #047857; margin: 0; padding-left: 20px;">
                <li>Rest for 15-20 minutes and have some refreshments</li>
                <li>Keep the bandage on for at least 4 hours</li>
                <li>Drink plenty of fluids for the next 24-48 hours</li>
                <li>Avoid heavy lifting with the donation arm for 24 hours</li>
                <li>Contact us if you experience any unusual symptoms</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 30px 0;">
              You can donate again in 8 weeks (56 days). We'll send you a reminder when you're eligible!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #374151; font-size: 18px; font-weight: bold; margin: 0;">
                Your next eligible donation date: ${data.nextEligibleDate}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>
              You are someone's hero today! Thank you for making a difference! 🌟
            </p>
            <p>
              © 2025 Blood Donation Platform. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
  }
};

// Create transporter
let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
};

// Send email function
export const sendEmail = async ({ to, subject, html, template, data }) => {
  try {
    const emailTransporter = createTransporter();

    let emailContent = {};

    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
    } else {
      emailContent = { subject, html };
    }

    const mailOptions = {
      from: {
        name: 'Blood Donation Platform',
        address: process.env.SMTP_USER
      },
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await emailTransporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: result.messageId,
      to,
      subject: emailContent.subject
    });

    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('Email sending failed:', error);
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send notification email to multiple recipients
export const sendBulkEmail = async (recipients) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail(recipient);
      results.push({
        to: recipient.to,
        success: true,
        messageId: result.messageId
      });
    } catch (error) {
      results.push({
        to: recipient.to,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const emailTransporter = createTransporter();
    await emailTransporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration verification failed:', error);
    return false;
  }
};