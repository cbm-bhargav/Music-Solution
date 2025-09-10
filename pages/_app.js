import '../styles/globals.scss';
import '../styles/tailwind.css';
import '../styles/NewDesigns/styles.scss';
import '../styles/TeacherInfo/styles.scss';
import '../styles/TeacherSearch/styles.scss';
import '../components/InstrumentComponents/styles.scss';
import '../components/evta/styles.scss';
import '../styles/NewDesigns/langToggle.scss';

import Script from 'next/script';
import Bugsnag from '@bugsnag/js';
import React, { useEffect, useState } from 'react';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import BugsnagPerformance from '@bugsnag/browser-performance';
import Head from 'next/head';

if (!Bugsnag._client) {
  Bugsnag.start({
    apiKey: 'a9f8a6cb4a257c3e57abd95f0bd19e3f', // staging
    plugins: [new BugsnagPluginReact()],
  });

  BugsnagPerformance.start({ apiKey: 'a9f8a6cb4a257c3e57abd95f0bd19e3f' }); // staging
}

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

const MyApp = ({ Component, pageProps }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const cookies = {};
    document?.cookie?.split(';')?.forEach((item) => {
      const split = String(item || '')
        .trim()
        .split('=');
      cookies[split[0]] = split[1];
    });

    if (cookies['ms_user_id']) Bugsnag.setUser(cookies['ms_user_id']);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <link rel='preconnect' href='https://www.googletagmanager.com' />
      </Head>
      {/* GTM Script */}
      <Script
        id="google-tag-manager"
        strategy="lazyOnload" 
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.GOOGLE_TAG_MANAGER_ID}');
          `,
        }}
      />
      
      {/* End Google Tag Manager */}
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
};

export default MyApp;
