const express = require('express');
const cors = require('cors');
const pool = require('./src/db');

const app = express();
app.use(express.json());
app.use(cors());

const authRoutes = require('./auth');
app.use('/api/auth', authRoutes);

const paymentRoutes = require('./payments');
app.use('/api/payments', paymentRoutes);

app.get('/api/productos', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT id, n, c, p, i, t, bs FROM productos ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar productos:', error);
        res.status(500).json({ error: 'Error al obtener el inventario' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Lunnea corriendo en http://localhost:${PORT}`);
});