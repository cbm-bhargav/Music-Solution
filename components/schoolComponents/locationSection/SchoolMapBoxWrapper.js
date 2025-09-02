import React from 'react';
import SchoolMapBox from './SchoolMapBox';
import TeacherStudioIcon from '../../icons/TeacherStudio.svg';
import { translateENtoDE } from 'functions/translator';

function SchoolMapBoxWrapper({ language, locations, query }) {
  const titleNameClasses = 'flex items-center text-16px font-bold';
  const searchParamLocation = query?.coords?.split(',')
  return (
    <div className='teacher-content-location'>
      <div>
        {locations?.length > 0 ? (
          locations.map((location, index) => (
            <div className='' key={locations?.id ?? index}>
              <h3 className={`${titleNameClasses} mb-2`}>
                <TeacherStudioIcon className='mr-2' />
                {translateENtoDE('Main building', language)}
              </h3>
              <p className='ml-[31.1px] text-14px text-gray-600 mb-4'>{location.full_address}</p>
            </div>
          ))
        ) : (
          <div className='text-14px text-gray-600 leading-115 font-Roboto font-medium mt-4'>
            {translateENtoDE('No other location found', language)}
          </div>
        )}
      </div>
      <SchoolMapBox
        markers={locations}
        language={language}
        styleContent={{
          height: '100%',
          minHeight: '350px',
          borderRadius: '12px',
        }}
        latitude={searchParamLocation && searchParamLocation[0] ? searchParamLocation[0] : locations && locations[0]?.latitude}
        longitude={searchParamLocation && searchParamLocation[1] ? searchParamLocation[1] : locations && locations[0]?.longitude}
      />
    </div>
  );
}

export default SchoolMapBoxWrapper;
