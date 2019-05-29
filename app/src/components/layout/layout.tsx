import React from 'react';

import { Header } from '../header/header';
import './layout.scss';

export const Layout: React.FC = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};
