import useLogout from "@/hooks/auth/use-logout";

const LogoutButton = ({ className = "", variant = "default" }) => {
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const baseClasses = "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
  
  const variants = {
    default: "px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "px-4 py-2 text-sm border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500",
    ghost: "px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-100 focus:ring-gray-500",
    link: "text-sm text-red-600 hover:text-red-700 underline-offset-4 hover:underline",
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
};

export default LogoutButton;
