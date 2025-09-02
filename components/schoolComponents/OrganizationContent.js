import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { translateENtoDE } from 'functions/translator';
import dynamic from 'next/dynamic';

import AboutSection from './Instruments/AboutSection';
const OrganizationReviews = dynamic(() => import('./organizationReviews/OrganizationReviews'));
const ContentBlock = dynamic(() => import('../TeacherInfoPage/ContentBlock'));
const TeacherContentGallery = dynamic(() =>
  import('../TeacherInfoPage/TeacherContent/TeacherContentGallery/TeacherContentGallery')
);
const TeacherContentWrapper = dynamic(() => import('./teacherSection/TeacherContentWrapper'));
const CourseSectionWrapper = dynamic(() => import('./coursesSection/CourseSectionWrapper'));
const EventsData = dynamic(() => import('./eventCompoenents/EventsData'));
import cx from 'classnames';
import OtherLocationSection from './OtherLocationSection';
import InstrumentRelatedLocation from './instrumentRelatedLocation';
import SchoolMapBoxWrapper from './locationSection/SchoolMapBoxWrapper';
import MockDataOrganization from '../../data/schoolData.json';
import TeacherLocation from '../TeacherInfoPage/TeacherContent/TeacherLocation/TeacherLocation';
import SchoolMapBox from './locationSection/SchoolMapBox';
import { useSchoolPage } from '@/utils/context/SchoolPageContext';

function OrganizationContent({
  organizationData,
  language,
  showPopup,
  seoActions,
  shareLinkHandle,
  instrumentsData,
  teachersData,
  coursesData,
  show,
}) {
  const { query } = useRouter();
  // const [isGalleryPopup, setIsGalleryPopup] = useState(false);
  // const [slideIndex, setSlideIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('about');
  const [showMore, setShowMore] = useState(false);
  const [locations, setLocations] = useState([]);
  const sectionRefs = useRef({});
  const isScrollingByClick = useRef(false);
  const [commonFilterQuery, setCommonFilterQuery] = useState({ courseType: '', instrument: '', age: '' });
  const {setSavedInstrument} = useSchoolPage()

 const navdata = useMemo(() => {
   const items = [
     { nav: 'About', id: 'about' },
     organizationData && organizationData?.teachers && organizationData?.teachers?.length > 0 && { nav: 'Teachers', id: 'teachers' },
     coursesData && coursesData?.length > 0 && { nav: 'Courses', id: 'courses' },
     organizationData && organizationData?.gallery && organizationData?.gallery?.length > 0 && { nav: 'Gallery', id: 'gallery' },
     // { nav: 'Reviews', id: 'reviews' },
     { nav: 'Location', id: 'location' },
     { nav: 'Events', id: 'event' },
     { nav: 'More Locations', id: 'otherlocation' },
     { nav: 'More Instruments', id: 'instrument' },
   ];

   return items.filter(Boolean);
 }, [organizationData]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -75% 0px',
      threshold: 0.1,
    };

    const observerCallback = (entries) => {
      if (isScrollingByClick.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Only observe sections that exist
    navdata.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) {
        sectionRefs.current[id] = el;
        observer.observe(el);
      }
    });

    return () => {
      Object.values(sectionRefs.current).forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, [navdata]); // Add navdata as dependency

  const handleNavClick = (id) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -75;
      const y = section.getBoundingClientRect().top + window.scrollY + yOffset;

      isScrollingByClick.current = true;
      window.scrollTo({ top: y, behavior: 'smooth' });

      setActiveSection(id);

      setTimeout(() => {
        isScrollingByClick.current = false;
      }, 800);
    }

    setShowMore(false);
  };

  const visibleNavs = navdata.slice(0, 7);
  const moreNavs = navdata.slice(visibleNavs.length);
  const showMoreRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (showMoreRef.current && showMoreRef.current.contains(e.target)) {
        return;
      }
      setShowMore(false);
    }

    window.addEventListener('mousedown', handleClick);

    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const getData = async () => {
      const res = await fetch('/api/music-schools');
      const { data } = await res.json();
      setLocations(data);
    };
    getData();
  }, []);

  useEffect(() => {
    if (query && query?.instrument) {
      const findInstrument = instrumentsData?.find((item) => query?.instrument == item?.key);
      setCommonFilterQuery((prev) => ({ ...prev, instrument: findInstrument?.id }));
      setSavedInstrument(findInstrument?.id)
    }
  }, [query]);

  return (
    <div className='w-full max-w-full md:max-w-[61.7%] '>
      {navdata && (
        <div className='  sticky top-0 z-10 pl-[16px] sm:px-[20px] pt-[24px] bg-[#F3F5F6] left-0 w-full'>
          <div className='relative w-full md:max-w-full whitespace-nowrap pr-2'>
            <div className='flex items-center gap-[20px] xs:gap-[28px]  pb-[7px] mb-[13px] sticky top-0 z-50 overflow-x-auto overflow-y-hidden '>
              {visibleNavs.map((item, index) => (
                <div key={index} onClick={() => handleNavClick(item.id)}>
                  <span
                    className={`text-[13px] font-Roboto font-semibold uppercase leading-[100%] pb-[6px] cursor-pointer border-b-[3px] hover:text-black hover:border-[#21697C] ${
                      activeSection === item.id ? 'border-[#21697C] text-black' : 'border-transparent text-[#000000AD]'
                    }`}>
                    {translateENtoDE(item.nav, language)}
                  </span>
                </div>
              ))}

              {moreNavs.map((item, index) => (
                <div key={index} onClick={() => handleNavClick(item.id)} className='md:hidden'>
                  <span
                    className={`text-[13px] font-Roboto font-semibold uppercase leading-[100%] pb-[6px] cursor-pointer border-b-[3px] hover:text-black hover:border-[#21697C] ${
                      activeSection === item.id ? 'border-[#21697C] text-black' : 'border-transparent text-[#000000AD]'
                    }`}>
                    {translateENtoDE(item.nav, language)}
                  </span>
                </div>
              ))}

              {moreNavs.length > 0 && (
                <div className='relative hidden md:block'>
                  <div
                    className='text-[13px] font-Roboto font-semibold uppercase leading-[100%]  cursor-pointer border-b-[3px] border-transparent text-[#000000AD] hover:text-black pt-1.5'
                    onClick={() => setShowMore(!showMore)}>
                    {translateENtoDE('More', language)}
                  </div>
                </div>
              )}
            </div>
            {showMore && (
              <div
                ref={showMoreRef}
                className='hidden md:block absolute z-[999] right-[-0px] sm:right-[-19px] xs:right-0 top-[40px] bg-white shadow-lg rounded-lg w-max min-w-[150px] overflow-hidden'>
                {moreNavs.map((item, index) => (
                  <div key={index} onClick={() => handleNavClick(item.id)}>
                    <span className='block px-4 py-2 text-[13px] font-Roboto cursor-pointer hover:bg-gray-200'>
                      {translateENtoDE(item.nav, language)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Sections */}
      <div id='about' className='mb-[12px] sm:mb-[20px] org-gallery'>
        <div className={cx('teacher-content-block md:!rounded-xl !p-[16px] md:!p-[24px] w-full ')}>
          <div className='flex items-center gap-2 mb-[20px]'>
            <img src='/assets/images/musicschool.svg' alt='image' className='w-[32px] h-[32px]' />
            <span className='text-[15px] font-Roboto text-black/[87%] font-semibold'>
              {' '}
              {translateENtoDE('Public Music School', language)}
            </span>
          </div>
          <div className='flex sm:flex-row flex-col items-start sm:items-center gap-y-[16px] justify-between mb-[20px]'>
            <h2 className='font-bold text-[17px] sm:text-[19px] leading-[126.316%] font-Roboto '>
              {translateENtoDE('About', language)}
            </h2>
          </div>
          <AboutSection organizationData={organizationData} language={language} instrumentsData={instrumentsData} setCommonFilterQuery={setCommonFilterQuery} commonFilterQuery={commonFilterQuery}/>
        </div>
      </div>

      {organizationData && organizationData?.teachers && organizationData?.teachers?.length > 0 ? <div className='flex justify-between w-full org-gallery' id='teachers'>
        <TeacherContentWrapper
          teachersData={organizationData?.teachers}
          language={language}
          showPopup={showPopup}
          instrumentsData={instrumentsData}
          show={show}
          allOrganizationData={locations}
          commonFilterQuery={commonFilterQuery}
          setCommonFilterQuery={setCommonFilterQuery}
        />
      </div> : null}

      {coursesData && coursesData?.length > 0 ? <div id='courses' ref={null} className='mb-[12px] sm:mb-[20px] org-gallery'>
        <CourseSectionWrapper
          coursesData={coursesData}
          instrumentsData={instrumentsData}
          language={language}
          showPopup={showPopup}
          seoActions={seoActions}
          organizationData={organizationData}
          allOrganizationData={locations}
          commonFilterQuery={commonFilterQuery}
          setCommonFilterQuery={setCommonFilterQuery}
        />
      </div> : null }

      {organizationData && organizationData?.gallery && organizationData?.gallery?.length > 0 ? <div className='relative overflow-hidden z-1'>
          <div id='gallery' className='xs:h-[360px] sm:mb-[5px] [&>div]:md:rounded-xl org-gallery'>
            <ContentBlock
              name='gallery'
              language={language}
              maxItemsVisible={0}
              data={organizationData?.gallery}
              onShowPopup={showPopup}
              label={translateENtoDE('Gallery', language)}>
              <TeacherContentGallery
                gallery={organizationData?.gallery?.slice(0, 5)}
                showPopup={showPopup}
                organizationGalleryClass={'!max-w-[calc(100vw-12px)]'}
              />
            </ContentBlock>
          </div>
        </div> : null}

      {/* <div id='reviews' className='mb-[12px] md:mb-[20px] org-gallery [&>div]:md:rounded-xl '>
        <ContentBlock name='reviews' withPopup={false} language={language} label={translateENtoDE('Reviews', language)}>
          <OrganizationReviews reviews={organizationData?.reviews} language={language} />
        </ContentBlock>
      </div> */}

      <div id='location' className='mb-[12px] md:mb-[20px] org-gallery [&>div]:md:rounded-xl'>
        <ContentBlock
          name='location'
          withPopup={false}
          language={language}
          label={translateENtoDE('Location', language)}>
          <SchoolMapBoxWrapper language={language} locations={organizationData?.addresses} query={query} />
        </ContentBlock>
      </div>

      <div className='flex justify-between w-full org-gallery overflow-hidden' id='event'>
        <EventsData language={language} organizationData={organizationData} />
      </div>

      <OtherLocationSection locationsData={locations} language={language} />

      <div id='instrument' className='org-gallery'>
        <div className={cx('teacher-content-block md:!rounded-xl !px-[16px] !py-[20px] sm:!p-[20px] w-full !mb-0 ')}>
          <h2 className='font-bold text-[17px] sm:text-[19px] leading-[126.316%] font-Roboto mb-[12px]'>
            {translateENtoDE('More Instruments', language)}
          </h2>

          <InstrumentRelatedLocation
            organizationData={organizationData}
            instrumentsData={instrumentsData}
            language={language}
            locations={locations}
          />
        </div>
      </div>
    </div>
  );
}

export default OrganizationContent;
