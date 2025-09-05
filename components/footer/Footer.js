// import React, { useState } from 'react';
// import cx from 'classnames';
// import FooterTopBar from './FooterTopBar/FooterTopBar';
// import FooterBottomBar from './FooterBottomBar/FooterBottomBar';

// const Footer = ({ story, isTeacherInfoPage }) => {
//   const blok = story?.body.filter((comp) => comp.component === 'global_reference')[0].reference;

//   let language = blok.full_slug;

//   if (language.includes('ch-de')) {
//     language = 'ch-de';
//   } else language = 'ch-en';

//   return (
//     <footer
//       className={cx('flex flex-col px-6 bg-light-grey-200 lg:px-20 border-disable', {
//         'mt-[64px] border-t-2': !isTeacherInfoPage,
//       })}>
//       <FooterTopBar
//         language={language}
//         isTeacherInfoPage={isTeacherInfoPage}
//         footerData={blok?.content?.footer}
//         blok={blok}
//       />
//       <FooterBottomBar blok={blok} />
//     </footer>
//   );
// };

// export default Footer;

import React from 'react';
import cx from 'classnames';
import FooterTopBar from './FooterTopBar/FooterTopBar';
import FooterBottomBar from './FooterBottomBar/FooterBottomBar';

const Footer = ({ story, isTeacherInfoPage }) => {
  // ✅ safely find blok (avoid crash if story/body is missing)
  const blok =
    story?.body?.find((comp) => comp.component === 'global_reference')
      ?.reference ?? {};

  // ✅ safely get full_slug
  let language = blok?.full_slug ?? '';

  if (language.includes('ch-de')) {
    language = 'ch-de';
  } else if (language.includes('ch-en')) {
    language = 'ch-en';
  } else {
    // fallback if no slug found
    language = 'ch-en';
  }

  return (
    <footer
      className={cx(
        'flex flex-col px-6 bg-light-grey-200 lg:px-20 border-disable',
        {
          'mt-[64px] border-t-2': !isTeacherInfoPage,
        }
      )}
    >
      <FooterTopBar
        language={language}
        isTeacherInfoPage={isTeacherInfoPage}
        footerData={blok?.content?.footer ?? {}}
        blok={blok}
      />
      <FooterBottomBar blok={blok} />
    </footer>
  );
};

export default Footer;
