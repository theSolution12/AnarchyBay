import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3000}`;

async function testProfile() {
  console.log('Testing Profile Management\n');

  // Step 1: Register a new user
  console.log('1. Registering new user...');
  const registerResponse = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User'
    })
  });

  if (!registerResponse.ok) {
    console.error('Registration failed:', await registerResponse.text());
    return;
  }

  const registerData = await registerResponse.json();
  const token = registerData.accessToken;
  console.log('✓ User registered\n');

  // Step 2: Get current profile
  console.log('2. Getting current profile...');
  const getResponse = await fetch(`${API_URL}/api/v1/profile/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (getResponse.ok) {
    const profile = await getResponse.json();
    console.log('✓ Current profile:', JSON.stringify(profile, null, 2));
  } else {
    console.error('✗ Failed:', await getResponse.text());
  }
  console.log();

  // Step 3: Update profile with payment provider
  console.log('3. Updating payment provider to Stripe...');
  const updateResponse = await fetch(`${API_URL}/api/v1/profile/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      preferred_payment_provider: 'stripe',
      stripe_customer_id: 'cus_test123',
      stripe_account_id: 'acct_test456'
    })
  });

  if (updateResponse.ok) {
    const updated = await updateResponse.json();
    console.log('✓ Profile updated:', JSON.stringify(updated, null, 2));
  } else {
    console.error('✗ Failed:', await updateResponse.text());
  }
  console.log();

  // Step 4: Update to Dodo
  console.log('4. Switching to Dodo payment provider...');
  const dodoResponse = await fetch(`${API_URL}/api/v1/profile/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      preferred_payment_provider: 'dodo',
      dodo_customer_id: 'dodo_cus_789',
      dodo_merchant_id: 'dodo_merch_012'
    })
  });

  if (dodoResponse.ok) {
    const dodoData = await dodoResponse.json();
    console.log('✓ Switched to Dodo:', JSON.stringify(dodoData, null, 2));
  } else {
    console.error('✗ Failed:', await dodoResponse.text());
  }
  console.log();

  // Step 5: Update name
  console.log('5. Updating name...');
  const nameResponse = await fetch(`${API_URL}/api/v1/profile/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Updated Test User'
    })
  });

  if (nameResponse.ok) {
    const nameData = await nameResponse.json();
    console.log('✓ Name updated:', JSON.stringify(nameData, null, 2));
  } else {
    console.error('✗ Failed:', await nameResponse.text());
  }
  console.log();

  console.log('✅ All tests completed!');
}

testProfile().catch(console.error);
