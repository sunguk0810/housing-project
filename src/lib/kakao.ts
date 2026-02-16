/**
 * Kakao Maps & Address SDK type declarations and helpers.
 * Source of Truth: M3 spec Section 7
 */

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
        CustomOverlay: new (options: KakaoOverlayOptions) => KakaoCustomOverlay;
        event: {
          addListener: (target: unknown, type: string, callback: () => void) => void;
        };
        services: {
          Status: {
            OK: string;
          };
        };
      };
    };
    daum?: {
      Postcode: new (options: DaumPostcodeOptions) => DaumPostcodeInstance;
    };
  }
}

export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoMapOptions {
  center: KakaoLatLng;
  level: number;
}

export interface KakaoMapInstance {
  setCenter(latlng: KakaoLatLng): void;
  setLevel(level: number): void;
  getCenter(): KakaoLatLng;
  relayout(): void;
}

export interface KakaoOverlayOptions {
  position: KakaoLatLng;
  content: string | HTMLElement;
  yAnchor?: number;
  zIndex?: number;
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMapInstance | null): void;
  setPosition(position: KakaoLatLng): void;
  getPosition(): KakaoLatLng;
}

export interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeResult) => void;
  onclose?: () => void;
  width?: string | number;
  height?: string | number;
}

export interface DaumPostcodeInstance {
  open(): void;
  embed(element: HTMLElement): void;
}

export interface DaumPostcodeResult {
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  buildingName: string;
}

export function isKakaoMapsLoaded(): boolean {
  return typeof window !== "undefined" && !!window.kakao?.maps;
}

export function isKakaoAddressLoaded(): boolean {
  return typeof window !== "undefined" && !!window.daum?.Postcode;
}
