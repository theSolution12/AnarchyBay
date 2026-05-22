import { supabase } from '../lib/supabase.js';

/**
 * Store a refresh token in the database
 * @param {string} userId - User ID
 * @param {string} token - Refresh token
 * @param {Date} expiresAt - Expiration date
 * @returns {Promise<Object>} Created refresh token record
 */
export const storeRefreshToken = async (userId, token, expiresAt) => {
  const { data, error } = await supabase
    .from('refresh_tokens')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Find a refresh token by token string
 * @param {string} token - Refresh token
 * @returns {Promise<Object|null>} Refresh token record or null
 */
export const findRefreshToken = async (token) => {
  const { data, error } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
};

/**
 * Delete a refresh token
 * @param {string} token - Refresh token to delete
 * @returns {Promise<void>}
 */
export const deleteRefreshToken = async (token) => {
  const { error } = await supabase
    .from('refresh_tokens')
    .delete()
    .eq('token', token);

  if (error) throw error;
};

/**
 * Delete all refresh tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteUserRefreshTokens = async (userId) => {
  const { error } = await supabase
    .from('refresh_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};

/**
 * Delete expired refresh tokens (cleanup)
 * @returns {Promise<void>}
 */
export const deleteExpiredRefreshTokens = async () => {
  const { error } = await supabase
    .from('refresh_tokens')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) throw error;
};
