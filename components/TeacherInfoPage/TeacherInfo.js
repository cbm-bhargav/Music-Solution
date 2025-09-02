import cx from 'classnames';
import Bugsnag from '@bugsnag/js';
import { useRouter } from 'next/router';
import { useSnackbar } from 'react-simple-snackbar';
import { useState, useMemo, useCallback, useEffect } from 'react';
import TeacherAssociationListPopup from './TeacherContent/TeacherAssociations/TeacherListPopup';
import TeacherGalleryPopup from './TeacherContent/TeacherContentGallery/TeacherGalleryPopup';
import TeacherPopupCourse from './TeacherContent/TeacherContentCourses/TeacherPopupCourse';
import TeacherPopupLikes from './TeacherContent/TeacherContentLikes/TeacherPopupLikes';
import TeacherPhotoPopup from './TeacherContent/TeacherContentHead/TeacherPhotoPopup';
import TeacherListPopup from './TeacherContent/TeacherExperience/TeacherListPopup';
import TeacherGuaranteePopup from './TeacherConfigurator/TeacherGuaranteePopup';
import TeacherConfigurator from './TeacherConfigurator/TeacherConfigurator';
import TeacherPopupShareLinks from './TeacherHeader/TeacherPopupShareLinks';
import AskQuestionCallback from './AskQuestion/AskQuestionCallback';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import AskQuestionPopup from './AskQuestion/AskQuestionPopup';
import { translateENtoDE } from '../../functions/translator';
import TeacherContent from './TeacherContent/TeacherContent';
import TeacherCallbackPopups from './TeacherCallbackPopups';
import TeacherInfoSupport from './TeacherInfoSupport';
import snackbarOptions from './snackbarOptions';
import { getScrollbarWidth } from '../../utils';
import { useFixedTabs } from './useFixedTabs';
import TeacherPopup from './TeacherPopup';
import TeacherContactSection from './NewTeacherSections/TeacherContactSection';
import NewTeacherInfoSupport from './NewTeacherSections/NewTeacherInfoSupport';
import GuaranteePopup from './NewTeacherSections/GuaranteePopup';

const PABBLY_URL = process.env.PABBLY_CALLBACK_URL;

const TeacherInfoPage = ({ language, teacher, seoActions = {} }) => {
  const fixedTabs = useFixedTabs();
  const { query, asPath } = useRouter();
  const [show, setShow] = useState(false);
  const [, onCopyText] = useCopyToClipboard();
  const [pageYOffset, setPageYOffset] = useState(0);
  const [openSnackbar] = useSnackbar(snackbarOptions);
  const [popupInfo, setPopupInfo] = useState({ name: null });

  const showPopup = useCallback((name, params) => {
    if (typeof window !== 'undefined') {
      setPageYOffset(() => window?.pageYOffset || 0);
    }

    setShow(true);
    setPopupInfo({ name, ...params });
  }, []);

  const hidePopup = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, pageYOffset || 0);
    }

    setShow(false);
    setPopupInfo({ name: null });
  }, [pageYOffset]);

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
      const courseData = teacher?.courses?.filter((item, index) => {
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
  }, [query, showPopup, pabblyHandle, language, teacher]);

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

  const contactHandle = () => {
    // window.scrollTo({ top: 0, behavior: 'instant' });
    showPopup('contact', {});
  };

  const pricesHandle = () => {
    showPopup('prices', {
      extraClass: 'teacher-page-popup-prices',
      title: translateENtoDE('Configure your session', language),
    });
  };

  function handleOpenGuaranteeModal() {
    showPopup('guaranteeNewPopup', {
      title: translateENtoDE('Our flexible payment options', language),
    });
  }

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

    if (name === 'education') {
      content = <TeacherListPopup name={name} language={language} data={teacher?.education} />;
    }
    if (name === 'experience') {
      content = <TeacherListPopup name={name} language={language} data={teacher?.experience} />;
    }
    if (name === 'associations') {
      content = <TeacherAssociationListPopup name={name} language={language} data={teacher?.association_list} />;
    }
    if (name === 'likes') {
      content = <TeacherPopupLikes language={language} likes={teacher?.recommendations} />;
    }
    if (name === 'links') {
      content = (
        <TeacherPopupShareLinks
          teacher={teacher}
          language={language}
          seoActions={seoActions}
          onCopyLink={(linkType) => onCopyLink({ name, linkType })}
        />
      );
    }
    if (name === 'course' || name === 'course-price') {
      content = (
        <TeacherPopupCourse
          course={course}
          teacher={teacher}
          language={language}
          hidePopup={hidePopup}
          showPopup={showPopup}
          seoActions={seoActions}
          courseIndex={courseIndex}
          courseParams={courseParams}
          isMobileOnClose={isMobileOnClose}
          isConfigurator={name === 'course-price'}
        />
      );
    }
    if (name === 'prices') {
      content = (
        <div className='configurator-fixed-mobile'>
          <TeacherConfigurator
            isModal={true}
            teacher={teacher}
            language={language}
            showPopup={showPopup}
            hidePopup={hidePopup}
            fixedTabs={fixedTabs}
            seoActions={seoActions}
            courses={teacher?.courses}
            courseParams={courseParams}
          />
        </div>
      );
    }
    if (name === 'guarantee') {
      content = <TeacherGuaranteePopup language={language} />;
    }
    if (name === 'callback') {
      content = <AskQuestionCallback language={language} />;
    }
    if (name === 'photo') {
      return <TeacherPhotoPopup teacher={teacher} onClose={hidePopup} />;
    }
    if (name === 'contact') {
      return (
        <AskQuestionPopup
          course={course}
          teacher={teacher}
          language={language}
          onClose={hidePopup}
          showPopup={showPopup}
          seoActions={seoActions}
          isSuccessPopup={isSuccessPopup}
          isConfigurator={isConfigurator}
        />
      );
    }
    if (name === 'gallery') {
      return (
        <>
          <TeacherGalleryPopup
            onClose={hidePopup}
            teacherInfo={teacher}
            slideIndex={slideIndex}
            seoActions={seoActions}
            gallery={teacher?.gallery}
          />
        </>
      );
    }

    if(name === 'guaranteeNewPopup'){
     content =<GuaranteePopup language={language} />
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
      'guaranteeNewPopup'
    ].includes(name);

    return (
      <TeacherPopup
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
      </TeacherPopup>
    );
  }, [popupInfo, hidePopup, show, language, fixedTabs, showPopup, onCopyLink, teacher, seoActions]);

  const isWindows = useMemo(() => {
    return typeof window !== 'undefined' ? navigator?.platform?.includes('Win') : false;
  }, []);

  useEffect(() => {
    document?.style?.setProperty('--scrollbar-width', `${getScrollbarWidth() || 17}px`);
  }, []);

  return (
    <div className={cx('teacher-info-page', { 'window-scrollbar': isWindows })}>
      <TeacherCallbackPopups language={language} />
      <div className='teacher-info-content-wrapper'>
        <div className='teacher-info-content'>
          <TeacherContent
            teacher={teacher}
            language={language}
            fixedTabs={fixedTabs}
            showPopup={showPopup}
            hidePopup={hidePopup}
            seoActions={seoActions}
            handleOpenGuaranteeModal={handleOpenGuaranteeModal}
          />
          <div className='min-[1101px]:block hidden h-full'>
            <TeacherContactSection teacher={teacher} contactHandle={contactHandle} language={language} pricesHandle={pricesHandle} handleOpenGuaranteeModal={handleOpenGuaranteeModal} headRef={fixedTabs?.ref?.headRef}/>
          </div>
        </div>

        <NewTeacherInfoSupport language={language} />
      </div>
      {modalComponent}
    </div>
  );
};

export default TeacherInfoPage;
