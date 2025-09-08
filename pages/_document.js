import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () => originalRenderPage((App) => (props) => sheet.collectStyles(<App {...props} />));

    const initialProps = await Document.getInitialProps(ctx);
    const styleTags = sheet.getStyleElement();

    return { ...initialProps, styleTags };
  }

  render() {
    const language = this.props.__NEXT_DATA__?.query?.language;
    const locale = language === 'ch-de' ? 'de' : 'en';
    return (
      <Html lang={locale}>
        <Head>
          {this.props.styleTags}
          {/** Add Google fonts and Preconnect to Google Servers - Next JS will add Optimizations automatically  */}
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://fonts.gstatic.com' />
          <link rel='preconnect' href='https://www.googletagmanager.com' />
          <link
            rel="preload"
            href="/assets/fonts/Roboto/Roboto-Regular.ttf"
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/assets/fonts/Roboto/Roboto-Bold.ttf"
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/assets/fonts/Roboto/Roboto-Light.ttf"
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/assets/fonts/Roboto/Roboto-Medium.ttf"
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
            rel='stylesheet'
          />

          <style
            dangerouslySetInnerHTML={{
              __html: `
                /* fallback */
                @font-face {
                  font-family: 'Material Icons Outlined';
                  font-style: normal;
                  font-weight: 400;
                  font-display: swap;
                  src: url(https://fonts.gstatic.com/s/materialiconsoutlined/v95/gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUcel5euIg.woff2) format('woff2');
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>
        <body>
          {/* Google Tag Manager (noscript)  */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `
                <iframe 
                  title='Google Tag Manager'
                  src="https://www.googletagmanager.com/ns.html?id=${process.env.GOOGLE_TAG_MANAGER_ID}" 
                  height="0" 
                  width="0" 
                  style="display:none;visibility:hidden"></iframe>
              `,
            }}
          />
          {/* End Google Tag Manager (noscript)  */}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
