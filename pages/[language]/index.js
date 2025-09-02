import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import TeacherCallbackPopups from '../../components/TeacherInfoPage/TeacherCallbackPopups';
import { getComponentByKey } from '../../utils/getComponentByKey';
import StoryblokService from '../../utils/storyblok-service';
import { getAlgoliaData } from '../../utils/algolia';
import Layout from '../../components/Layout';
// import { searchClient } from '../../config';

const Page = dynamic(() => import('../../components/Page'));

const LanguageIndexPage = ({ res, language, instruments }) => {
  useEffect(() => {
    StoryblokService.initEditor(this);
  }, []);

  const changeLanguage = () => {
    const { story } = res.data;
    if (story.alternates.length > 0) {
      const alternateSlug = story.alternates[0].full_slug;
      location.href = location.origin + '/' + alternateSlug;
    }
  };

  const contentOfStory = res?.data?.story?.content;
  const extendedMetaData = getComponentByKey(contentOfStory?.body, 'meta_data', 'component');
  const metaData = {
    ...contentOfStory?.meta,
    og_url: extendedMetaData?.og_url,
  };


  return contentOfStory ? (
    <Layout
      language={language}
      meta={metaData}
      keywords={contentOfStory?.keywords}
      alternateSlug={res.data.story.alternates[0].full_slug}
      languageChange={changeLanguage}
      story={contentOfStory}>
      <>
        <TeacherCallbackPopups isHomePage={true} language={language} />
        <Page
          content={contentOfStory}
          className='ms-page-scroll'
          // instruments={instruments || []}
          instruments={instruments?.data || []}
        />
      </>
    </Layout>
  ) : null;
};

export async function getStaticPaths() {
  const paths = [{ params: { language: 'ch-en' } }, { params: { language: 'ch-de' } }];
  return {
    paths,
    fallback: true,
  };
}

// const instrumentsIndex = searchClient.initIndex(process.env.ALGOLIA_INSTRUMENTS);

export async function getStaticProps({ params }) {
  StoryblokService.setQuery(params);

  let res;
  let status = 200;
  let language = params.language || 'ch-en';

  try {
    res = await StoryblokService.get(`cdn/stories/${language}`, {
      resolve_relations: 'global_reference.reference',
      sbParams: 'published',
    });
  } catch (err) {
    status = err.response.status;
  }

  // const instrumentsData = await instrumentsIndex.search('', {
  //   hitsPerPage: 300,
  // });

  const instrumentsData = await getAlgoliaData({
    type: 'instruments',
    url: process.env.ALGOLIA_URL,
  });

  const isUsername = ['ch-en', 'ch-de'].includes(params.language);

  const redirect = !isUsername
    ? {
        redirect: {
          permanent: true,
          destination: `/ch-en/teachers/${params.language}`,
        },
      }
    : {};

  return {
    props: {
      res,
      status,
      language,
      instruments: instrumentsData || [],
      // instruments: instrumentsData?.hits || [],
    },
    ...redirect,
  };
}

export default LanguageIndexPage;
