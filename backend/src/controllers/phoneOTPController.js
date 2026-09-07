const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function normalizePhone(phone) {
  const value = String(phone || "").trim();

  // Accept 10-digit Indian number
  if (/^\d{10}$/.test(value)) {
    return `+91${value}`;
  }

  // Also accept +91XXXXXXXXXX
  if (/^\+91\d{10}$/.test(value)) {
    return value;
  }

  return null;
}

// Send Phone OTP
async function sendPhoneOTP(req, res, next) {
  try {
    const phone = normalizePhone(req.body.phone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit Indian phone number.",
      });
    }

    const verification =
      await client.verify.v2.services(
        process.env.TWILIO_VERIFY_SERVICE_SID
      ).verifications.create({
        to: phone,
        channel: "sms",
      });

    res.json({
      success: true,
      message: "Phone OTP sent successfully.",
      status: verification.status,
    });
  } catch (error) {
    console.error("SEND PHONE OTP ERROR:", error);
    next(error);
  }
}

// Verify Phone OTP
async function verifyPhoneOTP(req, res, next) {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || "").trim();

    if (!phone || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Phone number and 6-digit OTP are required.",
      });
    }

    const verificationCheck =
      await client.verify.v2.services(
        process.env.TWILIO_VERIFY_SERVICE_SID
      ).verificationChecks.create({
        to: phone,
        code: otp,
      });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid phone OTP.",
      });
    }

    res.json({
      success: true,
      message: "Phone number verified successfully.",
    });
  } catch (error) {
    console.error("VERIFY PHONE OTP ERROR:", error);
    next(error);
  }
}

module.exports = {
  sendPhoneOTP,
  verifyPhoneOTP,
};