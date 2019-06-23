import React from 'react';
import VeritoneActivate, { API_EVENTS, WS_EVENTS } from 'veritone-activate';
import AudioAnalyser from './AudioAnalyser';

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

const SEPARATE_TRANSCRIPTION_ENGINE_ID = '0981e79f-de99-489e-a2c4-366c4b466321';
const FACE_ENGINE_ID = '434db220-b38f-4bb6-bf65-02a4469559ac';

const additionalEngines = [{
  'engineId': SEPARATE_TRANSCRIPTION_ENGINE_ID,
  'payload': {
    'idThreshold': 0.6,
    'stoppingThreshold': 0.6,
    'maxSpeakerLabels': 8,
    'hideUnknown': '0',
    'libraryId': '5ab4b6d2-dff4-410f-ab53-5031635a3fda'
  }
}];

const FACE_EVENT = 'face';
const TRANSCRIPT_EVENT = 'audio-recognition';
const TRANSCRIPT_EVENT_UPLOAD = 'audio-recognition-upload';
const TRANSCRIPT_EVENT_RECORD = 'audio-recognition-record';

const veritoneActivate = new VeritoneActivate(config);

class App extends React.Component {

  state = {
    ready: false,
    face: {
      tdoId: null,
      jobId: null,
    },
    audio: null,
    audioUrl: ''
  }

  componentDidMount() {
    veritoneActivate.connect();
    veritoneActivate.on(WS_EVENTS.updateStatus, ({ typeCode }) => {
      if (typeCode === 'WS_CONNECT_SUCCESS') {
        this.setState({
          ready: true
        })
      }
    })
    veritoneActivate.on(WS_EVENTS.updateResponse, ({ data }) => {
      console.log(data);
      if (data) {
        this.setState({
          face: {
            tdoId: data.tdoId,
            jobId: data.jobId
          }
        });
        veritoneActivate.startPolling(
          FACE_EVENT,
          data.tdoId,
          data.jobId,
          FACE_ENGINE_ID
        );
        veritoneActivate.on(FACE_EVENT, (msg) => {
          console.log('from event face', msg);
        })
      }
    });
    veritoneActivate.on(
      API_EVENTS.error,
      (error) => console.error("error", error)
    );
  }

  onInputFile = (event) => {
    console.log(event);
    const file = event.target.files[0]
    veritoneActivate.launchJob(file, additionalEngines)
      .then(({ tdoId, jobId }) => {
        veritoneActivate.startPolling(
          TRANSCRIPT_EVENT_UPLOAD,
          tdoId,
          jobId,
          SEPARATE_TRANSCRIPTION_ENGINE_ID
        );
      })
    veritoneActivate.on(
      TRANSCRIPT_EVENT_UPLOAD,
      (message) => console.log('from event transcript uploading', message)
    );
  }

  getMicrophone = async () => {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    this.setState({ audio });
  }

  stopMicrophone = () => {
    this.state.audio.getTracks().forEach(track => track.stop());
    this.setState({ audio: null });
  }

  onRecorded = (blob) => {
    this.setState({
      audioUrl: URL.createObjectURL(blob)
    })
    const audioFileName = 'activate-' + new Date().toISOString() + '.webm';
    const file = new File([blob], audioFileName, {
      type: "audio/webm",
    });
    veritoneActivate.launchJob(file, additionalEngines)
      .then(({ tdoId, jobId }) => {
        veritoneActivate.startPolling(
          TRANSCRIPT_EVENT_RECORD,
          tdoId,
          jobId,
          SEPARATE_TRANSCRIPTION_ENGINE_ID
        );
      })
    veritoneActivate.on(
      TRANSCRIPT_EVENT_RECORD,
      (message) => console.log('from event transcript recording', message)
    );
  }

  render() {
    const { audio, audioUrl } = this.state;
    return (
      <div className="App">
        {
          audio ? (
            <button onClick={this.stopMicrophone}>stop microphone</button>
          ) : (
              <button onClick={this.getMicrophone}>click to record</button>
            )
        }
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'lightgrey' }} >
          {
            audio && <AudioAnalyser audio={audio} onRecorded={this.onRecorded} />
          }
        </div>
        <audio controls src={audioUrl}></audio>
        <input type="file" onChange={this.onInputFile} />
        {
          this.state.ready && <div>We are recording for face recognition. Upload video to get audio recognition data</div>
        }
      </div>
    )
  }
}


export default App;
