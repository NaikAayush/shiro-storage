import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

import { EmailBody } from 'src/interfaces/email-body.js';

@Injectable()
export class SendgridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  sendMail(emailData: EmailBody) {
    return sgMail
      .send(emailData)
      .then(() => {
        return {
          message: 'Email sent successfully',
        };
      })
      .catch((error) => {
        return {
          message: 'Error',
          error: error,
        };
      });
  }
}
