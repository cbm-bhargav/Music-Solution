import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import algoliasearch from 'algoliasearch/lite';
import * as algoliaCacheCommon from '@algolia/cache-common';

import Layout from '../../../../components/Layout';
import InstrumentLandingPage from '../../../../components/InstrumentLandingPage';
import { getInstrumentById } from '@/utils/getInstrumentById';
import StoryblokService from '../../../../utils/storyblok-service';
import { changeLanguage, findComponent } from '../../../../utils';
import { searchClient, instrumentsIndex, algoliaClient } from '../../../../config';
import { fetchInstrumentsData, fetchTeachersData, fetchStoryData, fetchInstrumentLocations } from '../../../../apiHelpers';

import StructuredData from '@/components/StructuredData';

const getTeachers = algoliaClient.initIndex(process.env.ALGOLIA_TEACHERINDEX_INSTRUMENT);
const likes = searchClient.initIndex(process.env.ALGOLIA_RECOMMENDATION_INDEX);

export async function getServerSideProps({ params }) {
    StoryblokService.setQuery(params);
    const language = 'ch-en';
    const instruments = await fetchInstrumentsData(instrumentsIndex);

    const instrument = getInstrumentById(instruments, 'piano', 'en') || null;

    const storyFetchResult = await fetchStoryData(StoryblokService, language, 'music-lessons/piano-lessons');
    const teachers = await fetchTeachersData(getTeachers, instrument?.key);

    const story = storyFetchResult.result?.data?.story || null;
    const status = storyFetchResult.status;

    const likesList = (await likes?.search('piano'))?.hits || [];

    return {
        props: {
            recommendations: likesList,
            instrument,
            instruments,
            _online: teachers?.hits || [],
            language,
            story,
            status,
        },
    };
}

function PianoLessonsPage({ story, language, instrument, instruments, _online, recommendations }) {
    const [onlineTeachers, setOnlineTeachers] = useState(_online || []);
    const [instrumentLocations, setInstrumentLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const loadInstrumentLocations = async () => {
            setIsLoading(true);
            const { data, error } = await fetchInstrumentLocations('ch-en');
            if (data) {
                setInstrumentLocations(data);
            }
            if (error) {
                setError(error);
            }
            setIsLoading(false);
        };

        loadInstrumentLocations();
    }, [language]);

    const [globalReference, pageContent] = story.content.body;

    const componentIds = [
        'hero-component',
        'two-col-component',
        'links-component',
        'table-component',
        'faq-component',
        'two-col-component-2',
        'teaser-component',
        'lined-card-component',
    ];
    const [
        heroComponent,
        twoColComponent,
        linksComponent,
        tableComponent,
        faqComponent,
        twoColComponent2,
        teaserComponent,
        linedCardComponent,
    ] = componentIds.map((id) => findComponent(pageContent.components, id));

    return (
        <Layout
            noIndex={story?.content?.noIndex}
            meta={story?.content?.meta}
            keywords={story?.content?.keywords}
            alternateSlug={story.alternates[0]?.full_slug}
            language={language}
            story={story?.content}
            languageChange={() => (location.href = location.href.replace(
                'ch-en/music-lessons/piano-lessons',
                'ch-de/musikunterricht/klavierunterricht'
            ))}>
            <InstrumentLandingPage
                recommendations={recommendations}
                teachers={onlineTeachers}
                instrument={instrument}
                language={language}
                instrumentLocations={instrumentLocations}
                pageContent={{
                    heroComponent,
                    twoColComponent,
                    linksComponent,
                    tableComponent,
                    faqComponent,
                    twoColComponent2,
                    teaserComponent,
                    linedCardComponent,
                }}
                titleTexts={{
                    mainTitle: `Piano lessons in Switzerland`,
                    teacherTitle: 'Our qualified piano teachers',
                    recommendationsTitle: 'Recommendations from our piano students'
                }}
            />
            <StructuredData
                data={{
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "How do I know that the piano teachers are qualified?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "All Matchspace Music piano teachers are checked by a qualified music teacher and activated on our platform."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "How much do piano lessons cost?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "The cost of lessons varies from canton to canton and starts at around CHF 85 to CHF 115 per hour. A subscription with 5 lessons costs around CHF 340 for children and around CHF 425 for adults."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "From what age can you learn to play the piano?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Children can learn to play the piano from around 4 years old, depending on their stage of development. Piano lessons are also ideal for teenagers, adults and senior citizens up to an advanced age."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Where do piano lessons take place?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Our piano teachers offer their lessons in their studio, as a home visit, i.e. at the piano student's home, or online lessons if required."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "How do I find the right piano teacher?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Hundreds of qualified piano teachers teach at Matchspace Music. Search for the instrument in your area and choose the teacher that suits your needs. Get in touch and arrange your first lesson."
                            }
                        }
                    ]
                }}
            />
        </Layout>
    );
}

export default PianoLessonsPage;
