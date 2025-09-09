// import { storyblokEditable } from '@storyblok/react';
// import { useRouter } from 'next/router';
// import Script from 'next/script';
// import { useMediaQuery } from 'react-responsive';
// import SbEditable from 'storyblok-react';

// const StudentRecommendations = ({ blok }) => {
//   const DesktopSize = useMediaQuery({ minWidth: 1030 });
//   const TabletSize = useMediaQuery({ minWidth: 600, maxWidth: 1029 });
//   const MobileSize = useMediaQuery({ maxWidth: 599 });

//   const router = useRouter();

//   const currentUrl = router.asPath; // Gets the current path including query parameters

//   let language;
//   let ClassNames;

//   if (currentUrl.includes('ch-de')) {
//     language = 'ch-de';
//   } else currentUrl = 'ch-en';

//   if (language === 'ch-de') {
//     ClassNames = 'elfsight-app-edd672e9-da4b-417f-bc55-d953c937b96b';
//   } else ClassNames = 'elfsight-app-14c20c44-6945-494c-a6ed-3afe4743fa2f';

//   return (
//     <>
//       {DesktopSize && (
//         <SbEditable content={blok} key={blok}>
//           <div {...storyblokEditable(blok)}>
//             <div className={ClassNames} data-elfsight-app-lazy></div>
//           </div>
//           <Script src='https://static.elfsight.com/platform/platform.js' async />
//         </SbEditable>
//       )}

//       {TabletSize && (
//         <SbEditable content={blok} key={blok}>
//           <div {...storyblokEditable(blok)}>
//             <div className={ClassNames} data-elfsight-app-lazy></div>
//           </div>
//           <Script src='https://static.elfsight.com/platform/platform.js' async />
//         </SbEditable>
//       )}

//       {MobileSize && (
//         <SbEditable content={blok} key={blok}>
//           <div {...storyblokEditable(blok)}>
//             <div className={ClassNames} data-elfsight-app-lazy></div>
//           </div>
//           <Script src='https://static.elfsight.com/platform/platform.js' async />
//         </SbEditable>
//       )}
//     </>
//   );
// };

// export default StudentRecommendations;

import { storyblokEditable } from '@storyblok/react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { useMediaQuery } from 'react-responsive';
import SbEditable from 'storyblok-react';

const StudentRecommendations = ({ blok }) => {
  const isDesktop = useMediaQuery({ minWidth: 1030 });
  const isTablet = useMediaQuery({ minWidth: 600, maxWidth: 1029 });
  const isMobile = useMediaQuery({ maxWidth: 599 });

  const router = useRouter();
  const currentUrl = router.asPath;

  // Determine language based on URL
  const language = currentUrl.includes('ch-de') ? 'ch-de' : 'ch-en';

  // Determine the correct Elfsight widget class
  const elfsightClass =
    language === 'ch-de'
      ? 'elfsight-app-edd672e9-da4b-417f-bc55-d953c937b96b'
      : 'elfsight-app-14c20c44-6945-494c-a6ed-3afe4743fa2f';

  // Render only if any device matches
  const shouldRender = isDesktop || isTablet || isMobile;

  if (!shouldRender) return null;

  return (
    <SbEditable content={blok} key={blok._uid}>
      <div {...storyblokEditable(blok)}>
        <div className={elfsightClass} data-elfsight-app-lazy></div>
      </div>
      {/* Load script once after page is interactive */}
      <Script
        src="https://static.elfsight.com/platform/platform.js"
        strategy="afterInteractive"
      />
    </SbEditable>
  );
};

export default StudentRecommendations;
