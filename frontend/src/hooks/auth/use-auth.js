import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, logout as logoutService } from "../../services/auth/auth.service.js";
import { getUserProfile } from "../../services/auth/profile.service.js";
import { QUERY_KEYS } from "../../utils/constants.js";
import { getAccessToken } from "../../lib/api/client.js";

export const useAuth = () => {
  const { USER, CURRENT_USER } = QUERY_KEYS;

  // Determine auth status based on presence of access token.
  // This avoids redirect flicker before user data loads.
  const isAuthenticated = Boolean(getAccessToken());

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: [CURRENT_USER],
    queryFn: getCurrentUser,
    retry: false,
    enabled: isAuthenticated, // only fetch when we have a token
  });

  const userId = user?.id;
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: [USER, userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });

  const logout = async () => {
    // Clear tokens server-side and locally
    await logoutService();
  };

  return {
    isAuthenticated,
    user,
    profile,
    role: profile?.role || null,
    loading: userLoading || profileLoading,
    name: profile?.display_name || profile?.name || null,
    avatar: profile?.profile_image_url || null,
    logout,
  };
};