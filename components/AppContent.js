import cx from 'classnames';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { MapProvider } from 'react-map-gl';
import { useHits } from 'react-instantsearch';
import { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getFilterNewList } from './TeachersSearch/TeacherFilter/functions';
import { translateENtoDE } from '../functions/translator';
import useWindowSize from '../hooks/useWindowSize';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as algoliaCacheCommon from '@algolia/cache-common';
import algoliasearch from 'algoliasearch/lite';
const ModalComponent = dynamic(() => import('./ModalComponent'));
const MapboxMap = dynamic(() => import('./TeachersSearchMap/MapboxMap'));
const ShowModalButton = dynamic(() => import('./TeachersSearch/ShowModalButton'));
const MarketingSection = dynamic(() => import('./TeachersSearchMap/MarketingSection'));
const TeachersSearchResult = dynamic(() => import('./TeachersSearch/TeachersSearchResult'));
const TeacherFiltersPopup = dynamic(() => import('./TeachersSearch/TeacherFilter/TeacherFilter'));
const algoliaConfig = {
  appId: process.env.ALGOLIA_SEARCHAPPID || process.env.NEXT_PUBLIC_ALGOLIA_SEARCHAPPID,
  apiKey: process.env.ALGOLIA_SEARCHAPIKEY || process.env.NEXT_PUBLIC_ALGOLIA_SEARCHAPIKEY,
};

const algoliaClient = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey, {
  hostsCache: algoliaCacheCommon.createNullCache(),
  requestsCache: algoliaCacheCommon.createNullCache(),
  responsesCache: algoliaCacheCommon.createNullCache(),
});
const AppContent = (props) => {
  const {
    radius,
    showMap,
    isOnline,
    language,
    location,
    zoomLevel,
    isLoading,
    setShowMap,
    seoActions,
    showFilter,
    instrument,
    filter = {},
    instruments,
    locationGeo,
    setIsOnline,
    setIsLoading,
    aroundLatLng,
    openListPopup,
    openFilterModal,
    closeFilterModal,
    resultsStateHits,
    instrumentLocations,
    seoFilteredData,
    isSwitzerland,
    searchState
  } = props;
  const { form, onReset, setValue, setValues, isActive } = filter;

  const getAreaTeachers = useCallback(() => {
    const indexName = isSwitzerland ? process.env.ALGOLIA_TEACHERINDEX_SW : process.env.ALGOLIA_TEACHERINDEX;
    return algoliaClient.initIndex(indexName);
  }, [isSwitzerland]);

  const router = useRouter();
  const mapRef = useRef(null);
  const mapRef2 = useRef(null);
  const bottomRef = useRef(null);
  const showMapRef = useRef(null);
  const containerRef = useRef(null);

  const { hits, sendEvent } = useHits();
  const { width, height } = useWindowSize();

  const [newList, setNewList] = useState([]);
  const [isBottom, setIsBottom] = useState(false);
  const [prevMarker, setPrevMarker] = useState(null);
  const [currentUUID, setCurrentUUID] = useState(null);
  const [filterParams, setFilterParams] = useState({});
  const [mobileStatus, setMobileStatus] = useState(false);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [filteredList, setFilteredList] = useState(resultsStateHits || []);

  const [defaultList, setDefaultList] = useState([]);

  useEffect(() => {
    let data = newList.concat(resultsStateHits || []);

    if (hits?.length) {
      let extraData = {};

      hits.map((item) => {
        extraData[item?.user_id] = {
          __queryID: item?.__queryID,
          // __position: item?.__position,
        };
      });

      data = data.map((item, index) => ({
        ...item,
        ...(extraData[item?.user_id] || {}),
        __position: index + 1,
      }));
    }

    setDefaultList(data);
  }, [hits, newList, resultsStateHits]);

  const openMapModal = () => {
    if (!isBottom) setShowMap(true);
  };
  const closeMapModal = () => {
    setShowMap(false);
    setCurrentUUID(null);
    setCurrentMarker(null);
    window?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const coords = aroundLatLng?.split(',') || [];
  const lat = coords[0];
  const lng = coords[1];

  const list = newList.concat(resultsStateHits || []);
  const refs = filteredList.reduce((acc, value) => {
    acc[value?.username || value?.user_id] = createRef();

    return acc;
  }, {});

  const markers = useMemo(
    () =>
      filteredList
        .map((item) => {
          const locations = item?.locations;
          const studios = locations?.studios?.checked ? locations?.studios?.address_list : [];
          const teacher = locations?.teacher_place?.checked ? locations?.teacher_place?.address : [];
          const place = locations?.student_place?.checked ? locations?.student_place?.address_list : [];

          const allLocations = [...studios, teacher, ...place]
            .flat()
            .filter(
              (item) =>
                !!item &&
                !!item?.latitude &&
                !!item?.longitude &&
                !(item.latitude > 90 || item.latitude < -90 || item.longitude > 90 || item.longitude < -90)
            )
            .map((item) => `${item?.latitude}-${item?.longitude}`);
          return {
            ...item,
            _geoloc: item?._geoloc.filter((geo) => !!allLocations.includes(`${geo?.lat}-${geo?.lng}`)),
          };
        })
        .map((item) => {
          const geoStrings = item._geoloc.filter((geo) => !!geo?.lat).map((geo) => Object.values(geo).join(','));
          const uniqueGeo = [...new Set(geoStrings)].map((geo) => geo.split(','));

          return uniqueGeo.map((geoItem) => ({
            id: item.username || item.user_id,
            name: item.name,
            latitude: geoItem[0],
            longitude: geoItem[1],
            avatar_path: item.avatar_path,
            recommendations: item.recommendations,
            teacher: item,
            profile_type: item?.profile_type,
            uuid: uuidv4(),
          }));
        })
        .flat().map((data)=>{
           if (data?.profile_type === 'music_school') {
             return {
               ...data,
               id:data?.teacher?.mzo_region_full_name?.de || data?.teacher?.user_id,
               name:
                 language === 'ch-en'
                   ? data?.teacher?.mzo_region_full_name?.en
                   : data?.teacher?.mzo_region_full_name?.de,
               avatar_path: data?.teacher?.avatar_path,
             };
           }
           return data;
        }),
    [filteredList]
  );
  const onSearchInArea = useCallback(
    (lat, lng, callback) => {
      getAreaTeachers().search(instrument?.key, {
          advancedSyntax: true,
          aroundRadius: 40000,
          aroundLatLng: `${lat}, ${lng}`,
        })
        .then(({ hits }) => {
          const ids = filteredList.map((item) => item?.user_id);
          const newTeachers = hits.filter((item) => !ids?.includes(item?.user_id));
          setNewList(newTeachers);
          setFilteredList(() => newTeachers.concat(filteredList));
        })
        .finally(() => callback && callback());
    },
    [instrument, filteredList,getAreaTeachers]
  );

  const scrollHandle = useCallback(() => {
    if (width <= 550) {
      const offerBottom = bottomRef?.current?.getBoundingClientRect()?.bottom;
      const showMapBottom = showMapRef?.current?.getBoundingClientRect()?.bottom;

      setIsBottom(offerBottom < showMapBottom);
    } else {
      setIsBottom(false);
    }
  }, [width, bottomRef, showMapRef]);

  useEffect(() => {
    window.addEventListener('scroll', scrollHandle);
    return () => {
      window.removeEventListener('scroll', scrollHandle);
    };
  }, [scrollHandle]);

  useEffect(() => {
    // const headerOffset = containerRef?.current?.getBoundingClientRect()?.top - 220;
    // const elementPosition = refs[currentMarker]?.current?.getBoundingClientRect()?.top;
    // const offsetTop = elementPosition - headerOffset;

    if (mobileStatus) {
      // refs[currentMarker]?.current?.scrollIntoView();
      setMobileStatus(false);
    } else {
      if (currentMarker && (window.innerWidth || document.documentElement.clientWidth) > 960) {
        if (!prevMarker || currentMarker !== prevMarker) {
          // window.scrollTo({ top: offsetTop, behavior: 'smooth' });
          setPrevMarker(currentMarker);
        }
      }
    }
  }, [currentMarker, prevMarker, refs, mobileStatus]);

  const mapStyles = useMemo(
    () => ({
      height: showMap ? `${height - 60}px` : '550px',
      borderRadius: showMap ? 0 : '12px',
    }),
    [showMap, height]
  );

  useEffect(() => {
    // Extract the path from the current location
    const path = location.language;

    // Check if the path matches the pattern for a teacher URL
    if (path) {
      // Extract the teacher's name from the path
      const teacherName = path.split('/')[1];

      fetch(`${window.location.origin}/.netlify/functions/validate-teacher?name=${teacherName}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.isValidTeacher) {
            // Redirect to the validated teacher's page with language prefix
            router.push(`/ch-en/teachers/${teacherName}`);
          } else {
            // Redirect to the 'not found' page
            router.push('/ch-en/?teachers=notfound');
          }
        });
    }
  }, [location, router]);

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (setIsLoading && isLoading) {
      const list = document.getElementById('await-loading');

      if (list || counter === 4) {
        setIsLoading(false);
      } else {
        setTimeout(() => setCounter((value) => value + 1), 1000);
      }
    }
  }, [width, counter, isLoading, setIsLoading]);

  const [prevIsOnline, setPrevIsOnline] = useState(isOnline);

  const resetFilter = useCallback(() => {
    onReset();
    setFilterParams({});
  }, [onReset, setFilterParams]);

  useEffect(() => {
    setCurrentUUID(null);
    setCurrentMarker(null);

    getFilterNewList(form, newList.concat(resultsStateHits || []), setFilteredList, resetFilter);
  }, [form, newList, resultsStateHits, resetFilter]);

  useEffect(() => {
    if (isOnline !== prevIsOnline && Object.values(form).includes(true)) {
      getFilterNewList(form, defaultList, setFilteredList, resetFilter);
      setPrevIsOnline(isOnline);
    }
  }, [form, isOnline, prevIsOnline, defaultList, resetFilter]);

  const locationName = `${location || ''}`.split(',')[0];
  return (
    <>
      <MapProvider>
        <main ref={containerRef} className='mx-auto lg:container'>
          <div
            className={cx('teacher-search-container', {
              'teacher-search-container-empty': !filteredList?.length,
            })}>
            {!isLoading && (
              <TeachersSearchResult
                radius={radius}
                showMap={showMap}
                language={language}
                location={location}
                teachersRefs={refs}
                sendEvent={sendEvent}
                bottomRef={bottomRef}
                seoActions={seoActions}
                instrument={instrument}
                locationGeo={locationGeo}
                instruments={instruments}
                locationName={locationName}
                teachersList={filteredList}
                filterParams={filterParams}
                currentMarker={currentMarker}
                seoFilteredData={seoFilteredData}
                instrumentLocations={instrumentLocations}
                searchState={searchState}
                form={form}
                filterButton={
                  <>
                    {!!filteredList?.length && (
                      <ShowModalButton
                        icon='filter'
                        id='filter-id'
                        isActive={isActive}
                        onClick={openFilterModal}
                        label={translateENtoDE('Filters', language)}
                      />
                    )}
                  </>
                }
                showMapButton={
                  <>
                    {!!filteredList?.length && (
                      <ShowModalButton
                        icon='map'
                        id='map-id'
                        onClick={openMapModal}
                        seoActions={seoActions}
                        label={translateENtoDE('Show map', language)}
                      />
                    )}
                  </>
                }
              />
            )}

            <div className='teacher-search-mapbox'>
              <div className='sticky top-28 overflow-hidden rounded-xl'>
                {!isLoading && (
                  <>
                    <MapboxMap
                      isSearchPage
                      id='desktopMap'
                      mapRef={mapRef}
                      markers={markers}
                      language={language}
                      isFitBounds={false}
                      zoomLevel={zoomLevel}
                      instrument={instrument}
                      seoActions={seoActions}
                      styleContent={mapStyles}
                      currentUUID={currentUUID}
                      latitude={lat || '47.394'}
                      longitude={lng || '8.445'}
                      filterParams={filterParams}
                      locationName={locationName}
                      currentMarker={currentMarker}
                      openListPopup={openListPopup}
                      setCurrentUUID={setCurrentUUID}
                      onSearchInArea={onSearchInArea}
                      setCurrentMarker={setCurrentMarker}
                    />
                    <MarketingSection language={language} seoActions={seoActions} />
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
        {showFilter && !isLoading && (
          <TeacherFiltersPopup
            list={list}
            form={form}
            onReset={onReset}
            isOnline={isOnline}
            setValue={setValue}
            language={language}
            setValues={setValues}
            seoActions={seoActions}
            setIsOnline={setIsOnline}
            defaultList={defaultList}
            onClose={closeFilterModal}
            setFilterParams={setFilterParams}
            setFilteredList={setFilteredList}
          />
        )}
        {showMap && !isLoading && (
          <ModalComponent
            isMapModal
            show={showMap}
            className={'md:hidden'}
            handleClose={closeMapModal}
            contentClass='teacher-search-map-content'
            title={translateENtoDE('Search', language)}>
            <div className='relative pt-[64px]'>
              <ShowModalButton
                icon='list'
                id='list-id'
                seoActions={seoActions}
                onClick={closeMapModal}
                extraClass='teacher-search-show-list-btn'
                label={translateENtoDE('Show list', language)}
              />
              <MapboxMap
                isSearchPage
                id='desktopMap2'
                mapRef={mapRef2}
                markers={markers}
                isFitBounds={false}
                language={language}
                zoomLevel={zoomLevel}
                isMobileVersion={true}
                seoActions={seoActions}
                instrument={instrument}
                styleContent={mapStyles}
                instruments={instruments}
                currentUUID={currentUUID}
                latitude={lat || '47.394'}
                longitude={lng || '8.445'}
                locationName={locationName}
                filterParams={filterParams}
                currentMarker={currentMarker}
                onSearchInArea={onSearchInArea}
                setCurrentUUID={setCurrentUUID}
                setMobileStatus={setMobileStatus}
                setCurrentMarker={setCurrentMarker}
              />
            </div>
          </ModalComponent>
        )}
      </MapProvider>
    </>
  );
};

export default AppContent;
