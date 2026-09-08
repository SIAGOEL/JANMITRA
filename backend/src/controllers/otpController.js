const crypto = require('crypto');
const { Resend } = require('resend');
const EmailOTP = require('../models/EmailOTP');

const resend = process.env.RESEND_API_KEY

 ? new Resend (process.env.RESEND_API_KEY)
 : null;

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOTP(otp) {
  return crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');
}

async function sendOTP(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    await EmailOTP.findOneAndUpdate(
      { email },
      {
        email,
        otpHash,
        // OTP itself is valid for 10 minutes
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
      },
      {
        upsert: true,
        new: true,
      }
    );

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Janmitra Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Janmitra Email Verification</h2>

          <p>Use the following OTP to verify your email address:</p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 20px;
            background: #f3f4f6;
            text-align: center;
            border-radius: 10px;
          ">
            ${otp}
          </div>

          <p>This OTP is valid for <strong>10 minutes</strong>.</p>

          <p>
            If you did not request this verification, you can safely ignore
            this email.
          </p>

          <hr />

          <p style="font-size: 12px; color: #666;">
            Janmitra — Legal Investigation System
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('RESEND ERROR:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to send OTP email',
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('SEND OTP ERROR:', error);
    next(error);
  }
}

async function verifyOTP(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const record = await EmailOTP.findOne({ email });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.',
      });
    }

    // OTP must still be within its 10-minute validity period
    if (!record.verified && record.expiresAt < new Date()) {
      await EmailOTP.deleteOne({ _id: record._id });

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      });
    }

    // Check OTP
    if (!record.verified && record.otpHash !== hashOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Mark email as verified
    record.verified = true;

    // Keep verified email available for registration for 24 hours
    record.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await record.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('VERIFY OTP ERROR:', error);
    next(error);
  }
}

module.exports = {
  sendOTP,
  verifyOTP,
};