import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginWithEmail } from "../../services/auth/auth.service.js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../utils/constants.js";

const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password }) => {
      return await loginWithEmail(email, password);
    },
    onSuccess: (data) => {
      if (data?.user && data?.session) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      }
    },
    onError: (error) => {
      const msg = error.message?.toLowerCase() || "";
      const code = error.code || "";
      
      if (code === "EMAIL_NOT_VERIFIED" || msg.includes("verify") || msg.includes("not verified")) {
        toast.error("Please verify your email first. Check your inbox for a verification link.");
        navigate("/auth/verify-email", { state: { fromLogin: true } });
      } else if (msg.includes("invalid") || msg.includes("credentials") || msg.includes("password")) {
        toast.error("Invalid email or password");
      } else if (msg.includes("not found") || msg.includes("no user")) {
        toast.error("Account not found. Please sign up first.");
      } else {
        toast.error(error.message || "Failed to login");
      }
    },
  });
};

export default useLogin;