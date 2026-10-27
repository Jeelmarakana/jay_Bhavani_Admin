/**
 * WhatsApp Notification Service for Jay Bhavani Ornaments
 * Supports:
 * 1. Direct wa.me link generation (100% free, no setup required)
 * 2. CallMeBot API (free automated WhatsApp notifications to admin phone)
 * 3. Twilio WhatsApp API (for business/production)
 * 4. Custom Webhook (UltraMsg / GreenAPI / Zapier / Make)
 */

export function buildInquiryWhatsAppMessage(inquiry, clientOrigin = 'http://localhost:4200') {
  const adminUrl = `${clientOrigin}/admin/inquiries/${inquiry._id || inquiry.id || ''}`;
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  return `🔔 *નવી ઇન્કવાયરી - Jay Bhavani Ornaments*
━━━━━━━━━━━━━━━━━━━━
👤 *નામ:* ${inquiry.clientName}
📞 *ફોન:* ${inquiry.phone}
${inquiry.email ? `✉️ *ઇમેઇલ:* ${inquiry.email}\n` : ''}💍 *પ્રોડક્ટ:* ${inquiry.productName}
💬 *વિગત:* ${inquiry.message}
🖼️ *ફોટો:* ${inquiry.referenceImageName ? 'હા (Upload થયેલ છે)' : 'નથી'}
⏰ *સમય:* ${now}
━━━━━━━━━━━━━━━━━━━━
🔗 *Admin Panel:* ${adminUrl}`;
}

export function getDirectWhatsAppUrl(phone, text) {
  if (!phone) return '';
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export async function sendWhatsAppNotification(inquiry, clientOrigin = 'http://localhost:4200') {
  const adminPhone = process.env.ADMIN_WHATSAPP_PHONE || '';
  const message = buildInquiryWhatsAppMessage(inquiry, clientOrigin);

  const result = {
    message,
    directUrl: adminPhone ? getDirectWhatsAppUrl(adminPhone, message) : '',
    sentViaApi: false,
    provider: 'none',
    error: null
  };

  if (!adminPhone) {
    console.log('[WhatsApp Notification] ADMIN_WHATSAPP_PHONE is not configured in .env.');
    return result;
  }

  // Provider 1: CallMeBot (Free, widely used personal WhatsApp notification bot)
  const callmebotApiKey = process.env.CALLMEBOT_API_KEY;
  if (callmebotApiKey) {
    try {
      const cleanPhone = adminPhone.replace(/\D/g, '');
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(callmebotApiKey)}`;
      const response = await fetch(url);
      if (response.ok) {
        console.log(`[WhatsApp Notification] CallMeBot notification sent successfully to ${cleanPhone}`);
        result.sentViaApi = true;
        result.provider = 'callmebot';
        return result;
      }
      const errText = await response.text();
      console.warn(`[WhatsApp Notification] CallMeBot error:`, errText);
      result.error = errText;
    } catch (err) {
      console.error('[WhatsApp Notification] CallMeBot fetch failed:', err.message);
      result.error = err.message;
    }
  }

  // Provider 2: Twilio WhatsApp
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const formattedTo = adminPhone.startsWith('+') ? `whatsapp:${adminPhone}` : `whatsapp:+${adminPhone.replace(/\D/g, '')}`;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const body = new URLSearchParams({
        From: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
        To: formattedTo,
        Body: message
      });
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });
      if (response.ok) {
        console.log(`[WhatsApp Notification] Twilio WhatsApp message sent to ${formattedTo}`);
        result.sentViaApi = true;
        result.provider = 'twilio';
        return result;
      }
      const errJson = await response.json();
      console.warn('[WhatsApp Notification] Twilio error:', errJson);
      result.error = JSON.stringify(errJson);
    } catch (err) {
      console.error('[WhatsApp Notification] Twilio failed:', err.message);
      result.error = err.message;
    }
  }

  // Provider 3: Custom Webhook
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPhone,
          message,
          inquiry
        })
      });
      if (response.ok) {
        console.log(`[WhatsApp Notification] Custom Webhook triggered successfully`);
        result.sentViaApi = true;
        result.provider = 'webhook';
        return result;
      }
    } catch (err) {
      console.error('[WhatsApp Notification] Webhook failed:', err.message);
      result.error = err.message;
    }
  }

  return result;
}
