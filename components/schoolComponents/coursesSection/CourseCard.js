import cx from 'classnames';
import Image from 'next/image';
import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { translateENtoDE, translateFieldKeyToEN } from '../../../functions/translator';
import ChevronRightPrimary from '../../icons/ChevronRightPrimary.svg';
import useWindowSize from '../../../hooks/useWindowSize';
import SmallClock from '../../../components/icons/SmallClock';
import SmallProfile from '../../../components/icons/SmallProfile';
import SmallMusic from '../../../components/icons/SmallMusic';
import { getKidsAndAdultsLabel } from '../commonComponent/getKidsAndAdultsLabel';
import { formatPrice } from '../commonComponent/formatPrice';
import { desktopPriceCard } from '../commonComponent/desktopPriceCard';
import { useSchoolPage } from '@/utils/context/SchoolPageContext';

const getCourseName = (name = '', ref, windowWidth) => {
  const _name = name.trim().replace('  ', ' ');
  const width = ref?.current?.getBoundingClientRect()?.width;
  if (width && _name?.length * 8 + (windowWidth > 1100 ? 20 : 0) > width) {
    return `${_name.slice(0, Math.ceil(width / 10))}...`;
  }
  return _name;
};

const CourseCard = ({ item, teacher, language, onClick, imageSize, seoActions, courseIndex }) => {
  const titleRef = useRef(null);
  const { width } = useWindowSize();
  const [courseName, setCourseName] = useState(item?.name || '');
  const { courseCategoriesData } = useSchoolPage()
  const courseHandle = useCallback(() => {
    onClick();
    if (seoActions?.selectCourse) seoActions?.selectCourse(item, courseIndex, teacher);
  }, [seoActions, onClick, courseIndex, teacher, item]);

  const updateCourseName = useCallback(() => {
    setCourseName(getCourseName(item?.name, titleRef, width));
  }, [item, width, titleRef]);

  useEffect(() => {
    window.addEventListener('resize', updateCourseName);
    updateCourseName();
    return () => {
      window.removeEventListener('resize', updateCourseName);
    };
  }, [updateCourseName]);

  const lowestAndHighest = useMemo(() => {
    const prices = item?.prices;
    if (!prices || prices.length === 0) return [];
    if (prices.length === 1) {
      return [prices[0]];
    }
    const sortedPrices = prices.sort((a, b) => a.price - b.price);
    return [sortedPrices[0], sortedPrices[sortedPrices.length - 1]];
  }, [item?.prices]);

  const sortedDurations = useMemo(() => {
    return item?.durations.sort((a, b) => a - b);
  }, [item?.durations]);
  const category = courseCategoriesData?.find((category)=> category?.id == item?.mzo_course_category_id)
  return (
    <div
      id={`course-item-${item?.id}`}
      className='grid smd:grid-cols-[0.8fr_2fr] w-full gap-[12px] sm:gap-3 lg:gap-6 border-0 sm:border-[1px] border-[#d0d5dd] rounded-lg sm:pl-[12px] pr-[12px] lg:pr-[20px] py-[16px] cursor-pointer'
      onClick={courseHandle}>
      <div className=' w-full max-w-full smd:max-w-[240px] '>
        <div className='w-full max-w-full smd:max-w-[240px] h-[190px] lg:h-[160px] [&>span]:!h-full  [&>span]:!w-full relative overflow-hidden rounded-lg'>
          {!!item?.instrument?.image_url ? (
            <Image
              layout='fixed'
              objectFit='cover'
              src={item?.instrument?.image_url}
              width={500}
              height={500}
              alt={`${item?.name} course image`}
              className='!w-full max-w-full lg:!max-w-[240px] h-auto rounded-lg'
            />
          ) : (
            <div className='rounded-lg w-full max-w-full sm:!max-w-[288px] !h-[182px] bg-gray-200'></div>
          )}
          <div className='absolute inset-0 w-full  bg-[#00000080] h-[190px] smd:h-[160px] smd:hidden block '></div>
          <div className='absolute bottom-0 right-0 w-full max-w-[350px] rounded-tl-[10px] pl-4'>
            {item?.min_prices?.kids?.price || item?.min_prices?.adults?.price ? (
              <div className=' bg-[#ffffffcc] backdrop-blur-[4px] py-2.5 px-[10px] xs:px-[12px] rounded-tl-[10px]  smd:hidden flex flex-col items-end'>
                <div className='w-full'>
                  <p className='text-[12px] font-Roboto text-[#002D3B] font-semibold'>
                    {translateENtoDE('Starting from', language) + ':'}
                  </p>
                  <div className='flex justify-between mt-[8px] gap-2'>
                    {item?.min_prices?.kids?.price ? (
                      <div
                        className={`h-fit  pr-[10px] xs:pr-[12px] w-full ${
                          item?.min_prices?.adults?.price && 'border-r-[1px] border-[#696969]'
                        } `}>
                        <div className='flex items-start gap-1 '>
                          <p className='text-[30px] font-Roboto leading-[80%] text-[#002D3B] '>
                            {formatPrice(Math.floor(item?.min_prices?.kids?.price?.toFixed(2)), language)}{' '}
                          </p>
                          <div>
                            <p className='text-[10px] font-Roboto leading-[95%] text-[#000000DE]'>CHF</p>
                            <p className='text-[12px] font-Roboto leading-[100%] text-[#000000DE] mt-[4px]'>
                              {item?.min_prices?.kids?.quantity}x{item?.min_prices?.kids?.duration}{' '}
                              {translateENtoDE('mins.', language)}
                            </p>
                          </div>
                        </div>
                        <p className='text-[12px] font-Roboto leading-[90%] text-[#002D3B] font-semibold mt-[8px]'>
                          {/* {getKidsAndAdultsLabel(lowestAndHighest[0], language)} */}
                          {item?.min_prices?.kids?.price
                            ? `${translateENtoDE('for kids and young adults', language)}`
                            : null}
                        </p>
                      </div>
                    ) : null}
                    {/* Check if highest price exists and is different from the lowest */}
                    {item?.min_prices?.adults?.price ? (
                      <div className='h-fit block smd:hidden w-full'>
                        <div className='flex items-start gap-1 '>
                          <p className='text-[32px] font-Roboto leading-[80%] text-[#002D3B] '>
                            {formatPrice(Math.floor(item?.min_prices?.adults?.price?.toFixed(2)), language)}{' '}
                          </p>
                          <div>
                            <p className='text-[10px] font-Roboto leading-[100%] text-[#000000DE]'>
                              {translateENtoDE('CHF', language)}
                            </p>
                            <p className='text-[12px] font-Roboto leading-[100%] text-[#000000DE] mt-[4px]'>
                              {item?.min_prices?.adults?.quantity}x
                              {item?.min_prices?.adults?.duration} {translateENtoDE('mins.', language)}
                            </p>
                          </div>
                        </div>
                        <p className='text-[12px] font-Roboto leading-[90%] text-[#002D3B] font-semibold mt-[8px]'>
                          {item?.min_prices?.adults?.price ? `${translateENtoDE('for adults', language)}` : null}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {!!item?.is_full && (
          <div className='teacher-content-course-booked'>{translateENtoDE('Fully booked', language)}</div>
        )}
      </div>
      <div className=' w-full  flex items-center justify-between'>
        <div className='w-full h-[100%] flex flex-col justify-between'>
          <div>
            <p className='text-[14px] font-semibold font-Roboto text-[#000000DE] mb-[2px]'>
              {/* {translateENtoDE('Music lessons', language)} */}
              {category?.type_name[language == 'ch-en' ? 'en' : 'de']}
            </p>
            <h3 ref={titleRef} className='text-[17px] font-bold text-[#000000DE] font-Roboto leading-[129%]'>
              {language == 'ch-en' ? item?.title.en : item?.title?.de}
            </h3>
            <div className='flex flex-wrap items-center gap-[6px] mt-[12px] sm:mt-[8px]'>
              <div className='flex items-center gap-[6px] py-[3px] px-[6px] bg-[#F2F4F7] rounded-[4px]'>
                {/* <CourseInstrumentIcon className='w-[20px] h-[20px]' /> */}
                <SmallMusic className='w-[20px] h-[20px]' />
                <span className='text-[#000000AD] text-[12px] lg:text-[14px] leading-[110%] font-medium'>
                  {language === 'ch-en' ? item?.instrument?.en : item?.instrument?.de}
                </span>
              </div>
              <div className='flex items-center gap-[6px] py-[3px] px-[6px] bg-[#F2F4F7] rounded-[4px]'>
                <SmallProfile className='w-[20px] h-[20px]' />
                <span className='text-[#000000AD] text-[12px] lg:text-[14px] leading-[110%] font-medium'>
                  {item?.age_groups
                    ?.sort()
                    ?.map((ageItem) => translateFieldKeyToEN(ageItem, language))
                    ?.join('/')}
                </span>
              </div>
              {item?.durations.length > 0 ? (
                <div className='flex items-center gap-[6px] py-[3px] px-[6px] bg-[#F2F4F7] rounded-[4px]'>
                  {/* here we set time */}
                  <SmallClock className='w-[20px] h-[20px]' />
                  <div className='text-[#000000AD] text-[12px] lg:text-[14px] leading-[110%] font-medium'>
                    {item?.durations.length > 1
                      ? `${sortedDurations[0]}-${sortedDurations[sortedDurations.length - 1]}`
                      : `${sortedDurations[0]}`}{' '}
                    {translateENtoDE('mins.', language)}
                  </div>
                </div>
              ) : null}
            </div>
            <div className='mt-[12px]'>
              {item?.min_prices?.kids?.price || item?.min_prices?.adults?.price ? (
                <h6 className='text-[12px] text-[#002D3B] leading-[116%] font-semibold smd:block hidden'>
                  {translateENtoDE(`Starting from`, language) + ':'}
                </h6>
              ) : null}
              <div
                className={`flex flex-row  items-start lg:items-center ${
                  item?.min_prices?.kids?.price ? 'justify-between' : 'justify-end'
                } w-full gap-[12px] mt-[8px]`}>
                {item?.min_prices?.kids?.price || item?.min_prices?.adults?.price ? (
                  <div className='flex items-start justify-between w-full gap-[8px] lg:gap-[12px]'>
                    {item?.min_prices?.kids?.price && (
                      <div className='h-fit smd:block hidden'>
                        {desktopPriceCard(item?.min_prices?.kids, lowestAndHighest[0], language)}{' '}
                        <p className='text-[12px] font-Roboto leading-[90%] text-[#002D3B] font-semibold mt-[8px]'>
                          {item?.min_prices?.kids?.price
                            ? `${translateENtoDE('for kids and young adults', language)}`
                            : null}
                        </p>
                      </div>
                    )}
                    {item?.min_prices?.adults?.price && (
                      <div className='h-fit smd:block hidden'>
                        {' '}
                        {desktopPriceCard(item?.min_prices?.adults, lowestAndHighest[1], language)}
                        <p className='text-[12px] font-Roboto leading-[90%] text-[#002D3B] font-semibold mt-[8px]'>
                          {item?.min_prices?.adults?.price ? `${translateENtoDE('for adults', language)}` : null}
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
                <div
                  className={cx(
                    'font-medium hidden smd:flex items-center justify-center sm:justify-between  border-[1px] border-[#21697C] rounded-full py-[6px] px-[12px] w-full smd:max-w-[135px] lg:max-w-[155px] cursor-pointer hover:bg-[#21697C]/[10%] lg:mt-0 mt-1',
                    {
                      '': language === 'ch-en',
                    }
                  )}>
                  <span className='text-[12px] lg:text-[14px] leading-[100%] font-Roboto text-[#21697C] uppercase block '>
                    {' '}
                    {translateENtoDE('MORE DETAILS', language)}
                  </span>
                  <ChevronRightPrimary className='ml-0.5 mb-[2px]' />
                </div>
              </div>
              <div
                className={cx(
                  'font-medium smd:hidden flex items-center justify-center sm:justify-between  border-[1px] border-[#21697C] rounded-full py-[6px] px-[12px] w-full smd:max-w-[135px] lg:max-w-[155px] cursor-pointer hover:bg-[#21697C]/[10%] lg:mt-0 mt-1',
                  {
                    '': language === 'ch-en',
                  }
                )}>
                <span className='text-[12px] lg:text-[14px] leading-[100%] font-Roboto text-[#21697C] uppercase block '>
                  {' '}
                  {translateENtoDE('MORE DETAILS', language)}
                </span>
                <ChevronRightPrimary className='ml-0.5 mb-[2px]' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseCard;
