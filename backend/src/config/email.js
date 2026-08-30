import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendMail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return
  try {
    await transporter.sendMail({
      from: `"Housie" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error('[email]', err.message)
  }
}

// ── Plantillas ────────────────────────────────────────────────────

function base(contenido) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <tr><td style="background:#10b981;padding:24px 32px">
          <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-.5px">Housie</span>
        </td></tr>
        <tr><td style="padding:32px">
          ${contenido}
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0">
          <p style="color:#94a3b8;font-size:12px;margin:0">Este es un mensaje automático de Housie. Por favor, no respondas a este correo.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function titulo(texto) {
  return `<h2 style="margin:0 0 8px;font-size:20px;color:#0f172a">${texto}</h2>`
}

function parrafo(texto) {
  return `<p style="color:#475569;font-size:15px;line-height:1.6;margin:12px 0">${texto}</p>`
}

function boton(texto, url) {
  return `<a href="${url}" style="display:inline-block;margin:20px 0 0;padding:12px 28px;background:#10b981;color:#fff;font-weight:600;font-size:14px;border-radius:10px;text-decoration:none">${texto}</a>`
}

function chip(color, texto) {
  const colores = {
    verde:  { bg: '#dcfce7', text: '#166534' },
    rojo:   { bg: '#fee2e2', text: '#991b1b' },
    naranja:{ bg: '#fef3c7', text: '#92400e' },
  }
  const c = colores[color] ?? colores.naranja
  return `<span style="display:inline-block;padding:4px 12px;background:${c.bg};color:${c.text};border-radius:20px;font-size:13px;font-weight:600">${texto}</span>`
}

// ── Emails de solicitudes ─────────────────────────────────────────

export function emailSolicitudEnviadaUsuario({ nombreUsuario, nombreGrupo, appUrl }) {
  return {
    subject: `Has solicitado contactar con "${nombreGrupo}" — Housie`,
    html: base(`
      ${titulo(`Solicitud enviada`)}
      ${parrafo(`Hola <strong>${nombreUsuario}</strong>, tu solicitud de contacto ha sido enviada correctamente.`)}
      ${parrafo(`El administrador del grupo <strong>${nombreGrupo}</strong> la revisará y te responderá en breve.`)}
      <div style="margin:20px 0;padding:16px;background:#f8fafc;border-radius:10px;border-left:3px solid #10b981">
        <p style="margin:0;font-size:14px;color:#475569">Puedes ver el estado de tu solicitud en <strong>Mensajes</strong>.</p>
      </div>
      ${boton('Ver mis solicitudes', `${appUrl}/perfil/chat`)}
    `),
  }
}

export function emailSolicitudRecibidaAdmin({ nombreAdmin, nombreSolicitante, nombreGrupo, appUrl }) {
  return {
    subject: `Nueva solicitud de contacto — ${nombreGrupo}`,
    html: base(`
      ${titulo(`Nueva solicitud de contacto`)}
      ${parrafo(`Hola <strong>${nombreAdmin}</strong>, tienes una nueva solicitud de contacto para el piso <strong>${nombreGrupo}</strong>.`)}
      <div style="margin:20px 0;padding:16px;background:#f8fafc;border-radius:10px">
        <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Solicitante</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a">${nombreSolicitante}</p>
      </div>
      ${parrafo(`Accede a tu panel para ver el perfil del solicitante y aceptar o rechazar la solicitud.`)}
      ${boton('Ver solicitudes', `${appUrl}/grupo/mensajes`)}
    `),
  }
}

export function emailSolicitudAceptada({ nombreUsuario, nombreGrupo, appUrl }) {
  return {
    subject: `Tu solicitud ha sido aceptada — ${nombreGrupo}`,
    html: base(`
      ${titulo(`¡Solicitud aceptada! ${chip('verde', '✓ Aceptada')}`)}
      ${parrafo(`Hola <strong>${nombreUsuario}</strong>, el grupo <strong>${nombreGrupo}</strong> ha aceptado tu solicitud.`)}
      ${parrafo(`Ahora puedes chatear directamente con el administrador del piso para conocer todos los detalles.`)}
      ${boton('Ir al chat', `${appUrl}/perfil/chat`)}
    `),
  }
}

export function emailSolicitudRechazada({ nombreUsuario, nombreGrupo }) {
  return {
    subject: `Tu solicitud no ha sido aceptada — ${nombreGrupo}`,
    html: base(`
      ${titulo(`Solicitud no aceptada ${chip('rojo', '✗ Rechazada')}`)}
      ${parrafo(`Hola <strong>${nombreUsuario}</strong>, el grupo <strong>${nombreGrupo}</strong> no ha podido aceptar tu solicitud en este momento.`)}
      ${parrafo(`No te desanimes — hay muchos pisos disponibles en Housie. Puedes volver a contactar con este grupo o explorar otros anuncios.`)}
    `),
  }
}

// ── Email de publicación ──────────────────────────────────────────

export function emailPublicacionConfirmada({ nombreAdmin, nombreGrupo, tituloAnuncio, appUrl }) {
  return {
    subject: `Tu anuncio está publicado en Housie`,
    html: base(`
      ${titulo(`¡Anuncio publicado! ${chip('verde', '✓ Activo')}`)}
      ${parrafo(`Hola <strong>${nombreAdmin}</strong>, tu anuncio ya está visible en Housie y los usuarios pueden contactarte.`)}
      <div style="margin:20px 0;padding:16px;background:#f8fafc;border-radius:10px">
        <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Grupo</p>
        <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#0f172a">${nombreGrupo}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Anuncio</p>
        <p style="margin:0;font-size:15px;color:#334155">${tituloAnuncio}</p>
      </div>
      ${parrafo(`Las solicitudes de contacto te llegarán a esta misma dirección de correo.`)}
      ${boton('Ver mi anuncio', `${appUrl}/grupo/publicacion`)}
    `),
  }
}

// ── Emails de facturas ────────────────────────────────────────────

export function emailFacturaNueva({ nombreInquilino, tipo, descripcion, importe, fechaVencimiento, appUrl }) {
  return {
    subject: `Nueva factura pendiente — ${tipo}`,
    html: base(`
      ${titulo(`Nueva factura en tu piso`)}
      ${parrafo(`Hola <strong>${nombreInquilino}</strong>, el casero ha registrado una nueva factura y ya puedes consultar la parte que te corresponde.`)}
      <div style="margin:20px 0;padding:16px;background:#f8fafc;border-radius:10px">
        <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Concepto</p>
        <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#0f172a">${tipo}${descripcion ? ` — ${descripcion}` : ''}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Tu parte</p>
        <p style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172a">${importe} €</p>
        <p style="margin:0;font-size:14px;color:#475569">Vence el <strong>${fechaVencimiento}</strong></p>
      </div>
      ${parrafo(`Cuando hayas realizado el pago, márcalo desde la aplicación para que el casero quede informado.`)}
      ${boton('Ver facturas', `${appUrl}/grupo/facturas`)}
    `),
  }
}
