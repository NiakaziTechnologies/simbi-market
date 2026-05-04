/** Example payloads for financial partner admin forms (illustrative). */

export const FP_FIELD_DEFINITIONS_EXAMPLE = `[
  {
    "key": "nationalId",
    "label": "National ID",
    "type": "text",
    "required": true,
    "placeholder": "63-1234567 A 12"
  },
  {
    "key": "yearsInBusiness",
    "label": "Years in business",
    "type": "number",
    "required": false
  }
]`

export const FP_INTEGRATION_CONFIG_EXAMPLE = `{
  "baseUrl": "https://api.partner.example.co.zw",
  "submitPath": "/v1/loan-applications",
  "submitMethod": "POST",
  "statusPath": "/v1/loan-applications/:partnerReferenceId/status",
  "statusMethod": "GET",
  "headersTemplate": {
    "X-Partner-Id": "{{partnerSlug}}"
  }
}`

export const FP_SECRETS_MERGE_EXAMPLE = `{
  "apiKey": "new_key_value",
  "webhookSigningSecret": "whsec_xxxxxxxx",
  "legacyToken": null
}`
