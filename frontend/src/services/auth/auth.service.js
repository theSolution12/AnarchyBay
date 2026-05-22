import api, { saveSessionTokens, clearSessionTokens } from "../../lib/api/client.js";
import { supabase } from "../../lib/supabase.js";

export const signUpWithEmail = async ({ name, email, password, role = "customer" }) => {
  const data = await api.post(
    "/api/auth/signup", 
    { name, email, password, role }, 
    { requireAuth: false }
  );
  return data;
};

export const loginWithEmail = async (email, password) => {
  const data = await api.post(
    "/api/auth/login",
    { email, password },
    { requireAuth: false }
  );
  
  if (data?.session) {
    saveSessionTokens(data.session);
    
    // Also set session in Supabase client for consistency
    await supabase.auth.setSession({
      access_token: data.session.accessToken || data.session.access_token,
      refresh_token: data.session.refreshToken || data.session.refresh_token
    });
  }
  
  return data;
};

export const resendVerificationEmail = async (email) => {
  return api.post(
    "/api/auth/resend-verification",
    { email },
    { requireAuth: false }
  );
};

export const getCurrentUser = async () => {
  return api.get("/api/auth/me", { requireAuth: true });
};

export const logout = async () => {
  await api.post("/api/auth/logout", undefined, { requireAuth: false });
  await supabase.auth.signOut();
  clearSessionTokens();
};