export function toGregorianISO(persianDate) {
     const persianNums = "۰۱۲۳۴۵۶۷۸۹";
     const latinNums = "0123456789";

     const latin = persianDate.replace(/[۰-۹]/g, (ch) =>
          latinNums[persianNums.indexOf(ch)]
     );

     const [y, m, d] = latin.split("/").map((s) => s.padStart(2, "0"));
     return `${y}/${m}/${d}`;
}
