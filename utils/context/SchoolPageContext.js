import { createContext, useContext, useState, useEffect } from 'react';

export const SchoolPageContext = createContext(null);

export function SchoolPageProvider({ children }) {
  const [currentSelectedTeacher, setCurrentSelectedTeacher] = useState({});
  const [isMoreCourseSidebarOpen, setIsMoreCourseSidebarOpen] = useState(false);
  const [isCourseDetailSidebar, setIsCourseDetailSidebar] = useState(false);
  const [isTeacherDetailSidebar, setIsTeacherDetailSidebar] = useState(false);
  const [isMoreTeacherSidebarOpen, setMoreTeacherSidebarOpen] = useState(false)
  const [show, setShow] = useState(false);
  const [courseCategoriesData, setCourseCategoriesData] = useState([])
  const [instrumentFilterAbout, setInstrumentFilterAbout] = useState('')
  const [savedInstrument, setSavedInstrument] = useState('')

  useEffect(() => {
    if (isMoreCourseSidebarOpen || isCourseDetailSidebar || isTeacherDetailSidebar || isMoreTeacherSidebarOpen || show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMoreCourseSidebarOpen, isCourseDetailSidebar, isTeacherDetailSidebar, show]);

  return (
    <SchoolPageContext.Provider
      value={{
        currentSelectedTeacher,
        setCurrentSelectedTeacher,
        isCourseDetailSidebar,
        setIsCourseDetailSidebar,
        isTeacherDetailSidebar,
        setIsTeacherDetailSidebar,
        isMoreTeacherSidebarOpen,
        setMoreTeacherSidebarOpen,
        isMoreCourseSidebarOpen,
        setIsMoreCourseSidebarOpen,
        show,
        setShow,
        courseCategoriesData,
        setCourseCategoriesData,
        instrumentFilterAbout,
        setInstrumentFilterAbout,
        savedInstrument,
        setSavedInstrument
      }}
    >
      {children}
    </SchoolPageContext.Provider>
  );
}

export function useSchoolPage() {
  const context = useContext(SchoolPageContext);
  if (!context) {
    throw new Error('useSchoolPage must be used within a SchoolPageProvider');
  }
  return context;
}