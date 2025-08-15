const axios = require('axios');

class TokenService {
  constructor(username, password, baseUrl) {
    this.username = username;
    this.password = password;
    this.baseUrl = baseUrl;
    this.token = null;
    this.expiresAt = null; // timestamp when token expires
  }

  async authenticate(country) {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        username: this.username,
        password: this.password
      }, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });

      this.token = response.data.token;
      this.refreshToken = response.data.refreshToken;
      this.expiresAt = Date.now() + (response.data.expiresIn * 1000) - 5000; // refresh 5 sec early

      console.log(`[${country}] Token received: ${this.token}`);
    } catch (err) {
      console.error(`[${country}] Failed to get token:`, err.message);
      this.token = null;
      this.expiresAt = null;
    }
  }

  isExpired() {
    return !this.token || Date.now() >= this.expiresAt;
  }
}

module.exports = TokenService;
