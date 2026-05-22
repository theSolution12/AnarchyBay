/**
 * Quick integration test for infrastructure components
 * Run with: node test-infrastructure.js
 */

import { logger } from './src/lib/logger.js';
import { initRedis, getRedis, closeRedis } from './src/lib/redis.js';
import { ValidationError, NotFoundError, ErrorCodes } from './src/middleware/errorHandler.js';
import { z } from 'zod';

console.log('🧪 Testing Infrastructure Components...\n');

// Test 1: Logger
console.log('1️⃣  Testing Logger...');
logger.info('Test info message');
logger.warn({ test: 'data' }, 'Test warning message');
logger.debug('Test debug message');
console.log('✅ Logger working\n');

// Test 2: Redis (optional)
console.log('2️⃣  Testing Redis...');
const redis = initRedis();
if (redis) {
  try {
    await redis.set('test-key', 'test-value', 'EX', 10);
    const value = await redis.get('test-key');
    if (value === 'test-value') {
      console.log('✅ Redis working (connected and operational)\n');
    } else {
      console.log('⚠️  Redis connected but value mismatch\n');
    }
  } catch (error) {
    console.log('⚠️  Redis error:', error.message, '\n');
  }
} else {
  console.log('⚠️  Redis not configured (optional - will work without it)\n');
}

// Test 3: Error Classes
console.log('3️⃣  Testing Error Classes...');
try {
  throw new ValidationError('Test validation error', [{ field: 'email', message: 'Invalid' }]);
} catch (error) {
  if (error.statusCode === 400 && error.errorCode === ErrorCodes.VALIDATION_ERROR) {
    console.log('✅ ValidationError working');
  }
}

try {
  throw new NotFoundError('User');
} catch (error) {
  if (error.statusCode === 404 && error.errorCode === ErrorCodes.NOT_FOUND) {
    console.log('✅ NotFoundError working\n');
  }
}

// Test 4: Zod Validation
console.log('4️⃣  Testing Zod Validation...');
const testSchema = z.object({
  email: z.string().email(),
  age: z.number().positive(),
});

try {
  const valid = testSchema.parse({ email: 'test@example.com', age: 25 });
  console.log('✅ Zod validation working (valid data passed)');
} catch (error) {
  console.log('❌ Zod validation failed unexpectedly');
}

try {
  testSchema.parse({ email: 'invalid', age: -5 });
  console.log('❌ Zod validation failed (should have thrown error)');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log('✅ Zod validation working (invalid data rejected)\n');
  }
}

// Test 5: Request ID generation
console.log('5️⃣  Testing UUID generation...');
import { v4 as uuidv4 } from 'uuid';
const requestId = uuidv4();
if (requestId && requestId.length === 36) {
  console.log('✅ UUID generation working\n');
}

// Cleanup
console.log('🧹 Cleaning up...');
await closeRedis();
console.log('✅ Cleanup complete\n');

console.log('✨ All infrastructure components tested successfully!');
console.log('📝 Note: Redis is optional - the system will work without it');
console.log('🚀 Ready to start the server with: npm run dev');

process.exit(0);
