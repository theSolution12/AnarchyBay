import dotenv from 'dotenv';
dotenv.config();

import { signUp, login, refreshAccessToken, getCurrentUser, requestPasswordReset } from './src/services/auth.service.js';
import { supabase } from './src/lib/supabase.js';

async function testAuth() {
  console.log('🧪 Testing Supabase Auth Integration\n');

  // Use a fixed test email (you can delete this user from Supabase dashboard after testing)
  const testEmail = `testcreator@gmail.com`;

  try {
    // Test 1: Sign up a new user
    console.log('1️⃣  Testing user registration...');
    const signupResult = await signUp({
      email: testEmail,
      password: 'SecurePassword123!',
      name: 'Test User',
      role: 'creator'
    });
    console.log('✅ User registered successfully');
    console.log('   User ID:', signupResult.user.id);
    console.log('   Role:', signupResult.user.role);
    console.log('   Access Token:', signupResult.accessToken?.substring(0, 20) + '...');
    console.log('   Refresh Token:', signupResult.refreshToken?.substring(0, 20) + '...\n');

    const accessToken = signupResult.accessToken;
    const refreshToken = signupResult.refreshToken;

    // Test 2: Get current user with access token
    console.log('2️⃣  Testing get current user...');
    const currentUser = await getCurrentUser(accessToken);
    console.log('✅ Current user retrieved successfully');
    console.log('   Email:', currentUser.email);
    console.log('   Role:', currentUser.role, '\n');

    // Test 3: Login with credentials
    console.log('3️⃣  Testing login...');
    const loginResult = await login({
      email: testEmail,
      password: 'SecurePassword123!'
    });
    console.log('✅ Login successful');
    console.log('   Access Token:', loginResult.accessToken.substring(0, 20) + '...');
    console.log('   Refresh Token:', loginResult.refreshToken.substring(0, 20) + '...\n');

    // Test 4: Refresh access token
    console.log('4️⃣  Testing token refresh...');
    const refreshResult = await refreshAccessToken(refreshToken);
    console.log('✅ Token refreshed successfully');
    console.log('   New Access Token:', refreshResult.accessToken.substring(0, 20) + '...');
    console.log('   New Refresh Token:', refreshResult.refreshToken.substring(0, 20) + '...\n');

    // Test 5: Request password reset
    console.log('5️⃣  Testing password reset request...');
    const resetRequest = await requestPasswordReset(testEmail);
    console.log('✅ Password reset requested');
    console.log('   Message:', resetRequest.message, '\n');

    // Test 6: Test invalid credentials
    console.log('6️⃣  Testing invalid credentials...');
    try {
      await login({
        email: testEmail,
        password: 'WrongPassword'
      });
      console.log('❌ Should have failed with invalid credentials');
    } catch (error) {
      console.log('✅ Invalid credentials rejected correctly:', error.message, '\n');
    }

    // Test 7: Test role-based access
    console.log('7️⃣  Testing role-based access...');
    const creatorUser = await getCurrentUser(loginResult.accessToken);
    console.log('✅ Creator role verified:', creatorUser.role === 'creator' ? 'PASS' : 'FAIL', '\n');

    // Test 8: Test duplicate email
    console.log('8️⃣  Testing duplicate email registration...');
    try {
      await signUp({
        email: testEmail,
        password: 'AnotherPassword123!',
        name: 'Another User',
        role: 'customer'
      });
      console.log('❌ Should have failed with duplicate email');
    } catch (error) {
      console.log('✅ Duplicate email rejected correctly:', error.message, '\n');
    }

    // Cleanup: Delete test user
    console.log('🧹 Cleaning up test user...');
    await supabase.from('profiles').delete().eq('email', testEmail);
    console.log('✅ Test user cleaned up\n');

    console.log('🎉 All authentication tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testAuth();
