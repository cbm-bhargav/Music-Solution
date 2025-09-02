import { useMemo, useEffect, useCallback } from 'react';

const getLocationTypes = (locations = {}) =>
  [
    locations?.studios?.address_list?.length ? 'studios' : '',
    locations?.student_place?.address_list?.length ? 'student_place' : '',
    locations?.teacher_place?.address ? 'teacher_place' : '',
    locations?.online ? 'online' : '',
  ]
    .filter((item) => !!item)
    .join(';');

const getStudentAge = (age_taught = {}) =>
  [age_taught?.adults ? 'adults' : '', age_taught?.kids ? 'kids' : ''].filter((item) => !!item).join(';');

const getCourseParams = (course, teacher) => {
  const kids = course?.prices
    ?.filter((item) => item?.age_taught === 'kids')
    .filter((item) => !!item?.amount)
    .sort((a, b) => a?.amount - b?.amount);
  const adults = course?.prices
    ?.filter((item) => item?.age_taught === 'adults')
    .filter((item) => !!item?.amount)
    .sort((a, b) => a?.amount - b?.amount);

  return {
    course_id: course?.id,
    course_title: course?.name,
    course_type_id: course?.course_type,
    course_instrument_id: course?.instruments?.map((item) => item?.key).join(';'),
    course_skillLevel_id: course?.skill_levels?.join(';'),
    course_locationType_id: course?.locations?.join(';'),
    course_locationAddress_id: '', // @TODO [[course_locationAddress_id(1);course_locationAddress_id(n)]]
    course_studentAge_id: course?.ages?.join(';'),
    course_lessonDuration_id: course?.durations?.join(';'),
    course_hourlyRate_Adults: adults[0]?.amount || teacher?.pricing?.adults?.hour_rate || 0,
    course_hourlyRate_Kids: kids[0]?.amount || teacher?.pricing?.kids?.hour_rate || 0,
    course_surcharge: teacher?.pricing?.surcharge?.price || 0,
  };
};

const getCourseEcommerce = (
  course,
  { value, currency, item_list_id, item_list_name, teacher_page_id, courseIndex }
) => ({
  value,
  currency,
  item_list_id,
  item_list_name,
  items: [
    {
      item_list_id,
      item_list_name,
      item_id: course?.id,
      item_name: `${course?.name} ${course?.id}`,
      affiliation: 'Matchspace Music',
      item_brand: teacher_page_id,
      item_category: 'course',
      item_category2: course?.course_type,
      location_id: '', // @TODO
      index: courseIndex,
    },
  ],
});

const useTeacherAnalytics = ({ teacher = {}, user_language = 'ch-en', algolia_user_token }) => {
  const params = useMemo(
    () => ({
      global: {
        value: 0,
        user_id: '',
        user_role: '',
        user_language: user_language.split('-')[1],
        currency: 'CHF',
        user_login: 'logged_out',
        algolia_user_token,
      },
      item_list_id: teacher?.username,
      teacher_page_id: teacher?.username,
      teacherParams: {
        teacher_id: teacher?.user_id,
        teacher_page_id: teacher?.username,
        teacher_type_id: teacher?.profile_type,
      },
      item_list_name: `${teacher?.name} ${teacher?.username}`,
    }),
    [user_language, teacher, algolia_user_token]
  );

  const selectCourse = useCallback(
    (course, courseIndex, teacher) => {
      window.dataLayer = window?.dataLayer || [];

      const {
        global,
        item_list_id,
        item_list_name,
        teacherParams: { teacher_page_id },
      } = params;
      const { currency, value } = global;

      window?.dataLayer.push({
        event: 'select_item',
        ...global,
        item_category: 'course',
        item_category2: course?.course_type,
        ...getCourseParams(course, teacher),
        ecommerce: getCourseEcommerce(course, {
          value,
          currency,
          item_list_id,
          item_list_name,
          teacher_page_id,
          courseIndex,
        }),
      });
    },
    [params]
  );

  const viewCourseModal = useCallback(
    (course, courseIndex, teacher) => {
      window.dataLayer = window?.dataLayer || [];

      const { global, item_list_id, item_list_name, teacherParams } = params;
      const { currency, value } = global;

      window?.dataLayer.push({
        event: 'view_item',
        ...global,
        item_category: 'course',
        item_category2: course?.course_type,
        ...teacherParams,
        ...getCourseParams(course, teacher),
        ecommerce: getCourseEcommerce(course, {
          value,
          currency,
          item_list_id,
          item_list_name,
          teacher_page_id: teacherParams.teacher_page_id,
          courseIndex,
        }),
      });
    },
    [params]
  );

  const contactStart = useCallback(() => {
    window.dataLayer = window?.dataLayer || [];

    window?.dataLayer.push({
      event: 'student_contact_start',
      ...params.global,
      ...params.teacherParams,
      student_contact_text: user_language === 'ch-en' ? 'CONTACT ME' : 'KONTAKTIERE MICH',
    });
  }, [params, user_language]);

  const contactLevel = useCallback(
    (level, message) => {
      window.dataLayer = window?.dataLayer || [];

      window?.dataLayer.push({
        event: `student_contact_prompt_h${level}`,
        prompt_message: message,
        ...params.global,
        ...params.teacherParams,
      });
    },
    [params]
  );

  const contactFinish = useCallback(() => {
    window.dataLayer = window?.dataLayer || [];

    window?.dataLayer.push({
      event: 'student_contact_finish',
      ...params.global,
      ...params.teacherParams,
      value: 20,
    });
  }, [params]);

  const selectPromotion = useCallback(
    (promo, promoIndex, name) => {
      window.dataLayer = window?.dataLayer || [];

      const { item_list_id, item_list_name, global } = params;
      const { currency, value } = global;

      window?.dataLayer.push({
        event: name, // view_promotion, select_promotion
        ...global,
        ecommerce: {
          item_list_id,
          item_list_name,
          currency,
          value,
          creative_name: promo?.creative_name,
          creative_slot: promo?.creative_slot,
          promotion_id: promo?.promotion_id,
          promotion_name: promo?.promotion_name,
          items: [
            {
              item_list_id,
              item_list_name,
              item_id: promo?.promotion_id,
              item_name: promo?.promotion_name,
              affiliation: 'Matchspace Music',
              item_brand: promo?.promotion_brand,
              item_category: 'promotion',
              item_category2: '',
              location_id: '', // @TODO
              index: promoIndex,
            },
          ],
        },
      });
    },
    [params]
  );

  const addToCart = useCallback(
    ({ course, form, discount, price, teacher }) => {
      window.dataLayer = window?.dataLayer || [];

      const { item_list_id, item_list_name, global, teacherParams } = params;
      const { currency, value } = global;

      window?.dataLayer.push({
        event: 'add_to_cart',
        ...global,
        item_category: 'course',
        item_category2: course?.course_type,
        ...teacherParams,
        ...getCourseParams(course, teacher),

        course_locationType_selected: form?.location,
        course_locationAddress_selected: form?.geoloc,
        course_studentAge_selected: form?.ageGroupe,
        course_lessonDuration_selected: form?.duration,
        course_package_selected: form?.lessons,

        ecommerce: {
          currency,
          value,
          item_list_id,
          item_list_name,
          items: [
            {
              item_list_id,
              item_list_name,
              item_id: course?.id,
              item_name: `${course?.name} ${course?.id}`,
              affiliation: 'Matchspace Music',
              item_brand: teacherParams.teacher_id,
              item_category: 'course',
              item_category2: course?.course_type,
              location_id: '', // @TODO [[emptyForNow]]
              price,
              quantity: 1,
              discount,
            },
          ],
        },
      });
    },
    [params]
  );

  const share = useCallback(
    (method, content_type) => {
      window.dataLayer = window?.dataLayer || [];

      const { global, teacherParams } = params;

      window?.dataLayer.push({
        event: 'share',
        ...global,
        ...teacherParams,
        method, // link, email, facebook, twitter, whatsapp
        content_type, // page_teacher, page_course, gallery_item
        item_id: teacherParams.teacher_id,
      });
    },
    [params]
  );

  const messageStart = useCallback(() => {
    window.dataLayer = window?.dataLayer || [];

    window?.dataLayer.push({
      event: 'student_contact_start_message',
      ...params.global,
      ...params.teacherParams,
    });
  }, [params]);

  const messageLater = useCallback(() => {
    window.dataLayer = window?.dataLayer || [];

    window?.dataLayer.push({
      event: 'student_contact_later',
      ...params.global,
      ...params.teacherParams,
    });
  }, [params]);

  const messageAbort = useCallback(() => {
    window.dataLayer = window?.dataLayer || [];

    window?.dataLayer.push({
      event: 'student_contact_abort',
      ...params.global,
      ...params.teacherParams,
    });
  }, [params]);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window?.dataLayer.push({ ecommerce: null });

    const { global, teacher_page_id } = params;
    const { currency, value } = global;

    // view_item
    window?.dataLayer.push({
      event: 'view_item',
      ...global,
      item_category: 'profile',
      item_category2: 'music_teacher',
      teacher_id: teacher?.user_id,
      teacher_page_id,
      teacher_type_id: teacher?.profile_type,
      teacher_instrument_id: teacher?.instruments.map((item) => item?.key).join(';'),
      teacher_locationType_id: getLocationTypes(teacher?.locations || {}),
      teacher_locationAddress_id: '', // @TOD '[[teacher_locationAddress_id(1);teacher_locationAddress_id(n)]]',
      teacher_language_id: teacher?.languages.map((item) => item?.key).join(';'),
      teacher_studentAge_id: getStudentAge(teacher?.age_taught || {}),
      teacher_skillLevel_id: teacher?.skill_levels_taught?.join(';'),
      teacher_genre_id: teacher?.genres.map((item) => item?.key).join(';'),
      teacher_recommendation_count: teacher?.recommendations?.length,
      teacher_course_count: teacher?.courses?.length,
      teacher_course_private_count: teacher?.courses?.filter((item) => item?.course_type === 'pri_vate')?.length || 0,
      teacher_course_group_count: teacher?.courses?.filter((item) => item?.course_type === 'group_course')?.length || 0,
      teacher_course_workshop_count: teacher?.courses?.filter((item) => item?.course_type === 'workshop')?.length || 0,
      teacher_course_camp_count: teacher?.courses?.filter((item) => item?.course_type === 'music_camp')?.length || 0,
      teacher_experience_count: teacher?.experience?.length || 0,
      teacher_education_count: teacher?.education?.length || 0,
      teacher_gallery_count: teacher?.gallery?.length || 0,
      teacher_award_count: 0, // @TODO
      teacher_performance_count: 0, // @TODO
      teacher_recording_count: 0, // @TODO
      ecommerce: {
        currency,
        value,
        items: [
          {
            item_id: teacher_page_id,
            item_name: `${teacher?.name} ${teacher_page_id}`,
            affiliation: 'Matchspace Music',
            item_brand: teacher_page_id, // @TODO
            item_category: 'profile',
            item_category2: 'music_teacher',
            location_id: '', // @TODO [[emptyForNow]]
          },
        ],
      },
    });

    // view_item_list
    window?.dataLayer.push({
      event: 'view_item_list',
      item_category: 'course',
      item_category2: 'private_lessons', // item?.course_type,
      ecommerce: {
        item_list_id: teacher_page_id,
        item_list_name: `${teacher?.name} ${teacher?.username}`,
        currency,
        value,
        items: teacher?.courses?.map((item, index) => ({
          item_list_id: teacher_page_id,
          item_list_name: `${teacher?.name} ${teacher?.username}`,
          item_id: item?.id,
          item_name: `${item?.name} ${item?.id}`,
          affiliation: 'Matchspace Music',
          item_brand: teacher_page_id,
          item_category: 'course',
          item_category2: 'private_lessons', // item?.course_type,
          location_id: '', // @TODO [[emptyForNow]]
          index,
        })),
      },
    });
  }, [params, teacher]);

  return {
    share,
    addToCart,
    contactStart,
    contactLevel,
    selectCourse,
    messageLater,
    messageAbort,
    messageStart,
    contactFinish,
    viewCourseModal,
    selectPromotion,
  };
};

export default useTeacherAnalytics;
