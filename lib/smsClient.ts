import axios from 'axios';

/**
 * MTN OCEP SMS Client
 * Handles SMS sending via MTN's REST API with proper authentication and validation
 */
class MTNSMSClient {
  constructor() {
    this.baseURL = process.env.MTN_BASE_URL || 'https://sms01.umsg.co.za';
    this.username = process.env.MTN_USERNAME;
    this.password = process.env.MTN_PASSWORD;
    
    if (!this.username || !this.password) {
      throw new Error('MTN credentials not configured. Set MTN_USERNAME and MTN_PASSWORD environment variables.');
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;

    // Setup axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Duplicate suppression cache (15 minutes)
    this.duplicateCache = new Map();
    this.DUPLICATE_TTL = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Validates phone number to E.164 format
   * @param {string} number - Phone number to validate
   * @returns {boolean} - Whether number is valid
   */
  validateE164(number) {
    // E.164: + followed by up to 15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(number);
  }

  /**
   * Normalizes phone numbers to E.164 format
   * @param {string|string[]} to - Phone number(s)
   * @returns {string|string[]} - Normalized number(s)
   */
  normalizeNumbers(to) {
    const normalize = (num) => {
      // Remove spaces and special characters
      let clean = num.replace(/[\s\-\(\)]/g, '');
      
      // Add + if missing and starts with country code
      if (!clean.startsWith('+') && clean.match(/^[1-9]/)) {
        clean = '+' + clean;
      }
      
      // South African numbers: convert 0xxx to +27xxx
      if (clean.startsWith('0') && clean.length === 10) {
        clean = '+27' + clean.substring(1);
      }
      
      return clean;
    };

    if (Array.isArray(to)) {
      return to.map(normalize);
    }
    return normalize(to);
  }

  /**
   * Checks for duplicate messages
   * @param {string|string[]} to - Destination number(s)
   * @param {string} message - Message text
   * @returns {boolean} - Whether this is a duplicate
   */
  isDuplicate(to, message) {
    const key = JSON.stringify({ to, message });
    const now = Date.now();
    
    // Clean expired entries
    for (const [cacheKey, timestamp] of this.duplicateCache.entries()) {
      if (now - timestamp > this.DUPLICATE_TTL) {
        this.duplicateCache.delete(cacheKey);
      }
    }
    
    if (this.duplicateCache.has(key)) {
      return true;
    }
    
    this.duplicateCache.set(key, now);
    return false;
  }

  /**
   * Maps MTN error codes to friendly messages
   * @param {number} errorCode - MTN error code
   * @returns {string} - User-friendly error message
   */
  mapErrorCode(errorCode) {
    const errorMap = {
      150: 'Invalid credentials',
      153: 'Insufficient credits',
      154: 'Invalid or banned phone number',
      155: 'Duplicate message within 15 minutes',
      162: 'Number is on Do Not Call list (WASPA DNC)',
      // Add more mappings as needed
    };
    
    return errorMap[errorCode] || `Unknown error (code: ${errorCode})`;
  }

  /**
   * Masks phone number for logging
   * @param {string} number - Phone number to mask
   * @returns {string} - Masked number (e.g., +2772####567)
   */
  maskPhoneNumber(number) {
    if (number.length <= 6) return number;
    const start = number.substring(0, 4);
    const end = number.substring(number.length - 3);
    const middle = '#'.repeat(number.length - 7);
    return start + middle + end;
  }

  /**
   * Sends SMS via MTN OCEP API
   * @param {Object} options - SMS options
   * @param {string|string[]} options.to - Destination number(s)
   * @param {string} options.message - Message text
   * @param {number} [options.ems=0] - Enable EMS for long messages (0 or 1)
   * @param {string} [options.userref] - Optional user reference
   * @returns {Promise<Object>} - Send result
   */
  async sendSMS({ to, message, ems = 0, userref }) {
    try {
      // Validate required fields
      if (!message || message.trim().length === 0) {
        throw new Error('Message cannot be empty');
      }

      if (!to) {
        throw new Error('Destination number(s) required');
      }

      // Normalize and validate numbers
      const normalizedTo = this.normalizeNumbers(to);
      const numbers = Array.isArray(normalizedTo) ? normalizedTo : [normalizedTo];
      
      // Validate all numbers
      const invalidNumbers = numbers.filter(num => !this.validateE164(num));
      if (invalidNumbers.length > 0) {
        throw new Error(`Invalid phone numbers: ${invalidNumbers.join(', ')}`);
      }

      // Check message length and EMS
      if (message.length > 160 && ems === 0) {
        console.warn(`Message length ${message.length} > 160 chars. Consider setting ems=1 for concatenated SMS.`);
      }

      // Check for duplicates
      if (this.isDuplicate(normalizedTo, message)) {
        throw new Error('Duplicate message detected within 15 minutes');
      }

      // Prepare request payload
      const payload = {
        to: Array.isArray(normalizedTo) && normalizedTo.length === 1 ? normalizedTo[0] : normalizedTo,
        message: message,
        ems: ems.toString()
      };

      if (userref) {
        payload.userref = userref;
      }

      // Log request (mask phone numbers)
      const maskedNumbers = numbers.map(num => this.maskPhoneNumber(num));
      console.log(`Sending SMS to ${maskedNumbers.join(', ')}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);

      // Send request to MTN API
      const response = await this.client.post('/send/sms/', payload);

      // Handle response
      if (response.status === 200 && response.data) {
        const results = Array.isArray(response.data) ? response.data : [response.data];
        const successful = [];
        const failed = [];

        for (const result of results) {
          if (result.Action === 'enqueued' && result.Result === 1) {
            successful.push({
              number: result.Number,
              key: result.Key,
              userref: result.userref
            });
          } else {
            const errorMsg = result.Error ? this.mapErrorCode(result.Error) : 'Unknown error';
            failed.push({
              number: result.Number,
              error: errorMsg,
              errorCode: result.Error
            });
          }
        }

        return {
          status: failed.length === 0 ? 'queued' : 'partial',
          successful,
          failed,
          totalSent: successful.length,
          totalFailed: failed.length
        };
      } else {
        throw new Error('Invalid response from MTN API');
      }

    } catch (error) {
      console.error('SMS send error:', error.message);
      
      if (error.response) {
        // HTTP error response
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          throw new Error('Authentication failed - check MTN credentials');
        }
        
        throw new Error(`MTN API error (${status}): ${data?.message || error.message}`);
      } else if (error.request) {
        // Network error
        throw new Error('Network error - unable to reach MTN API');
      } else {
        // Other error
        throw error;
      }
    }
  }
}

// Export singleton instance and class
const smsClient = new MTNSMSClient();

/**
 * Convenience function to send SMS
 * @param {Object} options - SMS options
 * @returns {Promise<Object>} - Send result
 */
async function sendSms(options) {
  return await smsClient.sendSMS(options);
}

export {
  MTNSMSClient,
  smsClient,
  sendSms
};