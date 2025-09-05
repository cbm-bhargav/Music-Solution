// import React from 'react';
// import Document, { Html, Head, Main, NextScript } from 'next/document';
// import { ServerStyleSheet } from 'styled-components';

// export default class CustomDocument extends Document {
//   static async getInitialProps(ctx) {
//     const sheet = new ServerStyleSheet();
//     const originalRenderPage = ctx.renderPage;

//     ctx.renderPage = () => originalRenderPage((App) => (props) => sheet.collectStyles(<App {...props} />));

//     const initialProps = await Document.getInitialProps(ctx);
//     const styleTags = sheet.getStyleElement();

//     return { ...initialProps, styleTags };
//   }

//   render() {
//     const language = this.props.__NEXT_DATA__?.query?.language;
//     const locale = language === 'ch-de' ? 'de' : 'en';
//     return (
//       <Html lang={locale}>
//         <Head>
//           {this.props.styleTags}
//           {/** Add Google fonts and Preconnect to Google Servers - Next JS will add Optimizations automatically  */}
//           <link rel='preconnect' href='https://fonts.googleapis.com' />
//           <link rel='preconnect' href='https://fonts.gstatic.com' />
//           <link rel='preconnect' href='https://www.googletagmanager.com' />

//           <link
//             href='https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
//             rel='stylesheet'
//           />
//           <style
//             dangerouslySetInnerHTML={{
//               __html: `
//                 /* fallback */
//                 @font-face {
//                   font-family: 'Material Icons Outlined';
//                   font-style: normal;
//                   font-weight: 400;
//                   font-display: swap;
//                   src: url(https://fonts.gstatic.com/s/materialiconsoutlined/v95/gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUcel5euIg.woff2) format('woff2');
//                 }
//                 .material-icons-outlined {
//                   font-family: 'Material Icons Outlined';
//                   font-weight: normal;
//                   font-style: normal;
//                   font-size: 24px;
//                   line-height: 1;
//                   letter-spacing: normal;
//                   text-transform: none;
//                   display: inline-block;
//                   white-space: nowrap;
//                   word-wrap: normal;
//                   direction: ltr;
//                   -webkit-font-smoothing: antialiased;
//                 }
//               `,
//             }}
//           />
//         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
//         </Head>
//         <body>
//           {/* Google Tag Manager (noscript)  */}
//           <noscript
//             dangerouslySetInnerHTML={{
//               __html: `
//                 <iframe 
//                   title='Google Tag Manager'
//                   src="https://www.googletagmanager.com/ns.html?id=${process.env.GOOGLE_TAG_MANAGER_ID}" 
//                   height="0" 
//                   width="0" 
//                   style="display:none;visibility:hidden"></iframe>
//               `,
//             }}
//           />
//           {/* End Google Tag Manager (noscript)  */}
//           <Main />
//           <NextScript />
//         </body>
//       </Html>
//     );
//   }
// }

// ---------------------------------------------------
// import React from 'react';
// import Document, { Html, Head, Main, NextScript } from 'next/document';
// import { ServerStyleSheet } from 'styled-components';

// export default class CustomDocument extends Document {
//   static async getInitialProps(ctx) {
//     const sheet = new ServerStyleSheet();
//     const originalRenderPage = ctx.renderPage;

//     try {
//       ctx.renderPage = () =>
//         originalRenderPage((App) => (props) => sheet.collectStyles(<App {...props} />));

//       const initialProps = await Document.getInitialProps(ctx);
//       return { ...initialProps, styles: [...initialProps.styles, sheet.getStyleElement()] };
//     } finally {
//       sheet.seal();
//     }
//   }

//   render() {
//     const language = this.props.__NEXT_DATA__?.query?.language;
//     const locale = language === 'ch-de' ? 'de' : 'en';

//     return (
//       <Html lang={locale}>
//         <Head>
//           {/* Preconnect for faster font fetching */}
//           <link rel="preconnect" href="https://fonts.googleapis.com" />
//           <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
//           <link rel="preconnect" href="https://www.googletagmanager.com" />

//           {/* Preload only modern formats (woff2) */}
//           <link
//             rel="preload"
//             href="/assets/fonts/ms_instruments.woff2"
//             as="font"
//             type="font/woff2"
//             crossOrigin="anonymous"
//           />

//           {/* Google Fonts with display=swap to avoid CLS */}
//           <link
//             href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
//             rel="stylesheet"
//           />

//           <style
//             dangerouslySetInnerHTML={{
//               __html: `
//                 /* Material Icons (use swap to avoid layout shift) */
//                 @font-face {
//                   font-family: 'Material Icons Outlined';
//                   font-style: normal;
//                   font-weight: 400;
//                   font-display: swap;
//                   src: url(https://fonts.gstatic.com/s/materialiconsoutlined/v95/gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUcel5euIg.woff2) format('woff2');
//                 }

//                 /* Custom font optimized */
//                 @font-face {
//                   font-family: 'ms_instruments';
//                   font-style: normal;
//                   font-weight: normal;
//                   font-display: swap;
//                   src: url('/assets/fonts/ms_instruments.woff2') format('woff2'),
//                        url('/assets/fonts/ms_instruments.woff') format('woff');
//                   ascent-override: 90%;
//                   descent-override: 22%;
//                   line-gap-override: 0%;
//                 }

//                 /* Fallback to Arial while custom font loads */
//                 @font-face {
//                   font-family: 'Roboto-fallback';
//                   font-style: normal;
//                   font-weight: 400;
//                   src: local('Arial');
//                   ascent-override: 92.49%;
//                   descent-override: 24.34%;
//                   line-gap-override: 0%;
//                   size-adjust: 107.4%;
//                 }

//                 .material-icons-outlined {
//                   font-family: 'Material Icons Outlined';
//                   font-weight: normal;
//                   font-style: normal;
//                   font-size: 24px;
//                   line-height: 1;
//                   letter-spacing: normal;
//                   text-transform: none;
//                   display: inline-block;
//                   white-space: nowrap;
//                   word-wrap: normal;
//                   direction: ltr;
//                   -webkit-font-smoothing: antialiased;
//                 }
//               `,
//             }}
//           />
//         </Head>
//         <body>
//           {/* Google Tag Manager (noscript) */}
//           <noscript
//             dangerouslySetInnerHTML={{
//               __html: `
//                 <iframe 
//                   title="Google Tag Manager"
//                   src="https://www.googletagmanager.com/ns.html?id=${process.env.GOOGLE_TAG_MANAGER_ID}" 
//                   height="0" 
//                   width="0" 
//                   style="display:none;visibility:hidden"></iframe>
//               `,
//             }}
//           />
//           <Main />
//           <NextScript />
//         </body>
//       </Html>
//     );
//   }
// }

// ---------------------------------------------------
import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage((App) => (props) => sheet.collectStyles(<App {...props} />));

      const initialProps = await Document.getInitialProps(ctx);
      return { ...initialProps, styles: [...initialProps.styles, sheet.getStyleElement()] };
    } finally {
      sheet.seal();
    }
  }

  render() {
    const language = this.props.__NEXT_DATA__?.query?.language;
    const locale = language === 'ch-de' ? 'de' : 'en';

    return (
      <Html lang={locale}>
        <Head>
          {/* Preconnect for faster font fetching */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://www.googletagmanager.com" />

          {/* Preload custom font (woff2 only) */}
          <link
            rel="preload"
            href="/assets/fonts/ms_instruments.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />

          {/* Google Fonts (deferred using media+onLoad) */}
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
            rel="stylesheet"
            media="print"
            onLoad="this.media='all'"
          />

          <style
            dangerouslySetInnerHTML={{
              __html: `
                /* ✅ Ensure Roboto always uses font-display: swap */
                @font-face {
                  font-family: 'Roboto';
                  font-style: normal;
                  font-weight: 100 900;
                  font-display: swap;
                  src: local('Roboto'), url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.woff2) format('woff2');
                }

                /* Material Icons (swap to avoid CLS) */
                @font-face {
                  font-family: 'Material Icons Outlined';
                  font-style: normal;
                  font-weight: 400;
                  font-display: swap;
                  src: url(https://fonts.gstatic.com/s/materialiconsoutlined/v95/gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUcel5euIg.woff2) format('woff2');
                }

                /* Custom font optimized */
                @font-face {
                  font-family: 'ms_instruments';
                  font-style: normal;
                  font-weight: normal;
                  font-display: swap;
                  src: url('/assets/fonts/ms_instruments.woff2') format('woff2'),
                       url('/assets/fonts/ms_instruments.woff') format('woff');
                  ascent-override: 90%;
                  descent-override: 22%;
                  line-gap-override: 0%;
                }

                /* Fallback to Arial while custom font loads */
                @font-face {
                  font-family: 'Roboto-fallback';
                  font-style: normal;
                  font-weight: 400;
                  src: local('Arial');
                  ascent-override: 92.49%;
                  descent-override: 24.34%;
                  line-gap-override: 0%;
                  size-adjust: 107.4%;
                }

                .material-icons-outlined {
                  font-family: 'Material Icons Outlined';
                  font-weight: normal;
                  font-style: normal;
                  font-size: 24px;
                  line-height: 1;
                  letter-spacing: normal;
                  text-transform: none;
                  display: inline-block;
                  white-space: nowrap;
                  word-wrap: normal;
                  direction: ltr;
                  -webkit-font-smoothing: antialiased;
                }
              `,
            }}
          />
        </Head>
        <body>
          {/* Google Tag Manager (noscript) */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `
                <iframe 
                  title="Google Tag Manager"
                  src="https://www.googletagmanager.com/ns.html?id=${process.env.GOOGLE_TAG_MANAGER_ID}" 
                  height="0" 
                  width="0" 
                  style="display:none;visibility:hidden"></iframe>
              `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

