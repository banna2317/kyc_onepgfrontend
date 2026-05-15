<script lang="ts">
export type ApiParam = {
  name: string
  type: string
  required: boolean
  description: string
}

export type ApiDoc = {
  key: string
  category: 'Bank' | 'PAN' | 'Aadhaar' | 'Company' | 'DL' | 'RC' | 'Voter'
  name: string
  method: 'POST'
  endpoint: string
  description: string
  requirements: string[]
  params: ApiParam[]
  request: string
  response: string
  example: string
}

const URL = 'http://127.0.0.1:8000/api/';

export const apis: ApiDoc[] = [
  {
    key: 'penny_drop',
    category: 'Bank',
    name: 'Bank Account – Verification Penny Drop',
    method: 'POST',
    endpoint: `${URL}verify-bank-account-penny`,

    description:
      'Verify a bank account using Penny Drop to confirm account existence and account holder name.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'account_number',
        type: 'string',
        required: true,
        description: 'Bank account number to be verified'
      },
      {
        name: 'ifsc_code',
        type: 'string',
        required: true,
        description: 'Bank IFSC code (e.g. HDFC0001234)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "account_number": "123456789012",
  "ifsc_code": "HDFC0001234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "Bank account verified successfully",
  "data": {
    "verification_id": "BPV000001",
    "full_name": "JOHN DOE",
    "account_exists": true,
    "fees": 3
  }
}

Errors:
401 Unauthorized
403 KYC not completed`,

    example: `axios.post("${URL}verify-bank-account-penny", {
  account_number: "123456789012",
  ifsc_code: "HDFC0001234"
}, {
    headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'mobile_upi',
    category: 'Bank',
    name: 'Bank Account – Mobile To UPI',
    method: 'POST',
    endpoint: `${URL}bank/mobile-to-upi`,

    description:
      'Fetch the UPI ID linked with a mobile number.',

    requirements: [
      'User must be KYC verified',
      'Wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'phone_number',
        type: 'string',
        required: true,
        description: '10 digit mobile number linked with UPI'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "phone_number": "9876543210"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "UPI found successfully",
  "data": {
    "upi_id": "user@oksbi",
    "name": "JOHN DOE",
    "fees": 2
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance`,

    example: `axios.post("${URL}bank/mobile-to-upi", {
  phone_number: "9876543210"
}, {
    headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'mobile_upi_advance',
    category: 'Bank',
    name: 'Bank Account – Mobile to UPI (Advance)',
    method: 'POST',
    endpoint: `${URL}bank/mobile-to-upi-advances`,

    description:
      'Verify a mobile number to fetch the linked UPI ID and bank details.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'phone_number',
        type: 'string',
        required: true,
        description: '10 digit mobile number linked with UPI'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "phone_number": "9876543210"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "UPI found successfully",
  "data": {
    "verification_id": "BMUA000001",
    "upi_id": "user@oksbi",
    "name": "JOHN DOE",
    "psp_name": "oksbi",
    "fees": 3
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance`,

    example: `axios.post("${URL}bank/mobile-to-upi", {
  phone_number: "9876543210"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'bank_account_verification',
    category: 'Bank',
    name: 'Bank Account – Verification',
    method: 'POST',
    endpoint: `${URL}bank-account-verify`,

    description:
      'Verify a bank account using Penny Drop to confirm account existence and fetch account holder details.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'account_number',
        type: 'string',
        required: true,
        description: 'Bank account number (6–18 digits)'
      },
      {
        name: 'ifsc_code',
        type: 'string',
        required: true,
        description: 'Valid bank IFSC code (e.g. HDFC0001234)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "account_number": "123456789012",
  "ifsc_code": "HDFC0001234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "Bank account verified successfully",
  "data": {
    "verification_id": "BAV000001",
    "full_name": "JOHN DOE",
    "account_exists": true,
    "fees": 3
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance`,

    example: `axios.post("${URL}bank-account-verify", {
  account_number: "123456789012",
  ifsc_code: "HDFC0001234"
}, {
    headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'upi_verification',
    category: 'Bank',
    name: 'Bank Account – UPI Verification',
    method: 'POST',
    endpoint: `${URL}bank/upi-verification`,

    description:
      'Verify a UPI ID to check its existence and fetch the account holder name.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'upi',
        type: 'string',
        required: true,
        description: 'Valid UPI ID (e.g. user@oksbi)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "upi": "user@oksbi"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "UPI verified successfully",
  "data": {
    "verification_id": "BUV000001",
    "upi_id": "user@oksbi",
    "name_at_bank": "JOHN DOE",
    "account_exists": true,
    "fees": 2
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance`,

    example: `axios.post("${URL}bank/upi-verification", {
  upi: "user@oksbi"
}, {
   headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'bank_account_verification_pl',
    category: 'Bank',
    name: 'Bank Account – Verification (Penny-Less)',
    method: 'POST',
    endpoint: `${URL}verify-bank-account-penny-less`,

    description:
      'Verify a bank account without penny drop (PL) to check account existence and fetch account holder details.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'account_number',
        type: 'string',
        required: true,
        description: 'Bank account number (6–18 digits)'
      },
      {
        name: 'ifsc_code',
        type: 'string',
        required: true,
        description: 'Valid bank IFSC code (e.g. HDFC0001234)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "account_number": "123456789012",
  "ifsc_code": "HDFC0001234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "Bank account verified successfully",
  "data": {
    "verification_id": "BLV000001",
    "full_name": "JOHN DOE",
    "account_exists": true,
    "fees": 3
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance
500 Internal Server Error`,

    example: `axios.post("${URL}verify-bank-account-penny-less", {
  account_number: "123456789012",
  ifsc_code: "HDFC0001234"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'ifsc_to_bank_verification',
    category: 'Bank',
    name: 'Bank – IFSC To Bank Verification',
    method: 'POST',
    endpoint: `${URL}bank/ifsc-to-bank`,

    description:
      'Verify an IFSC code to fetch bank branch details such as branch name and address.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'ifsc_code',
        type: 'string',
        required: true,
        description: 'Valid 11-character IFSC code (e.g. HDFC0001234)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "ifsc_code": "HDFC0001234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "Bank details fetched successfully",
  "data": {
    "verification_id": "BIV000001",
    "ifsc_code": "HDFC0001234",
    "branch_name": "AHMEDABAD MAIN",
    "branch_address": "AHMEDABAD, GUJARAT",
    "fees": 2
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance`,

    example: `axios.post("${URL}bank/ifsc-to-bank", {
  ifsc_code: "HDFC0001234"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'pan_card_verification_lite',
    category: 'PAN',
    name: 'PAN Card – Lite Verification',
    method: 'POST',
    endpoint: `${URL}pan-lite`,

    description:
      'Verify PAN card details using PAN Lite verification. This API validates the PAN number and fetches basic details like full name and category.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'pancard_number',
        type: 'string',
        required: true,
        description: 'Valid PAN card number (exactly 10 characters, e.g. ABCDE1234F)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "pancard_number": "ABCDE1234F"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "PAN verified successfully",
  "data": {
    "verification_id": "PLV000001",
    "pancard_number": "ABCDE1234F",
    "full_name": "JOHN DOE",
    "category": "Individual",
    "status": "success",
    "fees": 2
  }
}

Failure (200):
{
  "status": false,
  "message": "PAN verification failed",
  "data": {
    "verification_id": "PLV000002",
    "pancard_number": "ABCDE1234F",
    "status": "failed",
    "fees": 2
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}pan-lite", {
  pancard_number: "ABCDE1234F"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'pan_aadhaar_linked_check',
    category: 'PAN',
    name: 'PAN – Aadhaar Linked Check',
    method: 'POST',
    endpoint: `${URL}pan-aadhar-link`,

    description:
      'Check whether a PAN card is linked with the given Aadhaar number. This API validates PAN–Aadhaar linkage status using official records.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'pancard_number',
        type: 'string',
        required: true,
        description: 'Valid PAN card number (exactly 10 characters, e.g. ABCDE1234F)'
      },
      {
        name: 'aadhaar_number',
        type: 'string',
        required: true,
        description: 'Valid Aadhaar number (12 digits)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "pancard_number": "ABCDE1234F",
  "aadhaar_number": "123412341234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "PAN Aadhaar linked successfully",
  "data": {
    "verification_id": "PAV000001",
    "pancard_number": "ABCDE1234F",
    "aadhaar_number": "123412341234",
    "is_linked": true,
    "status": "success",
    "fees": 2
  }
}

Failure (200):
{
  "status": true,
  "message": "PAN Aadhaar not linked",
  "data": {
    "verification_id": "PAV000002",
    "pancard_number": "ABCDE1234F",
    "aadhaar_number": "123412341234",
    "is_linked": false,
    "status": "failed",
    "fees": 2
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}pan-aadhar-link", {
  pancard_number: "ABCDE1234F",
  aadhaar_number: "123412341234"
}, {
   headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'pan_validation',
    category: 'PAN',
    name: 'PAN – Validation',
    method: 'POST',
    endpoint: `${URL}pan-verification`,

    description:
      'Validate a PAN card number to check whether the PAN is valid and active as per official records. This API only validates PAN format and existence.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'pancard_number',
        type: 'string',
        required: true,
        description: 'Valid PAN card number (exactly 10 characters, e.g. ABCDE1234F)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "pancard_number": "ABCDE1234F"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "PAN verification successfully",
  "data": {
    "verification_id": "PCV000001",
    "pancard_number": "ABCDE1234F",
    "is_valid": true,
    "status": "success",
    "fees": 2
  }
}

Failure (200):
{
  "status": true,
  "message": "PAN verification failed",
  "data": {
    "verification_id": "PCV000002",
    "pancard_number": "ABCDE1234F",
    "is_valid": false,
    "status": "failed",
    "fees": 2
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}pan-verification", {
  pancard_number: "ABCDE1234F"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'pan_linked_verification',
    category: 'PAN',
    name: 'PAN – Linked Verification',
    method: 'POST',
    endpoint: `${URL}pan-link`,

    description:
      'Check whether a PAN card is linked/active for a user. This API validates the PAN, deducts fees, and returns verification status.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'pancard_number',
        type: 'string',
        required: true,
        description: 'Valid PAN card number (exactly 10 characters, e.g. ABCDE1234F)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "pancard_number": "ABCDE1234F"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "PAN verification successfully",
  "data": {
    "verification_id": "PLV000001",
    "pancard_number": "ABCDE1234F",
    "is_linked": true,
    "status": "success",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "PAN verification failed",
  "data": {
    "verification_id": "PLV000002",
    "pancard_number": "ABCDE1234F",
    "is_linked": false,
    "status": "failed",
    "fees": 3
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}pan-link", {
  pancard_number: "ABCDE1234F"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'pan_masked_verification',
    category: 'PAN',
    name: 'PAN – Masked Verification',
    method: 'POST',
    endpoint: `${URL}pan-masked`,

    description:
      'Verify a PAN card in a masked format and fetch associated user details (name, DOB, gender). Fees are deducted for each verification.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'pancard_number',
        type: 'string',
        required: true,
        description: 'Valid PAN card number (exactly 10 characters, e.g. ABCDE1234F)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "pancard_number": "ABCDE1234F"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "PAN verified successfully",
  "data": {
    "verification_id": "PMV000001",
    "pancard_number": "ABCDE1234F",
    "dob": "1990-01-01",
    "first_name": "John",
    "middle_name": "K",
    "last_name": "Doe",
    "gender": "Male",
    "status": "success",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "PAN verification failed",
  "data": {
    "verification_id": "PMV000002",
    "pancard_number": "ABCDE1234F",
    "dob": null,
    "first_name": null,
    "middle_name": null,
    "last_name": null,
    "gender": null,
    "status": "failed",
    "fees": 3
  }
}

Errors:
401 Unauthorized
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}pan-masked", {
  pancard_number: "ABCDE1234F"
}, {
    headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'pan_dob_verification',
    category: 'PAN',
    name: 'PAN – DOB Verification',
    method: 'POST',
    endpoint: `${URL}pan-dob`,

    description:
      'Verify a PAN card along with Date of Birth. This API fetches PAN details including full name, gender, DOB, and category. Fees are deducted per verification.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'pancard_number',
        type: 'string',
        required: true,
        description: 'Valid PAN card number (exactly 10 characters, e.g. ABCDE1234F)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "pancard_number": "ABCDE1234F"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "PAN verified successfully",
  "data": {
    "verification_id": "PDV000001",
    "pancard_number": "ABCDE1234F",
    "dob": "1990-01-01",
    "full_name": "John K Doe",
    "category": "individual",
    "gender": "Male",
    "status": "success",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "PAN verification failed",
  "data": {
    "verification_id": "PDV000002",
    "pancard_number": "ABCDE1234F",
    "dob": null,
    "full_name": null,
    "category": null,
    "gender": null,
    "status": "failed",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}pan-dob", {
  pancard_number: "ABCDE1234F"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'pan_advance_verification',
    category: 'PAN',
    name: 'PAN – Advance Verification',
    method: 'POST',
    endpoint: `${URL}pan-advance`,

    description:
      'Perform an advanced PAN verification with detailed information. Returns PAN details including DOB, full name, gender, category, address, mobile, email, and location. Fees are deducted per verification.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'pancard_number',
        type: 'string',
        required: true,
        description: 'Valid PAN card number (exactly 10 characters, e.g. ABCDE1234F)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "pancard_number": "ABCDE1234F"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "PAN verified successfully",
  "data": {
    "verification_id": "PAV000001",
    "pancard_number": "ABCDE1234F",
    "dob": "1990-01-01",
    "full_name": "John K Doe",
    "category": "individual",
    "gender": "Male",
    "sub_dist": "SubDistrictName",
    "dist": "DistrictName",
    "state": "StateName",
    "mobile_no": "9876543210",
    "email": "john@example.com",
    "address_line_1": "Address Line 1",
    "address_line_2": "Address Line 2",
    "address_line_3": null,
    "address_line_4": null,
    "address_line_5": null,
    "pincode": "123456",
    "status": "success",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "PAN verification failed",
  "data": {
    "verification_id": "PAV000002",
    "pancard_number": "ABCDE1234F",
    "dob": null,
    "full_name": null,
    "category": null,
    "gender": null,
    "sub_dist": null,
    "dist": null,
    "state": null,
    "mobile_no": null,
    "email": null,
    "address_line_1": null,
    "address_line_2": null,
    "address_line_3": null,
    "address_line_4": null,
    "address_line_5": null,
    "pincode": null,
    "status": "failed",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}pan-advance", {
  pancard_number: "ABCDE1234F"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'rc_book_verification',
    category: 'RC',
    name: 'RC Book Verification',
    method: 'POST',
    endpoint: `${URL}rc-full`,

    description:
      'Verify a vehicle RC (Registration Certificate) number. This API fetches detailed vehicle and owner information, deducts fees, and returns verification status.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'rc_number',
        type: 'string',
        required: true,
        description: 'Valid RC number (6 to 12 characters, e.g., MH12AB1234)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "rc_number": "MH12AB1234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "RC Book verified successfully",
  "data": {
    "verification_id": "RCV000001",
    "rc_number": "MH12AB1234",
    "client_id": "CL12345",
    "registration_date": "2020-01-01",
    "owner_name": "John Doe",
    "father_name": "Mr. Doe",
    "present_address": "Address Line 1",
    "permanent_address": "Address Line 2",
    "mobile_number": "9876543210",
    "vehicle_category": "Two Wheeler",
    "vehicle_chasi_number": "CHS123456",
    "vehicle_engine_number": "ENG987654",
    "maker_description": "Honda",
    "maker_model": "Activa 125",
    "body_type": "Scooter",
    "fuel_type": "Petrol",
    "color": "Red",
    "norms_type": "BS6",
    "fit_up_to": null,
    "financer": null,
    "financed": false,
    "insurance_company": "ABC Insurance",
    "insurance_policy_number": "INS12345",
    "insurance_upto": "2025-01-01",
    "manufacturing_date": "2019-12-01",
    "registered_at": "Mumbai RTO",
    "latest_by": null,
    "less_info": false,
    "tax_upto": "2024-12-31",
    "tax_paid_upto": "2024-12-31",
    "cubic_capacity": "125",
    "vehicle_gross_weight": "150",
    "no_cylinders": 1,
    "seat_capacity": 2,
    "sleeper_capacity": null,
    "standing_capacity": null,
    "wheelbase": 1230,
    "unladen_weight": 120,
    "vehicle_category_description": "Scooter 125cc",
    "pucc_number": "PUCC1234",
    "pucc_upto": "2024-12-31",
    "permit_number": null,
    "permit_issue_date": null,
    "permit_valid_from": null,
    "permit_valid_upto": null,
    "permit_type": null,
    "national_permit_number": null,
    "national_permit_upto": null,
    "national_permit_issued_by": null,
    "non_use_status": null,
    "non_use_from": null,
    "non_use_to": null,
    "blacklist_status": null,
    "noc_details": null,
    "owner_number": null,
    "rc_status": "Active",
    "masked_name": false,
    "challan_details": null,
    "variant": null,
    "status": "success",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "RC Book verification failed",
  "data": {
    "verification_id": "RCV000002",
    "rc_number": "MH12AB1234",
    "status": "failed",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}rc-full", {
  rc_number: "MH12AB1234"
}, {
   headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'rc_special_verification',
    category: 'RC',
    name: 'RC Special Verification',
    method: 'POST',
    endpoint: `${URL}rc-special`,

    description:
      'Verify a vehicle RC (Registration Certificate) number using the RC Special API. This fetches detailed vehicle and owner information, deducts fees from the wallet, and returns verification status.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'rc_number',
        type: 'string',
        required: true,
        description: 'Valid RC number (6 to 12 characters, e.g., MH12AB1234)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "rc_number": "MH12AB1234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "RC Book verified successfully",
  "data": {
    "verification_id": "RSV000001",
    "rc_number": "MH12AB1234",
    "registration_date": "2020-01-01",
    "owner_name": "John Doe",
    "father_name": "Mr. Doe",
    "present_address": "Address Line 1",
    "permanent_address": "Address Line 2",
    "mobile_number": "9876543210",
    "vehicle_category": "Two Wheeler",
    "vehicle_chasi_number": "CHS123456",
    "vehicle_engine_number": "ENG987654",
    "maker_description": "Honda",
    "maker_model": "Activa 125",
    "body_type": "Scooter",
    "fuel_type": "Petrol",
    "color": "Red",
    "norms_type": "BS6",
    "fit_up_to": null,
    "financer": null,
    "financed": false,
    "insurance_company": "ABC Insurance",
    "insurance_policy_number": "INS12345",
    "insurance_upto": "2025-01-01",
    "manufacturing_date": "2019-12-01",
    "registered_at": "Mumbai RTO",
    "tax_upto": "2024-12-31",
    "tax_paid_upto": "2024-12-31",
    "cubic_capacity": "125",
    "vehicle_gross_weight": "150",
    "no_cylinders": 1,
    "seat_capacity": 2,
    "wheelbase": 1230,
    "unladen_weight": 120,
    "vehicle_category_description": "Scooter 125cc",
    "pucc_number": "PUCC1234",
    "pucc_upto": "2024-12-31",
    "rc_status": "Active",
    "status": "success",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "RC Book verification failed",
  "data": {
    "verification_id": "RSV000002",
    "rc_number": "MH12AB1234",
    "status": "failed",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}rc-special", {
  rc_number: "MH12AB1234"
}, {
   headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'rc_mobile_verification',
    category: 'RC',
    name: 'RC Mobile Verification',
    method: 'POST',
    endpoint: `${URL}rc-mobile`,

    description:
      'Verify a vehicle RC (Registration Certificate) number using the RC Mobile API. This fetches detailed vehicle and owner information, deducts fees from the wallet, and returns verification status.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'rc_number',
        type: 'string',
        required: true,
        description: 'Valid RC number (6 to 12 characters, e.g., MH12AB1234)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "rc_number": "MH12AB1234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "RC Book verified successfully",
  "data": {
    "verification_id": "RMV000001",
    "rc_number": "MH12AB1234",
    "registration_date": "2020-01-01",
    "owner_name": "John Doe",
    "father_name": "Mr. Doe",
    "present_address": "Address Line 1",
    "permanent_address": "Address Line 2",
    "mobile_number": "9876543210",
    "vehicle_category": "Two Wheeler",
    "vehicle_chasi_number": "CHS123456",
    "vehicle_engine_number": "ENG987654",
    "maker_description": "Honda",
    "maker_model": "Activa 125",
    "body_type": "Scooter",
    "fuel_type": "Petrol",
    "color": "Red",
    "norms_type": "BS6",
    "fit_up_to": null,
    "financer": null,
    "financed": false,
    "insurance_company": "ABC Insurance",
    "insurance_policy_number": "INS12345",
    "insurance_upto": "2025-01-01",
    "manufacturing_date": "2019-12-01",
    "registered_at": "Mumbai RTO",
    "tax_upto": "2024-12-31",
    "tax_paid_upto": "2024-12-31",
    "cubic_capacity": "125",
    "vehicle_gross_weight": "150",
    "no_cylinders": 1,
    "seat_capacity": 2,
    "wheelbase": 1230,
    "unladen_weight": 120,
    "vehicle_category_description": "Scooter 125cc",
    "pucc_number": "PUCC1234",
    "pucc_upto": "2024-12-31",
    "rc_status": "Active",
    "status": "success",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "RC Book verification failed",
  "data": {
    "verification_id": "RMV000002",
    "rc_number": "MH12AB1234",
    "status": "failed",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
404 RC number not found
500 Internal Server Error`,

    example: `axios.post("${URL}rc-mobile", {
  rc_number: "MH12AB1234"
}, {
    headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'rc_engine_verification',
    category: 'RC',
    name: 'RC Engine Verification',
    method: 'POST',
    endpoint: `${URL}rc-engine`,

    description:
      'Verify a vehicle RC number by providing the engine number. This API fetches the corresponding RC number, deducts fees, and returns verification status.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'engine_no',
        type: 'string',
        required: true,
        description: 'Valid engine number (8 to 20 alphanumeric characters, e.g., ABCD12345678)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "engine_no": "ABCD12345678"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "RC Engine verified successfully",
  "data": {
    "verification_id": "REV000001",
    "engine_no": "ABCD12345678",
    "rc_no": "MH12AB1234",
    "status": "success",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "RC Engine verification failed",
  "data": {
    "verification_id": "REV000002",
    "engine_no": "ABCD12345678",
    "status": "failed",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
404 Engine number not found
500 Internal Server Error`,

    example: `axios.post("${URL}rc-engine", {
  engine_no: "ABCD12345678"
}, {
   headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'fastag_verification',
    category: 'RC',
    name: 'Fastag Verification',
    method: 'POST',
    endpoint: `${URL}rc-fastag`,

    description:
      'Verify a vehicle Fastag number linked with an RC number. This API fetches Fastag details, balance, and other information, deducts fees, and returns verification status.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'fastag',
        type: 'string',
        required: true,
        description: 'Fastag provider code or identifier (e.g., PAYTM, NPCI, etc.)'
      },
      {
        name: 'rc_no',
        type: 'string',
        required: true,
        description: 'Valid RC number (6 to 12 characters, e.g., MH12AB1234)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "fastag": "PAYTM",
  "rc_no": "MH12AB1234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "Fastag verified successfully",
  "data": {
    "verification_id": "FSV000001",
    "fastag": "PAYTM",
    "rc_no": "MH12AB1234",
    "owner_name": "John Doe",
    "balance": 120.50,
    "min_recharge_amount": 100.00,
    "max_recharge_amount": 2000.00,
    "biller_id": "BIL12345",
    "biller_name": "Paytm Fastag",
    "status": "success",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "Fastag verification failed",
  "data": {
    "verification_id": "FSV000002",
    "fastag": "PAYTM",
    "rc_no": "MH12AB1234",
    "status": "failed",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
404 Fastag not found
500 Internal Server Error`,

    example: `axios.post("${URL}rc-fastag", {
  fastag: "PAYTM",
  rc_no: "MH12AB1234"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'aadhaar_otp_send',
    category: 'Aadhaar',
    name: 'Aadhaar OTP Send',
    method: 'POST',
    endpoint: `${URL}aadhaar-v2/generate-otp`,

    description:
      'Send an OTP to the mobile number linked with a valid Aadhaar number. This API deducts the verification fee and returns OTP request details.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'aadhaar_number',
        type: 'string',
        required: true,
        description: '12-digit Aadhaar number of the user'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "aadhaar_number": "123412341234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "OTP sent successfully",
  "verification_id": "ADV000001",
  "data": {
    "verification_id": "ADV000001",
    "aadhaar_number": "123412341234",
    "valid_aadhaar": true,
    "status": "success",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "OTP sending failed",
  "verification_id": "ADV000002",
  "data": {
    "verification_id": "ADV000002",
    "aadhaar_number": "123412341234",
    "valid_aadhaar": false,
    "status": "failed",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
402 Insufficient wallet balance
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}aadhaar-v2/generate-otp", {
  aadhaar_number: "123412341234"
}, {
   headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'aadhaar_otp_submit',
    category: 'Aadhaar',
    name: 'Aadhaar OTP Submit',
    method: 'POST',
    endpoint: `${URL}aadhaar-v2/submit-otp`,

    description:
      'Submit the OTP received for Aadhaar verification. On success, it verifies the Aadhaar details and updates the record.',

    requirements: [
      'User must be KYC verified',
      'A valid verification_id from the OTP send API',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'verification_id',
        type: 'string',
        required: true,
        description: 'Verification ID returned from the Aadhaar OTP send API'
      },
      {
        name: 'otp',
        type: 'string',
        required: true,
        description: '6-digit OTP sent to the Aadhaar-linked mobile number'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "verification_id": "ADV000001",
  "otp": "123456"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "Aadhaar verified successfully",
  "data": {
    "verification_id": "ADV000001",
    "aadhaar_number": "123412341234",
    "full_name": "John Doe",
    "dob": "1990-01-01",
    "gender": "M",
    "address": {...},
    "face_status": "verified",
    "face_score": 98.5,
    "mobile_verified": true,
    "aadhaar_pdf": "https://example.com/aadhaar.pdf",
    "status": "success",
    "message": "Aadhaar verification successfully",
    "request_id": "REQ123456789",
    "source": "login",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "Aadhaar verification failed",
  "data": {
    "verification_id": "ADV000002",
    "aadhaar_number": "123412341234",
    "status": "failed",
    "message": "Invalid OTP",
    "request_id": "REQ987654321",
    "source": "login",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}aadhaar-v2/submit-otp", {
  verification_id: "ADV000001",
  otp: "123456"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },
  {
    key: 'aadhaar_validation',
    category: 'Aadhaar',
    name: 'Aadhaar Validation',
    method: 'POST',
    endpoint: `${URL}aadhaar-validation`,

    description:
      'Validates an Aadhaar number using the QuickEKYC Aadhaar Validation API. Requires KYC verification and sufficient wallet balance.',

    requirements: [
      'User must be KYC verified',
      'User must have sufficient wallet balance',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'aadhaar_number',
        type: 'string',
        required: true,
        description: '12-digit Aadhaar number to validate'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "aadhaar_number": "123412341234"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "Aadhaar verified successfully",
  "data": {
    "verification_id": "AVV000001",
    "aadhaar_number": "123412341234",
    "status": "success",
    "state": "Maharashtra",
    "age_range": "25-30",
    "gender": "M",
    "masked_mobile_number": "XXXXXXXX12",
    "aadhaar_status_code": "success_aadhaar",
    "message": "Aadhaar verified successfully",
    "request_id": "REQ123456789",
    "source": "login",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "Aadhaar verification failed",
  "data": {
    "verification_id": "AVV000002",
    "aadhaar_number": "123412341234",
    "status": "failed",
    "message": "Invalid Aadhaar number",
    "request_id": "REQ987654321",
    "source": "login",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}aadhaar-validation", {
  aadhaar_number: "123412341234"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'voter_id_verification',
    category: 'Voter',
    name: 'Voter ID Verification',
    method: 'POST',
    endpoint: `${URL}voter-verification`,

    description:
      'Verifies a Voter ID (EPIC number) using the QuickEKYC Voter ID Verification API. Requires KYC verification and sufficient wallet balance.',

    requirements: [
      'User must be KYC verified',
      'User must have sufficient wallet balance',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'voter_id',
        type: 'string',
        required: true,
        description: 'Voter ID / EPIC number, 6–10 alphanumeric characters'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json


Body:
{
  "voter_id": "AB1234567"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "Voter Id verified successfully",
  "data": {
    "verification_id": "VOV000001",
    "voter_id": "AB1234567",
    "status": "success",
    "gender": "M",
    "state": "Maharashtra",
    "name": "John Doe",
    "relation_name": "Jane Doe",
    "relation_type": "Father",
    "dob": "1990-01-01",
    "age": 33,
    "assembly_constituency": "Some Constituency",
    "polling_station": "Polling Station Name",
    "vid": "123456",
    "request_id": "REQ123456789",
    "source": "login",
    "fees": 3
  }
}

Failure (200):
{
  "status": true,
  "message": "Voter ID verification failed",
  "data": {
    "verification_id": "VOV000002",
    "voter_id": "AB1234567",
    "status": "failed",
    "message": "Invalid Voter ID",
    "request_id": "REQ987654321",
    "source": "login",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
402 Wallet balance insufficient
500 Internal Server Error`,

    example: `axios.post("${URL}voter-verification", {
  voter_id: "AB1234567"
}, {
  headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'dl_verification',
    category: 'DL',
    name: 'Driving License Verification',
    method: 'POST',
    endpoint: `${URL}license-verification`,

    description:
      'Verifies a Driving License using the QuickEKYC DL Verification API. Requires KYC verification and sufficient wallet balance.',

    requirements: [
      'User must be KYC verified',
      'User must have sufficient wallet balance',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'license_number',
        type: 'string',
        required: true,
        description: 'Driving License number, max 50 characters'
      },
      {
        name: 'dob',
        type: 'date',
        required: true,
        description: 'Date of birth of license holder (YYYY-MM-DD)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "license_number": "MH123456789012",
  "dob": "1990-01-01"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "License Verification successful",
  "data": {
    "verification_id": "LIV000001",
    "license_number": "MH123456789012",
    "dob": "1990-01-01",
    "name": "John Doe",
    "state": "Maharashtra",
    "gender": "M",
    "father_or_husband_name": "Jane Doe",
    "doi": "2010-05-12",
    "doe": "2030-05-12",
    "vehicle_classes": ["MCWG", "LMV"],
    "blood_group": "O+",
    "profile_image": "https://example.com/image.jpg",
    "has_image": true,
    "request_id": "REQ123456789",
    "source": "login",
    "fees": 3,
    "status": "success"
  }
}

Failure (200):
{
  "status": true,
  "message": "License Verification failed",
  "data": {
    "verification_id": "LIV000002",
    "license_number": "MH123456789012",
    "dob": "1990-01-01",
    "status": "failed",
    "message": "Invalid license number",
    "request_id": "REQ987654321",
    "source": "login",
    "fees": 3
  }
}

Errors:
401 Unauthorized / API Key invalid
403 KYC not completed
402 Wallet balance insufficient
500 Internal Server Error`,

    example: `axios.post("${URL}license-verification", {
  license_number: "MH123456789012",
  dob: "1990-01-01"
}, {
   headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'company_cin_verification',
    category: 'Company',
    name: 'Company CIN Verification',
    method: 'POST',
    endpoint: `${URL}company-verification`,

    description:
      'Verifies company details using CIN / Company ID via QuickEKYC Company Verification API. Requires completed KYC and sufficient wallet balance.',

    requirements: [
      'User must be KYC verified',
      'User must have sufficient wallet balance',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'company_id',
        type: 'string',
        required: true,
        description: 'Company CIN / Company Identification Number'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "company_id": "U12345MH2020PLC123456"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "company verified successfully",
  "data": {
    "verification_id": "CV000001",
    "company_id": "U12345MH2020PLC123456",
    "company_type": "Private Limited",
    "company_name": "ABC Technologies Pvt Ltd",
    "details": {
      "roc_code": "ROC-Mumbai",
      "registration_date": "2020-01-15",
      "authorized_capital": "1000000",
      "paid_up_capital": "500000"
    },
    "status": "success",
    "request_id": "REQ123456789",
    "source": "login",
    "fees": 5
  }
}

Failure (200):
{
  "status": true,
  "message": "company verification failed",
  "data": {
    "verification_id": "CV000002",
    "company_id": "U12345MH2020PLC123456",
    "status": "failed",
    "message": "Invalid company id",
    "request_id": "REQ987654321",
    "source": "login",
    "fees": 5
  }
}

Errors:
401 Unauthorized / API Key invalid
402 Wallet balance low
403 KYC not completed
404 Company not found
500 Internal Server Error`,

    example: `axios.post("${URL}company-verification", {
  company_id: "U12345MH2020PLC123456"
}, {
   headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'din_verification',
    category: 'Company',
    name: 'DIN Verification',
    method: 'POST',
    endpoint: `${URL}din-verification`,

    description:
      'Verifies Director Identification Number (DIN) using QuickEKYC DIN Verification API. Requires completed KYC and sufficient wallet balance.',

    requirements: [
      'User must be KYC verified',
      'User must have sufficient wallet balance',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'din_number',
        type: 'string',
        required: true,
        description: 'Director Identification Number (DIN)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "din_number": "01234567"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "DIN verified successfully",
  "data": {
    "verification_id": "DV000001",
    "din_number": "01234567",
    "full_name": "RAHUL SHARMA",
    "father_name": "SURESH SHARMA",
    "dob": "1985-06-12",
    "nationality": "Indian",
    "present_address": "Mumbai, Maharashtra",
    "permanent_address": "Jaipur, Rajasthan",
    "email": "rahul@example.com",
    "pan_number": "ABCDE1234F",
    "status": "success",
    "request_id": "REQ123456789",
    "source": "login",
    "fees": 10
  }
}

Failure (200):
{
  "status": true,
  "message": "DIN verification failed",
  "data": {
    "verification_id": "DV000002",
    "din_number": "01234567",
    "status": "failed",
    "message": "Invalid DIN number",
    "request_id": "REQ987654321",
    "source": "login",
    "fees": 10
  }
}

Errors:
401 Unauthorized / API Key invalid
402 Wallet balance low
403 KYC not completed
404 DIN not found
500 Internal Server Error`,

    example: `axios.post("${URL}din-verification", {
  din_number: "01234567"
}, {
   headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  },

  {
    key: 'gstin_verification',
    category: 'Company',
    name: 'GSTIN Verification',
    method: 'POST',
    endpoint: `${URL}gst-verification`,

    description:
      'Verify GSTIN (Goods and Services Tax Identification Number). This API fetches business, registration, jurisdiction, and filing status details. Wallet balance is deducted per request.',

    requirements: [
      'User must be KYC verified',
      'Sufficient wallet balance required',
      'API Key and API Secret'
    ],

    params: [
      {
        name: 'gstin',
        type: 'string',
        required: true,
        description: 'Valid GSTIN number (15 characters)'
      }
    ],

    request: `Headers:
X-API-KEY: your_api_key
X-API-SECRET: your_api_secret
Content-Type: application/json

Body:
{
  "gstin": "27AAPFU0939F1ZV"
}`,

    response: `Success (200):
{
  "status": true,
  "message": "GSTIN verified successfully",
  "data": {
    "verification_id": "DV000001",
    "gstin": "27AAPFU0939F1ZV",
    "pan_number": "AAPFU0939F",
    "business_name": "ABC TRADERS",
    "legal_name": "ABC TRADERS PRIVATE LIMITED",
    "center_jurisdiction": "RANGE-IV",
    "state_jurisdiction": "Mumbai East",
    "date_of_registration": "2018-07-01",
    "constitution_of_business": "Private Limited Company",
    "taxpayer_type": "Regular",
    "gstin_status": "Active",
    "date_of_cancellation": null,
    "field_visit_conducted": false,
    "nature_bus_activities": ["Wholesale Business"],
    "nature_of_core_business_activity_code": "WS",
    "nature_of_core_business_activity_description": "Wholesale Supplier",
    "filing_status": [
      {
        "year": "2023-24",
        "returns_filed": true
      }
    ],
    "address": {
      "building_name": "Business Tower",
      "street": "MG Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "hsn_info": [],
    "status": "success",
    "request_id": "REQ123456789",
    "fees": 10
  }
}

Failure (200):
{
  "status": true,
  "message": "GSTIN verification failed",
  "data": {
    "verification_id": "DV000002",
    "gstin": "27AAPFU0939F1ZV",
    "status": "failed",
    "message": "Invalid GSTIN",
    "fees": 10
  }
}

Errors:
401 Unauthorized / API Key invalid
402 Insufficient wallet balance
403 KYC not completed
422 Validation error
500 Internal Server Error`,

    example: `axios.post("${URL}gst-verification", {
  gstin: "27AAPFU0939F1ZV"
}, {
   headers: {
    "X-API-KEY": "YOUR_API_KEY",
    "X-API-SECRET": "YOUR_API_SECRET",
    "Content-Type": "application/json"
  }
})`
  }

]
</script>

<template></template>