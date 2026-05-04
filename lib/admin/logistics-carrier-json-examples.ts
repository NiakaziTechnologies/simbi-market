/** Example payloads for admin carrier forms (match POST/PUT body field names in the logistics API). */

export const LOGISTICS_CARRIER_SERVICE_LEVELS_EXAMPLE = `["STANDARD", "EXPRESS"]`

export const LOGISTICS_CARRIER_INTEGRATION_CONFIG_EXAMPLE = `{
  "rateQuotePath": "/v1/rates",
  "trackingPollPath": "/v1/track/{{trackingNumber}}",
  "headers": {
    "X-Carrier-Account": "{{accountId}}"
  }
}`

export const LOGISTICS_CARRIER_SLA_CONFIG_EXAMPLE = `{
  "pickupCutoffLocal": "15:00",
  "handoffEtaHours": 4,
  "deliveryCommitmentHours": 72,
  "businessDaysOnly": true,
  "maxRetryAttempts": 3
}`

export const LOGISTICS_CARRIER_SECRETS_EXAMPLE = `{
  "apiKey": "your-secret-key",
  "webhookSigningSecret": "whsec_xxxxxxxx",
  "webhookSecret": "alternate-key-name-supported-by-server"
}`
