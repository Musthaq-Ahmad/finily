import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

let transportPromise = null;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name}. Copy server/.env.example to server/.env and fill it in.`);
  return value;
}

function getTransport() {
  if (!transportPromise) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transportPromise = Promise.resolve(
      nodemailer.createTransport({
        host: requireEnv('SMTP_HOST'),
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: {
          user: requireEnv('SMTP_USER'),
          pass: requireEnv('SMTP_PASS'),
        },
      }),
    );
  }
  return transportPromise;
}

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? '*' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/reports/send', upload.single('pdf'), async (req, res) => {
  try {
    let to;
    try {
      to = JSON.parse(req.body.to ?? '[]');
    } catch {
      return res.status(400).json({ error: 'Recipient list is malformed.' });
    }
    if (!Array.isArray(to) || to.length === 0) {
      return res.status(400).json({ error: 'At least one recipient is required.' });
    }
    const invalid = to.filter((addr) => typeof addr !== 'string' || !EMAIL_RE.test(addr));
    if (invalid.length > 0) {
      return res.status(400).json({ error: `Invalid recipient address: ${invalid.join(', ')}` });
    }

    const subject = String(req.body.subject ?? '')
      .replace(/[\r\n]/g, ' ')
      .trim();
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required.' });
    }
    const text = String(req.body.body ?? '');

    const attachments = req.file
      ? [
          {
            filename: req.file.originalname || 'expense-report.pdf',
            content: req.file.buffer,
            contentType: 'application/pdf',
          },
        ]
      : [];

    const transport = await getTransport();
    const info = await transport.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      attachments,
    });

    // Only resolves to a URL for Ethereal test accounts; a no-op for real providers.
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('Preview URL:', previewUrl);

    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to send report email:', err);
    res.status(500).json({ error: 'Failed to send email. Check server logs and SMTP configuration.' });
  }
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`Finly mail server listening on http://localhost:${port}`);
});
