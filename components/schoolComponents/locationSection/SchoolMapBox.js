import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Map, NavigationControl, ScaleControl, Marker, Popup, useMap } from 'react-map-gl';
import { isEmpty } from 'ramda';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import MapboxPin from '@/components/TeachersSearchMap/MapboxPin';
import { translateENtoDE } from 'functions/translator';

export const MAP_STYLE = 'mapbox://styles/matchspace/cl2qnbfyw004015qmdq5rfgvn/draft';
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const sortAndGroup = (markers) => {
  const grouped = {};
  markers.forEach((marker) => {
    const key = `${marker.latitude}-${marker.longitude}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(marker);
  });
  return Object.values(grouped);
};

const getCurrentMarkerID = (marker, withUuid = false) => {
  return withUuid ? marker.uuid : marker.id;
};

const sortedMarkers = (markers) => {
  return markers.sort((a, b) => a.id - b.id);
};

// Pin Group Component (simplified)
const MapboxPinGroup = memo(
  ({ markers, currentUUID, currentMarker, handlePinClick, isMobileVersion, getCategoryColor }) => {
    const handleClick = useCallback(() => {
      handlePinClick(markers);
    }, [markers, handlePinClick]);

    const isActive = currentUUID && markers.some((m) => m.uuid === currentUUID);
    const markerCount = markers.length;
    const primaryMarker = markers[0];

    if (markers.length === 1) {
      return (
        <MapboxPin
          isTeacherInfo={false}
          isHomeVisit={markers[0]?.home_visit}
          onClick={() => {
            handlePinClick(markers);
          }}
          active={currentMarker === getCurrentMarkerID(markers[0])}
        />
      );
    }

    return (
      <div
        className={`cursor-pointer transform hover:scale-110 transition-transform relative ${
          isActive ? 'scale-125' : ''
        }`}
        onClick={handleClick}
        style={{ color: getCategoryColor('Piano') }}>
        {/* Main pin */}
        <div className='relative'>
          <div
            className='w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm'
            style={{ backgroundColor: getCategoryColor('Piano') }}>
            {markerCount > 1 ? markerCount : 'Piano'.charAt(0)}
          </div>

          {/* Pin pointer */}
          <div
            className='absolute top-6 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent'
            style={{ borderTopColor: getCategoryColor('Piano') }}></div>
        </div>
      </div>
    );
  }
);

// Mobile Teacher List Component (simplified)
const MapboxMobileTeacherList = memo(({ mobileMarkers, onClose, getCategoryColor }) => {
  if (!mobileMarkers || mobileMarkers.length === 0) return null;

  return (
    <div className='absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg max-h-96 overflow-y-auto z-50'>
      <div className='p-4 border-b flex justify-between items-center'>
        <h3 className='text-lg font-semibold'>Teachers in this area</h3>
        <button onClick={onClose} className='text-gray-500 hover:text-gray-700 text-xl'>
          ×
        </button>
      </div>
      <div className='p-4 space-y-3'>
        {mobileMarkers.map((marker) => (
          <div key={marker.id} className='border rounded-lg p-3'>
            <div className='flex items-start justify-between mb-2'>
              <h4 className='font-medium'>{marker.title}</h4>
              <span
                className='px-2 py-1 text-xs font-medium text-white rounded-full'
                style={{ backgroundColor: getCategoryColor('Piano') }}>
                {marker.category}
              </span>
            </div>
            <p className='text-sm text-gray-600 mb-1'>{marker.description}</p>
            <p className='text-sm text-blue-600'>{marker.contact}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

// Map Popups Component (simplified)
const MapboxMapPopups = memo(({ popupInfo, onClose, getCategoryColor, isMobileVersion,language }) => {
  if (!popupInfo || isEmpty(popupInfo) || isMobileVersion) return null;

  const marker = Array.isArray(popupInfo) ? popupInfo[0] : popupInfo;
  return (
    <Popup
      latitude={marker.latitude}
      longitude={marker.longitude}
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      anchor='bottom'
      className='max-w-[240px] w-full [&>*:nth-child(2)]:!w-full [&>*:nth-child(2)>button]:mr-2 [&>*:nth-child(2)>button]:w-[10px] [&>*:nth-child(2)>button]:h-[10px]'>
      <div className='relative w-full max-w-[240px] rounded-lg bg-white shadow-lg px-[8px] py-[8px] border border-gray-200'>
        <div className='text-[14px] text-gray-800 font-medium'>{`${marker?.street} ${marker?.street_no}`}</div>
        <div className='text-[14px] text-gray-600'>{`${marker?.zip} ${marker?.city}, ${marker?.country}`}</div>
        <a
          href='https://www.google.com/maps?q=Bahnhofstrasse+36,+8620+Wetzikon,+Switzerland'
          target='_blank'
          rel='noopener noreferrer'
          className='text-[14px] mt-1 block text-[#21697C] font-semibold'>
          {translateENtoDE('Directions', language)}
        </a>
      </div>
    </Popup>
  );
});

const SchoolMapBox = memo(
  ({
    styleContent,
    markers,
    enableClustering = true,
    isMobileVersion = false,
    fitBounds = true,
    zoomLevel = 11,
    latitude = 40.7128,
    longitude = -74.006,
    id = 'school-map',
    language,
  }) => {
    const mapRef = useRef();
    const maps = useMap();

    // State management (enhanced from original component)
    const [lat, setLat] = useState(latitude);
    const [lng, setLng] = useState(longitude);
    const [cluster, setCluster] = useState(null);
    const [initialBoundsFitted, setInitialBoundsFitted] = useState(false); 
    const [userHasInteracted, setUserHasInteracted] = useState(false); 
    const [popupInfo, setPopupInfo] = useState(null);
    const [mobileMarkers, setMobileMarkers] = useState([]);
    const [currentUUID, setCurrentUUID] = useState(null);
    const [currentMarker, setCurrentMarker] = useState(null);

    const [viewState, setViewState] = useState({
      latitude: lat,
      longitude: lng,
      zoom: isMobileVersion ? 11 : zoomLevel,
    });

    // Utility function for category colors
    const getCategoryColor = useCallback((category) => {
      const colors = {
        Piano: '#3B82F6',
        Guitar: '#10B981',
        Violin: '#8B5CF6',
        Drums: '#F59E0B',
      };
      return colors[category] || '#6B7280';
    }, []);

    // Update popup info callback
    const updatePopupInfo = useCallback(
      (data) => {
        setPopupInfo(data);
        if (isMobileVersion) setMobileMarkers(data);
      },
      [isMobileVersion]
    );

    // Map click handler
    const mapClickHandle = useCallback((event) => {
      if (event.target?.tagName === 'CANVAS') {
        setPopupInfo(null);
        setCurrentUUID(null);
        setCurrentMarker(null);
      }
    }, []);

    // Handle move
    const handleMove = useCallback((evt) => {
      setViewState(evt.viewState);
      // Mark that user has interacted with the map
      if (!userHasInteracted) {
        setUserHasInteracted(true);
      }
    }, [userHasInteracted]);

    // NEW: Handle user drag start to prevent fitBounds override
    const handleDragStart = useCallback(() => {
      setUserHasInteracted(true);
    }, []);

    // Close mobile list
    const closeMobileList = useCallback(() => {
      setCurrentMarker(null);
      setCurrentUUID(null);
      setMobileMarkers([]);
    }, []);

    // Zoom to cluster
    const zoomToCluster = useCallback(
      (longitude, latitude) => {
        setViewState((values) => ({
          ...values,
          latitude,
          longitude,
          zoom: Math.min(values.zoom + 2, 18), // Add max zoom limit
          transitionDuration: 500,
        }));
        setUserHasInteracted(true); // Mark as user interaction
      },
      []
    );

    // FIXED: Modified fit bounds logic to respect user interaction
    const getZoomLevel = useCallback(() => {
      if (
        mapRef?.current && 
        !initialBoundsFitted && 
        !userHasInteracted && // Only fit bounds if user hasn't interacted
        fitBounds && 
        markers?.length > 1
      ) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.forEach((item) => bounds.extend([item?.longitude, item?.latitude]));
        mapRef?.current?.fitBounds(bounds, { 
          padding: 50, 
          duration: 0,
          maxZoom: 15 // Add max zoom for fitBounds
        });
        setInitialBoundsFitted(true);
      }
    }, [mapRef, markers, initialBoundsFitted, userHasInteracted, fitBounds]);

    // Handle popup info changes
    useEffect(() => {
      if (popupInfo && !isEmpty(popupInfo)) {
        const sorted = sortedMarkers(Array.isArray(popupInfo) ? popupInfo : [popupInfo]);
        setCurrentUUID(getCurrentMarkerID(sorted[0], true));
        setCurrentMarker(getCurrentMarkerID(sorted[0]));
      }
    }, [popupInfo]);

    // FIXED: Only update coordinates if user hasn't interacted and markers change
    useEffect(() => {
      if (!isEmpty(markers) && !userHasInteracted) {
        setViewState(prevState => ({
          ...prevState,
          latitude: latitude,
          longitude: longitude,
        }));
      }
    }, [latitude, longitude, markers, userHasInteracted]);

    // FIXED: Enhanced clustering setup with better bounds
    useEffect(() => {
      if (markers?.length && enableClustering) {
        const supercluster = new Supercluster({ 
          radius: 50, 
          maxZoom: 15, // Reduced max zoom for better clustering
          minZoom: 1, // Set minimum zoom to prevent world wrapping issues
          extent: 512,
          nodeSize: 64
        });

        // Filter and normalize coordinates to prevent world wrapping
        const points = markers
          .filter(item => item?.longitude >= -180 && item?.longitude <= 180 && 
                          item?.latitude >= -85 && item?.latitude <= 85)
          .map((item) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [
                Math.max(-180, Math.min(180, item?.longitude)), // Clamp longitude
                Math.max(-85, Math.min(85, item?.latitude))     // Clamp latitude
              ],
            },
            properties: { ...item, uuid: item.uuid || `marker-${item.id}` },
          }));

        supercluster.load(points);
        setCluster(supercluster);
      }
    }, [markers, enableClustering]);

    const markersList = useMemo(() => {
      if (!markers?.length) return null;

      if (markers?.length && enableClustering && cluster) {
        const bounds = mapRef.current?.getBounds();
        let clusterBounds = [-180, -85, 180, 85]; 
        
        if (bounds) {
          clusterBounds = [
            Math.max(-180, bounds.getWest()),
            Math.max(-85, bounds.getSouth()),
            Math.min(180, bounds.getEast()),
            Math.min(85, bounds.getNorth())
          ];
        }

        const clusters = cluster.getClusters(clusterBounds, Math.floor(viewState?.zoom));

        return clusters.map((clusterItem) => {
          const [longitude, latitude] = clusterItem.geometry.coordinates;
          const { uuid, cluster: isCluster, point_count: pointCount } = clusterItem.properties;

          if (longitude < -180 || longitude > 180 || latitude < -85 || latitude > 85) {
            return null;
          }

          if (isCluster) {
            return (
              <Marker key={uuid || `cluster-${longitude}-${latitude}`} latitude={latitude} longitude={longitude}>
                <div
                  className='cluster-marker bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold cursor-pointer shadow-lg hover:bg-blue-600 transition-colors'
                  onClick={() => zoomToCluster(longitude, latitude)}>
                  {pointCount}
                </div>
              </Marker>
            );
          }

          const marker = markers.filter(
            (item) => Math.abs(item?.latitude - latitude) < 0.0001 && Math.abs(item?.longitude - longitude) < 0.0001
          );

          return (
            <Marker key={uuid || `marker-${longitude}-${latitude}`} latitude={latitude} longitude={longitude}>
              <MapboxPinGroup
                markers={marker}
                currentUUID={currentUUID}
                currentMarker={currentMarker}
                handlePinClick={updatePopupInfo}
                isMobileVersion={isMobileVersion}
                getCategoryColor={getCategoryColor}
              />
            </Marker>
          );
        }).filter(Boolean); 
      }

      return sortAndGroup(markers?.filter(marker => 
        marker.longitude >= -180 && marker.longitude <= 180 && 
        marker.latitude >= -85 && marker.latitude <= 85
      ) || []).map((markerGroup, index) => (
        <Marker key={`group-${index}`} longitude={markerGroup[0].longitude} latitude={markerGroup[0].latitude}>
          <MapboxPinGroup
            markers={markerGroup}
            currentUUID={currentUUID}
            currentMarker={currentMarker}
            handlePinClick={updatePopupInfo}
            isMobileVersion={isMobileVersion}
            getCategoryColor={getCategoryColor}
          />
        </Marker>
      ));
    }, [
      markers,
      cluster,
      viewState,
      currentUUID,
      currentMarker,
      enableClustering,
      zoomToCluster,
      updatePopupInfo,
      isMobileVersion,
      getCategoryColor,
    ]);

    const mapStyle = styleContent || { height: 550, borderRadius: '12px' };

    return (
      <>
        <Map
          id={id}
          ref={mapRef}
          reuseMaps
          {...viewState}
          onMove={handleMove}
          onDragStart={handleDragStart} 
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          style={mapStyle}
          mapStyle={MAP_STYLE}
          onRender={getZoomLevel}
          onClick={(event) => mapClickHandle(event?.originalEvent)}
          renderWorldCopies={false}
          maxBounds={[[-180, -85], [180, 85]]}
          minZoom={1}
          maxZoom={18}
          scrollZoom={true}
          boxZoom={true}
          dragRotate={true}
          dragPan={true}
          keyboard={true}
          doubleClickZoom={true}
          touchZoomRotate={true}>
          
          <NavigationControl position='top-right' />
          <ScaleControl position='bottom-left' />

          {/* Render markers */}
          {markersList} 

          {/* Map Popups */}
          <MapboxMapPopups
            popupInfo={popupInfo}
            onClose={() => setPopupInfo(null)}
            getCategoryColor={getCategoryColor}
            isMobileVersion={isMobileVersion}
            language={language}
          />

          {/* Mobile Teacher List */}
          {isMobileVersion && (
            <MapboxMobileTeacherList
              mobileMarkers={mobileMarkers}
              onClose={closeMobileList}
              getCategoryColor={getCategoryColor}
            />
          )}
        </Map>
      </>
    );
  }
);

SchoolMapBox.displayName = 'SchoolMapBox';

export default SchoolMapBox;
