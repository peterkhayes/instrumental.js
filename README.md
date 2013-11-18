instrumental.js
============

Making a sampler or mod tracker app?  Instrumental can get you started by provided a framework for loading and playing samples.
Developed for use in [Tunesmith](https://github.com/peterkhayes/Tunesmith "Tunesmith").

How to use
==========

Initialization
-------

    var player = new Instrumental({
      // The webAudio audiocontext object to be used. 
      // If omitted, defaults to a new window.AudioContext or window.webkitAudioContext
      context: <audioContext>,
      
      // Set the destination for the audio played.
      // Defaults to the destination of the audio context, which is the speakers.
      destination: <audioNode>,
      
      // Set the filetype that your samples are encoded in.  
      // Accepts most common formats: see the webAudio standards for more information.
      filetype: ".ogg", // Defauts to mp3.
      
      // Set the path to search for audio files in.  Your sample files
      // should be in the following structure:
      // [path]/[instrument_name]/[note_number].[filetype]
      // Defaults to the root directory.
      path: "directory/subdirectory/",
      
      // A list of instruments to load (asynchronously) upon initializiation.
      // Takes an object where the keys are instrument names and the values are
      // arrays of pitches that have sample files.
      // I recommend using the MIDI for encoding (69 = A440), but
      // instrumental.js is unopinionated here.
      // Can be omitted, if you want to load instruments manually later.
      // Loading instruments on demand can save you bandwidth.
      instruments: {
                      piano: [34, 40, 46, 52, 58],
                      guitar: [40, 45, 50, 55, 60]
                   }
    });
    
Loading new instruments:
--------

      // See initialization above for schema.  
      // Make sure that a sample file for each note occurs in the correct
      // directory: [path]/[instrument_name]/[note_number].[filetype]
      // Unless overwrite is set to true, samples that are already loaded
      // will be skipped.
      player.loadInstrument("trumpet", [33, 36, 45, 47], <overwrite>);

Playing notes:
-------

      // Schema is: 
      // instrument (make sure it's already loaded)
      // note (again, make sure a sample has been loaded)
      // volume (0 is silent, 1 is unchanged from the source file)
      // length (in miliseconds.  To convert from music notation, 
      // use the formula 15000/(tempo * type of note), where type of note is
      // 4 for quarter note, 8 for eighth note, etc.
      player.play("piano", 37, 0.5, 100)
