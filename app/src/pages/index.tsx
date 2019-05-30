import { RawCuePoint } from 'ableton-js/ns/cue-point';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import Helmet from 'react-helmet';

import './index.scss';

import io from 'socket.io-client';
import { Spinner } from '../components/spinner/spinner';
import { apiUrl } from '../util/api';
const globalSocket = io(`${apiUrl}/global`);
const setlistSocket = io(`${apiUrl}/setlist`);

interface EntryProps {
  cuePoint: RawCuePoint;
  nextCueTime: number;
  songTime: number;
  onClick: (point: RawCuePoint) => any;
}

const Entry: React.FC<EntryProps> = ({
  cuePoint,
  songTime,
  nextCueTime,
  onClick,
}) => {
  const progress = useMemo(() => {
    const rawProgress = (songTime - cuePoint.time) / (nextCueTime - cuePoint.time);
    return Math.min(1, Math.max(0, rawProgress));
  }, [songTime, cuePoint, nextCueTime]);

  const isActive = useMemo(
    () => songTime >= cuePoint.time && songTime < nextCueTime,
    [songTime, cuePoint, nextCueTime],
  );

  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsWaiting(false);
    }
  }, [isActive, songTime]);

  return (
    <li
      onClick={() => {
        setIsWaiting(true);
        onClick(cuePoint);
      }}
      className={classNames({ active: isActive, waiting: isWaiting })}
    >
      <span>{cuePoint.name}</span>
      <div className="progress" style={{ width: `${progress * 100}%` }} />
    </li>
  );
};

const IndexPage = () => {
  const [songTime, setSongTime] = useState<number>();
  const [songLength, setSongLength] = useState<number>();
  const [isPlaying, setIsPlaying] = useState<boolean>();
  const [setlist, setSetlist] = useState<RawCuePoint[]>();

  useEffect(() => {
    fetch(`${apiUrl}/global/status`)
      .then(r => r.json())
      .then(d => {
        setSongTime(d.time);
        setSongLength(d.length);
        setIsPlaying(d.isPlaying);
      });

    fetch(`${apiUrl}/setlist`)
      .then(r => r.json())
      .then(d => {
        setSetlist(d);
      });
  }, []);

  useEffect(() => {
    globalSocket.on('time', setSongTime);
    globalSocket.on('length', setSongLength);
    globalSocket.on('isPlaying', setIsPlaying);
    setlistSocket.on('cuePoints', setSetlist);
    return () => {
      globalSocket.off('time');
      globalSocket.off('length');
      globalSocket.off('isPlaying');
      setlistSocket.off('cuePoints');
    };
  }, []);

  const jumpToCue = (time: number, play = false) => {
    const body = new URLSearchParams();
    body.append('time', String(time));

    if (play) {
      body.append('play', '1');
    }

    fetch(`${apiUrl}/setlist/jump`, {
      method: 'post',
      body,
    });
  };

  return (
    <>
      <Helmet>
        <title>Setlist - Ableton Control</title>
      </Helmet>
      <ul className={classNames('setlist', { playing: isPlaying })}>
        {setlist && songTime !== undefined && songLength !== undefined ? (
          setlist.map((c, index) => (
            <Entry
              cuePoint={c}
              key={c.id}
              songTime={songTime}
              nextCueTime={
                index + 1 < setlist.length ? setlist[index + 1].time : songLength
              }
              onClick={cue => jumpToCue(cue.time, true)}
            />
          ))
        ) : (
          <Spinner />
        )}
      </ul>
    </>
  );
};

export default IndexPage;
