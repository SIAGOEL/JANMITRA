require("dotenv").config();

const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function createService() {
  try {
    const service = await client.verify.v2.services.create({
      friendlyName: "Janmitra Phone Verification",
    });

    console.log("VERIFY SERVICE CREATED");
    console.log("Service SID:", service.sid);
  } catch (error) {
    console.error("ERROR CREATING VERIFY SERVICE:");
    console.error(error.message);
  }
}

createService();