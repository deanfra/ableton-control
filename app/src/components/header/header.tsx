import { Link } from 'gatsby';
import React from 'react';

import './header.scss';

export const Header = () => (
  <header>
    <h1>Ableton Control</h1>
    <nav>
      <Link to="/" activeClassName="active">
        Setlist
      </Link>
      <Link to="/loopers" activeClassName="active">
        Loopers
      </Link>
    </nav>
  </header>
);
