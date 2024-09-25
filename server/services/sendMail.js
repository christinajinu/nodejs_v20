import handlebars from 'handlebars';
// const path = require('path');
import fs from 'fs';
import transporter from '../config/nodemailer.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SERVER_ROOT_PATH = join(__dirname, '../email_templates');

export const sendMail = async (mailOptions) => {
  // read the html file and compile it with handlebars
  const html = fs.readFileSync(
    join(SERVER_ROOT_PATH, mailOptions.template),
    'utf-8'
  );
  const template = handlebars.compile(html);
  const htmlToSend = template(mailOptions.data);

  // send the email with the rendered html
  const mailDetails = await transporter.sendMail({
    from: `"TrackGenesis" ${process.env.USER_EMAIL}`, // sender address
    ...mailOptions,
    html: htmlToSend,
  });

  return mailDetails;
};
