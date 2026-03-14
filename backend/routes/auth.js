import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
};

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

//Registro de usuario
router.post('/registro', async (req, res) => {
    const { username, email, password } = req.body;

    const usuarioExistente = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);

    if (usuarioExistente.rows.length > 0) {
        return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword]
    );

    const token = generateAccessToken(nuevoUsuario.rows[0].id);
    res.cookie('token', token, cookieOptions);
    res.status(201).json({ user: { user: nuevoUsuario.rows[0] } });
});

//Login de usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const usuario = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (usuario.rows.length === 0) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const userData = usuario.rows[0];
    const usuarioEncontrado = await bcrypt.compare(password, userData.password);

    if (!usuarioEncontrado) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const token = generateAccessToken(userData.id);
    res.cookie('token', token, cookieOptions);
    res.status(200).json({ user: { user: userData } });
});

//Logout de usuario
router.post('/logout', (req, res) => {
    res.cookie('token', '', { ...cookieOptions, maxAge: 1 });
    res.status(200).json({ message: 'Usuario desconectado' });
});

export default router;