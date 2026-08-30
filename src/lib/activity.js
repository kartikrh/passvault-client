import axiosInstance from "./api";

// PassVaultapi returns createdDate as a UTC ISO timestamp either way (see
// services/vaultActivity.js) -- formatting it in the viewer's local
// timezone happens entirely client-side, in formatActivityDate below.
export const fetchActivity = async (limit) => {
  const { result } = await axiosInstance.get("/vault/auth/activity", { params: { limit } });
  return result?.activity || [];
};

export const formatActivityDate = (isoString) =>
  new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
