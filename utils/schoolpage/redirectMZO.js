export function redirectToMZO(location, language) {
  const fullName = language === 'ch-en'
    ? location?.full_name?.en
    : location?.full_name?.de;

  const slug = fullName
    ?.toLowerCase()
    .split(' ')
    .join('-')
    .replace(/-mzo$/, ''); 

  window?.open(`/${language}/schools/mzo/${slug}`, '_blank');
}

export function locationLink(location, language) {
  const fullName = language === 'ch-en' ? location?.full_name?.en : location?.full_name?.de;

  let slug = fullName?.toLowerCase().split(' ').join('-');

  if (!slug.endsWith('-mzo')) {
    slug += '-mzo';
  }

  return `/${language}/schools/mzo/${slug}`;
}

