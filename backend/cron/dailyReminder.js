import cron from "node-cron";
import { sequelize } from "../config/db.js";
import { sendEmail } from "../utils/emailService.js";

const sendDailyReminders = async () => {
    try {
        console.log("Starting daily reminder job...");

        // Fetch all users with their emails
        const [users] = await sequelize.query(`
            SELECT users.name, user_auth.email 
            FROM users 
            JOIN user_auth ON users.user_id = user_auth.user_id
        `);

        if (users.length === 0) {
            console.log("No users found to send reminders to.");
            return;
        }

        for (const user of users) {
            const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Daily Learning Reminder</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
                        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <img src="https://img.icons8.com/color/96/000000/owl.png" alt="E-Learn Owl" style="width: 80px; margin-bottom: 20px;" />
                            <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">
                                Time for your daily lesson!
                            </h1>
                            <p style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 20px;">
                                Hi ${user.name},<br><br>
                                Consistency is key to mastering new skills! Take 5 minutes to learn something new today on E-Learn.
                            </p>
                            <a href="${process.env.FRONTEND_BASE_URL}" style="
                                display: inline-block; 
                                padding: 12px 25px; 
                                background-color: #58cc02; 
                                color: #fff; 
                                text-decoration: none; 
                                border-radius: 8px; 
                                font-weight: bold;
                                text-align: center; 
                                font-size: 16px; 
                                margin: 10px 0;">
                                Start Learning
                            </a>
                            <p style="font-size: 14px; color: #999; margin-top: 30px;">
                                You're receiving this because you're a registered user of E-Learn. Let's keep that streak alive!
                            </p>
                        </div>
                    </body>
                </html>
            `;

            // Send email (we don't await in loop to avoid blocking too long, but for simplicity here we do)
            await sendEmail(user.email, "It's time to practice on E-Learn! 🦉", htmlContent);
        }

        console.log(`Sent daily reminders to ${users.length} users.`);
    } catch (error) {
        console.error("Error running daily reminder job:", error);
    }
};

// Schedule the job to run every day at 10:00 AM server time
const startReminderCron = () => {
    cron.schedule('30 4 * * *', () => {
        sendDailyReminders();
    });
    console.log("Daily reminder cron job scheduled (Runs at 10:00 AM IST).");
};

export { startReminderCron, sendDailyReminders };
