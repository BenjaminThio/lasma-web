import 'server-only';
import { siteConfig } from '@/config/site';
import { env, features, isProduction } from '@/server/env';
import { logger } from '@/server/logger';

export interface Email {
    to: string;
    subject: string;
    text: string;
    html: string;
}

const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);

/**
 * Sends through Resend when configured. Without a key the message is logged instead, so flows like
 * password reset can be tried locally, but only in development or with the in-memory store (which
 * never holds real accounts). A real production server never writes reset links to its logs.
 */
export async function sendEmail(email: Email): Promise<void> {
    if (!features.email) {
        if (isProduction && env.DATA_DRIVER !== 'memory') {
            logger.error('Email is not configured (RESEND_API_KEY, EMAIL_FROM); message dropped', {
                subject: email.subject,
            });
        } else {
            logger.info('Email not sent (no RESEND_API_KEY); this is what would have gone out', {
                to: email.to,
                subject: email.subject,
                text: email.text,
            });
        }
        return;
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: env.EMAIL_FROM,
            to: [email.to],
            subject: email.subject,
            text: email.text,
            html: email.html,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
        throw new Error(`Resend responded with ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }
}

export function passwordResetEmail(to: string, username: string, link: string, minutes: number): Email {
    const name = escapeHtml(username);
    const href = escapeHtml(link);

    return {
        to,
        subject: `Reset your ${siteConfig.name} password`,
        text: [
            `Hi ${username},`,
            '',
            `Someone (hopefully you) asked to reset the password for your ${siteConfig.name} account.`,
            `Open this link within ${minutes} minutes to choose a new one:`,
            '',
            link,
            '',
            "If you didn't ask for this, ignore this email. Your password won't change.",
        ].join('\n'),
        html: `<!doctype html>
<html lang="en">
<body style="margin:0;background:#131314;color:#ffffff;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#1b1b1b;border-radius:16px;padding:32px">
        <tr><td style="font-size:14px;letter-spacing:2px;color:#ffd200;text-transform:uppercase">${escapeHtml(siteConfig.name)}</td></tr>
        <tr><td style="padding-top:16px;font-size:22px;font-weight:bold">Reset your password</td></tr>
        <tr><td style="padding-top:12px;font-size:15px;line-height:1.6;color:#a1a3a8">
          Hi ${name}, someone (hopefully you) asked to reset the password for your account.
          This link works once and expires in ${minutes} minutes.
        </td></tr>
        <tr><td style="padding-top:24px">
          <a href="${href}" style="display:inline-block;background:#ffd200;color:#131314;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px">Choose a new password</a>
        </td></tr>
        <tr><td style="padding-top:24px;font-size:13px;line-height:1.6;color:#6f7278">
          If you didn't ask for this, ignore this email. Your password won't change.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    };
}
