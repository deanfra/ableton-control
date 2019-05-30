import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';

import {
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  RecordIcon,
  StopIcon,
} from '../icons/icons';
import './playback-control.scss';

const globalSocket = io(`${process.env.GATSBY_API_HOST!}/global`);

const play = () =>
  fetch(`${process.env.GATSBY_API_HOST!}/global/play`, { method: 'post' });

const pause = () =>
  fetch(`${process.env.GATSBY_API_HOST!}/global/pause`, { method: 'post' });

const stop = () =>
  fetch(`${process.env.GATSBY_API_HOST!}/global/stop`, { method: 'post' });

const startRecording = () =>
  fetch(`${process.env.GATSBY_API_HOST!}/global/startRecording`, { method: 'post' });

const stopRecording = () =>
  fetch(`${process.env.GATSBY_API_HOST!}/global/stopRecording`, { method: 'post' });

const jumpToNextCue = () =>
  fetch(`${process.env.GATSBY_API_HOST!}/global/jumpToNextCue`, { method: 'post' });

const jumpToPrevCue = () =>
  fetch(`${process.env.GATSBY_API_HOST!}/global/jumpToPrevCue`, { method: 'post' });

export const PlaybackControl: React.FC = () => {
  const [songTime, setSongTime] = useState<number>();
  const [tempo, setTempo] = useState<number>();
  const [signatureNumerator, setSignatureNumerator] = useState<number>();
  const [isPlaying, setIsPlaying] = useState<boolean>();
  const [isCountingIn, setIsCountingIn] = useState<boolean>();
  const [recordMode, setRecordMode] = useState<boolean>();
  const [canJumpToNextCue, setCanJumpToNextCue] = useState<boolean>();
  const [canJumpToPrevCue, setCanJumpToPrevCue] = useState<boolean>();

  const humanTime = useMemo(() => {
    if (!songTime || !signatureNumerator) {
      return '0.0';
    }
    const bars = Math.floor(songTime / signatureNumerator);
    const beats = Math.floor(songTime - bars * signatureNumerator);
    return `${bars + 1}.${beats + 1}`;
  }, [songTime, signatureNumerator]);

  useEffect(() => {
    fetch(`${process.env.GATSBY_API_HOST!}/global/status`)
      .then(r => r.json())
      .then(d => {
        setSongTime(d.time);
        setTempo(d.tempo);
        setSignatureNumerator(d.signatureNumerator);
        setRecordMode(d.recordMode);
        setIsPlaying(d.isPlaying);
        setIsCountingIn(d.isCountingIn);
        setCanJumpToNextCue(d.canJumpToNextCue);
        setCanJumpToPrevCue(d.canJumpToPrevCue);
      });
  }, []);

  useEffect(() => {
    globalSocket.on('time', setSongTime);
    globalSocket.on('tempo', setTempo);
    globalSocket.on('signatureNumerator', setSignatureNumerator);
    globalSocket.on('recordMode', setRecordMode);
    globalSocket.on('isPlaying', setIsPlaying);
    globalSocket.on('isCountingIn', setIsCountingIn);
    globalSocket.on('canJumpToNextCue', setCanJumpToNextCue);
    globalSocket.on('canJumpToPrevCue', setCanJumpToPrevCue);

    return () => {
      globalSocket.off('time');
      globalSocket.off('tempo');
      globalSocket.off('signatureNumerator');
      globalSocket.off('sessionRecord');
      globalSocket.off('isPlaying');
      globalSocket.off('isCountingIn');
      globalSocket.off('canJumpToNextCue');
      globalSocket.off('canJumpToPrevCue');
    };
  }, []);

  return (
    <footer className="playback">
      <div className="info">
        <div className="time">{humanTime}</div>
        <div className="tempo">
          {tempo && `${Math.round(tempo * 100) / 100} BPM`}
        </div>
      </div>

      <div className="actions">
        <button
          title="Jump to previous cue"
          disabled={!canJumpToPrevCue}
          onClick={() => jumpToPrevCue()}
        >
          <BackwardIcon />
        </button>

        {isPlaying ? (
          <button title="Pause" onClick={() => pause()}>
            <PauseIcon />
          </button>
        ) : (
          <button title="Play" onClick={() => play()}>
            <PlayIcon />
          </button>
        )}

        <button title="Stop" onClick={() => stop()}>
          <StopIcon />
        </button>

        <button
          title="Record"
          className={classNames({
            recording: recordMode && !isCountingIn,
            'counting-in': isCountingIn,
          })}
          onClick={() => (recordMode ? stopRecording() : startRecording())}
        >
          <RecordIcon />
        </button>

        <button
          title="Jump to next cue"
          disabled={!canJumpToNextCue}
          onClick={() => jumpToNextCue()}
        >
          <ForwardIcon />
        </button>
      </div>
    </footer>
  );
};
