import cx from 'classnames';
import { isEmpty } from 'ramda';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getValidationSchema } from '../utils/searchFormValidationSchema';
import { getInitialLocation } from '../utils/getInitialLocation';
import TeacherPopup from './TeacherInfoPage/TeacherPopup';
import { translateENtoDE } from '../functions/translator';
import useWindowSize from '../hooks/useWindowSize';
import SearchWhite from './icons/SearchWhite.svg';
import Sticky from './StuckStickyComponent';
import Filter from './icons/Filter.svg';

const SearchMobile = dynamic(() => import('./SearchMobile'));
const SearchDesktop = dynamic(() => import('./SearchDesktop'));

const SearchForm = ({
  blok,
  filter,
  showMap,
  isOnline,
  language,
  showForm,
  setShowMap,
  instruments,
  setIsOnline,
  setIsLoading,
  isLoadingInner,
  openFilterModal,
  setIsInnerSearch,
  setIsLoadingInner,
  isLoading,
}) => {
  const router = useRouter();
  const [show, setShow] = showForm;
  const { width } = useWindowSize();
  const [scrollValue, setScrollValue] = useState(0);
  const [optionsSelectedContext, setOptionsSelectedContext] = useState([]);

  const isEnglish = language === 'ch-en';
  const options = instruments.map((items) => items) || [];
  const errorLabels = {
    locationError: translateENtoDE('Select your location', language),
    instrumentError: translateENtoDE('Select your instrument', language),
  };

  const { control, getValues, handleSubmit, setValue } = useForm({
    defaultValues: {
      location: [blok.location],
      instrument: [blok.instrument],
    },
    resolver: yupResolver(getValidationSchema(blok)),
    reValidateMode: 'onChange',
  });

  const modalShowHide = useCallback(
    (flag, closeFlag) => {
      setShow(flag);

      if (!flag && !closeFlag) {
        close(true);
      }
    },
    [setShow]
  );

  const handleClick = () => {
    setShow(true);
    setShowMap(false);
  };
  const handleClose = useCallback(() => {
    modalShowHide(false, true);
  }, [modalShowHide]);

  const onSubmit = (data) => {
    setIsLoading(true);
    setIsInnerSearch(true);
    setIsLoadingInner(true);
    modalShowHide(false, true);
    const noLocationData = isEmpty(optionsSelectedContext) || !optionsSelectedContext;
    const locationData = noLocationData ? getInitialLocation(language) : optionsSelectedContext;

    if (noLocationData) {
      setValue('location', [language === 'ch-de' ? 'Schweiz' : 'Switzerland']);
    }

    if (!isEmpty(data.instrument) && !isEmpty(locationData)) {
      let path;
      if (Array.isArray(locationData?.place_type) && !isEmpty(locationData?.place_type)) {
        if (locationData?.place_type[0] === 'address') {
          path = locationData.context
            .filter((item) => !item.id.startsWith('postcode'))
            .map((item) => `${item.text.toLowerCase()}`)
            .join('-');
        }
        if (locationData?.place_type[0] === 'postcode') {
          path = locationData.context.map((item) => `${item.text.toLowerCase()}`).join('-');
        }
        if (locationData?.place_type[0] === 'locality') {
          const localityPath = locationData.place_name.split(',');
          path = localityPath.map((item) => `${item.trim().toLowerCase()}`).join('-');
        }
        if (locationData?.place_type[0] === 'place') {
          const placePath = isEnglish ? locationData.place_name.split(',') : locationData.place_name_de.split(',');
          path = placePath.map((item) => item.trim().toLowerCase()).join('-');
        }
        if (locationData?.place_type[0] === 'region') {
          const regionPath = locationData.place_name.split(',');
          path = regionPath.map((item) => item.trim().replace(/-/g, '%20').toLowerCase()).join('-');
        }
        if (locationData?.place_type[0] === 'country') {
          const countryPath = locationData.place_name.split(',');
          path = countryPath.map((item) => item.trim().toLowerCase()).join('-');
        }
      } else {
        const queryPath = locationData.split(',');
        path = queryPath.map((item) => `${item.trim().toLowerCase()}`).join('-');
      }
      const lessonLabel = language === 'ch-en' ? 'lessons' : 'unterricht';

      const safePath = path?.replaceAll('/', '+');

      router.push(`/${language}/${data.instrument[0].toLowerCase()}-${lessonLabel}/${safePath}`, undefined, {
        shallow: false,
      });
      filter?.onReset();
      handleClose();
      // if (width <= 960) setShowMap(true);
    }
  };

  const handleLoadingEnd = useCallback(() => {
    setIsLoading(false);
    setIsInnerSearch(false);
    setIsLoadingInner(false);
  }, [setIsInnerSearch, setIsLoading,setIsLoadingInner]);

  useEffect(() => {
    router?.events?.on('routeChangeComplete', handleLoadingEnd);
    return () => {
      router?.events?.off('routeChangeComplete', handleLoadingEnd);
    };
  }, [router, handleLoadingEnd]);

  const filterButton = useMemo(() => {
    if (width >= 960) return null;

    return (
      <button
        onClick={openFilterModal}
        className={cx('teacher-search-filter-btn-mobile', {
          'teacher-search-filter-btn-active': !!filter?.isActive,
        })}>
        <Filter color={filter?.isActive ? '#ffffff' : '#21697C'} />
      </button>
    );
  }, [openFilterModal, width, filter]);

  const stickyClass = useMemo(
    () =>
      cx('sticky-search-form', {
        [`sticky-search-form-map top-[${scrollValue}px]`]: !!showMap,
      }),
    [showMap, scrollValue]
  );

  const unstuckStyles = useMemo(() => {
    return scrollValue && showMap ? { top: `${scrollValue}px` } : null;
  }, [scrollValue, showMap]);

  const onScroll = () => {
    setScrollValue(window.pageYOffset.toFixed(0));
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (width >= 969 && show) setShow(false);
  }, [width, show, setShow]);

  useEffect(() => {
    setOptionsSelectedContext(blok?.location);
  }, [blok?.location]);

  return (
    <>
      {!isLoadingInner && !isLoading && (
        <Sticky position='top' stuckClasses={stickyClass} unstuckClasses={stickyClass} isUnstuckStyles={unstuckStyles}>
          <div className='w-full search-form-block'>
            <div className='mx-auto contain sm:mt-0 flex items-center search-form-block-content'>
              <div className='w-full rounded-full mx-auto max-w-[900px] search-form-block-input'>
                <button type='button' onClick={handleClick} className='search-form-block-button'>
                  <div className='w-5 h-5 mx-[14px]'>
                    <SearchWhite />
                  </div>
                  <div className='w-full text-sm text-left truncate text-12px font-medium leading-[15px]'>
                    <span className='block font-bold tx-primary'>{getValues('instrument')}</span>
                    <span className='block tx-secondary'>{getValues('location')}</span>
                  </div>
                </button>
                <SearchDesktop
                  blok={blok}
                  control={control}
                  options={options}
                  onSubmit={onSubmit}
                  isOnline={isOnline}
                  language={language}
                  setIsOnline={setIsOnline}
                  errorLabels={errorLabels}
                  isLoading={isLoadingInner}
                  handleSubmit={handleSubmit}
                  setOptionsSelectedContext={setOptionsSelectedContext}
                />
              </div>
              {filterButton}
            </div>
          </div>
          {!!show && width < 969 && (
            <TeacherPopup
              isSearch
              name='main-search'
              onClose={handleClose}
              isFullViewModal={true}
              isFullModalStyle={true}
              title={translateENtoDE('Search', language)}>
              <SearchMobile
                show={show}
                blok={blok}
                options={options}
                control={control}
                isOnline={isOnline}
                onSubmit={onSubmit}
                language={language}
                setIsOnline={setIsOnline}
                errorLabels={errorLabels}
                isLoading={isLoadingInner}
                filterButton={filterButton}
                handleSubmit={handleSubmit}
                setOptionsSelectedContext={setOptionsSelectedContext}
              />
            </TeacherPopup>
          )}
        </Sticky>
      )}
    </>
  );
};
export default SearchForm;
