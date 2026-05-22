import fetch from 'node-fetch';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3000}`;

async function testProfileUpdate() {
  console.log('Testing Profile Update Functionality\n');
  console.log('=====================================\n');

  // First, login to get a token
  console.log('1. Logging in...');
  const loginResponse = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com', // Replace with your test user
      password: 'testpassword123' // Replace with your test password
    })
  });

  if (!loginResponse.ok) {
    console.error('Login failed:', await loginResponse.text());
    return;
  }

  const loginData = await loginResponse.json();
  const token = loginData.accessToken;
  console.log('✓ Login successful\n');

  // Test 1: Get current profile
  console.log('2. Getting current profile...');
  const getProfileResponse = await fetch(`${API_URL}/api/v1/profile/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (getProfileResponse.ok) {
    const profileData = await getProfileResponse.json();
    console.log('✓ Current profile:', JSON.stringify(profileData, null, 2));
  } else {
    console.error('✗ Failed to get profile:', await getProfileResponse.text());
  }
  console.log();

  // Test 2: Update profile with payment provider preference
  console.log('3. Updating profile with payment provider...');
  const updateResponse = await fetch(`${API_URL}/api/v1/profile/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      preferred_payment_provider: 'stripe',
      name: 'Updated Test User'
    })
  });

  if (updateResponse.ok) {
    const updateData = await updateResponse.json();
    console.log('✓ Profile updated:', JSON.stringify(updateData, null, 2));
  } else {
    console.error('✗ Failed to update profile:', await updateResponse.text());
  }
  console.log();

  // Test 3: Update with Stripe IDs
  console.log('4. Updating profile with Stripe IDs...');
  const stripeUpdateResponse = await fetch(`${API_URL}/api/v1/profile/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stripe_customer_id: 'cus_test123',
      stripe_account_id: 'acct_test456'
    })
  });

  if (stripeUpdateResponse.ok) {
    const stripeData = await stripeUpdateResponse.json();
    console.log('✓ Stripe IDs updated:', JSON.stringify(stripeData, null, 2));
  } else {
    console.error('✗ Failed to update Stripe IDs:', await stripeUpdateResponse.text());
  }
  console.log();

  // Test 4: Update with Dodo IDs
  console.log('5. Updating profile with Dodo IDs...');
  const dodoUpdateResponse = await fetch(`${API_URL}/api/v1/profile/me`, {
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

  if (dodoUpdateResponse.ok) {
    const dodoData = await dodoUpdateResponse.json();
    console.log('✓ Dodo IDs updated:', JSON.stringify(dodoData, null, 2));
  } else {
    console.error('✗ Failed to update Dodo IDs:', await dodoUpdateResponse.text());
  }
  console.log();

  // Test 5: Get updated profile
  console.log('6. Getting final profile state...');
  const finalProfileResponse = await fetch(`${API_URL}/api/v1/profile/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (finalProfileResponse.ok) {
    const finalProfileData = await finalProfileResponse.json();
    console.log('✓ Final profile:', JSON.stringify(finalProfileData, null, 2));
  } else {
    console.error('✗ Failed to get final profile:', await finalProfileResponse.text());
  }
  console.log();

  console.log('=====================================');
  console.log('Profile update tests completed!');
}

testProfileUpdate().catch(console.error);
