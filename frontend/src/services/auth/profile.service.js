import api from "../../lib/api/client.js";

export const createUserProfile = async ({
  id,
  name,
  email,
  role = "customer",
  sellerCode,
}) => {
  const data = await api.post(
    "/api/profile/create-user-profile",
    {id, name, email, role, sellerCode},
    {requireAuth: false}
  );

  return data;
};

export const getUserProfile = async () => {
  const data = await api.get(
    "/api/profile/me",
    {requireAuth: true}
  );
  return data;
}

export const getTotalUsers = async () => {
  const { count } = await api.get("/api/profile/get-total-users", { requireAuth: false })
  return count || 0;
};