import React, { Component } from 'react';
import { Bubble, GiftedChat } from 'react-native-gifted-chat'
// KeyboardAvoidingView helps to fix the keyboard out position on andorid
// View and Platform will be used to determine the OS currently in use (I DID NOT HAVE THIS ISSUE BUT IS RECOMMENDED TO APPLY IT)
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
    }
  }

  componentDidMount() {
     // Passing the name from value={this.state.name} on start.js file
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          }
        },
        {
          _id: 2,
          text: `${name} has entered the chat`,
          createdAt: new Date(),
          system: true
        },
        {
          _id: 3,
          text: 'This is a quick reply. Do you love Gifted Chat? (checkbox) KEEP IT',
          createdAt: new Date(),
          quickReplies: {
            type: 'checkbox', // or 'radio',
            keepIt: true,
            values: [
              {
                title: '😋 Yes',
                value: 'yes',
              },
              {
                title: '📷 Yes, let me show you with a picture!',
                value: 'yes_picture',
              },
              {
                title: '😞 Nope. What?',
                value: 'no',
              },
            ],
          },
          user: {
            _id: 2,
            name: 'React Native',
          },
        },
      ],
    })
  }

  // called when a user sends a message
  onSend(messages = []) {
    // previousState references to the component’s state at the time the change is applied.
    this.setState(previousState => ({
      // the message a user has just sent gets appended to the state messages so that it can be displayed in the chat.
      messages: GiftedChat.append(previousState.messages, messages)
    }))
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={styles.bubble}
      />
    )
  }

  render() {
    const { color } = this.props.route.params; 

    return (
      <View style={[{ backgroundColor: color }, styles.container]}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
        }
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: '#fff',
  },

  bubble: {
    left: {
      backgroundColor: 'white',
    },
    right: {
      backgroundColor: 'green'
    }
  }
})
