import React from 'react';
import { NextSeo } from 'next-seo';

const Seo = ({ meta, params }) => (
  <NextSeo
    title={meta?.title || ''}
    description={meta?.description || ''}
    robotsProps={{ noarchive: true }}
    canonical={params.pageUrl}
    openGraph={{
      url: params?.pageUrl,
      images: [{ url: params?.imageUrl }],
    }}
    additionalLinkTags={params?.links || []}
    additionalMetaTags={[
      {
        property: 'og:site_name',
        content: 'Matchspace Music',
      },
      {
        property: 'og:type',
        content: `product`,
      },
      {
        property: 'og:locale',
        content: `${params.language.split('-')[1]}`,
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, user-scalable=0',
      },
    ]}
  />
);

export default Seo;
