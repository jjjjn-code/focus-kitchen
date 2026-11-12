import { mp4 } from 'nosleep.js/src/media.js';

/**
 * Keeps the screen awake while cooking.
 * 'native': Screen Wake Lock API. 'video': silent looping video fallback (the
 * NoSleep.js technique). 'none': nothing worked, so the screen may lock.
 */
export type AwakeMode = 'native' | 'video' | 'none';

let sentinel: WakeLockSentinel | null = null;
let video: HTMLVideoElement | null = null;

async function tryNative(): Promise<boolean> {
  if (!('wakeLock' in navigator)) return false;
  try {
    sentinel = await navigator.wakeLock.request('screen');
    sentinel.addEventListener('release', () => {
      sentinel = null;
    });
    return true;
  } catch {
    return false;
  }
}

async function tryVideo(): Promise<boolean> {
  try {
    if (!video) {
      video = document.createElement('video');
      video.setAttribute('title', 'Focus Kitchen');
      video.setAttribute('playsinline', '');
      video.src = mp4;
      // The clip is short, so jump back before it ends instead of relying on loop.
      video.addEventListener('timeupdate', () => {
        if (video && video.currentTime > 0.5) video.currentTime = Math.random();
      });
    }
    await video.play();
    return true;
  } catch {
    return false;
  }
}

/** Call when cooking starts and whenever the page becomes visible again. */
export async function keepAwake(): Promise<AwakeMode> {
  if (sentinel && !sentinel.released) return 'native';
  if (await tryNative()) {
    video?.pause();
    return 'native';
  }
  if (await tryVideo()) return 'video';
  return 'none';
}

export function allowSleep(): void {
  void sentinel?.release().catch(() => {});
  sentinel = null;
  video?.pause();
}
