const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./src/db'); 
const router = express.Router();

// Usuario Nuevo
router.post('/register', async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;
        if (!nombre || !correo || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        const userExists = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        // Encriptado
        const saltRounds = 10;
        const passwordhash = await bcrypt.hash(password, saltRounds);

        const nuevoUsuario = await pool.query(
            `INSERT INTO usuarios (nombre, correo, password_hash, creado_en) 
             VALUES ($1, $2, $3, NOW()) RETURNING id, nombre, correo, creado_en`,
            [nombre, correo, passwordhash]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado con éxito',
            usuario: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error en el servidor al registrar el usuario' });
    }
});

// Iniciar Sesión
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const userFound = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (userFound.rows.length === 0) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
        }

        const usuario = userFound.rows[0];

        // Ojo aquí: revisa si en tu BD la columna se llama password_hash o passwordhash
        const passwordValid = await bcrypt.compare(password, usuario.password_hash); 
        if (!passwordValid) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
        }

        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            user: {
                id: usuario.id,
                name: usuario.nombre,
                email: usuario.correo
            },
            token: 'real-token-jwt'
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
    }
});
module.exports = router;