export default function handler(req, res) {
  // Set all the required headers
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Return test data
  res.status(200).json({
    message: 'Headers test successful',
    headers: {
      'X-Frame-Options': res.getHeader('X-Frame-Options'),
      'Content-Security-Policy': res.getHeader('Content-Security-Policy'),
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin')
    },
    timestamp: new Date().toISOString()
  });
} 