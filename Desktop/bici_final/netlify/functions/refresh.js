exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { refresh_token } = body;
  if (!refresh_token) {
    return { statusCode: 400, body: JSON.stringify({ error: 'refresh_token requerido' }) };
  }

  if (!process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Variables de entorno STRAVA_CLIENT_ID y STRAVA_CLIENT_SECRET no configuradas' }) };
  }

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
