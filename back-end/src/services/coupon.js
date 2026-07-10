function getCode() {
  return process.env.COUPON || 'SCRATCH-10OFF';
}

function generateEmailContent({ name, code, discount }) {
  const discountText = discount || '10%';
  return {
    subject: `Seu cupom de desconto chegou!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px">
        <div style="text-align:center;padding:32px 0 24px">
          <h1 style="font-size:28px;margin:0;color:#111">Voc\u00ea ganhou um desconto!</h1>
        </div>
        <div style="background:#fff;border-radius:12px;padding:32px;text-align:center">
          <p style="font-size:16px;color:#333;margin:0 0 8px">Ol\u00e1${name ? ' ' + name : ''},</p>
          <p style="font-size:14px;color:#666;margin:0 0 24px">Use o cupom abaixo na sua pr\u00f3xima compra:</p>
          <div style="background:#111;border-radius:8px;padding:16px 32px;display:inline-block;margin:0 0 24px">
            <span style="font-size:32px;font-weight:700;color:#fff;letter-spacing:4px;font-family:monospace">${code}</span>
          </div>
          <p style="font-size:14px;color:#888;margin:0">Desconto: <strong>${discountText}</strong></p>
          <p style="font-size:13px;color:#aaa;margin:16px 0 0">Este cupom expira em ${process.env.COUPON_EXPIRY_DAYS || '30'} dias.</p>
        </div>
        <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#999">
          <p style="margin:0">Obrigado por participar!</p>
        </div>
      </div>
    `
  };
}

module.exports = { getCode, generateEmailContent };
