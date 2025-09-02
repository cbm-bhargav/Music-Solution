import React from 'react';
import { v4 as uuidv4 } from 'uuid';
// import { searchClient } from '../../../../config';
import { getStory } from '../../../../utils/getStory';
import TeacherInfo from '../../../../components/TeacherInfoPage';
import { getAlgoliaData, getTeacherInfo } from '../../../../utils/algolia';

// const courses = searchClient.initIndex(process.env.ALGOLIA_COURSEINDEX);
// const teachers = searchClient.initIndex(process.env.ALGOLIA_TEACHERINDEX_PAGE);
// const likes = searchClient.initIndex(process.env.ALGOLIA_RECOMMENDATION_INDEX);

export const getServerSideProps = async ({ params }) => {
  let likesList = [];
  let coursesList = [];
  // const url = process.env.ALGOLIA_URL;
  const story = await getStory(`/${params.language}`);
  const teacher = await getTeacherInfo(params?.id || '');

  // const teachersData = await teachers.search(params?.id, { hitsPerPage: 100 });
  // const teacher = teachersData.hits?.filter((item) => {
  //   return item?.username === params?.id || item?.user_id === params?.id;
  // })[0];

  if (!teacher || !teacher?.uuid) {
    return {
      redirect: {
        permanent: false,
        destination: `/${params.language}/?teachers=notfound`,
      },
    };
  }

  if (teacher?.uuid) {
    // const _courses = await courses.search(teacher?.uuid, { hitsPerPage: 200 });
    // const _likes = await likes.search(teacher?.uuid, { hitsPerPage: 200 });

    // coursesList = _courses?.hits || [];
    // likesList = _likes?.hits || [];

    likesList = await getAlgoliaData({ type: 'likes', id: teacher?.uuid });
    coursesList = await getAlgoliaData({ type: 'courses', id: teacher?.uuid });
  }

  return {
    props: {
      story,
      params,
      userToken: uuidv4(),
      teacher: {
        ...teacher,
        // teacher2: teacher2,
        // courses: coursesList || [],
        // recommendations: likesList?.filter((item) => item?.status !== 'not_published'),
        courses: coursesList?.data || [],
        recommendations: likesList?.data?.filter((item) => item?.status !== 'not_published'),
      },
    },
  };
};

class TeacherInfoPage extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error({ error, errorInfo });
  }

  render() {
    return <TeacherInfo {...this.props} />;
  }
}

export default TeacherInfoPage;
