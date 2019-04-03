import React, { Component } from 'react';
import { connect } from 'react-redux';
import BackendService from './service';
import * as userActions from '../store/actions/user.action';


class Backend extends Component {
  state = {
    clientIsReady: false,
  }

  componentDidMount() {   
    BackendService.createClient()
      .then((clientResult) => {
        if (typeof clientResult.error === 'undefined') {
          this.setState({ clientIsReady: true });
          this.props.clientConnected();
        }
      }).catch((error) => {
        this.props.clientFailed();
      });
  }

  render() {
    return (
      <div>
        { this.state.clientIsReady && this.props.children }
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    clientConnected: () => dispatch(userActions.clientConnected()),
    clientFailed: () => dispatch(userActions.clientFailed()),
  }
}

export default connect(mapDispatchToProps)(Backend); 