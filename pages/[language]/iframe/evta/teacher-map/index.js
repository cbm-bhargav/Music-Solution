import React from 'react';
import { attributesToRetrieve } from '../../../../../constants/algoliaAttributes';
import EvtaMap from '../../../../../components/evta/EvtaMap';
import { searchClient } from '../../../../../config';

const EVTA_QUERY = 'EVTA';
// const EVTA_INSTRUMENT = 'singing';
const teachers = searchClient.initIndex(process.env.ALGOLIA_TEACHERINDEX_EVTA);

export const getServerSideProps = async ({ params }) => {
  const teachersData1 = await teachers.search(EVTA_QUERY, {
    page: 0,
    hitsPerPage: 250,
    attributesToRetrieve,
  });
  const teachersData2 = await teachers.search(EVTA_QUERY, {
    page: 1,
    hitsPerPage: 250,
    attributesToRetrieve,
  });

  const data = [...(teachersData1?.hits || []), ...(teachersData2?.hits || [])];

  return {
    props: {
      teachers: data || [],
      language: params?.language || 'ch-en',
    },
  };
};

class TeachersEvtaMapPage extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error({ error, errorInfo });
  }

  render() {
    return <EvtaMap {...this.props} />;
  }
}

export default TeachersEvtaMapPage;
