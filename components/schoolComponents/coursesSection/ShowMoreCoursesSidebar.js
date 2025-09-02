import CoursesSelectField from './CoursesSelectField';
import CourseCard from './CourseCard';
import { translateENtoDE } from 'functions/translator';
import CloseIcon from '@/components/icons/closeIcon';

const ShowMoreCoursesSidebar = ({ data, onClose, language, imageSize,showPopup,seoActions ,handleShowDetail,filteredCourses,
courseFilterQuery,handleInstrumentChange}) => {

    return (
      <div className=' '>
        <div className='flex justify-between items-center pb-4 border-b-[1px] border-[#E4E7EC] p-[20px] sticky top-0 z-20 bg-white'>
          <h3 className='font-semibold text-[19px] text-[#000000DE]   font-Roboto'>{translateENtoDE('Courses',language)}</h3>
          <button onClick={onClose} className='text-gray-600 hover:text-red-500'>
            <CloseIcon />
          </button>
        </div>
        <div className='flex sm:flex-row flex-col items-start sm:items-center gap-[16px] sm:gap-0 justify-between mt-[16px] sm:mt-[24px] px-[16px] sm:px-[24px]'>
          <p className='font-bold text-[19px] text-[#000000DE] font-Roboto flex gap-1'>
            <span>{filteredCourses && filteredCourses.length}</span> {language == 'ch-en' ? 'results' : 'Resultate'}
          </p>
          <CoursesSelectField
            courses={data}
            handleInstrumentChange={handleInstrumentChange}
            language={language}
            courseFilterQuery={courseFilterQuery}
          />
        </div>
        <div className='p-[16px] sm:p-[24px]'>
          {Array.isArray(filteredCourses) && filteredCourses.length > 0 ? (
            <ul className='flex flex-col gap-2 '>
              {filteredCourses.map((item, index) =>
                item ? (
                  <CourseCard
                    item={item}
                    key={item?.id || index}
                    courseIndex={index}
                    language={language}
                    imageSize={imageSize}
                    onClick={() => handleShowDetail(item)}
                  />
                ) : null
              )}
            </ul>
          ) : (
            <div className='text-gray-500 text-center mt-4'>{translateENtoDE('Courses not available',language)}</div>
          )}
        </div>
      </div>
    );
};

export default ShowMoreCoursesSidebar;
