import { useEffect, useState } from 'react';
import TeacherProfile from './TeacherProfile';
import { useTeacherFilter } from './useTeacherFilter';
import TeacherFilterField from './TeacherFilterField';
import CloseIcon from '@/components/icons/closeIcon';
import { translateENtoDE } from 'functions/translator';
import ArrowLeft from '@/components/icons/ArrowLeft';

const TeacherSectionSidebar = ({
  data,
  teacherFilterdData,
  onClose,
  language,
  showTeacherDetails,
  teacherFilterQuery,
  handleInstrumentChange,
}) => {
  return (
    <div className='  bg-white relative'>
      <div className='flex justify-between items-center py-[20px] px-[20px] sticky top-0 z-20 bg-white'>
        <div className='flex items-center gap-2'>
          {/* <div onClick={onClose} className='cursor-pointer'>
            <ArrowLeft />
          </div> */}
          <h3 className='font-semibold text-[19px] text-[#000000DE] font-Roboto'>
            {translateENtoDE('Teachers', language)}
          </h3>
        </div>
        <button onClick={onClose} className='text-gray-600 hover:text-red-500'>
          <CloseIcon />
        </button>
      </div>
      <hr />
      <div className='px-4 sm:px-[24px]'>
        <div className='flex sm:flex-row flex-col items-start sm:items-center gap-[16px] em:gap-0 justify-between mt-[16px] em:mt-[24px] '>
          <p className='font-bold text-[17px] sm:text-[19px] text-[#000000DE] font-Roboto whitespace-nowrap'>{`${
            teacherFilterdData?.length
          } ${translateENtoDE('results', language)}`}</p>
          <TeacherFilterField
            data={data}
            teacherFilterQuery={teacherFilterQuery}
            handleInstrumentChange={handleInstrumentChange}
            language={language}
          />
        </div>
        <ul className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-[16px] sm:mt-[24px] pb-[24px]'>
          {teacherFilterdData?.length
            ? teacherFilterdData?.map((teacher, idx) => {
                return (
                  <TeacherProfile
                    key={teacher.id || idx}
                    teacher={teacher}
                    showTeacherDetails={showTeacherDetails}
                    language={language}
                  />
                );
              })
            : translateENtoDE('Teacher Not Found', language)}
        </ul>
      </div>
    </div>
  );
};

export default TeacherSectionSidebar;
