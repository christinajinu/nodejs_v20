import nodemailer from 'nodemailer';

const {
  HOST,
  SERVICE,
  TRANSPORT_PORT,
  USER_EMAIL: user,
  USER_PASSWORD: pass,
} = process.env;

const transporter = nodemailer.createTransport({
  service: SERVICE,
  host: HOST,
  port: TRANSPORT_PORT,
  auth: { user, pass },
  transactionLog: true,
  allowInternalNetworkInterfaces: false,
});

export default transporter;
