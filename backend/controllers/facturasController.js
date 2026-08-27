import { randomUUID } from 'crypto';
import multer from 'multer';
import { prisma } from '../src/config/db.js';
import cloudinary from '../src/config/cloudinary.js';
import { facturaSchema } from '../validators/facturasValidator.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const permitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (permitidos.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten PDF, JPG, PNG o WEBP'));
  },
});

async function subirDocumento(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'roomies/facturas', resource_type: 'auto' },
      (err, result) => err ? reject(err) : resolve(result.secure_url)
    );
    stream.end(buffer);
  });
}

// ── GET /api/facturas/historial ───────────────────────────────
export const getHistorial = async (req, res, next) => {
  try {
    const historial = await prisma.$queryRaw`
      SELECT
        TO_CHAR(DATE_TRUNC('month', f.fecha_vencimiento), 'YYYY-MM') AS mes,
        COALESCE(SUM(pf.importe_asignado) FILTER (WHERE pf.pagado = TRUE),  0)::float AS pagado,
        COALESCE(SUM(pf.importe_asignado) FILTER (WHERE pf.pagado = FALSE), 0)::float AS pendiente
      FROM pagos_factura pf
      JOIN facturas f ON f.id = pf.factura_id
      WHERE pf.usuario_id = ${req.userId} AND f.grupo_id = ${req.grupoId}
      GROUP BY DATE_TRUNC('month', f.fecha_vencimiento)
      ORDER BY DATE_TRUNC('month', f.fecha_vencimiento) ASC
      LIMIT 12
    `;
    res.json({ historial });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/facturas ─────────────────────────────────────────
export const getFacturas = async (req, res, next) => {
  try {
    let facturas;

    if (req.miembro.rol === 'CASERO') {
      const data = await prisma.factura.findMany({
        where: { grupo_id: req.grupoId },
        select: {
          id: true, tipo: true, descripcion: true, importe_total: true, tipo_division: true,
          fecha_emision: true, fecha_vencimiento: true, url_documento: true, created_at: true,
          pagos: {
            select: {
              id: true, usuario_id: true, importe_asignado: true, pagado: true, fecha_pago: true,
              usuario: { select: { nombre: true, fotos: { where: { orden: 0 }, select: { url: true }, take: 1 } } },
            },
            orderBy: [{ pagado: 'asc' }, { usuario: { nombre: 'asc' } }],
          },
        },
        orderBy: { fecha_emision: 'desc' },
      });
      facturas = data.map(({ pagos, ...f }) => ({
        ...f,
        pagos: pagos.map(({ usuario: u, ...p }) => ({
          ...p, nombre_usuario: u.nombre, foto_usuario: u.fotos[0]?.url ?? null,
        })),
      }));
    } else {
      const data = await prisma.factura.findMany({
        where: { grupo_id: req.grupoId },
        select: {
          id: true, tipo: true, descripcion: true, importe_total: true, tipo_division: true,
          fecha_emision: true, fecha_vencimiento: true, url_documento: true, created_at: true,
          pagos: {
            where: { usuario_id: req.userId },
            select: { id: true, usuario_id: true, importe_asignado: true, pagado: true, fecha_pago: true },
          },
        },
        orderBy: { fecha_emision: 'desc' },
      });
      facturas = data;
    }

    res.json({ facturas });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/facturas ────────────────────────────────────────
export const crearFactura = async (req, res, next) => {
  const parsed = facturaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
  const d = parsed.data;

  try {
    const urlDocumento = req.file ? await subirDocumento(req.file.buffer) : null;

    const inquilinos = await prisma.miembroGrupo.findMany({
      where: { grupo_id: req.grupoId, activo: true, rol: { not: 'CASERO' } },
      select: { usuario_id: true },
    });
    if (!inquilinos.length) {
      return res.status(400).json({ message: 'No hay inquilinos en el grupo para dividir la factura' });
    }

    const facturaId = randomUUID();

    let pagosAInsertar;
    if (d.tipo_division === 'PERSONALIZADA') {
      const idsInquilinos = new Set(inquilinos.map(i => i.usuario_id));
      const idsRecibidos  = d.importes_personalizados.map(i => i.usuario_id);
      const invalidos     = idsRecibidos.filter(id => !idsInquilinos.has(id));
      if (invalidos.length) {
        return res.status(400).json({ message: 'Alguno de los importes personalizados no corresponde a un inquilino del grupo' });
      }
      if (new Set(idsRecibidos).size !== idsRecibidos.length) {
        return res.status(400).json({ message: 'No puede haber importes duplicados para el mismo inquilino' });
      }
      pagosAInsertar = d.importes_personalizados.map(({ usuario_id, importe }) => ({
        id: randomUUID(), factura_id: facturaId, usuario_id, importe_asignado: importe,
      }));
    } else {
      const importePorPersona = +(d.importe_total / inquilinos.length).toFixed(2);
      pagosAInsertar = inquilinos.map(({ usuario_id }) => ({
        id: randomUUID(), factura_id: facturaId, usuario_id, importe_asignado: importePorPersona,
      }));
    }

    const [factura] = await prisma.$transaction([
      prisma.factura.create({
        data: {
          id: facturaId, grupo_id: req.grupoId, casero_id: req.userId,
          tipo: d.tipo, descripcion: d.descripcion ?? null, importe_total: d.importe_total,
          tipo_division: d.tipo_division,
          fecha_emision: new Date(d.fecha_emision), fecha_vencimiento: new Date(d.fecha_vencimiento),
          url_documento: urlDocumento,
        },
        select: {
          id: true, tipo: true, descripcion: true, importe_total: true, tipo_division: true,
          fecha_emision: true, fecha_vencimiento: true, url_documento: true, created_at: true,
        },
      }),
      prisma.pagoFactura.createMany({
        data: pagosAInsertar,
      }),
    ]);

    const pagosData = await prisma.pagoFactura.findMany({
      where: { factura_id: facturaId },
      select: {
        id: true, usuario_id: true, importe_asignado: true, pagado: true, fecha_pago: true,
        usuario: { select: { nombre: true, fotos: { where: { orden: 0 }, select: { url: true }, take: 1 } } },
      },
    });
    const pagos = pagosData.map(({ usuario: u, ...p }) => ({
      ...p, nombre_usuario: u.nombre, foto_usuario: u.fotos[0]?.url ?? null,
    }));

    res.status(201).json({ factura: { ...factura, pagos } });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/facturas/:id ─────────────────────────────────────
export const editarFactura = async (req, res, next) => {
  const parsed = facturaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
  const d = parsed.data;

  try {
    const existing = await prisma.factura.findFirst({
      where: { id: req.params.id, grupo_id: req.grupoId },
      select: { importe_total: true, url_documento: true },
    });
    if (!existing) return res.status(404).json({ message: 'Factura no encontrada' });

    const urlDocumento    = req.file ? await subirDocumento(req.file.buffer) : existing.url_documento;
    const importeCambiado = Number(existing.importe_total) !== d.importe_total;

    if (d.tipo_division === 'PERSONALIZADA') {
      const pagosActuales = await prisma.pagoFactura.findMany({
        where: { factura_id: req.params.id },
        select: { usuario_id: true },
      });
      const idsActuales  = new Set(pagosActuales.map(p => p.usuario_id));
      const idsRecibidos = d.importes_personalizados.map(i => i.usuario_id);

      if (new Set(idsRecibidos).size !== idsRecibidos.length) {
        return res.status(400).json({ message: 'No puede haber importes duplicados para el mismo inquilino' });
      }
      if (idsRecibidos.length !== idsActuales.size || idsRecibidos.some(id => !idsActuales.has(id))) {
        return res.status(400).json({ message: 'Los importes personalizados deben cubrir exactamente a los inquilinos de la factura' });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.factura.update({
        where: { id: req.params.id },
        data: {
          tipo: d.tipo, descripcion: d.descripcion ?? null, importe_total: d.importe_total,
          tipo_division: d.tipo_division,
          fecha_emision: new Date(d.fecha_emision), fecha_vencimiento: new Date(d.fecha_vencimiento),
          url_documento: urlDocumento,
        },
      });

      if (d.tipo_division === 'PERSONALIZADA') {
        await Promise.all(d.importes_personalizados.map(({ usuario_id, importe }) =>
          tx.pagoFactura.updateMany({
            where: { factura_id: req.params.id, usuario_id },
            data: { importe_asignado: importe },
          })
        ));
      } else if (importeCambiado) {
        const numPagos = await tx.pagoFactura.count({ where: { factura_id: req.params.id } });
        if (numPagos > 0) {
          const importePorPersona = +(d.importe_total / numPagos).toFixed(2);
          await tx.pagoFactura.updateMany({
            where: { factura_id: req.params.id },
            data: { importe_asignado: importePorPersona },
          });
        }
      }
    });

    const [facturaFinal, pagosData] = await Promise.all([
      prisma.factura.findFirst({
        where: { id: req.params.id },
        select: {
          id: true, tipo: true, descripcion: true, importe_total: true, tipo_division: true,
          fecha_emision: true, fecha_vencimiento: true, url_documento: true, created_at: true,
        },
      }),
      prisma.pagoFactura.findMany({
        where: { factura_id: req.params.id },
        select: {
          id: true, usuario_id: true, importe_asignado: true, pagado: true, fecha_pago: true,
          usuario: { select: { nombre: true, fotos: { where: { orden: 0 }, select: { url: true }, take: 1 } } },
        },
        orderBy: [{ pagado: 'asc' }, { usuario: { nombre: 'asc' } }],
      }),
    ]);

    const pagos = pagosData.map(({ usuario: u, ...p }) => ({
      ...p, nombre_usuario: u.nombre, foto_usuario: u.fotos[0]?.url ?? null,
    }));

    res.json({ factura: { ...facturaFinal, pagos } });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/facturas/:id/pagada ────────────────────────────
export const togglePagada = async (req, res, next) => {
  try {
    const pagosActuales = await prisma.pagoFactura.findMany({
      where: { factura: { id: req.params.id, grupo_id: req.grupoId } },
      select: { id: true, pagado: true },
    });
    if (!pagosActuales.length) return res.status(404).json({ message: 'Factura no encontrada' });

    const todosPagados = pagosActuales.every(p => p.pagado);
    const nuevoPagado  = !todosPagados;

    await prisma.pagoFactura.updateMany({
      where: { factura_id: req.params.id },
      data: { pagado: nuevoPagado, fecha_pago: nuevoPagado ? new Date() : null },
    });

    const pagos = await prisma.pagoFactura.findMany({
      where: { factura_id: req.params.id },
      select: { id: true, usuario_id: true, importe_asignado: true, pagado: true, fecha_pago: true },
    });

    res.json({ pagos });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/facturas/:id ──────────────────────────────────
export const eliminarFactura = async (req, res, next) => {
  try {
    const existente = await prisma.factura.findFirst({
      where: { id: req.params.id, grupo_id: req.grupoId },
      select: { id: true },
    });
    if (!existente) return res.status(404).json({ message: 'Factura no encontrada' });

    const tienePagoConfirmado = await prisma.pagoFactura.findFirst({
      where: { factura_id: req.params.id, pagado: true },
      select: { id: true },
    });
    if (tienePagoConfirmado) {
      return res.status(400).json({ message: 'No se puede eliminar una factura que ya tiene pagos confirmados' });
    }

    await prisma.factura.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/facturas/:id/pagos/:usuarioId ──────────────────
export const togglePagoUsuario = async (req, res, next) => {
  try {
    const existente = await prisma.pagoFactura.findFirst({
      where: {
        factura_id: req.params.id,
        usuario_id: req.params.usuarioId,
        factura: { grupo_id: req.grupoId },
      },
      select: { id: true, pagado: true },
    });
    if (!existente) return res.status(404).json({ message: 'Pago no encontrado' });

    const nuevoPagado = !existente.pagado;

    const pago = await prisma.pagoFactura.update({
      where: { id: existente.id },
      data: { pagado: nuevoPagado, fecha_pago: nuevoPagado ? new Date() : null },
      select: { id: true, usuario_id: true, importe_asignado: true, pagado: true, fecha_pago: true },
    });

    res.json({ pago });
  } catch (err) {
    next(err);
  }
};
