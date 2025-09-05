// export function redirectToMZO(location, language) {
//   const fullName = language === 'ch-en'
//     ? location?.full_name?.en
//     : location?.full_name?.de;

//   const slug = fullName
//     ?.toLowerCase()
//     .split(' ')
//     .join('-')
//     .replace(/-mzo$/, ''); 

//   window?.open(`/${language}/schools/mzo/${slug}`, '_blank');
// }

// export function locationLink(location, language) {
//   const fullName = language === 'ch-en' ? location?.full_name?.en : location?.full_name?.de;

//   let slug = fullName?.toLowerCase().split(' ').join('-');

//   if (!slug.endsWith('-mzo')) {
//     slug += '-mzo';
//   }

//   return `/${language}/schools/mzo/${slug}`;
// }


// utils/mzoHelpers.js

/**
 * Normalize text into a safe URL slug
 * Handles special characters (ä → ae, ö → oe, ü → ue, ß → ss)
 */
function slugify(text) {
  return text
    ?.toLowerCase()
    .normalize("NFD") // split accent from letter
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with -
    .replace(/^-+|-+$/g, ""); // trim - from start/end
}

/**
 * Build a consistent MZO slug
 */
function buildMZOSlug(location, language) {
  const fullName =
    language === "ch-en"
      ? location?.full_name?.en
      : location?.full_name?.de;

  if (!fullName) return "";

  let slug = slugify(fullName);

  // ✅ Ensure -mzo suffix
  if (!slug.endsWith("-mzo")) {
    slug += "-mzo";
  }

  return slug;
}

/**
 * Opens the MZO school page in a new tab
 */
export function redirectToMZO(location, language) {
  const slug = buildMZOSlug(location, language);
  if (!slug) return;

  window?.open(`/${language}/schools/mzo/${slug}`, "_blank");
}

/**
 * Returns the link to the MZO school page
 */
export function locationLink(location, language) {
  const slug = buildMZOSlug(location, language);
  return slug ? `/${language}/schools/mzo/${slug}` : "#";
}
