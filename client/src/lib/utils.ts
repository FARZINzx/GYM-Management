import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from 'moment-jalaali';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Helper function : request to fullscreen and Exit fullscreen
export function toggleFullScreen() {
  if (typeof window === 'undefined') return;

  if (!document.fullscreenElement) {
    // Request fullscreen
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  } else {
    // Exit fullscreen
    document.exitFullscreen().catch((err) => {
      console.error(`Error attempting to exit full-screen mode: ${err.message}`);
    });
  }
}

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true });
export function convertToJalali(dateString: string | undefined): string | null {
  if(!dateString) return null
  const date = moment(dateString)
  return date.format('jYYYY/jM/jD');
}