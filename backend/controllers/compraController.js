import { randomUUID } from 'crypto';
import { prisma } from '../src/config/db.js';
import { anadirSchema, editarSchema } from '../validators/compraValidator.js';

// ── GET /api/compra ───────────────────────────────────────────
export const getProductos = async (req, res, next) => {
  try {
    const data = await prisma.producto.findMany({
      where: { grupo_id: req.grupoId },
      select: {
        id: true, nombre: true,
        categoria: true, comprado: true, created_at: true,
        anadido_por:  { select: { nombre: true } },
        comprado_por: { select: { nombre: true } },
      },
      orderBy: [{ comprado: 'asc' }, { created_at: 'desc' }],
    });

    const productos = data.map(({ anadido_por: ap, comprado_por: cp, ...p }) => ({
      ...p,
      anadido_por:  ap.nombre,
      comprado_por: cp?.nombre ?? null,
    }));

    res.json({ productos });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/compra ──────────────────────────────────────────
export const anadirProducto = async (req, res, next) => {
  const parsed = anadirSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

  const { nombre, categoria = 'otros' } = parsed.data;

  try {
    const data = await prisma.producto.create({
      data: {
        id: randomUUID(), grupo_id: req.grupoId, anadido_por_id: req.userId,
        nombre, categoria,
      },
      select: {
        id: true, nombre: true,
        categoria: true, comprado: true, created_at: true,
        anadido_por: { select: { nombre: true } },
      },
    });

    const { anadido_por: ap, ...producto } = data;
    res.status(201).json({ producto: { ...producto, anadido_por: ap.nombre, comprado_por: null } });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/compra/:id/comprado ────────────────────────────
export const toggleComprado = async (req, res, next) => {
  try {
    const existente = await prisma.producto.findFirst({
      where: { id: req.params.id, grupo_id: req.grupoId },
      select: { comprado: true },
    });
    if (!existente) return res.status(404).json({ message: 'Producto no encontrado' });

    const nuevoEstado = !existente.comprado;

    const data = await prisma.producto.update({
      where: { id: req.params.id },
      data: {
        comprado:        nuevoEstado,
        comprado_por_id: nuevoEstado ? req.userId : null,
        fecha_compra:    nuevoEstado ? new Date() : null,
      },
      select: {
        id: true, nombre: true,
        comprado: true, created_at: true,
        anadido_por:  { select: { nombre: true } },
        comprado_por: { select: { nombre: true } },
      },
    });

    const { anadido_por: ap, comprado_por: cp, ...producto } = data;
    res.json({ producto: { ...producto, anadido_por: ap.nombre, comprado_por: cp?.nombre ?? null } });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/compra/:id ───────────────────────────────────────
export const editarProducto = async (req, res, next) => {
  const parsed = editarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

  try {
    const existente = await prisma.producto.findFirst({
      where: { id: req.params.id, grupo_id: req.grupoId },
      select: { id: true },
    });
    if (!existente) return res.status(404).json({ message: 'Producto no encontrado' });

    const { nombre, categoria } = parsed.data;
    const updateData = {};
    if (nombre !== undefined)    updateData.nombre = nombre;
    if (categoria !== undefined) updateData.categoria = categoria;

    if (!Object.keys(updateData).length) {
      return res.status(400).json({ message: 'Nada que actualizar' });
    }

    const data = await prisma.producto.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true, nombre: true,
        categoria: true, comprado: true, created_at: true,
        anadido_por:  { select: { nombre: true } },
        comprado_por: { select: { nombre: true } },
      },
    });

    const { anadido_por: ap, comprado_por: cp, ...producto } = data;
    res.json({ producto: { ...producto, anadido_por: ap.nombre, comprado_por: cp?.nombre ?? null } });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/compra/:id ────────────────────────────────────
export const eliminarProducto = async (req, res, next) => {
  try {
    const deleted = await prisma.producto.deleteMany({
      where: { id: req.params.id, grupo_id: req.grupoId },
    });
    if (deleted.count === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
