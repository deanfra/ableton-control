import React from 'react';

import { Header } from '../header/header';
import { PlaybackControl } from '../playback-control/playback-control';
import './layout.scss';

export const Layout: React.FC = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <PlaybackControl />
    </>
  );
};

export default Layout;
