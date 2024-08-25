import React from 'react';
import io from 'socket.io-client';

class SocketManager extends React.Component {
  constructor(props) {
    super(props);
    this.socket = null;
  }

  connect = (serviceIP) => {
    this.socket = io.connect(
      serviceIP,
      {
        path: '/io/webrtc',
        query: {
          room: window.location.pathname,
        }
      }
    );

    this.socket.on('connection-success', this.props.onConnectionSuccess);
    this.socket.on('joined-peers', this.props.onJoinedPeers);
    this.socket.on('peer-disconnected', this.props.onPeerDisconnected);
    this.socket.on('online-peer', this.props.onOnlinePeer);
    this.socket.on('offer', this.props.onOffer);
    this.socket.on('answer', this.props.onAnswer);
    this.socket.on('candidate', this.props.onCandidate);
  }

  sendToPeer = (messageType, payload, socketID) => {
    this.socket.emit(messageType, {
      socketID,
      payload
    });
  }

  close = () => {
    this.socket.close();
  }

  render() {
    return null; // This component doesn't render anything
  }
}

export default SocketManager;