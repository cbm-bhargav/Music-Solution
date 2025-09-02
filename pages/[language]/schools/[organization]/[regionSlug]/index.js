import { getStory } from '@/utils/getStory';
import useIntersectionObserver from 'hooks/useIntersectionObserver';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import Navigation from '@/components/navigation/Navigation';
import Footer from '@/components/footer/Footer';
import OrganizationInfo from '@/components/schoolComponents/OrganizationInfo';
import SnackbarProvider from 'react-simple-snackbar';
import axios from 'axios';
import { organizationLogo } from 'data/courseData';
import { SchoolPageProvider } from '@/utils/context/SchoolPageContext';
import { getSlugAfterDash } from '@/utils/schoolpage/getSlugAfterDash';
import CustomHead from '@/components/Head';

export async function getStaticPaths() {
  const languages = ['ch-en', 'ch-de'];
  const organizations = ['mzo'];

  const url = process.env.MATCHSPACE_PROD || 'https://staging.matchspace.click';
  const paths = [];

  try {
    const { data } = await axios.get(`${url}/api/v1/auth_ms/music_school/school_regions`, {
      params: { organization: 'mzo' },
    });
    const regionSlugs = data.map((post) => post.slug);

    languages.forEach((language) => {
      organizations.forEach((organization) => {
        regionSlugs.forEach((regionSlug) => {
          paths.push({
            params: {
              language,
              organization,
              regionSlug: `music-school-${regionSlug}`,
            },
          });
        });
      });
    });
  } catch (error) {
    console.error('Error fetching region slugs:', error.message);
  }

  return {
    paths,
    fallback: 'blocking',
  };
}

// Helper function to create metadata (moved from client component)
function createMetaDataByLanguage(language, organizationData, organization, req) {
  const is_english = language === 'ch-en';
  const organizationFullName = is_english ? organizationData?.full_name?.en : organizationData?.full_name?.de;

  // Get host from request headers for server-side rendering
  const host = req?.headers?.host || 'matchspace.click';
  const protocol = req?.headers?.['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;

  const meta = {
    title: organizationFullName + ' ∙ ' + organization.toUpperCase() + ' ∙ ' + 'Matchspace Music',
    description: is_english ? organizationData?.about?.en : organizationData?.about?.de,
    og_title: organizationFullName + ' ∙ ' + organization.toUpperCase() + ' ∙ ' + 'Matchspace Music',
    og_image: baseUrl + organizationData?.organizationLogo,
    og_description: is_english ? organizationData?.about?.en : organizationData?.about?.de,
    og_type: 'website',
    og_locale: is_english ? 'en' : 'de',
    og_site_name: organizationFullName,
  };
  return meta;
}

export async function getStaticProps({ params, req }) {
  if (!params) return { notFound: true };
  const { language, organization, regionSlug: slugRegion } = params;

  if (!slugRegion || typeof slugRegion !== 'string') {
    console.error('Invalid region slug format:', slugRegion);
    return { notFound: true };
  }

  const regionSlug = getSlugAfterDash(slugRegion);
  const url = process.env.MATCHSPACE_PROD || 'https://staging.matchspace.click';
  const baseUrl = `${url}/api/v1/auth_ms/music_school`;

  try {
    const storyRes = await getStory(`/${language}`);

    let regionRes = null;
    let teachersRes = null;
    let courseRes = null;
    let instruments = null;

    try {
      regionRes = await axios.get(`${baseUrl}/show_region`, {
        params: { organization, region_slug: regionSlug },
      });
    } catch (err) {
      console.error('Failed to fetch region data:', err.message);
    }

    try {
      courseRes = await axios.get(`${baseUrl}/region_courses`, {
        params: { organization, region_slug: regionSlug },
      });
    } catch (err) {
      console.error('Failed to fetch course data:', err.message);
    }

    try {
      teachersRes = await axios.get(`${baseUrl}/region_teachers`, {
        params: { organization, region_slug: regionSlug },
      });
    } catch (err) {
      console.error('Failed to fetch teachers data:', err.message);
    }

    try {
      instruments = await axios.get(`${url}/api/v1/auth_ms/instruments`, {
        headers: {
          'X-TENANT-ID': 'matchspace',
        },
      });
    } catch (err) {
      console.error('Failed to fetch instruments data:', err.message);
    }

    if (!regionRes?.data?.region) {
      return {
        redirect: {
          destination: `/${language}/page-not-found`,
          permanent: false,
        },
      };
    }

    // Create organization data with logo from organizationLogo constant
    const organizationData = {
      ...organizationLogo,
      ...regionRes?.data?.region,
      newCourses: courseRes?.data?.courses,
    };

    // Create metadata on the server side
    const metadata = createMetaDataByLanguage(language, organizationData, organization, req);

    return {
      props: {
        initialStory: storyRes || {},
        initialRegionData: regionRes?.data || null,
        initialTeachersData: teachersRes?.data || null,
        initialCourseData: courseRes?.data?.courses || null,
        initialInstrumentsData: instruments?.data || null,
        metadata, // Pass metadata as props
        language,
        organization,
        regionSlug,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error.message);
    return { notFound: true };
  }
}

function SchoolData({
  initialStory,
  initialRegionData,
  initialTeachersData,
  initialCourseData,
  initialInstrumentsData,
  metadata, // Receive metadata from props
  language,
  organization,
  regionSlug,
  organizationId,
  noIndex,
}) {
  const router = useRouter();
  const ref = useRef(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;

  const [story, setStory] = useState(initialStory || {});
  const [organizationData, setOrganizationData] = useState({
    ...organizationLogo,
  });
  const [teachers, setTeachers] = useState(initialTeachersData?.region_teachers || []);
  const pageNoIndex = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' ? true : false;

  useEffect(() => {
    if (initialRegionData?.region || initialCourseData?.courses) {
      setOrganizationData((prev) => ({
        ...prev,
        ...initialRegionData?.region,
        newCourses: initialCourseData?.courses,
      }));
    }

   if (!initialStory || Object.keys(initialStory).length === 0) {
      const handleStory = async () => {
        try {
          const fresh = await getStory(`/${language}`);
          setStory(fresh || {});
        } catch (err) {
          console.error('Error fetching story:', err.message);
        }
      };
      handleStory();
    }

    }, [language, regionSlug, organizationId, initialRegionData, initialCourseData, initialStory]);

  let asPath = '';
  if (router.asPath.substr(-1) === '/') {
    asPath = router.asPath.substr(0, router.asPath.length - 1);
  } else {
    asPath = router.asPath;
  }

  const LoadingSpinner = () => (
    <div className='page-loading'>
      <div className='loading-balls'>
        <div className='ball first-ball mr-[12px]'></div>
        <div className='ball second-ball mr-[12px]'></div>
        <div className='ball'></div>
      </div>
    </div>
  );

  // Early return with meta tags for loading states to ensure SEO
  if (router.isFallback || Object.keys(story).length === 0) {
    return (
      <>
        <CustomHead
          meta={metadata}
          keywords={[]}
          location={asPath}
          language={language?.slice(3)}
          alternateSlug={''}
          noIndex={pageNoIndex}
        />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <div className='teacher-page teacher-info-page !px-0'>
      <CustomHead
        meta={metadata}
        keywords={[]}
        location={asPath}
        language={language?.slice(3)}
        alternateSlug={''}
        noIndex={pageNoIndex}
      />
      <Navigation
        language={language}
        languageContent={null}
        isVisible={isVisible}
        story={story}
        isOnSearchPage={true}
        isLocationPage
        showForm={[]}
        isTeacherInfoPage={true}
        isOrganizatioPage={true}
        organizationData={organizationData}
      />
      <div className='w-full max-w-[1280px] xl:max-w-[1440px] mx-auto lg:mt-6 xl:px-4'>
        <SchoolPageProvider>
          <SnackbarProvider>
            <OrganizationInfo
              organizationData={organizationData}
              language={language}
              instrumentsData={initialInstrumentsData}
              teachers={teachers}
              coursesData={initialCourseData}
            />
          </SnackbarProvider>
        </SchoolPageProvider>
      </div>
      <Footer story={story} />
    </div>
  );
}

export default SchoolData;
