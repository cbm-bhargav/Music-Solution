import React from 'react';
import { attributesToRetrieve } from '../../../../../constants/algoliaAttributes';
import EvtaTeachers from '../../../../../components/evta/EvtaTeachers';
import { searchClient } from '../../../../../config';

const EVTA_QUERY = 'EVTA';
const EVTA_INSTRUMENT = 'singing';
const instruments = searchClient.initIndex(process.env.ALGOLIA_INSTRUMENTS);
const teachers = searchClient.initIndex(process.env.ALGOLIA_TEACHERINDEX_EVTA);

const defaultInstrument = {
  id: 77,
  de: 'Gesang',
  en: 'Singing',
  key: 'singing',
  popular_index: 3,
  sub_category: 'voice',
  delimiter_teacher: 'slehrer*in',
  delimiter_lessons: 'sunterricht',
};

export const getServerSideProps = async ({ params }) => {
  const allInstruments = await instruments.search(EVTA_INSTRUMENT);

  const teachersData = await teachers.search(EVTA_QUERY, {
    hitsPerPage: 300,
    attributesToRetrieve,
  });

  return {
    props: {
      teachers: teachersData?.hits || [],
      language: params?.language || 'ch-en',
      instrument: allInstruments?.hits?.filter((item) => item?.key === EVTA_INSTRUMENT)[0] || defaultInstrument,
    },
  };
};

class TeachersEvtaPage extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error({ error, errorInfo });
  }

  render() {
    return <EvtaTeachers {...this.props} />;
  }
}

export default TeachersEvtaPage;
