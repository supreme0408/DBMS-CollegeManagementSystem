// emailScheduler.js
const env = require('dotenv');
const mysql = require('mysql');
// const sql = require('./database/mysql');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
env.config();
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.DOMAIN_NAME,
});

// const db=sql.connect();
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    dateStrings: 'date',
    database:process.env.DB_NAME,
  });

  const queryParamPromise = (sql, queryParam) => {
    return new Promise((resolve, reject) => {
      db.query(sql, queryParam, (err, results) => {
        if (err) return reject(err);
        return resolve(results);
      });
    });
  };

// Function to send birthday emails using Mailgun.
function sendBirthdayEmail(name, email) {
  const mailgunData = {
    from: 'freezebot720@gmail.com',
    to: email,
    subject: 'Happy Birthday!',
    text: `Dear ${name},\n\nHappy Birthday! 🎉🎂\n\nBest wishes from your alma mater.`
  };

  mailgun.messages().send(mailgunData, (error, body) => {
    if (error) {
      console.error('Mailgun error:', error);
    } else {
      console.log('Birthday email sent to:', email);
    }
  });
}

// Schedule the task to run daily at MM:HH any day
schedule.scheduleJob('30 12 * * *', async () => {
  // Get today's date.
  const today = new Date();
const day = today.getDate().toString().padStart(2, '0');
const month = (today.getMonth() + 1).toString().padStart(2, '0');
const todayDate = `${month}-${day}`;
    console.log('Querying Alumni');
  // Query the database to find alumni with today's birthday.
  const alumniWithBirthday = await queryParamPromise(
    'SELECT name, email FROM Alumni WHERE DATE_FORMAT(date_of_birth, "%m-%d") = ?',
    [todayDate]
  );
  console.log(alumniWithBirthday);
  // Send birthday emails to alumni with preferences set to receive them.
  alumniWithBirthday.forEach((alumni) => {
    // if (alumni.email_preferences) {
      sendBirthdayEmail(alumni.name, alumni.email);
    // }
  });
});
