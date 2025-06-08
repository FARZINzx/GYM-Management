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



export function isoToJalali(isoString : string) {
    if (!isoString) return '';
    const datePart = isoString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return `${year}/${month}/${day}`;
}

export function convertRoleNameToPersian(roleName: string | undefined) {
    if (!roleName) return '';
    switch (roleName.toLowerCase()) {
        case 'manager' : return 'مدیر';
        case 'trainer' : return 'مربی';
        case 'receptionist' : return 'منشی';
        default : return 'ادمین'
    }
}

export const formatToPersianCurrency = (amount: number | undefined): string | undefined => {
    if(!amount) return
    const toPersianDigits = (num: number): string => {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
    };

    // const tomanValue = amount / 10
    const formattedNumber = new Intl.NumberFormat('en-US').format(amount);
    const persianNumber = toPersianDigits(parseInt(formattedNumber.replace(/,/g, '')));

    // const unit = 'ریال';
    if (amount >= 1_000_000_000) {
        return `${toPersianDigits(Math.floor(amount / 1_000_000_000))} میلیارد `;
    } else if (amount >= 1_000_000) {
        return `${toPersianDigits(Math.floor(amount / 1_000_000))} میلیون `;
    } else if (amount >= 1_000) {
        return `${toPersianDigits(Math.floor(amount / 1_000))} هزار `;
    }

    return persianNumber;
};