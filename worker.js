export default {
    async fetch(request, env) {
        if (request.method === 'POST' && request.url.includes('/midtrans-token')) {
            try {
                const { order_id, amount, customer_details } = await request.json();

                if (!amount) {
                    return new Response(JSON.stringify({ error: "Amount tidak boleh kosong" }), { status: 400 });
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
                        'Authorization': `Basic ${btoa(env.MIDTRANS_SERVER_KEY + ":")}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(transactionDetails)
                });

                const result = await response.json();
                return new Response(JSON.stringify({ token: result.token }), { status: 200 });
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), { status: 500 });
            }
        }

        return new Response("Route tidak ditemukan", { status: 404 });
    }
};
