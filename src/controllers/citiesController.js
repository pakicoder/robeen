const express = require('express');
const pollutionService = require('../services/pollutionService');


const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await pollutionService.getCities(page, limit);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    if (result.total === 0) {
      return res.status(404).json({
        ...result,
        suggestion: 'Try checking the API documentation or contact support'
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Debug endpoint
router.get('/inspect-response', async (req, res) => {
  try {
    if (!pollutionService.token) {
      await pollutionService.authenticate();
    }

    const testCountry = 'PL';
    const response = await axios.get(`${pollutionService.baseUrl}/pollution`, {
      params: { country: testCountry, page: 1, limit: 1 },
      headers: { 'Authorization': `Bearer ${pollutionService.token}` }
    });

    res.json({
      status: 'success',
      country: testCountry,
      response: {
        status: response.status,
        headers: response.headers,
        data: response.data,
        fullStructure: inspectObject(response.data)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      response: error.response?.data
    });
  }
});

// Helper function to inspect objects
function inspectObject(obj, depth = 5) {
  const seen = new WeakSet();
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
      if (depth <= 0) return '[Object]';
      return inspectObject(value, depth - 1);
    }
    return value;
  }));
}

module.exports = router;