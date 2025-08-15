const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

const WIKI_API_URL = 'https://en.wikipedia.org/w/api.php';

class WikipediaService {
  constructor() {
    this.maxRetries = 3;
    this.timeout = 5000;
  }

  sanitizeKey(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }

  async getCityDescription(cityName, country) {
    if (!cityName || typeof cityName !== 'string') {
      return 'No description available';
    }

    const cacheKey = `${this.sanitizeKey(cityName)}-${this.sanitizeKey(country)}`.toLowerCase();
    
    // Check cache first
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    // Try different title formats
    const titleVariations = [
      `${cityName}, ${country}`,
      cityName,
      `${cityName} (${country})`,
      this.simplifyName(cityName),
      encodeURIComponent(`${cityName}, ${country}`)
    ];

    let description = 'No description available';

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const currentTitle = titleVariations[attempt % titleVariations.length];
      
      try {
        const response = await axios.get(WIKI_API_URL, {
          params: {
            action: 'query',
            format: 'json',
            prop: 'extracts',
            exintro: true,
            explaintext: true,
            titles: currentTitle,
            redirects: 1
          },
          timeout: this.timeout
        });

        const pages = response.data.query.pages;
        const pageId = Object.keys(pages)[0];

        // Check if page exists and has content
        if (pageId !== '-1' && pages[pageId]?.extract) {
          description = this.cleanDescription(pages[pageId].extract);
          break; // Exit loop if successful
        }
      } catch (error) {
        console.warn(`Wikipedia API attempt ${attempt + 1} failed for ${cityName}:`, error.message);
        // Continue to next attempt
      }
    }

    // Cache the result (including negative results)
    cache.set(cacheKey, description);
    return description;
  }

  cleanDescription(text) {
    if (!text || typeof text !== 'string') return 'No description available';
    
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\([^)]*\)/g, '') // Remove content in parentheses
      .substring(0, 100) // Trim to 100 chars
      .replace(/\s+\S*$/, '...') // Don't cut mid-word
      .trim();
  }

  simplifyName(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/\s*\(.*?\)\s*/g, '') // Remove parenthetical content
      .replace(/\b(the|a|an|of|in|at)\b/gi, '') // Remove common words
      .replace(/,.*/, '') // Remove after comma
      .trim();
  }
}

module.exports = new WikipediaService();