const express = require('express');
const router = express.Router();
const { sendCouponEmail } = require('../services/email');
const { getCode } = require('../services/coupon');

router.post('/', async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const code = getCode();
    const discount = process.env.COUPON_DISCOUNT || '10%';

    console.log(`[SCRATCH] New submission — ${email}${name ? ' (' + name + ')' : ''} | Coupon: ${code}`);

    await sendCouponEmail({ to: email, name, phone, code, discount });

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
