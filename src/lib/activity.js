import axiosInstance from "./api";

// PassVaultapi returns createdDate as a UTC ISO timestamp either way (see
// services/vaultActivity.js) -- formatting it in the viewer's local
// timezone happens entirely client-side, in formatActivityDate below.
export const fetchActivity = async (limit) => {
  const { result } = await axiosInstance.get("/vault/auth/activity", { params: { limit } });
  return result?.activity || [];
};

// Fire-and-forget page-view report (see usePageViewLogging) -- there's no
// server-side action to log this against the way account/note edits ride
// along on putVaultDataService, since navigating between pages is a
// client-only event.
export const logPageView = async (page) => {
  await axiosInstance.post("/vault/auth/activity/pageView", { page });
};

export const formatActivityDate = (isoString) =>
  new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
