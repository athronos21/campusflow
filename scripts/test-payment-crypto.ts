import {
  formatSignString,
  generateTelebirrSignature,
  verifyTelebirrSignature,
  generateCbeBirrSignature,
  verifyCbeBirrSignature,
} from '../apps/api/src/payments/gateway-crypto';

function runPaymentCryptoTests() {
  console.log('Testing Payment Gateway Cryptography & Signatures...');

  // 1. Telebirr Parameter Sorting
  const testParams = {
    totalAmount: '150.00',
    appId: 'CAMPUSFLOW_HU',
    outTradeNo: 'TB-HU-102948',
    sign: 'SHOULD_BE_IGNORED',
    nonce: 'abc123xyz',
  };

  const signString = formatSignString(testParams);
  const expectedString = 'appId=CAMPUSFLOW_HU&nonce=abc123xyz&outTradeNo=TB-HU-102948&totalAmount=150.00';
  if (signString !== expectedString) {
    throw new Error(`Parameter sorting failed!\nGot: ${signString}\nExpected: ${expectedString}`);
  }
  console.log('[PASS] 1. Parameter Sorting & Sign-string formatting');

  // 2. Telebirr Signature Generation & Verification
  const appKey = 'ethio_telecom_test_key_884920';
  const sig = generateTelebirrSignature(testParams, appKey);
  if (!sig || sig.length !== 64) {
    throw new Error(`Invalid signature generated: ${sig}`);
  }

  const isValid = verifyTelebirrSignature(testParams, sig, appKey);
  if (!isValid) {
    throw new Error('Valid signature failed verification!');
  }

  const isTamperedInvalid = verifyTelebirrSignature({ ...testParams, totalAmount: '999.00' }, sig, appKey);
  if (isTamperedInvalid) {
    throw new Error('Tampered payload incorrectly passed signature check!');
  }
  console.log('[PASS] 2. Telebirr HMAC-SHA256 signature generation, verification, and tamper rejection');

  // 3. CBE Birr Webhook Signature & Verification
  const cbeSecret = 'cbe_birr_merchant_secret_9941';
  const cbePayload = JSON.stringify({
    reference: 'CBE-HU-88310',
    amount: '250.00',
    status: 'PAID',
    shortCode: '882194',
  });

  const cbeSig = generateCbeBirrSignature(cbePayload, cbeSecret);
  const isCbeValid = verifyCbeBirrSignature(cbePayload, cbeSig, cbeSecret);
  if (!isCbeValid) {
    throw new Error('CBE Birr signature verification failed!');
  }

  const isCbeTampered = verifyCbeBirrSignature(cbePayload + ' ', cbeSig, cbeSecret);
  if (isCbeTampered) {
    throw new Error('Tampered CBE payload passed verification!');
  }
  console.log('[PASS] 3. CBE Birr signature generation and tamper verification');

  console.log('\n[SUCCESS] All 3 Payment Gateway Crypto checks passed cleanly!');
}

runPaymentCryptoTests();
