import React from 'react';
import VeritoneActivate, { API_EVENTS } from 'veritone-activate';

const config = {
  authToken:
    "288497:4e797c92d71d4efaab7a14ccd1a34d7b73ac132246224e8b8540754ebc1093d2",
  scheduledJobId: "55849",
  streamEngineId: "9e611ad7-2d3b-48f6-a51b-0a1ba40feab4",
  videoInputId: "videoInputId",
  cognition: {
    transcription: {
      language: "en-US" // Parameters are optional
    },
    faceDetection: {
      libraryId: "ab4b6d2-dff4-410f-ab53-5031635a3fda"
    }
  },
  on: {}
};

const additionalEngines = [{
  'engineId': '0981e79f-de99-489e-a2c4-366c4b466321',
  'payload': {
    'idThreshold': 0.6,
    'stoppingThreshold': 0.6,
    'maxSpeakerLabels': 8,
    'hideUnknown': '0',
    'libraryId': '5ab4b6d2-dff4-410f-ab53-5031635a3fda'
  }
}];


const veritoneActivate = new VeritoneActivate(config);


function App() {
  const onInputFile = (event) => {
    const file = event.target.files[0]
    const blob = new Blob([file], { type: file.type });
    veritoneActivate.launchJob(blob, additionalEngines)
      .then(({ tdoId, jobId }) => {
        veritoneActivate.startPolling('getEngineResult', tdoId, jobId, '0981e79f-de99-489e-a2c4-366c4b466321');
      })
      veritoneActivate.on('getEngineResult', (message) => console.log('from event', message));
      veritoneActivate.on(API_EVENTS.error, (error) => console.error("error", error));
  }

  return (
    <div className="App">
      <input type="file" onChange={onInputFile} />
    </div>
  );
}

export default App;
