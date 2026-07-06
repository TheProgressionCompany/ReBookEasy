export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { yourName, bizName, yourPhone } = req.body;

  // Validate required fields
  if (!yourName || !bizName || !yourPhone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Build the SMS message
  const message = `Hello\n\nThis is ${yourName} from ${bizName}. It has been a while since your last visit.\n\nReady to rebook? Reply YES to rebook and STOP to opt out of rebooking reminders.`;

  // TextMagic API credentials from environment variables
  const username = process.env.TEXTMAGIC_USERNAME;
  const apiKey = process.env.TEXTMAGIC_API_KEY;

  if (!username || !apiKey) {
    return res.status(500).json({ error: 'SMS service not configured' });
  }

  try {
    const response = await fetch('https://rest.textmagic.com/api/v2/messages', {
      method: 'POST',
      headers: {
        'X-TM-Username': username,
        'X-TM-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: message,
        phones: yourPhone
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('TextMagic error:', data);
      return res.status(500).json({ error: 'Failed to send SMS. Please check your phone number and try again.' });
    }

    return res.status(200).json({ success: true, message: 'SMS sent successfully' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
