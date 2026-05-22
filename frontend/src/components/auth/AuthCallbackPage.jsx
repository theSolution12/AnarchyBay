import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { saveSessionTokens } from "@/lib/api/client";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const type = searchParams.get("type");
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          if (data.session) {
            saveSessionTokens(data.session);
            
            if (type === "email_verified") {
              toast.success("Email verified successfully! You can now login.");
              navigate("/login", { replace: true });
            } else {
              toast.success("Logged in successfully!");
              navigate("/dashboard", { replace: true });
            }
            return;
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          saveSessionTokens(session);
          
          if (type === "email_verified") {
            toast.success("Email verified successfully! You can now login.");
            navigate("/login", { replace: true });
          } else {
            toast.success("Logged in successfully!");
            navigate("/dashboard", { replace: true });
          }
        } else {
          if (type === "email_verified") {
            toast.success("Email verified! Please login to continue.");
            navigate("/login", { replace: true });
          } else {
            setStatus("Authentication failed. Redirecting to login...");
            setTimeout(() => navigate("/login", { replace: true }), 2000);
          }
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("Authentication error. Redirecting to login...");
        toast.error("Authentication failed");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--pink-500)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-lg font-bold text-gray-600">{status}</p>
      </div>
    </div>
  );
}