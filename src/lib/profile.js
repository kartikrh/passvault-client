import axiosInstance from "./api";

export const fetchProfile = async () => {
  const { result } = await axiosInstance.get("/vault/auth/profile");
  return result?.client || null;
};

// All fields optional -- pass only what changed. Username uniqueness (and
// the real error message) is enforced server-side (PassVaultapi's
// updateProfileService + sql/vault/003_client_username.sql's unique index);
// mobileNo/address validation is enforced there too (004_client_contact_info.sql).
export const updateProfile = async ({ name, username, mobileNo, address } = {}) => {
  const { result } = await axiosInstance.put("/vault/auth/profile", { name, username, mobileNo, address });
  return result?.client || null;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  await axiosInstance.post("/vault/auth/changePassword", { currentPassword, newPassword });
};

// For a Google-only account that has never had a password (hasPassword:
// false on the profile) -- there's nothing to verify against yet, so this
// hits PassVaultapi's existing POST /vault/auth/setPassword instead of
// changePassword.
export const setPassword = async ({ newPassword }) => {
  await axiosInstance.post("/vault/auth/setPassword", { newPassword });
};
