import React from 'react';
import AskQuestionSection from './AskQuestionSection';
import ProfileModal from './ProfileModal';
import HowItWorksForTeacherSection from './HowItWorksForTeacherSection';
import useWindowSize from 'hooks/useWindowSize';
import useIntersectionObserver from 'hooks/useIntersectionObserver';

const TeacherContactSection = ({contactHandle, language, pricesHandle, handleOpenGuaranteeModal, teacher, headRef}) => {
  const { width } = useWindowSize();
  const { isIntersecting: isHeadVisible } = useIntersectionObserver(headRef, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1, 
  });

  return (
    <div className='max-[1100px]:flex smd:flex-row flex-col max-[1100px]:gap-4 max-[1100px]:pb-[20px] relative h-full'>
      <AskQuestionSection contactHandle={contactHandle} teacher={teacher} language={language} />
      {width > 1100 && <HowItWorksForTeacherSection language={language} pricesHandle={pricesHandle} handleOpenGuaranteeModal={handleOpenGuaranteeModal} headRef={headRef}/>}
    {  !isHeadVisible && <div className='min-[1101px]:block hidden sticky top-14 mb-3'>
        <ProfileModal teacher={teacher} contactHandle={contactHandle} language={language} />
      </div>}
    </div>
  );
};

export default TeacherContactSection;
