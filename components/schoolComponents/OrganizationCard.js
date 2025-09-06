import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Styles from '../../styles/card-component.module.scss';
import Image from 'next/image';
import cx from 'classnames';
import TeacherAges from '../icons/TeacherAges.svg';
import TeacherMap from '../icons/TeacherMap.svg';
import TeacherLocationIcon from '../icons/TeacherLocation.svg';
import { getLocationTypes, getTeacherAges } from '@/utils/getTeacherGroupStrings';
import ShowMoreText from '../TeacherInfoPage/ShowMoreText';
import { translateENtoDE } from 'functions/translator';

function OrganizationCard({
  item,
  instrument,
  locationName,
  language,
  isCard,
  isEvta,
  active,
  isMapList,
  currentSearchState,
}) {
  const instruments = useMemo(() => item?.instruments || [], [item]);
  const instrumentsRow = useMemo(
    () => (
      <div className={`${Styles.card_instruments_wrapper} ms_instruments flex text-[24px] sm:text-[28px] w-full`}>
        {instruments.slice(0, 3).map((item, index) => (
          <div key={index} className={`ms_instruments-${String(item?.key).toLowerCase().replace(' ', '_')} ml-2`} />
        ))}
      </div>
    ),
    [instruments]
  );

  const teachers = useMemo(() => item?.mzo_region_teacher_avatars || [], [item]);
  const teachersInSchool = useMemo(() => teachers.slice(0, 4).map((item, index) => item), [teachers]);
  function handleOpenSchool(item) {
    const schoolLocation = item?.locations?.studios?.address_list[0];
    const currentInstrument = currentSearchState?.query;

    window?.open(
      `/${language}/schools/mzo/${
        language == 'ch-en'
          ? item?.mzo_region_full_name?.en?.toLowerCase().split(' ').join('-')
          : item?.mzo_region_full_name?.de?.toLowerCase().split(' ').join('-')
      }?instrument=${instrument?.key ?? ''}&location=${locationName}&coords=${schoolLocation?.latitude},${
        schoolLocation?.longitude
      }`,
      '_blank'
    );
  }

  const [counter, setCounter] = useState(0);
  const [isImageError, setIsImageError] = useState(false);

  const onError = useCallback(() => {
    setIsImageError(true);
    setCounter((value) => value + 1);
  }, []);

  useEffect(() => {
    if (isImageError && counter === 1) {
      setIsImageError(false);
      setTimeout(() => setIsImageError(false), 1000);
    }
  }, [counter, isImageError]);

  const linkClasses = cx(`${Styles.teacher_card} teacher-card-item select-none`, {
    'outline-primary': active,
    'teacher-card-new': isCard,
    'teacher-card-evta': isEvta,
  });
  const initialsClasses = `
    rounded-full flex text-[#000000de] font-[600] items-center justify-center 
    bg-slate-400 text-[18px] uppercase 
  `;
  const split =
    language == 'ch-en'
      ? item?.mzo_region_full_name?.en?.trim()?.split(' ')
      : item?.mzo_region_full_name?.de?.trim()?.split(' ');
  const initials = `${(split[0] || ' ')[0]}${(split[1] || ' ')[0]}`.trim();

  const rowClass = 'flex items-center font-[400] leading-[14px] text-14px tx-primary';
  const locationTypes = getLocationTypes(item?.locations, language) || '';

  const age_taught_data = Object.keys(item?.age_taught)
    .map((age) => (item?.age_taught[age] ? age : false))
    .filter(Boolean);
  const teacherAges = getTeacherAges(age_taught_data, language);
  return (
    <div
      onClick={() => handleOpenSchool(item)}
      className={`teacher-card-new border-[1px] border-[#d0d5dd] rounded-xl  sm:py-3 mb-4 cursor-pointer overflow-hidden`}>
      <div className='flex items-start justify-between [&>*:nth-child(1)>:nth-child(1)]:ml-0 px-2 py-3 sm:py-0 focus:none'>
        <div className='flex items-end'>
          {teachersInSchool?.map((teacher, index) => {
            return (
              <>
                {
                  <div
                    key={index}
                    className={cx(
                      'w-full max-w-[56px] sm:max-w-[100px] h-[56px] sm:h-[100px] overflow-hidden rounded-full ml-[-7%] sm:ml-[-3%] flex items-center justify-center relative',
                      Styles.card_teacher_wrapper
                    )}>
                     {/* <img
                      src={teacher || '/assets/images/teacherdefault.avif'}
                      alt='teacher image'
                      layout='intrinsic'
                      className='rounded-full object-cover'
                    /> */}
                    <Image
                      src={teacher || '/assets/images/teacherdefault.avif'}
                      alt='teacher image'
                      layout='intrinsic'
                      width={200}
                      height={200}
                      className='rounded-full object-cover'
                    />
                  </div>
                }
              </>
            );
          })}
          {item.mzo_region_teacher_avatars.length > 4 && (
            <div className='bg-[#2E788D] w-full max-w-[32px] sm:max-w-[44px] h-[32px] sm:h-[44px] rounded-full flex items-center justify-center border-[2px] border-white text-[10px] sm:text-[15px] font-semibold text-white ml-[-6%] relative z-[5] '>
              <span>{'+' + (item.mzo_region_teacher_avatars.length - 4)}</span>
            </div>
          )}
        </div>
        <div className='flex items-center w-full`'>
          {instrumentsRow}
          {instruments.length > 3 && <div className='text-14px ml-3 text-primary'>{`+${instruments.length - 3}`}</div>}
        </div>
      </div>
      <div className={`flex xs:flex-row flex-col items-start gap-2.5 bg-white pt-5 px-2`}>
        <div className={cx(` relative [&>span]:!w-[80px] [&>span]:!h-[29px]`)}>
          {!!item?.avatar_path && !isImageError ? (
            <Image
              alt=''
              width={96}
              height={96}
              layout='fixed'
              onError={onError}
              src={item.avatar_path}
              className={cx('rounded-full teacher-card-img  w-full !max-w-[80px] !h-[80px] object-contain')}
            />
          ) : (
            <div className='w-[56px] sm:w-[100px] aspect-square overflow-hidden rounded-full border-2 border-white ml-[-7%] sm:ml-[-3%] flex items-center justify-center relative'>
              <div className='w-full h-full bg-gray-300 rounded-full object-cover' />
            </div>
          )}
          {!!isImageError && <div className={cx(`${initialsClasses} h-[96px] w-[96px]`)}>{initials}</div>}
        </div>

        <div>
          <div className={`${Styles.card_instruments} mb-1`}>
            <div className='flex items-center'>
              <h2 className='text-16px leading-[22px] sm:text-22px sm:leading-26px font-bold mb-1 tx-primary'>
                {language == 'ch-en' ? item?.mzo_region_full_name?.en : item?.mzo_region_full_name?.de}
              </h2>
            </div>
          </div>
          {/* {!!locationString && !isMapList && (
                        <div className={`${rowClass} mb-[8px]`}>
                            <TeacherMap className='mr-2 min-w-[24px]' />
                            {locationString}
                        </div>
                    )} */}
          <div className={`${rowClass} mb-[8px]`}>
            <TeacherMap className='mr-2 min-w-[24px]' />
            <p>
              {language == 'ch-en' ? instrument.en : instrument.de} {translateENtoDE('school in', language)}{' '}
              <span className='capitalize'>{item?.mzo_region_slug}</span>
            </p>
          </div>
          <div className={`${rowClass} mb-[8px]`}>
            <TeacherLocationIcon className='mr-2 min-w-[24px]' />
            <span className='first-letter:uppercase'>{translateENtoDE('At school location', language)}</span>
          </div>
          <div className={`${rowClass} mb-[12px]`}>
            <TeacherAges className='mr-2 min-w-[24px]' />
            {teacherAges}
          </div>
          <div className='card-component-text-wrapper'>
           <ShowMoreText
              isDisabled={true}
              language={language}
              text={language == 'ch-en' ? item?.about_me?.en : item?.about_me?.de}
              onClick={() => {}}
              maxLength={isMapList ? 120 : 230}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationCard;
