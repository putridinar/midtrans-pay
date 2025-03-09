require('dotenv').config();
const express = require('express');
const midtransClient = require('midtrans-client');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
    isProduction: false, // Ganti ke true jika sudah live
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

// Endpoint untuk mendapatkan token transaksi Midtrans
app.post('/midtrans-token', async (req, res) => {
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


// Endpoint untuk menangani notifikasi pembayaran dari Midtrans
app.post('/midtrans-notification', async (req, res) => {
    try {
        const notification = req.body;

        const apiClient = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY
        });

        let statusResponse = await apiClient.transaction.notification(notification);
        let orderId = statusResponse.order_id;
        let transactionStatus = statusResponse.transaction_status;
        let fraudStatus = statusResponse.fraud_status;

        console.log(`Order ID: ${orderId}`);
        console.log(`Transaction Status: ${transactionStatus}`);
        console.log(`Fraud Status: ${fraudStatus}`);

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'accept') {
                console.log('Pembayaran berhasil.');
            }
        } else if (transactionStatus === 'settlement') {
            console.log('Pembayaran sudah selesai.');
        } else if (transactionStatus === 'pending') {
            console.log('Menunggu pembayaran.');
        } else if (transactionStatus === 'deny') {
            console.log('Pembayaran ditolak.');
        } else if (transactionStatus === 'expire') {
            console.log('Pembayaran kadaluarsa.');
        } else if (transactionStatus === 'cancel') {
            console.log('Pembayaran dibatalkan.');
        }

        res.status(200).json({ message: 'Notifikasi diterima' });
    } catch (error) {
        console.error('Error pada notifikasi:', error);
        res.status(500).json({ error: error.message });
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
