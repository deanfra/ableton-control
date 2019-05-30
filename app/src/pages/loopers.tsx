import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/layout';
import { Spinner } from '../components/spinner/spinner';

import './loopers.scss';

import io from 'socket.io-client';
import Helmet from 'react-helmet';
const looperSocket = io(`${process.env.GATSBY_API_HOST!}/loopers`);

interface Looper {
  id: number;
  name: string;
  active: boolean;
  state: number;
  trackName: string;
  trackColor: number;
}

const stateMap = { 0: 'stop', 1: 'record', 2: 'play', 3: 'overdub' };
const humanStateMap = {
  0: 'Stopped',
  1: 'Recording',
  2: 'Playing',
  3: 'Overdubbing',
};

interface EntryProps {
  looper: Looper;
  onClick: (looper: Looper) => any;
}

const Entry: React.FC<EntryProps> = ({ looper, onClick }) => {
  return (
    <li
      onClick={() => onClick(looper)}
      className={classNames(stateMap[looper.state], { disabled: !looper.active })}
    >
      <div
        className="color"
        style={{ backgroundColor: `#${looper.trackColor.toString(16)}` }}
      />
      <div className="info">
        <span className="name">
          {looper.name} ({looper.trackName})
        </span>
        <span className="state">{humanStateMap[looper.state]}</span>
      </div>
    </li>
  );
};

const IndexPage = () => {
  const [loopers, setLoopers] = useState<Looper[]>([]);

  useEffect(() => {
    fetch(`${process.env.GATSBY_API_HOST!}/loopers`)
      .then(r => r.json())
      .then(d => setLoopers(d));
  }, []);

  console.log('Loopers:', loopers);

  useEffect(() => {
    looperSocket.on('active', d => {
      console.log('Active', d);
      if (loopers !== undefined) {
        console.log(
          loopers,
          loopers.map(l => (l.id !== d.id ? l : { ...l, active: d.active })),
        );
        setLoopers(
          loopers.map(l => (l.id !== d.id ? l : { ...l, active: d.active })),
        );
      }
    });
    looperSocket.on('state', d => {
      console.log('State', d);
      if (loopers !== undefined) {
        console.log(
          loopers,
          loopers.map(l => (l.id !== d.id ? l : { ...l, state: d.state })),
        );
        setLoopers(loopers.map(l => (l.id !== d.id ? l : { ...l, state: d.state })));
      }
    });
    return () => {
      looperSocket.off('active');
      looperSocket.off('state');
    };
  }, [loopers]);

  const focus = (id: number) => {
    const body = new URLSearchParams();
    body.append('id', String(id));

    fetch(`${process.env.GATSBY_API_HOST!}/loopers/focus`, {
      method: 'post',
      body,
    });
  };

  return (
    <>
      <Helmet>
        <title>Loopers - Ableton Control</title>
      </Helmet>
      <ul className={classNames('loopers')}>
        {loopers ? (
          loopers.map(l => (
            <Entry looper={l} key={l.id} onClick={() => focus(l.id)} />
          ))
        ) : (
          <Spinner />
        )}
      </ul>
    </>
  );
};

export default IndexPage;