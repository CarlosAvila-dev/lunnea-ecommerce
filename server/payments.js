const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference } = require('mercadopago');
const pool = require('./src/db'); 

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});

router.post('/create-preference', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        const itemsForMP = items.map(item => ({
            title: item.nombre || item.n || 'Vela artesanal Lunnea',
            quantity: Number(item.cantidad || 1),
            unit_price: Number(item.precio || item.p || 100),
            currency_id: 'MXN'
        }));

        const preference = new Preference(client);
        
        // back urls
        const resultado = await preference.create({
            body: {
                items: itemsForMP,
                back_urls: {
                    success: 'https://carlosavila-dev.github.io/lunnea-ecommerce/success.html',
                    failure: 'https://carlosavila-dev.github.io/lunnea-ecommerce/failure.html',
                    pending: 'https://carlosavila-dev.github.io/lunnea-ecommerce/pending.html'
                },
                auto_return: 'approved'
            }
        });

        try {
            const total = items.reduce((acc, i) => acc + (Number(i.precio || i.p) * Number(i.q || i.cantidad || 1)), 0);

            const queryText = `
                INSERT INTO ordenes (preference_id, total, status, items, fecha) 
                VALUES ($1, $2, $3, $4, NOW()) 
                RETURNING *;
            `;
            
            await pool.query(queryText, [
                resultado.id, 
                total, 
                'pendiente', 
                JSON.stringify(items)
            ]);
            console.log("✅ Orden registrada en PostgreSQL con éxito.");
        } catch (dbError) {
            console.error("⚠️ Nota de base de datos:", dbError.message);
        }
        
        res.status(200).json({
            preferenceId: resultado.id,
            initPoint: resultado.sandbox_init_point || resultado.init_point
        });

    } catch (error) {
        console.error('❌ Error al crear la preferencia en Mercado Pago:', error);
        res.status(500).json({ error: 'Error al conectar con la pasarela de pagos' });
    }
});

module.exports = router;