"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isKakaoAddressLoaded, type DaumPostcodeResult } from "@/lib/kakao";

interface AddressResult {
  roadAddress: string;
  jibunAddress: string;
}

function subscribeToSdkLoad(callback: () => void) {
  const interval = setInterval(() => {
    callback();
    if (isKakaoAddressLoaded()) {
      clearInterval(interval);
    }
  }, 1000);
  return () => clearInterval(interval);
}

function getSdkSnapshot() {
  return isKakaoAddressLoaded();
}

function getServerSnapshot() {
  return false;
}

/**
 * Kakao (Daum) Address popup hook.
 */
export function useKakaoAddress() {
  const isLoaded = useSyncExternalStore(
    subscribeToSdkLoad,
    getSdkSnapshot,
    getServerSnapshot,
  );

  const open = useCallback((): Promise<AddressResult> => {
    return new Promise((resolve, reject) => {
      if (!isKakaoAddressLoaded()) {
        reject(new Error("Kakao Address SDK not loaded"));
        return;
      }

      new window.daum!.Postcode({
        oncomplete: (data: DaumPostcodeResult) => {
          resolve({
            roadAddress: data.roadAddress,
            jibunAddress: data.jibunAddress,
          });
        },
        onclose: () => {
          reject(new Error("cancelled"));
        },
      }).open();
    });
  }, []);

  return { open, isLoaded };
}
