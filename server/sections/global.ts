import { Ableton } from "ableton-js";
import { Server } from "socket.io";
import { Router } from "express";
import throttle from "lodash/throttle";

export const global = (socketIo: Server, ableton: Ableton) => {
  const router = Router();
  const io = socketIo.of("global");

  router.get("/status", async (req, res) => {
    const [time, length, tempo, isPlaying, isCountingIn] = await Promise.all([
      ableton.song.get("current_song_time"),
      ableton.song.get("song_length"),
      ableton.song.get("tempo"),
      ableton.song.get("is_playing"),
      ableton.song.get("is_counting_in"),
    ]);

    res.send({ time, length, tempo, isPlaying, isCountingIn });
  });

  const events = () => {
    ableton.song.addListener(
      "current_song_time",
      throttle(d => io.emit("time", d), 500),
    );
    ableton.song.addListener("song_length", d => io.emit("length", d));
    ableton.song.addListener("tempo", d => io.emit("tempo", d));
    ableton.song.addListener("is_playing", d => io.emit("isPlaying", d));
    ableton.song.addListener("is_counting_in", d => io.emit("isCountingIn", d));
  };

  events();
  ableton.addConnectionListener("connect", events);

  return router;
};
