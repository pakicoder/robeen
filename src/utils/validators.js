/*
function isValidCityName(name) {
  if (!name || typeof name !== 'string') return false;
  
  // Remove special characters and normalize
  const cleanName = name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-zA-Z\s-]/g, "") // Keep only letters, spaces, and hyphens
    .trim();
  
  // Common invalid patterns
  const invalidPatterns = [
    /\bunknown\b\s+\w+/i,
    /unknown/i,        // Matches "Unknown", "UNKNOWN", etc.
    /unkn/i,           // Catches partial matches like "unknOwn"
    /^unknown$/i,      // Exact match
    /unknown\s+\w+/i,  // "Unknown" followed by words
    /\w+\s+unknown/i,  // Words before "unknown"
    /^un\s*kn/i,       // Variants like "Un knOwn"
    /un.?kn/i,         // Matches "un-kn", "un_kn", etc.
    /\(unknown\)/i,    // "(Unknown)" in parentheses
    /station/i,
    /monitoring/i,
    /powerplant/i,
    /district/i,
    /area/i,
    /zone/i,
    /point/i,
    /\d/, // Contains numbers
    /\(.*\)/, // Parentheses
    /[^a-zA-Z]$/, // Ends with non-letter
    /^[^a-zA-Z]/, // Starts with non-letter
    /\s{2,}/ // Multiple spaces
  ];
  
  // Minimum requirements
  const minLength = 2;
  const maxLength = 50;
  const hasLetters = /[a-zA-Z]/.test(cleanName);
  
  return cleanName.length >= minLength &&
         cleanName.length <= maxLength &&
         hasLetters &&
         !invalidPatterns.some(pattern => pattern.test(cleanName));
}

function isValidPollutionLevel(level) {
  return typeof level === 'number' && 
         level >= 0 && 
         level <= 1000;
}

function validateCity(city) {
  return city && 
         isValidCityName(city.name || city.city) &&
         isValidPollutionLevel(city.pollution || city.pollutionLevel);
}


// validators.js
function sanitizeData(data) {
    if (Array.isArray(data)) {
        return data.map(item => {
            return {
                ...item,
                city: item.city === "UNKNOWN" ? "Not Available" : item.city,
                station: item.station === "UNKNOWN" ? "Not Available" : item.station,
                // you can add more field replacements here
            };
        });
    }
    return data;
}


module.exports = {
  isValidCityName,
  isValidPollutionLevel,
  validateCity,
  sanitizeData
};
*/


///
// validators.js

function capitalizeFirstLetter(str) {
  if (!str || typeof str !== 'string') return str;
  const clean = str.trim().toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function isValidCityName(name) {
  if (!name || typeof name !== 'string') return false;

  const cleanName = name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const invalidPatterns = [
    /\bunknown\b/i,
    /station/i,
    /monitoring/i,
    /powerplant/i,
    /district/i,
    /area/i,
    /zone/i,
    /point/i,
    /\d/,
    /\(.*\)/,
    /[^a-zA-Z\s-]$/,
    /^[^a-zA-Z]/,
    /\s{2,}/
  ];

  const hasLetters = /[a-zA-Z]/.test(cleanName);
  return cleanName.length >= 2 &&
         cleanName.length <= 50 &&
         hasLetters &&
         !invalidPatterns.some(pattern => pattern.test(cleanName));
}

function isValidPollutionLevel(level) {
  return typeof level === 'number' && level >= 0 && level <= 1000;
}

function validateCity(city) {
  return city &&
         isValidCityName(city.name || city.city) &&
         isValidPollutionLevel(city.pollution || city.pollutionLevel);
}

/*
// Sanitize data: replace UNKNOWN and capitalize first letter
function sanitizeData(data) {
  if (!Array.isArray(data)) return data;

  return data.map(item => {
    const normalizedName = (item.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const sanitizedName = /\bunknown\b/i.test(normalizedName) ? "Not available" : item.name;

    return {
      ...item,
      name: capitalizeFirstLetter(sanitizedName),
      country: item.country ? capitalizeFirstLetter(item.country) : item.country
    };
  });
}
*/
function sanitizeData(data) {
  if (!Array.isArray(data)) return data;

  return data
    .filter(item => {
      if (!item.name) return false;
      const nameClean = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return !nameClean.includes("unknown"); // remove cities with 'unknown' in name
    })
    .map(item => {
      let name = item.name.toLowerCase() || "";
      let country = item.country || "";

      // Normalize, remove diacritics
      name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      country = country.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // Remove parentheses content like (Zone), (Area), (District), (Station)
      name = name.replace(/\s*\(.*?\)/g, "").trim();

      // Lowercase and capitalize first letter
      name = name.toLowerCase();
      name = name.charAt(0).toUpperCase() + name.slice(1);

      country = country.toLowerCase();
      country = country.charAt(0).toUpperCase() + country.slice(1);
      return {
        ...item,
        name,
        country
      };
    });
}


module.exports = {
  isValidCityName,
  isValidPollutionLevel,
  validateCity,
  sanitizeData,
  capitalizeFirstLetter
};

