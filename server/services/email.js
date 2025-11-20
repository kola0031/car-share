import nodemailer from 'nodemailer';

// For development, use console logging
// For production, configure with real SMTP settings
const isDevelopment = process.env.NODE_ENV !== 'production';

// Create transporter
const createTransporter = () => {
    if (isDevelopment) {
        // Log emails to console in development
        return {
            sendMail: async (mailOptions) => {
                console.log('\n📧 EMAIL SENT:');
                console.log('To:', mailOptions.to);
                console.log('Subject:', mailOptions.subject);
                console.log('Body:', mailOptions.text || mailOptions.html);
                console.log('---\n');
                return { messageId: 'dev-' + Date.now() };
            }
        };
    }

    // Production: Use real SMTP settings from environment variables
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const transporter = createTransporter();

/**
 * Send verification email to new user
 */
export const sendVerificationEmail = async (email, name, verificationToken) => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: process.env.SMTP_FROM || 'HostPilot <noreply@hostpilot.com>',
        to: email,
        subject: 'Verify your HostPilot account',
        text: `Hi ${name},\n\nWelcome to HostPilot! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nIf you didn't create an account, you can safely ignore this email.\n\nBest regards,\nThe HostPilot Team`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to HostPilot!</h2>
        <p>Hi ${name},</p>
        <p>Thanks for signing up! Please verify your email address to complete your registration:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The HostPilot Team</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

/**
 * Send welcome email after successful onboarding
 */
export const sendWelcomeEmail = async (email, name, dashboardUrl) => {
    const mailOptions = {
        from: process.env.SMTP_FROM || 'HostPilot <noreply@hostpilot.com>',
        to: email,
        subject: 'Welcome to HostPilot - Your Dashboard is Ready!',
        text: `Hi ${name},\n\nCongratulations! Your HostPilot account is all set up.\n\nYou can now access your dashboard at: ${dashboardUrl}\n\nHere's what you can do:\n- Manage your fleet\n- Track bookings and earnings\n- Monitor vehicle maintenance\n- And much more!\n\nIf you need any help, our support team is here for you.\n\nHappy hosting!\nThe HostPilot Team`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎉 Welcome to HostPilot!</h2>
        <p>Hi ${name},</p>
        <p>Congratulations! Your HostPilot account is all set up and ready to go.</p>
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Go to Dashboard</a>
        <h3 style="color: #333;">What's Next?</h3>
        <ul style="color: #666;">
          <li>Manage your fleet</li>
          <li>Track bookings and earnings</li>
          <li>Monitor vehicle maintenance</li>
          <li>View analytics and insights</li>
        </ul>
        <p>If you need any help, our support team is here for you!</p>
        <p>Happy hosting!<br>The HostPilot Team</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
};

/**
 * Send maintenance alert email
 */
export const sendMaintenanceAlert = async (email, name, vehicleName, alertMessage) => {
    const mailOptions = {
        from: process.env.SMTP_FROM || 'HostPilot <noreply@hostpilot.com>',
        to: email,
        subject: `Maintenance Alert: ${vehicleName}`,
        text: `Hi ${name},\n\n${alertMessage}\n\nVehicle: ${vehicleName}\n\nPlease log in to your dashboard to view details and schedule maintenance.\n\nBest regards,\nThe HostPilot Team`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF9800;">⚠️ Maintenance Alert</h2>
        <p>Hi ${name},</p>
        <p>${alertMessage}</p>
        <p><strong>Vehicle:</strong> ${vehicleName}</p>
        <p>Please log in to your dashboard to view details and schedule maintenance.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/dashboard" style="display: inline-block; background-color: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">View Dashboard</a>
        <p>Best regards,<br>The HostPilot Team</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Maintenance alert sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending maintenance alert:', error);
        throw error;
    }
};

export default {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendMaintenanceAlert,
};
