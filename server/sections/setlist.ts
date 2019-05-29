import { Ableton } from "ableton-js";
import { Server } from "socket.io";
import { Router } from "express";

export const setlist = (socketIo: Server, ableton: Ableton) => {
  const router = Router();
  const io = socketIo.of("setlist");

  router.get("/", async (req, res) => {
    const cuePoints = await ableton.song.get("cue_points");
    res.send(cuePoints.map(p => p.raw));
  });

  router.post("/jump", async (req, res) => {
    const cues = await ableton.song.get("cue_points");
    const cue = cues.find(c => c.raw.time === Number(req.body.time));

    if (!cue) {
      res.send();
      return;
    }

    await cue.jump();

    if (req.body.play && !(await ableton.song.get("is_playing"))) {
      await ableton.song.set("current_song_time", cue.raw.time);
      await ableton.song.set("is_playing", true);
    }

    res.send();
  });

  const events = () => {
    ableton.song.addListener("cue_points", d =>
      io.emit("cuePoints", d.map(p => p.raw)),
    );
  };

  events();
  ableton.addConnectionListener("connect", events);

  return router;
};
