const express = require('express');
const router = express.Router();
const { sendCouponEmail } = require('../services/email');
const { getCode } = require('../services/coupon');

router.options('/', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }).sendStatus(200);
});

router.post('/', async (req, res) => {
  console.log('[SCRATCH] POST /api/scratch — body:', JSON.stringify(req.body));

  try {
    const { email, name, phone } = req.body;

    if (!email) {
      console.log('[SCRATCH] Missing email');
      return res.status(400).json({ error: 'Email is required' });
    }

    const code = getCode();
    const discount = process.env.COUPON_DISCOUNT || '10%';

    console.log(`[SCRATCH] Sending email to ${email}${name ? ' (' + name + ')' : ''} | Coupon: ${code}`);

    await sendCouponEmail({ to: email, name, phone, code, discount });

    console.log('[SCRATCH] Email sent successfully to ' + email);
    res.json({
      success: true,
      message: 'Coupon sent successfully',
      coupon: code
    });
  } catch (err) {
    console.error('[SCRATCH] Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
