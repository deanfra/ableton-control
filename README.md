# Ableton Web Control

[![Current Version](https://img.shields.io/npm/v/ableton-web-control.svg)](https://www.npmjs.com/package/ableton-web-control/)

Ableton Web Control lets you control your instance or instances of Ableton using your browser.

![Screenshots](https://i.imgur.com/RzW7HSh.jpg)

## Prerequisites

To use this library, you'll need to install and activate the MIDI Remote Script in
Ableton.js. To do that, copy the `midi-script` folder of
[`ableton-js`](https://github.com/leolabs/ableton.js) to Ableton's
Remote Scripts folder. If you prefer, you can rename it to something like `AbletonJS`
for better identification. The MIDI Remote Scripts folder is usually located at:

- **Windows:** {path to Ableton}\Resources\MIDI\Remote Scripts
- **macOS:** /Applications/Ableton Live {version}/Contents/App-Resources/MIDI Remote Scripts

After starting Ableton Live, add the script to your list of control surfaces:

![Ableton Live Settings](https://i.imgur.com/a34zJca.png)

To use the server, you need to have Node.js installed on your system.

## Starting the Server

Run `npx ableton-web-control` and the web server should start. You can now access the
web app from any device using your computer's IP address.
