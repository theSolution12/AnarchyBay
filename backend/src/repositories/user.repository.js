import { supabase } from '../lib/supabase.js';

/**
 * Create a new user profile
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user profile
 */
export const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(userData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Find a user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User profile or null
 */
export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Find a user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User profile or null
 */
export const findUserById = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user profile
 */
export const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Find user by password reset token
 * @param {string} token - Password reset token
 * @returns {Promise<Object|null>} User profile or null
 */
export const findUserByResetToken = async (token) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('password_reset_token', token)
    .gt('password_reset_expires_at', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
