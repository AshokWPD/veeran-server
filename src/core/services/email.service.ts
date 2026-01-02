import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // app password
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = `
      <h1>Verify your e-commerce account</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${url}">${url}</a>
    `;

    await this.transporter.sendMail({
      to: email,
      subject: 'Email Verification',
      html,
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">${url}</a>
      <p>This link is valid for 1 hour.</p>
    `;

    await this.transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html,
    });
  }
}
