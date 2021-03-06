#!/usr/bin/env node

import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import socketIo from "socket.io";
import http from "http";
import path from "path";
import { Ableton } from "ableton-js";

import { setlist } from "./sections/setlist";
import { global } from "./sections/global";
import { loopers } from "./sections/loopers";

const ableton = new Ableton();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/global", global(io, ableton));
app.use("/api/setlist", setlist(io, ableton));
app.use("/api/loopers", loopers(io, ableton));

app.use(express.static(path.join(__dirname, "../app/public")));

const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Listening on port ${port}`));
