import cx from 'classnames';
import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination } from 'swiper/core';
import PlayButtonIcon from '../../../icons/PlayButton.svg';
import ChevronLeft from '../../../icons/ChevronLeft.svg';
import useBlockWidth from '../../useBlockWidth';
import 'swiper/swiper-bundle.css';
import Image from 'next/image';

function convertDriveUrl(url) {
  const match = url.match(/\/d\/([^/]+)\//);
  if (!match || !match[1]) {
    return '';
  }

  const fileId = match[1];
  return `https://drive.usercontent.google.com/download?id=${fileId}&export=view&authuser=0`;
}

export function getGalleryImage(item) {
  if (item?.type === 'image') return item?.url;

  const youtubeMatch = item?.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  return item.url;
}

function isVideo(item) {
  const url = item?.url || '';
  return item?.type === 'video' || url.includes('youtube.com') || url.includes('youtu.be');
}

SwiperCore.use([Navigation, Pagination]);

const TeacherContentGallery = ({ gallery = [], showPopup, organizationGalleryClass = '' }) => {
  const ref = useRef();
  const { blockWidth } = useBlockWidth(ref, 'swiper');
  const [currentIndex, setCurrentIndex] = useState(0);

  const onSlideChange = ({ activeIndex }) => {
    setCurrentIndex(activeIndex);
  };

  const popupHandle = (index) => {
    showPopup('gallery', { slideIndex: index });
  };

  return (
    <div ref={ref}>
      {!!blockWidth && (
        <div className='teacher-content-slider teacher-content-slider-gallery '>
          <div className={`teacher-content-slider-scroll-wrapper ${organizationGalleryClass}`}>
            <div className='teacher-content-slider-scroll scrollbarHidden'>
              {gallery.map((item, index) => (
                <div
                  key={item?.id}
                  onClick={() => popupHandle(index)}
                  className={cx(
                    'teacher-content-slider-scroll-item cursor-pointer teacher-content-gallery-slide-wrapper mr-3',
                    { 'mr-5': index === gallery.length - 1 }
                  )}
                  style={{ backgroundImage: `url(${getGalleryImage(item)})` }}>
                  <div className='teacher-content-gallery-slide'>
                    {isVideo(item) && (
                      <div className='teacher-content-gallery-slide-play'>
                        <PlayButtonIcon />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='teacher-content-slider-scroll-hidden '>
            <div
              className={cx('teacher-slider-button teacher-slider-button-prev', {
                'opacity-0 cursor-default': !currentIndex,
              })}>
              <ChevronLeft color='#ffffff' />
            </div>
            <div
              className={cx('teacher-slider-button teacher-slider-button-next', {
                'opacity-0 cursor-default': currentIndex === gallery.length - 2,
              })}>
              <ChevronLeft color='#ffffff' className='slider-btn-next' />
            </div>
            <Swiper
              spaceBetween={10}
              slidesPerView={2}
              onSlideChange={onSlideChange}
              navigation={{
                prevEl: '.teacher-slider-button-prev',
                nextEl: '.teacher-slider-button-next',
              }}
              style={{ maxWidth: `${blockWidth}px` }}>
              {gallery.map((item, index) => {
                // const finalImageUrl = convertDriveUrl(item?.url)
                const finalImageUrl = getGalleryImage(item);
                return (
                  <SwiperSlide
                    key={item?.id}
                    onClick={() => popupHandle(index)}
                    className='teacher-content-gallery-slide-wrapper cursor-pointer'
                    style={{ width: '340px', marginRight: '10px' }}>
                    <div className='teacher-content-gallery-slide h-full'>
                      <div className='relative w-full h-full rounded-[12px] overflow-hidden'>
                        <Image
                          src={finalImageUrl}
                          alt={`gallery-item-${index}`}
                          layout="fill"
                          className='object-cover'
                        />
                      </div>
                      {isVideo(item) && (
                        <div className='teacher-content-gallery-slide-play'>
                          <PlayButtonIcon />
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherContentGallery;
