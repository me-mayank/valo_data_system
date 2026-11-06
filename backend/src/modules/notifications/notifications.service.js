import { logger } from '../../shared/logger.js';
import { env } from '../../config/env.js';

export class NotificationsService {
  /**
   * Registers event bus listeners for notifications.
   * @param {import('../../shared/events/event-bus.js').eventBus} bus
   */
  registerListeners(bus) {
    bus.on('lead.created', async (payload) => {
      try {
        logger.info(
          { leadId: payload.id, email: payload.email, isUpdate: payload.isUpdate },
          'Notification listener received lead.created'
        );

        if (env.RESEND_API_KEY && env.LEAD_NOTIFY_EMAIL) {
          await this.sendLeadEmail(payload);
        }
      } catch (err) {
        logger.error({ err: err.message, leadId: payload.id }, 'Failed to deliver lead notification email');
      }
    });

    bus.on('campus-request.created', async (payload) => {
      try {
        logger.info(
          { campusRequestId: payload.id, institution: payload.institution },
          'Notification listener received campus-request.created'
        );

        if (env.RESEND_API_KEY && env.LEAD_NOTIFY_EMAIL) {
          await this.sendCampusRequestEmail(payload);
        }
      } catch (err) {
        logger.error(
          { err: err.message, campusRequestId: payload.id },
          'Failed to deliver campus request notification email'
        );
      }
    });
  }

  async sendLeadEmail(payload) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Data Valo System <notifications@datavalosystem.com>',
        to: [env.LEAD_NOTIFY_EMAIL],
        subject: `New Lead: ${payload.fullName} (${payload.college})`,
        text: [
          `New student registration received:`,
          `Name: ${payload.fullName}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.phone}`,
          `College: ${payload.college}`,
          `Course/Year: ${payload.courseYear}`,
          `Source: ${payload.source || 'direct'}`,
          `Form Variant: ${payload.formVariant || 'popup'}`,
          `Updated Existing: ${payload.isUpdate ? 'Yes' : 'No'}`,
        ].join('\n'),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend API error (${res.status}): ${body}`);
    }
  }

  async sendCampusRequestEmail(payload) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Data Valo System <notifications@datavalosystem.com>',
        to: [env.LEAD_NOTIFY_EMAIL],
        subject: `New Campus Workshop Request: ${payload.institution}`,
        text: [
          `New campus workshop request received:`,
          `Institution: ${payload.institution}`,
          `Contact Person: ${payload.contactPerson}`,
          `Designation: ${payload.designation}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.phone}`,
          `Approx Students: ${payload.approxStudents || 'Not specified'}`,
          `Preferred Format: ${payload.preferredFormat || 'Not specified'}`,
          `Message: ${payload.message || 'None'}`,
        ].join('\n'),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend API error (${res.status}): ${body}`);
    }
  }
}

export const notificationsService = new NotificationsService();
