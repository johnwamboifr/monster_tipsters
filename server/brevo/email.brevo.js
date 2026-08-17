import { Resend } from "resend";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplates.js";

//const resend = new Resend(process.env.RESEND_API_KEY);
const resend = new Resend("re_AUuUhEqH_JLpg5xQEbxc6Gv8iWSKbaFue");

const sender = "Monster Tipsters <onboarding@resend.dev>";

const applyTemplate = (template, data) => {
  return Object.keys(data).reduce(
    (acc, key) =>
      acc.replace(new RegExp(`{${key}}`, "g"), data[key] ?? ""),
    template
  );
};

const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: sender,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (error) {
    console.error("Resend Error:", error);
    throw new Error(error.message);
  }

  return data;
};

export const sendVerificationEmail = async (email, verificationCode) => {
  return sendEmail({
    to: email,
    subject: "Verify Your Email",
    html: applyTemplate(VERIFICATION_EMAIL_TEMPLATE, {
      verificationCode,
    }),
  });
};

export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: "Welcome!",
    html: applyTemplate(WELCOME_EMAIL_TEMPLATE, {
      name,
    }),
  });
};

export const sendPasswordResetEmail = async (email, resetCode) => {
  return sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: applyTemplate(PASSWORD_RESET_REQUEST_TEMPLATE, {
      resetCode,
    }),
  });
};

export const sendResetSuccessEmail = async (email) => {
  return sendEmail({
    to: email,
    subject: "Password Reset Successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  });
};

export const sendNotificationEmail = async (email, subject, message) => {
  return sendEmail({
    to: email,
    subject,
    html: message,
  });
};

export default {
  sendNotificationEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
};
