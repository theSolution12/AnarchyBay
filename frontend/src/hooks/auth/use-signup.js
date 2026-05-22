import { useMutation } from "@tanstack/react-query";
import { signUpWithEmail } from "../../services/auth/auth.service.js";
import { queryClient } from "../../lib/tanstack/client";
import { useNavigate } from "react-router-dom";
import { QUERY_KEYS } from "../../utils/constants.js";
import { toast } from "sonner";

const useSignUp = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({ name, email, password, role = "customer" }) => {
      return await signUpWithEmail({ name, email, password, role });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOTAL_USERS] });
      
      if (data?.requiresEmailVerification) {
        toast.success("Account created! Please check your email to verify your account.");
        navigate("/auth/verify-email", { state: { email: data.user?.email } });
      } else {
        toast.success("Account created successfully!");
        navigate("/login");
      }
    },
    onError: (error) => {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("already") || msg.includes("exists") || msg.includes("duplicate")) {
        toast.error("Account already exists. Please login instead.");
        navigate("/login");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    },
  });
};

export default useSignUp;