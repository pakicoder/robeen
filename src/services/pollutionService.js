const axios = require('axios');
const { 
  isValidCityName,
  isValidPollutionLevel,
  validateCity,
  sanitizeData,
  capitalizeFirstLetter
 } = require('../utils/validators.js');

class PollutionService {
  constructor() {
    this.baseUrl = 'https://be-recruitment-task.onrender.com';
    this.credentials = {
      username: process.env.POLLUTION_API_USER || 'testuser',
      password: process.env.POLLUTION_API_PASS || 'testpass'
    };
    this.token = null;
  }


  async authenticate() {
    try {
      console.log('Authenticating with API...');
      const response = await axios.post(`${this.baseUrl}/auth/login`, this.credentials);
      
      if (!response.data.token) {
        throw new Error('No token received');
      }
      
      this.token = response.data.token;
      console.log('Authentication successful');
      return true;
    } catch (error) {
      console.error('Authentication failed:', {
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data
      });
      throw error;
    }
  }

  async fetchData(country) {
    try {
      console.log(`Fetching data for ${country}...`);
      const response = await axios.get(`${this.baseUrl}/pollution`, {
        params: { country, page: 1, limit: 10 },
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      console.log(`Response for ${country}:`, {
        status: response.status,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : null
      });

      // Handle various response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Check for common response structures
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          return response.data.results;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          return response.data.items;
        }
      }

      throw new Error(`Unexpected response format for ${country}`);
    } catch (error) {
      console.error(`Error fetching ${country}:`, {
        message: error.message,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          params: error.config?.params
        }
      });
      throw error;
    }
  }

  /*
  async getCities() {
    try {
      if (!this.token) await this.authenticate();

      const countries = ['PL', 'DE', 'ES', 'FR'];
      const allCities = [];

      for (const country of countries) {
        try {
          const data = await this.fetchData(country);
          console.log("... data ...",data);
          if (data && data.length > 0) {
            allCities.push(...data.map(item => ({
              name: item.city || item.name || 'Unknown',
              country: item.country || country,
              pollution: item.pollutionLevel || item.pollution || 0
            })));
          }
        } catch (error) {
          console.error(`Skipping ${country} due to error:`, error.message);
          continue;
        }
      }

      return {
        success: true,
        total: allCities.length,
        cities: allCities,
        ...(allCities.length === 0 && { 
          warning: 'API returned no valid city data',
          debug: 'The API responded with unexpected format'
        })
      };
    } catch (error) {
      console.error('Failed to get cities:', error);
      return {
        success: false,
        error: 'Failed to fetch city data',
        debug: {
          message: error.message,
          ...(error.response && { responseStatus: error.response.status })
        }
      };
    }
  }
  */
  async getCities() {
    try {
      if (!this.token) await this.authenticate();

      const countries = ['PL', 'DE', 'ES', 'FR'];
      const allCities = [];
      /*
      for (const country of countries) {
        try {
          const data = await this.fetchData(country);
          console.log("... data ...",data);
          if (data && data.length > 0) {
            allCities.push(...data.map(item => ({
              name: item.city || item.name || 'Unknown',
              country: item.country || country,
              pollution: item.pollutionLevel || item.pollution || 0
            })));
          }
        } catch (error) {
          console.error(`Skipping ${country} due to error:`, error.message);
          continue;
        }
      }
      */
      for (const country of countries) {
          try {
            const data = await this.fetchData(country);
            console.log("... data ...", data);

            if (data && data.length > 0) {
              // Map raw data first
              let mapped = data.map(item => ({
                name: item.city || item.name,
                country: item.country || country,
                pollution: item.pollutionLevel || item.pollution || 0
              }));

              // Sanitize and filter out invalid/unknown cities
              mapped = sanitizeData(mapped)
                .filter(city => city.name && validateCity(city)); 

              console.log(".. mapped ...", mapped);
              // Only push valid cities
              if (mapped.length > 0) {
                allCities.push(...mapped);
              }
            }
          } catch (error) {
            console.error(`Skipping ${country} due to error:`, error.message);
            continue;
          }
      }



      return {
        success: true,
        total: allCities.length,
        cities: allCities,
        ...(allCities.length === 0 && { 
          warning: 'API returned no valid city data',
          debug: 'The API responded with unexpected format'
        })
      };
    } catch (error) {
      console.error('Failed to get cities:', error);
      return {
        success: false,
        error: 'Failed to fetch city data',
        debug: {
          message: error.message,
          ...(error.response && { responseStatus: error.response.status })
        }
      };
    }
  }


}

module.exports = new PollutionService();

