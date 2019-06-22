import React, { Component } from 'react';

class AudioVisualiser extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }

  componentDidUpdate() {
    this.draw();
  }

  draw() {
    const { audioData } = this.props;
    const canvas = this.canvas.current;
    const height = canvas.height;
    const width = canvas.width;
    const context = canvas.getContext('2d');
    let x = 0;
    const sliceWidth = (width * 1.0) / audioData.length;

    context.lineWidth = 4;
    context.strokeStyle = '#FFFFFF';
    context.clearRect(0, 0, width, height);

    context.beginPath();
    context.moveTo(0, height / 2);
    audioData.forEach((item, index) => {
      const audioLength = audioData.length;
      const ratio = index < audioLength / 2 ? 2 * index / audioLength : (2 - 2 * index / audioLength);
      const y = height / 2 + ((item / 255.0) * height - height / 2) * ratio;
      context.lineTo(x, y);
      x += sliceWidth;
    });
    context.lineTo(x, height / 2);
    context.stroke();
  }

  render() {
    const { width = 70, height = 70 } = this.props;
    return <canvas width={width} height={height} ref={this.canvas} />;
  }
}

export default AudioVisualiser;
