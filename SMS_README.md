# MTN OCEP SMS Module

This module provides SMS functionality for the Citizen Engagement App using the MTN OCEP HTTP SMS API.

## Features

- Send SMS to single or multiple recipients
- E.164 phone number validation and normalization
- Automatic message length handling with EMS support
- Delivery receipt (DLR) processing
- Incoming message (MO) handling
- Duplicate message suppression (15-minute window)
- Comprehensive error handling and logging
- Secure webhook endpoints with token validation

## Configuration

### Environment Variables

Set the following secrets in your Replit environment:

```bash
MTN_USERNAME=your_mtn_username
MTN_PASSWORD=your_mtn_password
MTN_BASE_URL=https://sms01.umsg.co.za
WEBHOOK_TOKEN=your_secure_random_token
PUBLIC_BASE_URL=https://your-repl-name.replit.app
```

### Replit Secrets Setup

1. Open your Repl
2. Click on "Tools" → "Secrets"
3. Add each environment variable as a secret:
   - Key: `MTN_USERNAME`, Value: Your MTN username
   - Key: `MTN_PASSWORD`, Value: Your MTN password
   - Key: `WEBHOOK_TOKEN`, Value: A secure random string
   - Key: `PUBLIC_BASE_URL`, Value: Your Replit app's public URL

## API Endpoints

### Send SMS

**POST** `/sms/send`

Send SMS to one or multiple recipients.

**Request Body:**
```json
{
  "to": "27721234567",              // Single number or array of numbers
  "message": "Hello from the city!", // Message text
  "ems": 0,                        // Optional: 0 or 1 for long messages
  "userref": "unique-ref-123"      // Optional: user reference
}
```

**Response:**
```json
{
  "status": "queued",
  "message": "SMS processing completed",
  "details": {
    "totalSent": 1,
    "totalFailed": 0,
    "successful": [
      {
        "number": "27721234567",
        "key": "MSG123456",
        "userref": "unique-ref-123"
      }
    ],
    "failed": []
  }
}
```

### Webhooks

**MTN Delivery Receipts:** `GET /webhooks/mtn/dlr?token=your_webhook_token`
**Incoming Messages:** `GET /webhooks/mtn/mo?token=your_webhook_token`

## Usage Examples

### Using the SMS Client Library

```javascript
const { sendSms } = require('./lib/smsClient');

// Send to single recipient
try {
  const result = await sendSms({
    to: '+27721234567',
    message: 'Your municipal service request has been received.',
    userref: 'REQ-12345'
  });
  console.log('SMS sent:', result);
} catch (error) {
  console.error('SMS failed:', error.message);
}

// Send to multiple recipients
try {
  const result = await sendSms({
    to: ['+27721234567', '+27821234567'],
    message: 'Water outage scheduled for tomorrow 9AM-12PM',
    ems: 1  // Enable for long messages
  });
  console.log('Bulk SMS sent:', result);
} catch (error) {
  console.error('Bulk SMS failed:', error.message);
}
```

### Testing with cURL

```bash
# Send SMS
curl -X POST http://localhost:3000/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+27721234567",
    "message": "Test message from municipal system",
    "userref": "test-123"
  }'

# Test webhook (with token)
curl "http://localhost:3000/webhooks/mtn/dlr?FN=27721234567&TN=12345&SC=1&ST=DELIVRD&RF=MSG123&TS=2024-01-01T10:00:00Z&token=your_webhook_token"
```

## Phone Number Format

The module automatically handles various phone number formats:

- **E.164 Format:** `+27721234567` (preferred)
- **Local Format:** `0721234567` (automatically converted to +27721234567)
- **International:** `27721234567` (automatically prefixed with +)

## Message Length & EMS

- **Standard SMS:** Up to 160 characters
- **Long Messages:** Set `ems: 1` for messages > 160 characters
- **Concatenated SMS:** Long messages are split into multiple parts (each billed separately)

## Error Handling

The module maps MTN error codes to user-friendly messages:

- **150:** Invalid credentials
- **153:** Insufficient credits
- **154:** Invalid or banned phone number
- **155:** Duplicate message within 15 minutes
- **162:** Number is on Do Not Call list

## Security Features

- **Webhook Token Validation:** All webhook endpoints require a secure token
- **Phone Number Masking:** Phone numbers are masked in logs (+2772####567)
- **Credential Protection:** MTN credentials are never logged
- **Duplicate Suppression:** Prevents duplicate messages within 15 minutes

## Integration with Citizen Engagement App

The SMS module can be integrated with various features:

1. **Issue Notifications:** Send SMS when issues are created/updated
2. **Status Updates:** Notify citizens of service request progress
3. **Emergency Alerts:** Broadcast urgent information to residents
4. **Payment Confirmations:** Send receipts for municipal payments
5. **Appointment Reminders:** Notify about scheduled services

## Development & Testing

### Test Endpoints

- **GET** `/dev/ping` - Health check
- **GET** `/dev/send-test?to=+27xxx&msg=Hello` - Test SMS sending

### Monitoring

The module logs all SMS activities with masked phone numbers for privacy and security.

## Support

For MTN OCEP API support: messagingsupport@mtn.com
For module issues: Check the application logs for detailed error messages.