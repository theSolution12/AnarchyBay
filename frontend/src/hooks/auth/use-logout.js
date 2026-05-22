import { useMutation } from "@tanstack/react-query";
import { logout } from "../../services/auth/auth.service.js";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      navigate("/login");
      window.location.reload();
    },
  });
};

export default useLogout;
