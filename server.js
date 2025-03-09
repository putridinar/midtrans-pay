require('dotenv').config();
const express = require('express');
const midtransClient = require('midtrans-client');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

// Endpoint untuk mendapatkan token transaksi Midtrans
app.post('/api/midtrans-token', async (req, res) => {
    try {
        const { order_id, amount, customer_details } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "Amount tidak boleh kosong" });
        }

        let transactionDetails = {
            transaction_details: {
                order_id: order_id || `ORDER-${Math.floor(Math.random() * 1000000)}`,
                gross_amount: amount
            },
            customer_details: customer_details
        };

        let transaction = await snap.createTransaction(transactionDetails);
        console.log('Token Midtrans:', transaction.token);

        res.json({ token: transaction.token });
    } catch (error) {
        console.error('Error Midtrans:', error);
        res.status(500).json({ error: error.message });
    }
});

// Menjalankan server hanya jika di lingkungan lokal
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app; // Diperlukan