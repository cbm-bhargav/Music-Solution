import React, { useRef } from 'react';
import { extractClassValues } from '@/utils/breakpoint';
import { storyblokEditable } from '@storyblok/react';
import { useMediaQuery } from 'react-responsive';

const GoogleMap = ({ blok }) => {
  const DesktopSize = useMediaQuery({ minWidth: 1030 });
  const TabletSize = useMediaQuery({ minWidth: 600, maxWidth: 1029 });
  const MobileSize = useMediaQuery({ maxWidth: 599 });

  const responsiveClasses = useRef([...extractClassValues(blok)].join(' ').trim());

  return (
    <>
      {DesktopSize && (
        <div
          className='parent-square relative w-full pt-[100%]'
          style={{
            height: `${blok?.heigth}px`,
            width: `${blok?.width}px`,
            aspectRatio: 1 / 1,
          }}
          {...storyblokEditable(blok)}>
          <iframe
            className="absolute inset-0 w-full h-full"
            style={{ height: '100%', width: '100%', borderRadius: 8 }}
            title='Google Map'
            src='https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1398041.1378619722!2d8.224119!3d46.8131873!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479aa60731a95555%3A0xa6ef4c6044516d35!2sMatchspace%20Music!5e0!3m2!1sen!2s!4v1728306523313!5m2!1sen!2s'
            loading='lazy'></iframe>
        </div>
      )}

      {TabletSize && (
        <div
          style={{
            height: `${blok?.mobile_height}px`,
            width: `${blok?.mobile_width}px`,
          }}
          {...storyblokEditable(blok)}
          className='h-full'>
          <iframe
            style={{ position: 'relative', height: '100%', width: '100%', borderRadius: 8 }}
            title='Google Map'
            className={responsiveClasses.current}
            src='https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1398041.1378619722!2d8.224119!3d46.8131873!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479aa60731a95555%3A0xa6ef4c6044516d35!2sMatchspace%20Music!5e0!3m2!1sen!2s!4v1728306523313!5m2!1sen!2s'
            loading='lazy'></iframe>
        </div>
      )}

      {MobileSize && (
        <div
          style={{
            height: `${blok?.mobile_height}px`,
            width: '100%',
          }}
          {...storyblokEditable(blok)}
          className='h-full'>
          <iframe
            title='Google Map'
            className={responsiveClasses.current}
            src='https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1398041.1378619722!2d8.224119!3d46.8131873!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479aa60731a95555%3A0xa6ef4c6044516d35!2sMatchspace%20Music!5e0!3m2!1sen!2s!4v1728306523313!5m2!1sen!2s'
            style={{ position: 'relative', height: '100%', width: '100%', borderRadius: 8 }}
            loading='lazy'></iframe>
        </div>
      )}
    </>
  );
};
export default GoogleMap;
