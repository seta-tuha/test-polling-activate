import React, { Component } from 'react';
import AudioVisualiser from './AudioVisualiser';

class AudioAnalyser extends Component {
  constructor(props) {
    super(props);
    this.state = { audioData: new Uint8Array(0) };
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const options = { mimeType: 'audio/webm' };
    this.recorder = new window.MediaRecorder(this.props.audio, options);
    this.recorder.start();

    const audioChunks = [];
    this.recorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    this.recorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      console.log(audioBlob);
      this.props.onRecorded(audioBlob);
    });

    this.analyser = this.audioContext.createAnalyser();
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.source = this.audioContext.createMediaStreamSource(this.props.audio);
    this.source.connect(this.analyser);
    this.rafId = requestAnimationFrame(this.tick);
  }

  tick() {
    this.analyser.getByteTimeDomainData(this.dataArray);
    this.setState({ audioData: this.dataArray });
    this.rafId = requestAnimationFrame(this.tick);
  }

  componentWillUnmount() {
    this.recorder.stop();
    cancelAnimationFrame(this.rafId);
    this.analyser.disconnect();
    this.source.disconnect();
  }

  render() {
    return <AudioVisualiser audioData={this.state.audioData} />;
  }
}

export default AudioAnalyser;
