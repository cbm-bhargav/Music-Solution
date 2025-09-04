import Bugsnag from '@bugsnag/js';
import { useRouter } from 'next/router';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import TeacherGalleryPopup from '../TeacherInfoPage/TeacherContent/TeacherContentGallery/TeacherGalleryPopup';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import { translateENtoDE } from '../../functions/translator';
import TeacherCallbackPopups from '../TeacherInfoPage/TeacherCallbackPopups';
import snackbarOptions from '../TeacherInfoPage/snackbarOptions';
import { getScrollbarWidth } from '../../utils';
import { useFixedTabs } from '../TeacherInfoPage/useFixedTabs';
import OrganizationContent from './OrganizationContent';
import { useSnackbar } from 'react-simple-snackbar';
import ContactForm from './contectUs/ContectUs';
import SchoolOrganizationCard from './SchoolOrganizationCard';
import OrganizationContentPopup from './organizationPopup';
import TeacherPopupShareLinks from '../TeacherInfoPage/TeacherHeader/TeacherPopupShareLinks';
import ShareIcon from '../icons/ShareIcon';
import Image from 'next/image';
import { useSchoolPage } from '@/utils/context/SchoolPageContext';
import CallUsComponent from './callUsComponent/CallUsComponent';
import useWindowSize from 'hooks/useWindowSize';
import SuccessFormComponent from './SuccessFormComponent';

const PABBLY_URL = process.env.PABBLY_CALLBACK_URL;

const OrganizationInfo = ({ language, organizationData, seoActions = {}, instrumentsData, teachers, coursesData }) => {
  const fixedTabs = useFixedTabs();
  const { query, asPath } = useRouter();
  const [, onCopyText] = useCopyToClipboard();
  const [openSnackbar] = useSnackbar({ snackbarOptions });
  const [popupInfo, setPopupInfo] = useState({ name: null });
  const [scrollPosition, setScrollPosition] = useState(0);
  const { currentSelectedTeacher, setCurrentSelectedTeacher, show, setShow } = useSchoolPage();
  const full_name =  organizationData && organizationData?.full_name && organizationData?.full_name[language == 'ch-en' ? 'en' : 'de']

  const showPopup = useCallback((name, params) => {
    setScrollPosition(window.scrollY);
    setShow(true);
    setPopupInfo({ name, ...params });
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  }, []);

  const hidePopup = useCallback(() => {
    setShow(false);
    setPopupInfo({ name: null });
    document.body.style.position = '';
    document.body.style.paddingRight = '';
    document.body.style.overflow = 'auto';
    window.scrollTo(0, scrollPosition);
  }, [scrollPosition]);

  const [isTeacherCardReached, setIsTeacherCardReached] = useState(false);
  const { width } = useWindowSize()

  useEffect(() => {
    setCurrentSelectedTeacher({ name: full_name });
  }, [full_name, organizationData]);

  const pabblyHandle = useCallback(async (callbackid) => {
    await fetch(PABBLY_URL, {
      method: 'POST',
      body: JSON.stringify({ callbackid }),
      headers: { 'Content-Type': 'text/plain' },
    })
      .catch((error) => {
        Bugsnag.notify(error);
        console.log('LOG: pabbly error', error);
      })
      .finally(() => {
        window.history.pushState(null, '', window.location.pathname);
      });
  }, []);

  useEffect(() => {
    if (query?.course) {
      let courseIndex = 0;
      const courseData = organizationData?.courses?.filter((item, index) => {
        if (item?.id === +query?.course) courseIndex = index;
        return item?.id === +query?.course;
      })[0];

      if (courseData) {
        showPopup('course-price', {
          course: courseData,
          courseIndex,
          extraClass: 'teacher-page-popup-course-mobile',
          title: translateENtoDE('Course details', language),
        });
      }
    }

    if (query?.gallery) {
      showPopup('gallery', { slideIndex: query?.gallery });
    }
    if (query?.tf === 'success' && localStorage.getItem('typeform_submitted')) {
      showPopup('contact', { isSuccessPopup: true });
    }
    if ((!query?.tf || (query?.tf && query?.tf !== 'success')) && localStorage.getItem('typeform_submitted')) {
      localStorage.removeItem('typeform_submitted');
    }
    if (!!query?.callback) {
      pabblyHandle(query?.callback);
      showPopup('callback', {});
    }
  }, [query, showPopup, pabblyHandle, language, organizationData?.teachers]);

  const onCopyLink = useCallback(
    ({ name, course, linkType }) => {
      const baseUrl = `${window.location.origin}${asPath.split('?')[0]}`;

      if (name === 'course' || name === 'course-price') {
        const priceQuery = `${name === 'course-price' ? '&price=true' : ''}`;
        const link = `${baseUrl}?course=${course?.id}${priceQuery}`;

        onCopyText(link);
        openSnackbar(translateENtoDE('Link copied!', language));
      }
      if (name === 'links') {
        if (linkType === 'url') onCopyText(baseUrl);
        if (linkType === 'twitter') onCopyText('https://twitter.com/');
        if (linkType === 'facebook') onCopyText('https://www.facebook.com/');
        if (linkType === 'instagram') onCopyText('https://www.instagram.com/');

        openSnackbar(translateENtoDE('Link copied!', language));
      }
    },
    [asPath, onCopyText, openSnackbar, language]
  );
  const modalComponent = useMemo(() => {
    if (!show) return null;

    const {
      name,
      title,
      course,
      extraClass,
      slideIndex,
      extraOnClose,
      courseParams,
      mobileOnClose,
      isSuccessPopup,
      isConfigurator,
      courseIndex = 0,
      isMobileOnClose,
    } = popupInfo;

    let content = null;
    const isCopyLink = !!course || name === 'gallery';

    if (name === 'links') {
      content = (
        <TeacherPopupShareLinks
          teacher={currentSelectedTeacher}
          language={language}
          seoActions={seoActions}
          onCopyLink={(linkType) => onCopyLink({ name, linkType })}
        />
      );
    }

    if (name === 'gallery') {
      return (
        <div className='[&>div]:!top-0'>
          <TeacherGalleryPopup
            onClose={hidePopup}
            teacherInfo={[]}
            slideIndex={slideIndex}
            seoActions={seoActions}
            gallery={organizationData?.gallery}
            language={language}
          />
        </div>
      );
    }

    if (name == 'contectUs') {
      content = <ContactForm organizationData={organizationData} hidePopup={hidePopup} language={language} showPopup={showPopup} />;
    }

    if (name == 'callUs') {
      content = <CallUsComponent organizationData={organizationData} hidePopup={hidePopup} language={language} />
    }

    if (name == 'success') { 
      content = <SuccessFormComponent language={language} />
    }

    const isFullModalStyle = [
      'likes',
      'prices',
      'course',
      'education',
      'guarantee',
      'experience',
      'associations',
      'course-price',
      'teachers',
      'contectUs',
      'links',
    ].includes(name);

    return (
      <div className=''>
        <OrganizationContentPopup
          name={name}
          title={title}
          onClose={hidePopup}
          isFullViewModal={true}
          extraClass={extraClass}
          isCopyLink={isCopyLink}
          extraOnClose={extraOnClose}
          mobileOnClose={mobileOnClose}
          isMobileOnClose={isMobileOnClose}
          isFullModalStyle={isFullModalStyle}
          onCopyLink={() => {
            onCopyLink({ name, course });
            if (seoActions?.share && (name === 'course' || name === 'course-price')) {
              seoActions?.share('link', 'page_course');
            }
          }}>
          {content}
        </OrganizationContentPopup>
      </div>
    );
  }, [popupInfo, hidePopup, show, language, fixedTabs, showPopup, onCopyLink, organizationData?.teachers, seoActions]);

  useEffect(() => {
    document?.style?.setProperty('--scrollbar-width', `${getScrollbarWidth() || 17}px`);
  }, []);

  const shareLinkHandle = () => {
    showPopup('links', { title: translateENtoDE('Share this page', language) });
  };

  useEffect(() => {
    const handleScroll = (e) => {
      if (window.scrollY > 500) {
        setIsTeacherCardReached(true);
      } else {
        setIsTeacherCardReached(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const success = query?.contact_form;
    if (success) {
      showPopup('success', {
        title: '',
      });
    }
  }, [query]);
 
  return (
    <div>
      {/* <div className='w-full max-w-[1440px] mx-auto  sm:mt-[24.5px] h-[141px] xs:h-[180px] sm:h-[280px]  [&>span]:!h-full pt-4 sm:pt-0 relative rounded-xl px-[8px]'>
        <Image
          src={'/assets/images/schollbg.webp'}
          alt=''
          width={1920}
          height={300}
          className='!w-full max-w-[1440px]  object-cover !h-[130px] sm:!h-[280px] rounded-xl !m-0 '
        />
        <div
          onClick={() => shareLinkHandle()}
          className=' absolute top-[30px] sm:top-[39px] right-[15px] sm:right-[40px] '>
          <div className='relative group w-[28px] sm:w-[40px] h-[28px] sm:h-[40px] bg-white rounded-full p-[6px] flex items-center justify-center cursor-pointer'>
            <ShareIcon className='w-[16px] h-[16px]' />
            <span className='absolute -top-2 right-[50%] translate-x-1/2 -translate-y-full bg-black/50  text-[12px] leading-[110%] tracking-[0.5px] font-medium text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50'>
              Share
            </span>
          </div>
        </div>
      </div> */}
      <div className="relative w-full max-w-[1440px] mx-auto sm:mt-6 rounded-xl overflow-hidden px-2">
        {/* main page background image - schollbg.web */}
        <div className="relative h-[141px] xs:h-[180px] sm:h-[280px]">
          <Image
            src="/assets/images/schollbg.webp"
            alt="School background"
            layout='fill'
            fetchPriority="high"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
            className="object-cover rounded-xl"
          />
        </div>

        {/* Share button */}
        <button
          onClick={shareLinkHandle}
          className="absolute top-[30px] sm:top-[39px] right-[15px] sm:right-[40px] group w-[28px] sm:w-[40px] h-[28px] sm:h-[40px] bg-white rounded-full flex items-center justify-center p-[6px] shadow cursor-pointer"
          aria-label="Share"
        >
          <ShareIcon className="w-[16px] h-[16px]" />
          <span className="absolute -top-2 right-1/2 translate-x-1/2 -translate-y-full bg-black/50 text-[12px] leading-[110%] tracking-[0.5px] font-medium text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Share
          </span>
        </button>
      </div>
      <TeacherCallbackPopups language={language} />

      <div className='flex md:flex-row flex-col items-center md:items-start justify-start gap-[12px] sm:gap-[25px] lg:gap-[40px]'>
        <SchoolOrganizationCard organizationData={organizationData} language={language} showPopup={showPopup} />
        <OrganizationContent
          organizationData={organizationData}
          language={language}
          showPopup={showPopup}
          seoActions={seoActions}
          instrumentsData={instrumentsData}
          teachersData={teachers}
          coursesData={coursesData}
          show={show}
        />
      </div>
      { isTeacherCardReached && width < 952 && (
        <div>
          <button
            type='button'
            onClick={() =>
              showPopup('contectUs', {
                title: translateENtoDE('Get in touch with us', language),
              })
            }
            className='fixed bottom-5 left-5 max-[600px]:w-[calc(100%-135px)] w-[240px] h-[40px] px-4 text-[15px] font-medium uppercase btn-orange  max-[600px]:tracking-[0px] z-20 whitespace-nowrap'>
            {language === 'ch-en' ? 'CONTACT US' : 'SCHREIB UNS'}
          </button>
        </div>
      )}
      {modalComponent}
    </div>
  );
};

export default OrganizationInfo;
