/**
 * Vercel Serverless Function untuk fetch data dari Google Sheets
 * 
 * Endpoint: /api/getSheet
 * Method: GET
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get environment variables with trim to remove whitespace
  const API_KEY = process.env.API_KEY ? process.env.API_KEY.trim() : '';
  const SHEET_ID = process.env.SHEET_ID ? process.env.SHEET_ID.trim() : '';

  if (!API_KEY || !SHEET_ID) {
    console.error('Missing env vars:', { 
      hasApiKey: !!process.env.API_KEY, 
      hasSheetId: !!process.env.SHEET_ID 
    });
    return res.status(500).json({
      error: 'Missing environment variables',
      message: 'Pastikan API_KEY dan SHEET_ID sudah di-set di environment variables Vercel',
      debug: {
        hasApiKey: !!process.env.API_KEY,
        hasSheetId: !!process.env.SHEET_ID
      }
    });
  }

  try {
    console.log(`[${new Date().toISOString()}] Fetching data dari Google Sheets...`);
    console.log(`[${new Date().toISOString()}] API_KEY length: ${API_KEY.length}, SHEET_ID length: ${SHEET_ID.length}`);

    const RANGE = "Sheet1!A:AY";
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    const response = await fetch(sheetUrl);
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error?.message || 'Google Sheets API Error');
    }

    if (!json.values || json.values.length === 0) {
      return res.status(200).json([]);
    }

    const rows = json.values;
    const header = rows[0];
    const data = rows.slice(1).map((r) => {
      let obj = {};
      header.forEach((h, i) => (obj[h] = r[i] || ""));
      return obj;
    });

    res.status(200).json(data);
    console.log(`[${new Date().toISOString()}] ✅ Berhasil fetch ${data.length} rows`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Error:`, err.message);
    return res.status(500).json({
      error: err.message,
      hint: 'Cek API_KEY dan SHEET_ID di environment variables Vercel'
    });
  }
}
