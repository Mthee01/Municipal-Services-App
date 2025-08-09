import express from 'express';
import { sendSms } from '../lib/smsClient';
const router = express.Router();

/**
 * Send SMS endpoint
 * POST /sms/send
 * 
 * Body: {
 *   to: string | string[],     // Destination number(s) in E.164 format
 *   message: string,           // Message text
 *   ems?: 0|1,                // Enable EMS for long messages (optional, default: 0)
 *   userref?: string          // User reference (optional)
 * }
 */
router.post('/send', async (req, res) => {
  try {
    const { to, message, ems = 0, userref } = req.body;

    // Basic validation
    if (!to) {
      return res.status(400).json({
        status: 'failed',
        error: 'Missing required field: to'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        status: 'failed',
        error: 'Message is required and must be a non-empty string'
      });
    }

    // Validate ems parameter
    if (ems !== undefined && ems !== 0 && ems !== 1 && ems !== '0' && ems !== '1') {
      return res.status(400).json({
        status: 'failed',
        error: 'ems must be 0 or 1'
      });
    }

    // Convert ems to number
    const emsValue = parseInt(ems);

    // Validate destination numbers
    const destinations = Array.isArray(to) ? to : [to];
    if (destinations.length === 0) {
      return res.status(400).json({
        status: 'failed',
        error: 'At least one destination number is required'
      });
    }

    // Check for empty or invalid destination entries
    const invalidDestinations = destinations.filter(dest => 
      !dest || typeof dest !== 'string' || dest.trim().length === 0
    );
    
    if (invalidDestinations.length > 0) {
      return res.status(400).json({
        status: 'failed',
        error: 'All destination numbers must be valid strings'
      });
    }

    // Send SMS
    const result = await sendSms({
      to: Array.isArray(to) ? to : to,
      message: message.trim(),
      ems: emsValue,
      userref
    });

    // Return success response
    res.json({
      status: result.status,
      message: 'SMS processing completed',
      details: {
        totalSent: result.totalSent,
        totalFailed: result.totalFailed,
        successful: result.successful,
        failed: result.failed
      }
    });

  } catch (error) {
    console.error('SMS send endpoint error:', error.message);
    
    // Return error response
    res.status(500).json({
      status: 'failed',
      error: error.message
    });
  }
});

/**
 * Get SMS status endpoint (optional)
 * GET /sms/status/:key
 */
router.get('/status/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    // This would typically query a database for SMS status
    // For now, return a placeholder response
    res.json({
      status: 'success',
      key,
      message: 'Status tracking not yet implemented'
    });
    
  } catch (error) {
    console.error('SMS status endpoint error:', error.message);
    res.status(500).json({
      status: 'failed',
      error: error.message
    });
  }
});

export default router;