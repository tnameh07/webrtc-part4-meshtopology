import React from 'react';

class WebRTCManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      peerConnections: {},
      sendChannels: [],
    };
  }

  createPeerConnection = (socketID, callback) => {
    try {
      let pc = new RTCPeerConnection(this.props.pcConfig);

      // add pc to peerConnections object
      const peerConnections = { ...this.state.peerConnections, [socketID]: pc };
      this.setState({ peerConnections });

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          this.props.sendToPeer('candidate', e.candidate, {
            local: this.props.socketId,
            remote: socketID
          });
        }
      };

      pc.oniceconnectionstatechange = (e) => {
        // Existing ice connection state change logic
      };

      pc.ontrack = (e) => {
        // Existing ontrack logic
        this.props.handleTrack(e, socketID);
      };

      pc.close = () => {
        console.log("pc closed");
      };

      if (this.props.localStream)
        this.props.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.props.localStream);
        });

      // Send Channel
      const handleSendChannelStatusChange = (event) => {
        console.log('send channel status: ' + this.state.sendChannels[0].readyState);
      };

      const sendChannel = pc.createDataChannel('sendChannel');
      sendChannel.onopen = handleSendChannelStatusChange;
      sendChannel.onclose = handleSendChannelStatusChange;
    
      this.setState(prevState => ({
        sendChannels: [...prevState.sendChannels, sendChannel]
      }));

      // Receive Channels
      const handleReceiveMessage = (event) => {
        const message = JSON.parse(event.data);
        this.props.handleReceiveMessage(message);
      };

      const handleReceiveChannelStatusChange = (event) => {
        if (this.receiveChannel) {
          console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
        }
      };

      const receiveChannelCallback = (event) => {
        const receiveChannel = event.channel;
        receiveChannel.onmessage = handleReceiveMessage;
        receiveChannel.onopen = handleReceiveChannelStatusChange;
        receiveChannel.onclose = handleReceiveChannelStatusChange;
      };

      pc.ondatachannel = receiveChannelCallback;

      callback(pc);

    } catch(e) {
      console.log('Something went wrong! pc not created!!', e);
      callback(null);
    }
  }

  setRemoteDescription = (pc, sdp) => {
    return pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  createOffer = (pc, sdpConstraints) => {
    return pc.createOffer(sdpConstraints);
  }

  createAnswer = (pc, sdpConstraints) => {
    return pc.createAnswer(sdpConstraints);
  }

  addIceCandidate = (pc, candidate) => {
    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  render() {
    return null; // This component doesn't render anything
  }
}

export default WebRTCManager;