const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL

module.exports = (duration) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.json(cachedResponse);
      return;
    }

    // Store the original json method
    const originalJson = res.json;
    
    // Override json method
    res.json = function(body) {
      // Restore original json method
      res.json = originalJson;
      
      // Cache the response
      cache.set(key, body, duration || 300);
      
      // Send the response
      return res.json(body);
    };

    next();
  };
};