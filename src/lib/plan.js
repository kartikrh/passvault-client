import axiosInstance from "./api";

// Plans a client can upgrade to -- PassVaultapi's isActive+isDisplay
// filtered, admin-ordered list (see getAvailablePlansService).
export const fetchAvailablePlans = async () => {
  const { result } = await axiosInstance.get("/vault/plan/packages");
  return result || [];
};

// The single QR/bank payment method the admin has flagged default -- the
// only one ever shown to a client (see getDefaultPaymentMethodService).
export const fetchDefaultPaymentMethod = async () => {
  const { result } = await axiosInstance.get("/vault/plan/paymentMethod");
  return result || null;
};

export const submitPlanUpgrade = async ({ packageId, transferCode }) => {
  const { result } = await axiosInstance.post("/vault/plan/upgradeRequest", { packageId, transferCode });
  return result;
};

// Null when the client has never submitted a request. Used to show a
// pending/rejected banner instead of letting them submit a second request
// while one is still outstanding (the server enforces this too, via
// idxPlanUpgradeOnePendingPerClient).
export const fetchMyUpgradeRequest = async () => {
  const { result } = await axiosInstance.get("/vault/plan/upgradeRequest/mine");
  return result?.request || null;
};
