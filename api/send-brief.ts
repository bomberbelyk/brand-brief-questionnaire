import nodemailer from 'nodemailer'
import type { IncomingMessage, ServerResponse } from 'node:http'

const recipientEmail = 'v.demidov@urc.org.ua'

type RequestWithBody = IncomingMessage & {
  body?: {
    brief?: unknown
  }
}

function readBody(req: RequestWithBody) {
  return new Promise<{ brief?: unknown }>((resolve, reject) => {
    if (req.body) {
      resolve(req.body)
      return
    }

    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, statusCode: number, payload: Record<string, unknown>) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

export default async function handler(req: RequestWithBody, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Метод не підтримується.' })
    return
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    sendJson(res, 500, {
      message:
        'Відправку пошти ще не налаштовано. Додайте SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS і SMTP_FROM.',
    })
    return
  }

  try {
    const body = await readBody(req)
    const brief = body.brief

    if (!brief || typeof brief !== 'object') {
      sendJson(res, 400, { message: 'Бриф порожній або має неправильний формат.' })
      return
    }

    const briefJson = JSON.stringify(brief, null, 2)

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: SMTP_FROM,
      to: recipientEmail,
      subject: 'Новий бренд-бриф з анкети',
      text: `Новий бриф з онлайн-анкети.\n\n${briefJson}`,
      attachments: [
        {
          filename: 'brand-brief.json',
          content: briefJson,
          contentType: 'application/json',
        },
        {
          filename: 'brand-brief.txt',
          content: briefJson,
          contentType: 'text/plain; charset=utf-8',
        },
      ],
    })

    sendJson(res, 200, { ok: true })
  } catch (error) {
    sendJson(res, 500, {
      message: error instanceof Error ? error.message : 'Не вдалося надіслати лист.',
    })
  }
}
