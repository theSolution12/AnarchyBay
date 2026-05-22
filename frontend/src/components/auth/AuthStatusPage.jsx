import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const PROVIDERS = [
  { id: "google", name: "Google", color: "#4285F4" },
  { id: "github", name: "GitHub", color: "#333" },
  { id: "gitlab", name: "GitLab", color: "#FC6D26" },
];

const AuthStatusPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkingProvider, setLinkingProvider] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        navigate("/login");
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const getProviderStatus = (providerId) => {
    if (!user) return { linked: false };
    
    const identities = user.identities || [];
    const identity = identities.find((i) => i.provider === providerId);
    
    if (identity) {
      return {
        linked: true,
        email: identity.identity_data?.email,
        avatar: identity.identity_data?.avatar_url,
        name: identity.identity_data?.full_name || identity.identity_data?.name,
      };
    }
    
    if (user.app_metadata?.provider === providerId) {
      return {
        linked: true,
        email: user.email,
        avatar: user.user_metadata?.avatar_url,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
      };
    }
    
    return { linked: false };
  };

  const handleLinkProvider = async (providerId) => {
    setLinkingProvider(providerId);
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: providerId,
        options: {
          redirectTo: `${window.location.origin}/auth-status`,
        },
      });
      if (error) {
        if (error.message.includes("already linked") || error.message.includes("already exists")) {
          toast.error("This provider is already linked to another account.");
        } else {
          toast.error(error.message);
        }
      }
    } catch {
      toast.error("Failed to link provider. Please try again.");
    } finally {
      setLinkingProvider(null);
    }
  };

  const handleUnlinkProvider = async (providerId) => {
    const identities = user?.identities || [];
    const identity = identities.find((i) => i.provider === providerId);
    
    if (!identity) {
      toast.error("Provider not found");
      return;
    }
    
    if (identities.length <= 1) {
      toast.error("Cannot unlink the only authentication method.");
      return;
    }
    
    try {
      const { error } = await supabase.auth.unlinkIdentity(identity);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(`${providerId} unlinked successfully`);
        const { data: { user: refreshedUser } } = await supabase.auth.getUser();
        setUser(refreshedUser);
      }
    } catch {
      toast.error("Failed to unlink provider.");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
        </div>
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Not Authenticated</h2>
            <p className="text-slate-600 mb-6">
              {error || "Please login to view your authentication status."}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-pink-500 p-8 text-white">
              <div className="flex items-center gap-4">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full border-4 border-white/30"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">
                    {user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                  </h1>
                  <p className="text-white/80">{user.email}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Authenticated</span>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Connected Providers</h2>
              
              <div className="space-y-4">
                {PROVIDERS.map((provider) => {
                  const status = getProviderStatus(provider.id);
                  
                  return (
                    <div
                      key={provider.id}
                      className={`border rounded-xl p-4 transition-all ${
                        status.linked
                          ? "border-green-200 bg-green-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${provider.color}15` }}
                          >
                            {provider.id === "google" && (
                              <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                            )}
                            {provider.id === "github" && (
                              <svg className="w-6 h-6" fill={provider.color} viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                            )}
                            {provider.id === "gitlab" && (
                              <svg className="w-6 h-6" viewBox="0 0 24 24" fill={provider.color}>
                                <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.918 1.263c-.135-.423-.73-.423-.867 0L1.386 9.45.044 13.587c-.1.31.018.654.282.846L12 23.034l11.674-8.601c.264-.192.382-.536.281-.846"/>
                              </svg>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{provider.name}</span>
                              {status.linked && (
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            {status.linked ? (
                              <p className="text-sm text-slate-600">{status.email || "Connected"}</p>
                            ) : (
                              <p className="text-sm text-slate-500">Not connected</p>
                            )}
                          </div>
                        </div>

                        <div>
                          {status.linked ? (
                            <button
                              onClick={() => handleUnlinkProvider(provider.id)}
                              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Unlink
                            </button>
                          ) : (
                            <button
                              onClick={() => handleLinkProvider(provider.id)}
                              disabled={linkingProvider === provider.id}
                              className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-50"
                            >
                              {linkingProvider === provider.id ? "Linking..." : "Link"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">User ID</span>
                    <span className="text-sm text-slate-900 font-mono bg-slate-100 px-3 py-1 rounded">
                      {user.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Email</span>
                    <span className="text-slate-900">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Email Verified</span>
                    {user.email_confirmed_at ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="text-amber-600">Pending</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Last Sign In</span>
                    <span className="text-slate-900">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Link
                  to="/dashboard"
                  className="flex-1 py-3 px-4 text-center font-semibold rounded-xl text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 transition-all"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthStatusPage;