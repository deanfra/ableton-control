import { Ableton } from "ableton-js";
import { Server } from "socket.io";
import { Router } from "express";
import throttle from "lodash/throttle";

export const global = (socketIo: Server, ableton: Ableton) => {
  const router = Router();
  const io = socketIo.of("global");
  let isPaused = false;

  router.get("/status", async (req, res) => {
    const [
      time,
      length,
      tempo,
      recordMode,
      signatureNumerator,
      isPlaying,
      isCountingIn,
      canJumpToNextCue,
      canJumpToPrevCue,
    ] = await Promise.all([
      ableton.song.get("current_song_time"),
      ableton.song.get("song_length"),
      ableton.song.get("tempo"),
      ableton.song.get("record_mode"),
      ableton.song.get("signature_numerator"),
      ableton.song.get("is_playing"),
      ableton.song.get("is_counting_in"),
      ableton.song.get("can_jump_to_next_cue"),
      ableton.song.get("can_jump_to_prev_cue"),
    ]);

    res.send({
      time,
      length,
      tempo,
      recordMode,
      signatureNumerator,
      isPlaying,
      isCountingIn,
      canJumpToNextCue,
      canJumpToPrevCue,
    });
  });

  router.post("/stop", async (req, res) => {
    await ableton.song.stopPlaying();
    isPaused = false;
    res.send();
  });

  router.post("/pause", async (req, res) => {
    await ableton.song.stopPlaying();
    isPaused = true;
    res.send();
  });

  router.post("/play", async (req, res) => {
    if (isPaused) {
      await ableton.song.continuePlaying();
    } else {
      await ableton.song.startPlaying();
    }

    isPaused = false;
    res.send();
  });

  router.post("/startRecording", async (req, res) => {
    await ableton.song.set("record_mode", 1);
    res.send();
  });

  router.post("/stopRecording", async (req, res) => {
    await ableton.song.set("record_mode", 0);
    res.send();
  });

  router.post("/jumpToNextCue", async (req, res) => {
    await ableton.song.jumpToNextCue();
    res.send();
  });

  router.post("/jumpToPrevCue", async (req, res) => {
    await ableton.song.jumpToPrevCue();
    res.send();
  });

  const events = () => {
    ableton.song.addListener(
      "current_song_time",
      throttle(d => io.emit("time", d), 250),
    );
    ableton.song.addListener("song_length", d => io.emit("length", d));
    ableton.song.addListener("tempo", d => io.emit("tempo", d));
    ableton.song.addListener("record_mode", d => io.emit("recordMode", d));
    ableton.song.addListener("signature_numerator", d =>
      io.emit("signatureNumerator", d),
    );
    ableton.song.addListener("is_playing", d => io.emit("isPlaying", d));
    ableton.song.addListener("is_counting_in", d => io.emit("isCountingIn", d));
    ableton.song.addListener("can_jump_to_next_cue", d =>
      io.emit("canJumpToNextCue", d),
    );
    ableton.song.addListener("can_jump_to_prev_cue", d =>
      io.emit("canJumpToPrevCue", d),
    );
  };

  events();
  ableton.addConnectionListener("connect", events);

  return router;
};
