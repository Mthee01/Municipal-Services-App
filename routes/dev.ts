import express from 'express';
import { sendSms } from '../lib/smsClient';
const router = express.Router();

/**
 * Development and testing endpoints for SMS functionality
 */

/**
 * Health check endpoint
 * GET /dev/ping
 */
router.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SMS module is running',
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      hasCredentials: !!(process.env.MTN_USERNAME && process.env.MTN_PASSWORD),
      baseUrl: process.env.MTN_BASE_URL || 'https://sms01.umsg.co.za'
    }
  });
});

/**
 * Test SMS sending endpoint
 * GET /dev/send-test?to=+27xxx&msg=Hello&ems=0
 */
router.get('/send-test', async (req, res) => {
  try {
    const { to, msg, ems = 0 } = req.query;

    // Validate parameters
    if (!to) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameter: to'
      });
    }

    if (!msg) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameter: msg'
      });
    }

    // Send test SMS
    const result = await sendSms({
      to: to,
      message: msg,
      ems: parseInt(ems),
      userref: `test-${Date.now()}`
    });

    res.json({
      status: 'success',
      message: 'Test SMS sent',
      result: result
    });

  } catch (error) {
    console.error('Test SMS error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * SMS configuration check endpoint
 * GET /dev/config-check
 */
router.get('/config-check', (req, res) => {
  const config = {
    mtnBaseUrl: process.env.MTN_BASE_URL || 'https://sms01.umsg.co.za',
    hasUsername: !!process.env.MTN_USERNAME,
    hasPassword: !!process.env.MTN_PASSWORD,
    hasWebhookToken: !!process.env.WEBHOOK_TOKEN,
    publicBaseUrl: process.env.PUBLIC_BASE_URL || 'Not configured'
  };

  const allConfigured = config.hasUsername && config.hasPassword && config.hasWebhookToken;

  res.json({
    status: allConfigured ? 'ready' : 'incomplete',
    message: allConfigured ? 'SMS module fully configured' : 'Missing required configuration',
    configuration: config,
    requiredSecrets: [
      'MTN_USERNAME',
      'MTN_PASSWORD', 
      'WEBHOOK_TOKEN'
    ],
    optionalSecrets: [
      'MTN_BASE_URL',
      'PUBLIC_BASE_URL'
    ]
  });
});

/**
 * Webhook URL generator
 * GET /dev/webhook-urls
 */
router.get('/webhook-urls', (req, res) => {
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://your-repl-name.replit.app';
  const webhookToken = process.env.WEBHOOK_TOKEN || 'your_webhook_token';

  res.json({
    status: 'info',
    message: 'Webhook URLs for MTN configuration',
    webhooks: {
      deliveryReceipt: `${baseUrl}/webhooks/mtn/dlr?token=${webhookToken}`,
      incomingMessages: `${baseUrl}/webhooks/mtn/mo?token=${webhookToken}`
    },
    instructions: [
      '1. Configure these URLs in your MTN OCEP account settings',
      '2. Ensure WEBHOOK_TOKEN is set in your environment secrets',
      '3. Make sure PUBLIC_BASE_URL points to your live application'
    ]
  });
});

export default router;