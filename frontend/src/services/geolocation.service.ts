/**
 * Progressive Geolocation Service for Nirikshan Field Inspection PWA
 * Operates 100% client-side via Browser Geolocation API.
 * Does NOT depend on backend/cloud availability.
 */

export type GpsCaptureMethod = 'fresh_high_accuracy' | 'recent_cached' | 'watch_position';

export interface GpsLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  capturedAt: string;
  captureMethod: GpsCaptureMethod;
  isStale: boolean;
}

export type GpsErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED';

export interface GpsErrorResult {
  code: GpsErrorCode;
  message: string;
  userGuidance: string;
}

class GeolocationService {
  private activeWatchId: number | null = null;
  private watchTimeoutId: any = null;

  /**
   * Check if Geolocation API is supported by the current browser
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  /**
   * Query permission state where supported by modern browsers
   */
  public async getPermissionState(): Promise<PermissionState | 'unknown'> {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        return status.state;
      } catch {
        return 'unknown';
      }
    }
    return 'unknown';
  }

  /**
   * Progressive location acquisition strategy:
   * 1. Try acceptable recent cached location (max age 2 mins, quick 4s timeout)
   * 2. If no recent location or accuracy poor, request fresh high-accuracy position (25s timeout)
   * 3. If fresh request times out, launch controlled watchPosition with accuracy threshold
   */
  public async captureDeviceLocation(): Promise<GpsLocationResult> {
    if (!this.isSupported()) {
      throw {
        code: 'NOT_SUPPORTED',
        message: 'Geolocation API is not supported in this browser.',
        userGuidance: 'Please use a modern browser like Chrome, Edge, or Safari with location capabilities.',
      } as GpsErrorResult;
    }

    // Step 1: Try quick recent cached position first
    try {
      const cached = await this.getPosition({
        enableHighAccuracy: false,
        maximumAge: 120000, // 2 minutes
        timeout: 4000,      // 4 seconds
      });

      // If recent cached position has good accuracy (within 50 meters), return it
      if (cached.coords.accuracy <= 50) {
        return this.formatResult(cached, 'recent_cached', true);
      }
    } catch {
      // Ignore cached attempt failure and proceed to fresh acquisition
    }

    // Step 2: Fresh high-accuracy acquisition with realistic mobile field timeout (25s)
    try {
      const fresh = await this.getPosition({
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 25000, // 25 seconds for GPS satellite / cellular triangulation
      });

      return this.formatResult(fresh, 'fresh_high_accuracy', false);
    } catch (err: any) {
      // If permission was explicitly denied, fail immediately with clear guidance
      if (err.code === 1) {
        throw {
          code: 'PERMISSION_DENIED',
          message: 'Location access was denied by user or system.',
          userGuidance: 'Please allow location permission in your browser or device settings to stamp audit GPS.',
        } as GpsErrorResult;
      }

      // Step 3: If timeout or unavailable, try controlled watchPosition for up to 15 seconds
      return await this.captureViaWatch();
    }
  }

  /**
   * Controlled watchPosition fallback
   */
  private captureViaWatch(): Promise<GpsLocationResult> {
    return new Promise((resolve, reject) => {
      let bestPosition: GeolocationPosition | null = null;

      const cleanup = () => {
        if (this.activeWatchId !== null) {
          navigator.geolocation.clearWatch(this.activeWatchId);
          this.activeWatchId = null;
        }
        if (this.watchTimeoutId) {
          clearTimeout(this.watchTimeoutId);
          this.watchTimeoutId = null;
        }
      };

      // Set 15-second total window for watch
      this.watchTimeoutId = setTimeout(() => {
        cleanup();
        if (bestPosition) {
          resolve(this.formatResult(bestPosition, 'watch_position', false));
        } else {
          reject({
            code: 'TIMEOUT',
            message: 'Device location provider timed out while acquiring coordinates.',
            userGuidance: 'Ensure your device location is enabled. You can retry GPS or save the checklist without GPS.',
          } as GpsErrorResult);
        }
      }, 15000);

      this.activeWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
            bestPosition = pos;
          }

          // If acceptable accuracy (within 35 meters) acquired, resolve early
          if (pos.coords.accuracy <= 35) {
            cleanup();
            resolve(this.formatResult(pos, 'watch_position', false));
          }
        },
        (err) => {
          cleanup();
          if (bestPosition) {
            resolve(this.formatResult(bestPosition, 'watch_position', false));
          } else {
            reject(this.mapError(err));
          }
        },
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    });
  }

  /**
   * Promisified single position request
   */
  private getPosition(options: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  /**
   * Cancel any pending watch or active capture
   */
  public cancelCapture(): void {
    if (this.activeWatchId !== null) {
      navigator.geolocation.clearWatch(this.activeWatchId);
      this.activeWatchId = null;
    }
    if (this.watchTimeoutId) {
      clearTimeout(this.watchTimeoutId);
      this.watchTimeoutId = null;
    }
  }

  private formatResult(
    pos: GeolocationPosition,
    method: GpsCaptureMethod,
    isStale: boolean
  ): GpsLocationResult {
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy * 10) / 10,
      altitude: pos.coords.altitude !== null ? Math.round(pos.coords.altitude * 10) / 10 : null,
      altitudeAccuracy: pos.coords.altitudeAccuracy !== null ? Math.round(pos.coords.altitudeAccuracy * 10) / 10 : null,
      heading: pos.coords.heading !== null ? Math.round(pos.coords.heading * 10) / 10 : null,
      speed: pos.coords.speed !== null ? Math.round(pos.coords.speed * 10) / 10 : null,
      capturedAt: new Date(pos.timestamp).toISOString(),
      captureMethod: method,
      isStale,
    };
  }

  private mapError(err: GeolocationPositionError): GpsErrorResult {
    switch (err.code) {
      case 1:
        return {
          code: 'PERMISSION_DENIED',
          message: 'Location access was denied.',
          userGuidance: 'Please enable location permissions in your browser or device settings to stamp coordinates.',
        };
      case 2:
        return {
          code: 'POSITION_UNAVAILABLE',
          message: 'Device location provider is unavailable.',
          userGuidance: 'Check that device Location/GPS is turned on. You can continue saving the checklist.',
        };
      case 3:
      default:
        return {
          code: 'TIMEOUT',
          message: 'Location request timed out.',
          userGuidance: 'Device GPS took too long to lock onto coordinates. You can retry or proceed with saving.',
        };
    }
  }
}

export const geolocationService = new GeolocationService();
