/**
 * Debug endpoint untuk cek environment variables di Vercel
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const API_KEY = process.env.API_KEY || 'NOT_SET';
  const SHEET_ID = process.env.SHEET_ID || 'NOT_SET';

  // Jangan expose full key, tapi tampilkan cukup untuk debug
  const apiKeyPreview = API_KEY === 'NOT_SET' ? 'NOT_SET' : `${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 5)}`;

  return res.status(200).json({
    message: 'Debug Info',
    environment: {
      API_KEY: apiKeyPreview,
      SHEET_ID: SHEET_ID,
      API_KEY_length: API_KEY.length,
      SHEET_ID_length: SHEET_ID.length,
      API_KEY_raw_exists: !!process.env.API_KEY,
      SHEET_ID_raw_exists: !!process.env.SHEET_ID,
    },
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
};
