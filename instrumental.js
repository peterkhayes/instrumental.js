'use strict';

var Instrumental = function(config) {

  if (!config.audioContext) window.AudioContext = window.AudioContext || window.webkitAudioContext; // Webkit shim.

  var context = config.audioContext || new window.AudioContext(),
      destination = config.destination || context.destination,
      path = config.path || "",
      filetype = config.filetype || "mp3",
      instruments = {};

  if (path.length && path[path.length - 1] !== "/") {
    path = path + "/";
  }

  // Load or update notes associated with a single instrument.
  // Name is the instrument's name.
  // Notes is an array of notes that will be associated with samples.
  // If overwrite is not set, do not load notes that are already loaded.
  this.loadInstrument = function(name, notes, overwrite) {
    instruments[name] = instruments[name] || {};
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      if (!instruments[name][note] || overwrite) {
        this.loadBuffer(name, note);
      }
    }
  };

  // Load a single note buffer using XML.
  this.loadBuffer = function(name, note) {
    var request = new XMLHttpRequest(),
        url = path + name + "/" + note + "." + filetype;
    console.log("loading " + url);
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      context.decodeAudioData(request.response,
        function (buffer) {
          if (!buffer) {
            console.log("error decoding file data for", url);
            return;
          }
          console.log("Downloaded", url);
          instruments[name][note] = buffer;
        },
        function (error) {
          console.error('decodeAudioData error', error);
        }
      );
    };

    request.onerror = function() {
      console.error("Could not fetch #{url} from the server.");
    };

    request.send();
  };

  // Plays a note, pitch-shifting the closet available sample to match.
  this.play = function(name, note, length, gain) {

    gain = gain || 1;

    // First find the closest sample.
    var best = null,
        best_dist = Infinity,
        instrument = instruments[name];

    if (!instrument) {
      console.log("Instrument not loaded yet.");
      return;
    }

    for (var loaded_note in instrument) {
      var loaded_note_int = parseInt(loaded_note, 10), // keys are strings.
          dist = Math.abs(loaded_note_int - note);
      if (dist < best_dist) {
        best_dist = dist;
        best = loaded_note;
        if (!dist) break; // If the distance is 0, we can stop.
      }
    }

    if (!best) {
      console.log("Notes not ready yet.");
      return;
    }
    var best_int = parseInt(best, 10);

    // Make a new source node to play our note.
    var source = context.createBufferSource();
    source.buffer = instrument[best_int];
    // Pitch shift and play!
    source.playbackRate.value = Math.pow(2,(note - best_int)/12);
    source.gain.value = gain;
    source.connect(destination);
    source.noteOn(0);
    // End the note after the length;
    setTimeout(function() { fadeNote(source); }, length);
  };

  // Quickly fades a note out to avoid clicking sounds.
  var fadeNote = function(source) {
    if (source.gain.value === 0) {
      source.noteOff(0);
    } else {
      source.gain.value = Math.max(source.gain.value - 0.1, 0);
      setTimeout(function() { fadeNote(source); },1);
    }
  };

  // Load initial instruments.
  if (config.instruments) {
    for (var name in config.instruments) {
      if (config.instruments[name]) {
        this.loadInstrument(name, config.instruments[name]);
      }
    }
  }

};
