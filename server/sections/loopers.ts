import { Ableton } from "ableton-js";
import { Server } from "socket.io";
import { Router } from "express";
import { Device } from "ableton-js/ns/device";
import { Track } from "ableton-js/ns/track";

enum LooperState {
  Stop = 0,
  Record = 1,
  Play = 2,
  Overdub = 3,
}

interface LooperMeta {
  looper: Device;
  track: Track;
  state: LooperState;
  active: boolean;
}

export const loopers = (socketIo: Server, ableton: Ableton) => {
  const router = Router();
  const io = socketIo.of("loopers");

  const loopers = new Map<number, LooperMeta>();

  router.get("/", async (req, res) => {
    res.send(
      await Promise.all(
        Array.from(loopers.values()).map(async l => ({
          id: l.looper.raw.id,
          name: await l.looper.get("name"),
          active: l.active,
          state: l.state,
          trackName: await l.track.get("name"),
          trackColor: await l.track.get("color"),
        })),
      ),
    );
  });

  router.post("/focus", async (req, res) => {
    const looper = loopers.get(Number(req.body.id));

    if (!looper) {
      res.status(404).send();
      return;
    }

    await ableton.song.view.selectDevice(looper.looper);
    res.send();
  });

  const setupAllLoopers = async () => {
    const allLoopers = [
      ...(await getLoopersForTracks(await ableton.song.get("tracks"))),
      ...(await getLoopersForTracks(await ableton.song.get("return_tracks"))),
      ...(await getLoopersForTracks([await ableton.song.get("master_track")])),
    ];

    for (const looper of allLoopers) {
      const params = await looper.looper.get("parameters");

      const active = params.find(p => p.raw.name === "Device On");
      const state = params.find(p => p.raw.name === "State");

      await active!.addListener("value", v => {
        io.emit("active", {
          id: looper.looper.raw.id,
          active: Boolean(v),
        });
        loopers.get(looper.looper.raw.id)!.active = Boolean(v);
      });

      await state!.addListener("value", v => {
        io.emit("state", {
          id: looper.looper.raw.id,
          state: v,
        });
        loopers.get(looper.looper.raw.id)!.state = v;
      });
    }

    loopers.clear();

    for (const looper of allLoopers) {
      loopers.set(looper.looper.raw.id, looper);
    }
  };

  const getLoopersForTracks = async (tracks: Track[]) => {
    const loopers = await Promise.all(
      tracks.map(async t => {
        const loopers = (await t.get("devices")).filter(
          d => d.raw.class_name === "Looper",
        );

        return Promise.all(
          loopers.map(async l => {
            const params = await l.get("parameters");

            return {
              looper: l,
              track: t,
              active: Boolean(
                params.find(p => p.raw.name === "Device On")!.raw.value,
              ),
              state: params.find(p => p.raw.name === "State")!.raw
                .value as LooperState,
            } as LooperMeta;
          }),
        );
      }),
    );

    return ([] as LooperMeta[]).concat(...loopers);
  };

  const events = () => {
    setupAllLoopers();
  };

  events();
  ableton.addConnectionListener("connect", events);

  return router;
};
