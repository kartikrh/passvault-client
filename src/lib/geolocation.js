// One-off coordinate grab for actions taken deep in the signed-in app
// (saving a vault entry, revealing a password) -- distinct from
// useGeolocation.js, which drives the mandatory permission-gate UI on the
// login page. By the time any of these actions can happen, login/signup
// already required "granted" geolocation permission (see LoginForm's
// requireGeolocation), so this expects the browser to answer immediately
// from its permission cache, no prompt shown.
//
// Never throws and never blocks the caller -- resolves { latitude, longitude }
// on success, null on any failure (unsupported browser, revoked permission,
// timeout). Losing the location on an activity log row is a minor loss of
// detail, not a reason to fail the account save or password reveal it rides
// along on.
export function getCurrentCoords() {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  });
}
