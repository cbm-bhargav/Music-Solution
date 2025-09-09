// import '../styles/globals.scss';
// import '../styles/tailwind.css';
// import '../styles/NewDesigns/styles.scss';
// import '../styles/TeacherInfo/styles.scss';
// import '../styles/TeacherSearch/styles.scss';
// import '../components/InstrumentComponents/styles.scss';
// import '../components/evta/styles.scss';
// import '../styles/NewDesigns/langToggle.scss';

// import Script from 'next/script';
// import Bugsnag from '@bugsnag/js';
// import React, { useEffect, useState } from 'react';
// import BugsnagPluginReact from '@bugsnag/plugin-react';
// import BugsnagPerformance from '@bugsnag/browser-performance';

// if (!Bugsnag._client) {
//   Bugsnag.start({
//     apiKey: 'a9f8a6cb4a257c3e57abd95f0bd19e3f', // staging
//     plugins: [new BugsnagPluginReact()],
//   });

//   BugsnagPerformance.start({ apiKey: 'a9f8a6cb4a257c3e57abd95f0bd19e3f' }); // staging
// }

// const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

// const MyApp = ({ Component, pageProps }) => {
//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     const cookies = {};
//     document?.cookie?.split(';')?.forEach((item) => {
//       const split = String(item || '')
//         .trim()
//         .split('=');
//       cookies[split[0]] = split[1];
//     });

//     if (cookies['ms_user_id']) Bugsnag.setUser(cookies['ms_user_id']);
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoaded(true);
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <>
//       {/* Google Tag Manager */}
//       <link rel='preconnect' href='https://www.googletagmanager.com' />
//       {isLoaded && (
//         <Script
//           id='google-tag-manager'
//           dangerouslySetInnerHTML={{
//             __html: `
//           (function(w, d, s, l, i){
//             w[l] = w[l] || [];
//             w[l].push({ 'gtm.start': new Date().getTime(),event:'gtm.js' });
//             var f = d.getElementsByTagName(s)[0];
//             var j = d.createElement(s);
//             var dl = l != 'dataLayer' ? '&l='+l : '';
//             j.async=true;
//             j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
//             f.parentNode.insertBefore(j,f);
//           })(window, document, 'script', 'dataLayer', '${process.env.GOOGLE_TAG_MANAGER_ID}');
//         `,
//           }}
//         />
//       )}
//       {/* End Google Tag Manager */}
//       <ErrorBoundary>
//         <Component {...pageProps} />
//       </ErrorBoundary>
//     </>
//   );
// };

// export default MyApp;
import '../styles/globals.scss';
import '../styles/tailwind.css';
import '../styles/NewDesigns/styles.scss';
import '../styles/TeacherInfo/styles.scss';
import '../styles/TeacherSearch/styles.scss';
import '../components/InstrumentComponents/styles.scss';
import '../components/evta/styles.scss';
import '../styles/NewDesigns/langToggle.scss';

import Script from 'next/script';
import React, { useEffect, useState } from 'react';

let Bugsnag, BugsnagPerformance, BugsnagPluginReact;

const MyApp = ({ Component, pageProps }) => {
  const [ErrorBoundary, setErrorBoundary] = useState(() => ({ children }) => <>{children}</>); // ✅ default passthrough

  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined') {
        const bugsnag = await import('@bugsnag/js');
        const bugsnagReact = await import('@bugsnag/plugin-react');
        const bugsnagPerf = await import('@bugsnag/browser-performance');

        Bugsnag = bugsnag.default;
        BugsnagPluginReact = bugsnagReact.default;
        BugsnagPerformance = bugsnagPerf.default;

        if (!Bugsnag._client) {
          Bugsnag.start({
            apiKey: 'a9f8a6cb4a257c3e57abd95f0bd19e3f',
            plugins: [new BugsnagPluginReact()],
          });
          BugsnagPerformance.start({ apiKey: 'a9f8a6cb4a257c3e57abd95f0bd19e3f' });
        }

        const EB = Bugsnag.getPlugin('react').createErrorBoundary(React);
        setErrorBoundary(() => EB); // ✅ store the boundary component
      }
    })();
  }, []);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoaded && (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
            `,
          }}
        />
      )}

      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
};

export default MyApp;
