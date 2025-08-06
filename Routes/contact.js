const express = require("express");

const Email = require("../Email"); // importing my Email function here

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body; // getting the form data

    await Email({
      email: "kritikasharmaa.8736@gmail.com",
      subject: `New Contact Form Message from ${name}`,
      message: `
      Contact Form Submission:

      Name:${name}
      Email:${email}
      Phone:${phone}

      Message:
      ${message}

      -----
      SENT FROM TRAVELLIO CONTACT FORM   
      `,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.log("Email Error", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again.",
    });
  }
});

module.exports = router;
