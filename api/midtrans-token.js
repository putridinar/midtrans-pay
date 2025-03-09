export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { order_id, amount, customer_details } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "Amount tidak boleh kosong" });
        }

        const transactionDetails = {
            transaction_details: {
                order_id: order_id || `ORDER-${Math.floor(Math.random() * 1000000)}`,
                gross_amount: amount
            },
            customer_details: customer_details
        };

        const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString('base64')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionDetails)
        });

        const result = await response.json();
        return res.status(200).json({ token: result.token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}