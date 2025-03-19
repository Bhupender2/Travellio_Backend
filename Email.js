const nodemailer = require("nodemailer");

const Email = async (options) => {
    //STEP1 - Create a transporte
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.EMAIL_USRERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    //STEP2: Define the Email Details
    const mailOptions = {
        from: '"Travellio Support" <support@Travellio.com>', // Sender address
        to: options.email,  // Recipient email
        subject: options.subject, // Email subject
        text: options.message, // Plain text message
    };
    try {
        const info = await transport.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);

    } catch (err) {
        console.log(err)
    }

}

module.exports = Email;

//EMAIL SERVER : An email serveris a computer system that sends, receives, and stores emails. It works like a post office for digital messages.
// How a Fake Email Server (Mailtrap) Works 🚧
// ✅ Sender ("From") → You define the sender email (abc@example.com).
// ✅ Fake Email Server (Mailtrap) → Intercepts the email, but doesn’t forward it to the real user.
// ✅ Testing Inbox (Mailtrap UI) → Stores the email so you can see it without sending it to an actual user.

// 📌 Example:
// 📤 You send an email from abc@example.com → 🚫 It never reaches testuser@example.com but gets stored in Mailtrap’s inbox.


