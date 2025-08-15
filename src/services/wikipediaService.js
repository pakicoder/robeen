const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

class WikipediaService {
  constructor() {
    this.baseUrl = 'https://en.wikipedia.org/w/api.php';
  }

  async getCityDescription(cityName, country) {
    const cacheKey = `${cityName}-${country}`.toLowerCase();
    const cachedDescription = cache.get(cacheKey);
    
    if (cachedDescription) {
      return cachedDescription;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          action: 'query',
          format: 'json',
          prop: 'extracts',
          exintro: true,
          explaintext: true,
          titles: `${cityName}, ${country}`,
          redirects: 1
        }
      });

      const pages = response.data.query.pages;
      const pageId = Object.keys(pages)[0];
      let description = pages[pageId]?.extract || 'No description available';

      // Trim long descriptions
      if (description.length > 300) {
        description = description.substring(0, 300) + '...';
      }

      cache.set(cacheKey, description);
      return description;
    } catch (error) {
      console.error(`Error fetching Wikipedia description for ${cityName}:`, error);
      return 'Description not available';
    }
  }
}

module.exports = new WikipediaService();