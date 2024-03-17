export { jazz };

import weave from "./weave.js";
import { common } from "./commands_base.js";

let transpose = 0;
let currentChordChoice;
let chordIndex = 0;
let noteIndex = 0;
let note = 21;
let noteCount = 0;
let playing = false;

// Got these chords as the basic building blocks from jazzkeys by Plan8 (plan8.co)
// I added a few more at the end that mix well. I'll add a few more as I get any ideas.

const baseChords = [
  [48, 55, 57, 59, 64],
  [48, 55, 57, 62],
  [60, 64, 67, 69, 74, 76, 81],
  [48, 52, 55, 59, 62, 66],
  [60, 62, 64, 67, 71, 74, 78],
  [60, 65, 69, 70], // BbMaj7 inversion
  [60, 70, 71, 77], // EbMaj7 inversion
  [60, 64, 67, 69] // Am7b5 inversion
];

const highChords = [
  [72, 79, 83, 90],
  [79, 83, 84, 86],
  [71, 74, 76, 79, 81, 86, 88, 93],
  [72, 76, 79, 81, 86, 90],
];

// The following is based on https://github.com/tambien/Piano, including the
// excellent Internet Archive samples.

const allNotes = [
  21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75,
  78, 81, 84, 87, 90, 93, 96, 99, 102, 105, 108,
];

function getNotesInRange(min, max) {
  return allNotes.filter((note) => min <= note && note <= max);
}

function midiToNote(midi) {
  const frequency = new Tone.Frequency(midi, "midi");
  const ret = frequency.toNote();
  return ret;
}

function getNotesUrl(midi, vel) {
  return `${midiToNote(midi).replace("#", "s")}v${vel}.mp3`;
}
const notes = getNotesInRange(21, 108);
let noteUrls = {};
notes.forEach((note) => (noteUrls[midiToNote(note)] = getNotesUrl(note, 2)));

weave.pianoNoteSampler = null;

const jazz = {
  text: ["jazz"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    weave.pianoNoteSampler = new Tone.Sampler({
      attack: 0,
      urls: noteUrls,
      baseUrl: "piano/",
      curve: "exponential",
      release: 0.7,
      volume: 3,
      onload: () => {
        console.info("Note samples loaded");
      },
    }).toDestination();
    const body = document.getElementById(weave.lastBodyClickId());
    body.addEventListener("keydown", (ev) => {
      if (!playing) {
        if (ev.key === "Backspace") {
          if (note > 21) {
            note--;
            weave.pianoNoteSampler.triggerAttackRelease(midiToNote(note), 0.5);
            playing = true;
            return;
          }
        }
        //weave.pianoNoteSampler.triggerRelease(note);
        if (noteCount % 3 == 0) {
          if (Math.random(10) < 5) {
            currentChordChoice = baseChords;
          } else {
            currentChordChoice = highChords;
          }
        }

        chordIndex = Math.floor(Math.random() * currentChordChoice.length);
        if (noteCount == 0) {
          transpose = 24 + -7 + Math.floor(Math.random(14));
        }

        noteCount = noteCount + 1;
        noteCount = noteCount % 10;
        noteIndex = Math.floor(
          Math.random() * currentChordChoice[chordIndex].length
        );
        note = currentChordChoice[chordIndex][noteIndex] + transpose;
        console.log(`Triggering: ${midiToNote(note)}`);
        const sustain = 0.5 + Math.random() * 1.3;
        let play;
        if (ev.key === "Enter") {
          play = currentChordChoice[chordIndex].map((n) =>
            midiToNote(n + transpose)
          );
        } else {
          play = midiToNote(note);
        }
        weave.pianoNoteSampler.triggerAttackRelease(play, sustain);
        playing = true;
      }
    });
    body.addEventListener("keyup", () => {
      if (playing) {
        playing = false;
      }
    });
  },
  description: "Free rollin' piano jazz inspired by jazzkeys by Plan8",
  el: "u",
};
