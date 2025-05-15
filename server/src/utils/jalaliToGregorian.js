import jalaali from "jalaali-js";

/**
 * تبدیل یک تاریخ جلالی با ارقام فارسی به رشته میلادی ISO
 * @param {string} persianDate - مثل "۱۳۸۲/۰۹/۳۰"
 * @returns {string} مثل "2003-12-21"
 */
export function toGregorianISO(persianDate) {
  const persianNumbers = "۰۱۲۳۴۵۶۷۸۹";
  const latinNumbers   = "0123456789";

  const latinDate = persianDate.replace(/[۰-۹]/g, (d) =>
    latinNumbers[persianNumbers.indexOf(d)]
  );

  const [jy, jm, jd] = latinDate.split("/").map((x) => parseInt(x, 10));

  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);

  const mm = gm.toString().padStart(2, "0");
  const dd = gd.toString().padStart(2, "0");
  return `${gy}-${mm}-${dd}`;
}
