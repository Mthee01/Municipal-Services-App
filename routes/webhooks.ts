import express from 'express';
const router = express.Router();

/**
 * Webhook token validation middleware
 */
function validateWebhookToken(req, res, next) {
  const expectedToken = process.env.WEBHOOK_TOKEN;
  const providedToken = req.query.token;

  if (!expectedToken) {
    console.error('WEBHOOK_TOKEN environment variable not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!providedToken || providedToken !== expectedToken) {
    console.warn('Webhook access attempt with invalid token');
    return res.status(403).json({ error: 'Forbidden - invalid token' });
  }

  next();
}

/**
 * MTN Delivery Receipt (DLR) webhook
 * GET /webhooks/mtn/dlr
 * 
 * Query parameters:
 * - FN: From/recipient number on device
 * - TN: To/sender number (origin)
 * - SC: Status code (1 = success, 0 = failed)
 * - ST: SMSC status text/code
 * - RF: Message key/reference
 * - TS: Timestamp
 * - token: Webhook authentication token
 */
router.get('/mtn/dlr', validateWebhookToken, async (req, res) => {
  try {
    const { FN, TN, SC, ST, RF, TS } = req.query;

    // Log the delivery receipt
    console.log('MTN Delivery Receipt received:', {
      from: FN,
      to: TN,
      statusCode: SC,
      statusText: ST,
      messageKey: RF,
      timestamp: TS
    });

    // Map status codes to internal statuses
    let deliveryStatus;
    const statusCode = parseInt(SC);
    
    if (statusCode === 1) {
      deliveryStatus = 'delivered';
    } else if (statusCode === 0) {
      deliveryStatus = 'failed';
    } else {
      deliveryStatus = 'unknown';
    }

    // Parse timestamp if provided
    let parsedTimestamp = null;
    if (TS) {
      try {
        parsedTimestamp = new Date(TS);
      } catch (error) {
        console.warn('Invalid timestamp in DLR:', TS);
      }
    }

    // TODO: Store delivery receipt in database
    // This would typically involve:
    // 1. Finding the original SMS record by message key (RF)
    // 2. Updating the delivery status
    // 3. Recording delivery timestamp
    // 4. Possibly triggering notifications or callbacks
    
    const deliveryReceipt = {
      messageKey: RF,
      recipientNumber: FN ? maskPhoneNumber(FN) : null,
      senderNumber: TN ? maskPhoneNumber(TN) : null,
      statusCode: statusCode,
      statusText: ST,
      deliveryStatus: deliveryStatus,
      timestamp: parsedTimestamp || new Date(),
      receivedAt: new Date()
    };

    console.log('Processed delivery receipt:', deliveryReceipt);

    // Respond with 200 OK to acknowledge receipt
    res.status(200).json({
      status: 'success',
      message: 'Delivery receipt processed',
      messageKey: RF
    });

  } catch (error) {
    console.error('DLR webhook error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process delivery receipt'
    });
  }
});

/**
 * MTN Mobile Originated (MO) webhook - Incoming messages/replies
 * GET /webhooks/mtn/mo
 * 
 * Query parameters:
 * - FN: From number (citizen's number)
 * - TN: To number (your sending number)
 * - MS: Message text
 * - TS: Timestamp
 * - token: Webhook authentication token
 */
router.get('/mtn/mo', validateWebhookToken, async (req, res) => {
  try {
    const { FN, TN, MS, TS } = req.query;

    // Log the incoming message
    console.log('MTN Incoming Message received:', {
      from: FN ? maskPhoneNumber(FN) : null,
      to: TN ? maskPhoneNumber(TN) : null,
      message: MS,
      timestamp: TS
    });

    // Parse timestamp if provided
    let parsedTimestamp = null;
    if (TS) {
      try {
        parsedTimestamp = new Date(TS);
      } catch (error) {
        console.warn('Invalid timestamp in MO:', TS);
      }
    }

    // TODO: Store incoming message in database
    // This would typically involve:
    // 1. Storing the incoming message
    // 2. Possibly triggering automated responses
    // 3. Notifying relevant staff/systems
    // 4. Updating conversation threads
    
    const incomingMessage = {
      fromNumber: FN,
      toNumber: TN,
      messageText: MS,
      timestamp: parsedTimestamp || new Date(),
      receivedAt: new Date()
    };

    console.log('Processed incoming message:', {
      ...incomingMessage,
      fromNumber: FN ? maskPhoneNumber(FN) : null,
      toNumber: TN ? maskPhoneNumber(TN) : null
    });

    // TODO: Process the message content
    // This could include:
    // - Keyword detection
    // - Automated responses
    // - Creating support tickets
    // - Updating issue status based on message content

    // Respond with 200 OK to acknowledge receipt
    res.status(200).json({
      status: 'success',
      message: 'Incoming message processed'
    });

  } catch (error) {
    console.error('MO webhook error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process incoming message'
    });
  }
});

/**
 * Utility function to mask phone numbers for logging
 * @param {string} number - Phone number to mask
 * @returns {string} - Masked number
 */
function maskPhoneNumber(number) {
  if (!number || number.length <= 6) return number;
  const start = number.substring(0, 4);
  const end = number.substring(number.length - 3);
  const middle = '#'.repeat(number.length - 7);
  return start + middle + end;
}

export default router;