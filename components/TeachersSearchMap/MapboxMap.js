import { isEmpty } from 'ramda';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Map, Marker, useMap, NavigationControl, ScaleControl } from 'react-map-gl';
import { FlyTo, sortAndGroup, MAP_STYLE, MAPBOX_ACCESS_TOKEN, getCurrentMarkerID } from './mapboxInfo';
import MapboxMobileTeacherList from './MapboxMobileTeacherList';
import MapboxMapPopups from './MapboxMapPopups';
import MapboxPinGroup from './MapboxPinGroup';
import { sortedMarkers } from './functions';
import SearchInArea from './SearchInArea';

const MapboxMap = ({
  id,
  mapRef,
  isEvta,
  markers,
  language,
  latitude,
  longitude,
  zoomLevel,
  seoActions,
  instrument,
  instruments,
  currentUUID,
  isIpAddress,
  locationName,
  filterParams,
  styleContent,
  isSearchPage,
  currentMarker,
  isTeacherInfo,
  openListPopup,
  isSwitzerland,
  onSearchInArea,
  setCurrentUUID,
  isMobileVersion,
  setMobileStatus,
  isInstrumentPage,
  setCurrentMarker,
  isFitBounds = true,
  isSearchArea = true,
}) => {
  const maps = useMap();
  const [lat, setLat] = useState(latitude);
  const [lng, setLng] = useState(longitude);
  const [cluster, setCluster] = useState(null);
  const [rendered, setRendered] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [mobileMarkers, setMobileMarkers] = useState([]);
  const [currentCluster, setCurrentCluster] = useState(null);
  const [isOpenPinSlider, setIsOpenPinSlider] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: lat,
    longitude: lng,
    zoom: isEvta ? 6 : zoomLevel < 9 ? (isMobileVersion ? 11 : 10) : zoomLevel,
  });

  const updatePopupInfo = useCallback(
    (data) => {
      const filterData = data.map((item)=>{
        if(item?.profile_type === 'music_school'){
          return {
            ...item,
            id: item?.teacher?.mzo_region_full_name?.de || item?.teacher?.user_id,
            name:language == 'ch-en' ? item?.teacher?.mzo_region_full_name?.en : item?.teacher?.mzo_region_full_name?.de,
            avatar_path: item?.teacher?.avatar_path,
          }
        }
        return item
      })
      setPopupInfo(filterData);
      if (isMobileVersion) setMobileMarkers(filterData);
    },
    [isMobileVersion, language]
  );

  const mapClickHandle = useCallback(
    (event) => {
      if (event.target?.tagName === 'CANVAS') {
        setPopupInfo(null);
        setCurrentUUID(null);
        setCurrentMarker(null);
        setCurrentCluster(null);
      }
    },
    [setCurrentUUID, setCurrentMarker]
  );

  const handleOpen = useCallback(() => {
    if (setMobileStatus) setMobileStatus(true);
  }, [setMobileStatus]);

  const handleClose = useCallback(() => {
    setPopupInfo(null);
    setCurrentUUID(null);
    setCurrentMarker(null);
    if (setMobileStatus) setMobileStatus(false);
  }, [setMobileStatus, setCurrentUUID, setCurrentMarker]);

  useEffect(() => {
    if (popupInfo && !isEmpty(popupInfo)) {
      const sorted = sortedMarkers(popupInfo);

      setCurrentUUID(getCurrentMarkerID(sorted[0], true));
      setCurrentMarker(getCurrentMarkerID(sorted[0]));
      setMobileStatus && setMobileStatus(true);
    }
  }, [setCurrentMarker, setCurrentUUID, popupInfo, setMobileStatus]);

  const closeMobileList = () => {
    setCurrentMarker(null);
    setCurrentUUID(null);
    setMobileMarkers([]);
  };

  const getZoomLevel = useCallback(() => {
    if (mapRef?.current && !rendered && isFitBounds && markers?.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.map((item) => bounds.extend([item?.longitude, item?.latitude]));

      mapRef?.current?.fitBounds(bounds, { padding: 50, duration: 0, zoomLevel: 11 });

      setRendered(true);
    }
  }, [mapRef, markers, rendered, isFitBounds]);

  const handleMove = (evt) => {
    setViewState(evt.viewState);
  };

  const handleViewportChange = (viewport) => {
    setViewport(viewport);
  };

  useEffect(() => {
    const zoom =
      isEvta || isInstrumentPage ? 6 : isSwitzerland ? 8 : zoomLevel < 9 ? (isMobileVersion ? 11 : 10) : zoomLevel;

    setViewState((viewState) => ({
      ...viewState,
      zoom,
    }));
  }, [zoomLevel, isEvta, isSwitzerland, isInstrumentPage, isMobileVersion]);

  useEffect(() => {
    setPopupInfo(null);
  }, []);

  useEffect(() => {
    if (isIpAddress && maps[id] && isMobileVersion) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.map((item) => bounds.extend([item?.longitude, item?.latitude]));

      maps[id]?.fitBounds(bounds, { padding: 50, duration: 0 });
    }
  }, [maps, id, isIpAddress, markers, isMobileVersion]);

  useEffect(() => {
    if (!isEmpty(markers)) {
      setLat(latitude);
      setLng(longitude);
    }
  }, [latitude, longitude, markers]);

  const zoomToCluster = useCallback(
    (longitude, latitude) => {
      setViewState((values) => ({
        ...values,
        latitude,
        longitude,
        zoom: viewState.zoom + 2,
        transitionDuration: 500,
      }));
    },
    [viewState]
  );

  const markersList = useMemo(() => {
    if (!markers.length) return null;

    if (!!markers.length && isSearchPage && cluster) {
      const clusters = cluster.getClusters([-180, -90, 180, 90], Math.floor(viewState?.zoom));

      return clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { uuid, cluster: isCluster, point_count: pointCount } = cluster.properties;

        if (isCluster) {
          return (
            <Marker key={uuid} latitude={latitude} longitude={longitude}>
              <div className='cluster-marker' onClick={() => zoomToCluster(longitude, latitude)}>
                {pointCount}
              </div>
            </Marker>
          );
        }

        const marker = markers.filter((item) => item?.latitude === latitude && item?.longitude === longitude);

        return (
          <Marker key={uuid} latitude={latitude} longitude={longitude} role='img'>
            <div>
              <MapboxPinGroup
                mapRef={mapRef}
                markers={marker}
                clusterID={uuid}
                language={language}
                currentUUID={currentUUID}
                setViewState={setViewState}
                filterParams={filterParams}
                isTeacherInfo={isTeacherInfo}
                currentMarker={currentMarker}
                openListPopup={openListPopup}
                currentCluster={currentCluster}
                handlePinClick={updatePopupInfo}
                isMobileVersion={isMobileVersion}
                setCurrentCluster={setCurrentCluster}
                setIsOpenPinSlider={setIsOpenPinSlider}
              />
            </div>
          </Marker>
        );
      });
    }

    return (
      <>
        {sortAndGroup(markers || []).map((marker, index) => (
          <Marker key={index} longitude={marker[0].longitude} latitude={marker[0].latitude} role='img'>
            <MapboxPinGroup
              mapRef={mapRef}
              markers={marker}
              language={language}
              currentUUID={currentUUID}
              filterParams={filterParams}
              setViewState={setViewState}
              openListPopup={openListPopup}
              isTeacherInfo={isTeacherInfo}
              currentMarker={currentMarker}
              handlePinClick={updatePopupInfo}
              isMobileVersion={isMobileVersion}
              setIsOpenPinSlider={setIsOpenPinSlider}
            />
          </Marker>
        ))}
      </>
    );
  }, [
    mapRef,
    markers,
    cluster,
    language,
    viewState,
    currentUUID,
    filterParams,
    isSearchPage,
    isTeacherInfo,
    currentMarker,
    zoomToCluster,
    openListPopup,
    currentCluster,
    updatePopupInfo,
    isMobileVersion,
    setCurrentCluster,
    setIsOpenPinSlider,
  ]);

  useEffect(() => {
    if (!!markers?.length && isSearchPage) {
      const supercluster = new Supercluster({ radius: 50, maxZoom: 11 });

      supercluster.load(
        markers.map((item) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [item?.longitude, item?.latitude],
          },
          properties: item,
        }))
      );

      setCluster(supercluster);
    }
  }, [markers, isSearchPage]);

  if (lat && lng) {
    const mapStyle = styleContent || { height: 550, borderRadius: '12px' };

    return (
      <Map
        id={id}
        reuseMaps
        ref={mapRef}
        style={mapStyle}
        onMove={handleMove}
        mapStyle={MAP_STYLE}
        zoom={viewState.zoom}
        onRender={getZoomLevel}
        latitude={viewState.latitude}
        longitude={viewState.longitude}
        onViewportChange={handleViewportChange}
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        onClick={(event) => mapClickHandle(event?.originalEvent)}>
        <ScaleControl />
        <NavigationControl />
        <FlyTo lat={lat} lng={lng} />
        {false && (
          <>
            {isSearchPage && isSearchArea && mapRef?.current && language && (
              <SearchInArea
                mapRef={mapRef}
                language={language}
                seoActions={seoActions}
                isMobile={isMobileVersion}
                onSearchInArea={onSearchInArea}
              />
            )}
          </>
        )}
        {markersList}
        <MapboxMapPopups
          markers={markers}
          language={language}
          onOpen={handleOpen}
          popupInfo={popupInfo}
          onClose={handleClose}
          instrument={instrument}
          currentUUID={currentUUID}
          filterParams={filterParams}
          currentMarker={currentMarker}
          isTeacherInfo={isTeacherInfo}
          isMobileVersion={isMobileVersion}
          isOpenPinSlider={isOpenPinSlider}
        />
        {!!isMobileVersion && (
          <MapboxMobileTeacherList
            language={language}
            seoActions={seoActions}
            instrument={instrument}
            instruments={instruments}
            onClose={closeMobileList}
            locationName={locationName}
            filterParams={filterParams}
            mobileMarkers={mobileMarkers}
          />
        )}
      </Map>
    );
  }

  return null;
};

export default MapboxMap;
