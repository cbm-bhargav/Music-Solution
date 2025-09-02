import qs from 'qs';
import cx from 'classnames';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { isMobile } from 'react-device-detect';
import algoliasearch from 'algoliasearch/lite';
import { compose, join, map, split, toLower } from 'ramda';
import * as algoliaCacheCommon from '@algolia/cache-common';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { getTeacherSearchStructureData } from '../utils/getTeacherSearchStructureData';
import useSearchFilter from './TeachersSearch/TeacherFilter/useSearchFilter';
import { attributesToRetrieve } from '../constants/algoliaAttributes';
import useSearchAnalytics from './TeachersSearch/useSearchAnalytics';
import { useIntersectionObserver } from '../hooks/usehooks-ts';
import { ogTitleDe } from '../utils/translationExceptionsDe';
import { getLocation, getScrollbarWidth } from '../utils';
import { translateENtoDE } from '../functions/translator';
import useWindowSize from '../hooks/useWindowSize';
import { DEFAULT_SEARCH_PROPS } from '../config';
import Header from './Header';
import Seo from './Seo';
import instrumentseodata from '../data/InstrumentSeoData.ts';
import templatemapping from '../data/TemplateMapping.json';
import InstrumentLocationEn from '../data/instrument-location-en.json';
import InstrumentLocationDe from '../data/instrument-location-de.json';

const ShowModalButton = dynamic(() => import('./TeachersSearch/ShowModalButton'));
const CardComponent = dynamic(() => import('./TeachersSearch/CardComponent'));
const TeacherPopup = dynamic(() => import('./TeacherInfoPage/TeacherPopup'));
const StructuredData = dynamic(() => import('./StructuredData'));
const App = dynamic(() => import('./App'));
const Footer = dynamic(() => import('./footer/Footer'));
const SearchForm = dynamic(() => import('./SearchFormOnSearch'));
const Navigation = dynamic(() => import('./navigation/Navigation'));

const mapboxToken = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const createURL = (state) => `?${qs.stringify(state)}`;

const toTitleCase = (strtochange) =>
  strtochange.toLowerCase().replace(/(?:^|[\s-/])\w/g, (match) => match.toUpperCase());
const capitalize = (props) => toTitleCase(props);
const titleCase = compose(join(' '), map(capitalize), split(' '), toLower);

const algoliaConfig = {
  appId: process.env.ALGOLIA_SEARCHAPPID || process.env.NEXT_PUBLIC_ALGOLIA_SEARCHAPPID,
  apiKey: process.env.ALGOLIA_SEARCHAPIKEY || process.env.NEXT_PUBLIC_ALGOLIA_SEARCHAPIKEY,
};

const algoliaClient = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey, {
  hostsCache: algoliaCacheCommon.createNullCache(),
  requestsCache: algoliaCacheCommon.createNullCache(),
  responsesCache: algoliaCacheCommon.createNullCache(),
});

const getTeachers = (isReplica) => {
  const indexName = isReplica ? process.env.ALGOLIA_TEACHERINDEX_SW : process.env.ALGOLIA_TEACHERINDEX;

  return algoliaClient.initIndex(indexName);
};

const LocationPage = ({
  story,
  params,
  radius,
  userToken,
  zoomLevel,
  ipAddress,
  instrument,
  instruments,
  searchState,
  aroundLatLng,
  locationName,
  resultsState,
  isSwitzerland,
  _prevInstrument,
  locationData,
  _online,
}) => {
  const ref = useRef(null);
  const { query } = useRouter();
  const [show, setShow] = useState(false);
  const [counter, setCounter] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);
  const [prevCounter, setPrevCounter] = useState(0);
  const [onlineTeachers, setOnlineTeachers] = useState([]);
  const [isInnerSearch, setIsInnerSearch] = useState(false);
  const [isLoadingInner, setIsLoadingInner] = useState(false);
  const [prevInstrument, setPrevInstrument] = useState(_prevInstrument);
  const [isOnline, setIsOnline] = useState(!!query?.online || resultsState?.length <= 5);
  const showForm = [show, setShow];
  const locationSections = params?.location?.replaceAll('+', '/').split('-');
  const locationItems = locationSections.map((item) => titleCase(item)).join(', ');
  const [currentSearchState, setSearchState] = useState(searchState);
  const onSearchStateChange = (searchState) => {
    setSearchState(searchState);
  };
  const isCountry = locationSections.length === 1;

  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;
  const instrumentName = params.language == 'ch-en' ? instrument?.en || '' : instrument?.de || '';

  const locationItemsDE = isCountry ? `der ${locationItems?.split(',')[0]}` : locationItems?.split(',')[0];

  const searchProps = {
    instrument_hint: params.instrument,
    instrument_placeholder: params.language == 'ch-en' ? instrument?.en : instrument?.de,
    instrument: params.language == 'ch-en' ? instrument?.en : instrument?.de,
    location: locationItems,
    location_hint: locationItems,
    location_placeholder: locationItems,
    submit_text: 'Suchen',
    instrumentError: params.language == 'ch-en' ? 'Select your instrument' : 'Wähle dein Instrument aus',
    locationError: params.language == 'ch-en' ? 'Select your location' : 'Wähle deinen Unterrichtsort aus',
  };
  const filter = useSearchFilter();
  const [showFilter, setShowFilter] = useState(false);

  const seoParams = {
    ...params,
    pageUrl: typeof window === 'undefined' ? '' : window.location.href,
    imageUrl: `https://d1qzgjer0zdepi.cloudfront.net/courses/${instrument?.key}.jpeg`,
  };

  const [locationGeo, setLocationGeo] = useState('');

  const updateLocationGeo = useCallback(async () => {
    const center = await getLocation({ location: locationItems, language: params?.language }, mapboxToken);

    setLocationGeo(() => center);
  }, [locationItems, params]);

  const teachers = useMemo(() => resultsState || [], [resultsState]);

  useEffect(() => {
    if (!onlineTeachers.length && _online?.length) {
      const uniqueTeachers = _online.filter((obj1) => {
        return !teachers.some((obj2) => obj2?.user_id === obj1?.user_id);
      });

      setOnlineTeachers(uniqueTeachers);
    }
  }, [_online, teachers, onlineTeachers]);
  
  const resultsStateHits = useMemo(() => {
    const uniqueTeachers = onlineTeachers.filter((obj1) => {
      return !teachers.some((obj2) => obj2?.user_id === obj1?.user_id);
    });

    const all = [...teachers, ...(isOnline ? uniqueTeachers : [])].filter((a) => {
      return !!(a?.instruments?.filter((b) => {
        return a?.profile_type === "music_school" || b?.key === instrument?.key;
      })).length;
    });

    return all.filter(
    (teacher, index, self) => {
      if (teacher?.profile_type === "music_school") return true;

      return (
        index ===
        self.findIndex(
          (t) =>
            t?.user_id === teacher?.user_id &&
            t?.username === teacher?.username
        )
      );
    }
    );
  }, [isOnline, teachers, instrument, onlineTeachers]);

  const seoActions = useSearchAnalytics({
    location_id: locationGeo,
    location_name: locationItems,
    instrument_key: instrument?.key,
    instrument_name: instrumentName,
    user_language: params?.language,
    search_instrument_name: instrumentName,
    search: resultsStateHits,
    algolia_user_token: userToken,
  });

  const openFilterModal = () => {
    setShowFilter(true);
    seoActions?.searchFilterView();
  };

  const closeFilterModal = () => setShowFilter(false);

  useEffect(() => {
    updateLocationGeo();
    document?.style?.setProperty('--scrollbar-width', `${getScrollbarWidth() || 17}px`);
  }, [updateLocationGeo]);

  const cookies = useMemo(() => {
    const data = {};

    if (typeof window !== 'undefined') {
      document?.cookie?.split(';')?.map((item) => {
        const split = String(item || '')
          .trim()
          .split('=');
        data[split[0]] = split[1];
        return item;
      });
    }

    return data;
  }, []);

  const analyticsTags = useMemo(
    () => [
      `lang ${params?.language?.split('-')[1]}`,
      `hn ${typeof window !== 'undefined' ? window.location.origin : ''}`,
      `allOnline ${isOnline}`,
      `device ${isMobile ? 'mobile' : 'desktop'}`,
      `user_role ${cookies['user_role'] || '-'}`,
    ],
    [cookies, isOnline, params.language]
  );

  const getOnlineTeachers = useCallback(async () => {
    await getTeachers(isSwitzerland)
      .search(`${instrument?.key} ${aroundLatLng} ${locationName || locationItems}`, {
        analyticsTags,
        hitsPerPage: 500,
        attributesToRetrieve,
        getRankingInfo: true,
        advancedSyntax: true,
        optionalWords: [aroundLatLng, `${locationName || locationItems}`],
      })
      .then(({ hits }) => {
        const filtered = hits.filter((item) => !!item?.locations?.online);
        setOnlineTeachers(filtered);
      })
      .finally(() => {
        setIsUpdated(true);
        setPrevInstrument(instrument?.key);
      });
  }, [isSwitzerland, instrument, aroundLatLng, locationItems, locationName, analyticsTags]);

  useEffect(() => {
    if (isUpdated && prevInstrument && prevInstrument !== instrument?.key) {
      setIsUpdated(false);
    }

    if (!isUpdated && prevInstrument && prevInstrument !== instrument?.key) {
      getOnlineTeachers();
    }
  }, [isUpdated, instrument, prevInstrument, getOnlineTeachers]);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 1000);
  }, []);

  const innerSearchHandle = useCallback(
    (value) => {
      setIsInnerSearch(value);
      if (!value) setCounter(counter + 1);
    },
    [counter]
  );

  useEffect(() => {
    if (counter && counter > prevCounter && teachers?.length <= 5) {
      setPrevCounter(counter);
      setIsOnline(true);
    }
  }, [counter, prevCounter, teachers]);

  const [seoFilteredData, setSeoFilterdData] = useState([]);
  const [instrumentLocationsData, setInstrumentLocationsData] = useState([]);

  useEffect(() => {
    const loadInstrumentLocations = async () => {
      const data = params.language === 'ch-en' ? InstrumentLocationEn : InstrumentLocationDe;

      const isSwitzerlandRegion = locationData?.context?.find((data) => data.id === 'country.8748');

      const reagionCode = isSwitzerlandRegion ? locationData.context[0].short_code : 'OTHER';
      const filterRelatedLocation = data.filter((data) => data.region_code_full === reagionCode);
      const result =
        filterRelatedLocation.length > 0
          ? filterRelatedLocation
          : data.filter((data) => data.region_code_full === 'OTHER');

      const instrumentKey = `${
        params.language == 'ch-en' ? instrument?.en.toLowerCase() : instrument?.de.toLowerCase()
      }`;
      const transformOptions = {
        oldInstrument: params.language == 'ch-en' ? '{{instrument_en}}' : '{{instrument_de}}',
        newInstrument: instrumentKey,
        oldLesson: params.language == 'ch-en' ? '{{instrument_en}}' : '{{instrument_de}}',
        newLesson: instrumentKey,
        oldUrl: params.language == 'ch-en' ? '{{instrument_slug_en}}' : '{{instrument_slug_de}}',
        newUrl: instrumentKey,
        olddelimeter: '{{delimeter_lessons}}',
        newdelimeter: `${instrument?.delimiters?.lessons}`,
      };
      const updatedResult = result.map((item) => ({
        ...item,
        instrument: item.instrument.replace(transformOptions.oldLesson, transformOptions.newLesson),
        region_title: item.region_title.replace(transformOptions.oldLesson, transformOptions.newLesson),
        location_title: item.location_title
          .replace(transformOptions.oldInstrument, transformOptions.newInstrument)
          .replace(transformOptions.olddelimeter, transformOptions.newdelimeter),
        location_url: item.location_url.replace(transformOptions.oldUrl, transformOptions.newUrl),
        grammatical_delimeter: item.grammatical_delimeter.replace(
          transformOptions.olddelimeter,
          transformOptions.newdelimeter
        ),
      }));
      if (updatedResult) {
        setInstrumentLocationsData(updatedResult);
      }
    };

    loadInstrumentLocations();
  }, [params.language, instrument, locationName, locationData]);

  useEffect(() => {
    function handleFilter(instrument, language) {
      const filteredData = templatemapping
        .map((item) => {
          if (item.instrument_key == instrument) {
            const find = instrumentseodata.find((desc) => {
              return (
                (item?.instrument_key == 'vocal'
                  ? desc?.instrument == item?.instrument_key
                  : desc?.instrument?.includes(item?.instrument_key)) && desc?.lng == language
              );
            });
            return find;
          }
          return null;
        })
        .filter(Boolean);

      if (filteredData) {
        setSeoFilterdData(filteredData);
      }

      const isGenericInstrument = templatemapping.some((item) => item.instrument_key.includes(instrument));
      if (filteredData.length == 0 && !isGenericInstrument) {
        const genericMatches = instrumentseodata.filter((item) => item.instrument == 'generic' && item.lng == language);
        setSeoFilterdData(genericMatches);
      }
    }
    const languageParticular = params.language.split('-')[1];

    handleFilter(instrument.key, languageParticular);
  }, [params, instrument]);

  const { width } = useWindowSize();
  const [isOpen, setIsOpen] = useState(false);
  const [popupList, setPopupList] = useState({});

  const openListPopup = useCallback((arr = []) => {
    setIsOpen(true);
    setPopupList(arr);
  }, []);

  const closeListPopup = useCallback(() => {
    setIsOpen(false);
    setPopupList([]);
  }, []);

  useEffect(() => {
    if (width <= 960 && isOpen) closeListPopup();
  }, [width, isOpen, closeListPopup]);

  const [isFirstShow, setIsFirstShow] = useState(false);

  useEffect(() => {
    if (width <= 960 && !showMap && !isFirstShow && false) {
      setIsFirstShow(true);
      setShowMap(true);
    }
  }, [width, showMap, isFirstShow]);

  const isWindows = useMemo(() => {
    return typeof window !== 'undefined' ? navigator?.platform?.includes('Win') : false;
  }, []);

  const indexName = useMemo(() => {
    if (isSwitzerland) return process.env.ALGOLIA_TEACHERINDEX_SW;
    return process.env.ALGOLIA_TEACHERINDEX;
  }, [isSwitzerland]);

  const meta = {
    description:
      params?.language == 'ch-en'
        ? `${
            resultsStateHits?.length
          } ${instrumentName} qualified teachers nearby. ⭐️ Personalized ${instrumentName} lessons in ${
            locationItems?.split(',')[0]
          } for all ages & levels. ⭐️ Find your perfect teacher today`
        : `${resultsStateHits?.length} qualifizierte Lehrer in der Nähe. ⭐️ Individueller ${ogTitleDe(
            instrumentName
          )} in ${locationItemsDE?.split(',')[0]} für jedes Alter & Niveau. ⭐️ Finde heute deine perfekte Lehrperson`,
    title:
      params?.language == 'ch-en'
        ? `Flexible ${instrumentName} lessons in ${
            locationItems?.split(',')[0]
          }. Learn ${instrumentName} with private classes`
        : `Flexibler ${ogTitleDe(instrumentName)} in ${
            locationItemsDE?.split(',')[0]
          }. ${instrumentName} lernen im Privatunterricht`,
  };
  return (
    <>
      {!!(isLoading || isLoadingInner) && (
        <div className='page-loading'>
          <div className='loading-balls'>
            <div className='ball first-ball mr-[12px]'></div>
            <div className='ball second-ball mr-[12px]'></div>
            <div className='ball'></div>
          </div>
        </div>
      )}
      <div className={cx('teacher-search-page', { 'window-scrollbar': isWindows })}>
        <Seo params={seoParams} meta={meta} />
        {!!isOpen && !!popupList?.data?.length && !isLoading && (
          <TeacherPopup
            name='teachers-list'
            isFullViewModal={true}
            isFullModalStyle={true}
            onClose={closeListPopup}
            title={`${popupList?.data?.length} ${params?.language === 'ch-en' ? 'Teachers' : 'Lehrpersonen'}`}>
            <div className='pr-[5px]'>
              <ol className='max-h-[550px] min-w-[700px] overflow-y-scroll pt-[20px] pb-[4px] visible-scrollbar'>
                {popupList?.data?.map((item, index) => (
                  <li key={`${index}`} className='mb-[16px]'>
                    <CardComponent
                      active={false}
                      teacherIndex={index}
                      blok={item?.teacher}
                      instrument={instrument}
                      seoActions={seoActions}
                      language={params?.language}
                      instruments={instruments.hits}
                      filterParams={popupList?.filterParams || {}}
                    />
                  </li>
                ))}
              </ol>
            </div>
          </TeacherPopup>
        )}
        {visible && (
          <StructuredData
            data={getTeacherSearchStructureData({
              meta,
              seoParams,
              instrument,
              search: resultsStateHits,
              language: params?.language || 'ch-en',
            })}
          />
        )}
        {!isLoading && (
          <>
            <Navigation
              language={params?.language}
              languageContent={null}
              isVisible={isVisible}
              story={story}
              isOnSearchPage
              isLocationPage
              showForm={showForm}
            />
            <Header
              ref={ref}
              isCountry={isCountry}
              instrument={instrument}
              language={params?.language}
              locationItems={locationItems}
            />
          </>
        )}

        {instruments && instrument ? (
          <>
            <SearchForm
              show='false'
              filter={filter}
              showMap={showMap}
              blok={searchProps}
              isOnline={isOnline}
              showForm={showForm}
              setShowMap={setShowMap}
              setIsOnline={(value) => {
                filter.onReset();
                setIsOnline(value);
              }}
              instruments={instruments}
              setIsLoading={setIsLoading}
              language={params?.language}
              isLoadingInner={isLoadingInner}
              openFilterModal={openFilterModal}
              setIsInnerSearch={innerSearchHandle}
              setIsLoadingInner={setIsLoadingInner}
              isLoading={isLoading}
            />
            {zoomLevel && instrument && (
              <App
                {...DEFAULT_SEARCH_PROPS}
                radius={radius}
                filter={filter}
                showMap={showMap}
                isOnline={isOnline}
                indexName={indexName}
                isLoading={isLoading}
                zoomLevel={zoomLevel}
                createURL={createURL}
                userToken={userToken}
                ipAddress={ipAddress}
                setShowMap={setShowMap}
                seoActions={seoActions}
                showFilter={showFilter}
                instrument={instrument}
                setIsOnline={setIsOnline}
                instruments={instruments}
                locationGeo={locationGeo}
                setIsLoading={setIsLoading}
                language={params?.language}
                isSwitzerland={isSwitzerland}
                openListPopup={openListPopup}
                location={searchProps.location}
                onlineTeachers={onlineTeachers}
                searchState={currentSearchState}
                openFilterModal={openFilterModal}
                aroundLatLng={aroundLatLng || ''}
                closeFilterModal={closeFilterModal}
                resultsStateHits={resultsStateHits}
                setIsInnerSearch={innerSearchHandle}
                onSearchStateChange={onSearchStateChange}
                isLoadingInner={isLoadingInner}
                instrumentLocations={instrumentLocationsData}
                seoFilteredData={seoFilteredData}
              />
            )}
          </>
        ) : null}
        {!isLoading && <Footer story={story} />}
        {!showMap && !isLoading && (
          <ShowModalButton
            icon='map'
            id='map-2-id'
            seoActions={seoActions}
            onClick={() => setShowMap(true)}
            extraClass='teacher-search-show-map-btn'
            label={translateENtoDE('Show map', params.language)}
          />
        )}
      </div>
    </>
  );
};

export default LocationPage;
