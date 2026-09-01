"use client";

import { useCallback, useEffect, useState } from "react";

// status:
//  "checking"  -- initial render, permission state not read yet
//  "granted"   -- coords already available, form usable
//  "needed"    -- not yet decided, or denied, or unsupported -- LoginForm
//                 renders LocationRequiredModal over the form until this
//                 becomes "granted"
//  "requesting" -- request() in flight (native browser permission prompt
//                 may be showing right now)
//
// navigator.geolocation.getCurrentPosition() only shows the native
// permission popup in response to a user gesture (a click), so request()
// must be called from a button's onClick -- see LocationRequiredModal's
// "Enable Location" button -- never automatically on mount.
export function useGeolocation() {
  const [status, setStatus] = useState("checking");
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);

  // Checks the CURRENT permission state without prompting -- Safari has no
  // Permissions API for geolocation, so it always falls through to
  // "needed" there and the user sees the modal's Enable button instead.
  useEffect(() => {
    let cancelled = false;

    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("needed");
      setError("Your browser doesn't support location access.");
      return;
    }

    if (!navigator.permissions?.query) {
      setStatus("needed");
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        if (cancelled) return;
        if (permissionStatus.state === "granted") {
          // Already granted (e.g. a previous visit) -- fetch coords now,
          // silently, no modal needed.
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (cancelled) return;
              setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
              setStatus("granted");
            },
            () => {
              if (cancelled) return;
              setStatus("needed");
            }
          );
        } else {
          setStatus("needed");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("needed");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Must be called from a click handler -- see the module comment above.
  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location access.");
      return;
    }
    setStatus("requesting");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setStatus("granted");
      },
      (geoError) => {
        setStatus("needed");
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location access was denied. Please allow location access for this site in your browser settings, then try again."
            : "Couldn't determine your location. Please try again."
        );
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  return { status, coords, error, request };
}
