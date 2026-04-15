import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use((req, res, next) => {
  if(req.originalUrl === '/webhook') {
    next();
  } else {
    express.json({ limit: '50mb' })(req, res, next);
  }
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/api/analyze', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/create-checkout', async (req, res) => {
  try {
    const { userId, email, plan } = req.body;
    const priceId = process.env.STRIPE_PRICE_ID;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `https://getyourrizz.app/?payment=success`,
      cancel_url: `https://getyourrizz.app/?payment=cancelled`,
      metadata: { userId }
    });
    res.json({ url: session.url });
  } catch(e) {
    console.error('Stripe error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch(e) {
    console.error('Webhook error:', e.message);
    return res.status(400).json({error: e.message});
  }
  if(event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    console.log('Payment completed for userId:', userId);
    if(userId) {
      const { createClient } = await import('@supabase/supabase-js');
      const supaAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const { error } = await supaAdmin.from('profiles').update({is_premium: true}).eq('user_id', userId);
      console.log('Premium update:', error || 'success');
    }
  }
  res.json({received: true});
});

app.post('/api/delete-account', async (req, res) => {
  try {
    const { userId } = req.body;
    const { createClient } = await import('@supabase/supabase-js');
    const supaAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    await supaAdmin.auth.admin.deleteUser(userId);
    res.json({ success: true });
  } catch(e) {
    console.error('Delete account error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => console.log(`API server running on port ${PORT}`));
server.timeout = 60000;