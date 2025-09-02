import React, { useState } from 'react';
import cx from 'classnames';
import FooterTopBar from './FooterTopBar/FooterTopBar';
import FooterBottomBar from './FooterBottomBar/FooterBottomBar';

const Footer = ({ story, isTeacherInfoPage }) => {
  const blok = story?.body.filter((comp) => comp.component === 'global_reference')[0].reference;

  let language = blok.full_slug;

  if (language.includes('ch-de')) {
    language = 'ch-de';
  } else language = 'ch-en';

  return (
    <footer
      className={cx('flex flex-col px-6 bg-light-grey-200 lg:px-20 border-disable', {
        'mt-[64px] border-t-2': !isTeacherInfoPage,
      })}>
      <FooterTopBar
        language={language}
        isTeacherInfoPage={isTeacherInfoPage}
        footerData={blok?.content?.footer}
        blok={blok}
      />
      <FooterBottomBar blok={blok} />
    </footer>
  );
};

export default Footer;
