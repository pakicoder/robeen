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

