const axios = require('axios');

async function sendWhatsappText(toPhone, templateText) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';

  const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: toPhone,
    type: 'text',
    text: { preview_url: false, body: templateText }
  };

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return res.data;
}

module.exports = { sendWhatsappText };
