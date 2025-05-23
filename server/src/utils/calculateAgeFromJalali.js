import jalaali from 'jalaali-js';


export function calculateAgeFromJalali(dateInput) {
    if (!dateInput) return null;

    try {
        // Handle both Date objects and strings
        let dateString;
        if (dateInput instanceof Date) {
            // Convert Date to ISO string and extract YYYY-MM-DD part
            dateString = dateInput.toISOString().split('T')[0];
        } else if (typeof dateInput === 'string') {
            // Handle string input (both ISO and plain dates)
            dateString = dateInput.split('T')[0];
        } else {
            throw new Error('Invalid date input type');
        }

        // Split into components [year, month, day]
        const [year, month, day] = dateString.split('-').map(Number);
        
        // Convert Jalali to Gregorian
        const gregorian = jalaali.toGregorian(year, month, day);
        const birthDate = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);

        // Calculate age
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    } catch (error) {
        console.error("Age calculation failed:", error);
        return null;
    }
}