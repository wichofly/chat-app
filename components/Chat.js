import React, { Component } from 'react';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat'
// KeyboardAvoidingView helps to fix the keyboard out position on andorid
// View and Platform will be used to determine the OS currently in use (I DID NOT HAVE THIS ISSUE BUT IS RECOMMENDED TO APPLY IT)
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
// import firebase from 'firebase';
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: '',
        name: '',
        avatar: ''
      },
      isConnected: null,
      image: null
    };

    const firebaseConfig = {
      apiKey: "AIzaSyCSnFfaiDQtMNqV69Y4aPs4MSMdHTizVLQ",
      authDomain: "chatapp-ce9e9.firebaseapp.com",
      projectId: "chatapp-ce9e9",
      storageBucket: "chatapp-ce9e9.appspot.com",
      messagingSenderId: "360779851180",
      appId: "1:360779851180:web:9a7e2eadec8438d9b50609"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig)
    }

    // Reference to messages collection on firebase data. Stores and retrieves the chat messages the user send
    this.referenceChatMessages = firebase.firestore().collection('messages')
  }

  // Whenever something change in the messages collection, helps to store the messages and allows the data to be rendered in the view
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text || '',
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar || '',
        },
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({
      messages,
    });
  };

  async getMessages() {
    let messages = '';
    try {
      // getItem() allows to read the messages in storage wichh takes a key
      messages = (await AsyncStorage.getItem('messages')) || [];
      this.setState({
        // converting json data to an object.
        messages: JSON.parse(messages)
      })
    } catch (error) {
      console.log(error.message)
    }
  }

  async saveMessages() {
    try {
      // setItem() allows to save the messages
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message)
    }
  }

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message)
    }
  }

  componentDidMount() {

    // Passing the name from value={this.state.name} on start.js file
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    // To find put user connection status we call fetch()
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({
          isConnected: true,
        });

        // Reference to load messages from Firebase
        this.referenceChatMessages = firebase.firestore().collection('messages');

        // Authenticate user anonymously
        this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
          if (!user) {
            firebase.auth().signInAnonymously();
          }
          this.setState({
            uid: user.uid,
            messages: [],
            user: {
              _id: user.uid,
              name: name,
              avatar: "https://placeimg.com/140/140/any"
            },
          });
          this.unsubscribe = this.referenceChatMessages
            .orderBy('createdAt', 'desc')
            .onSnapshot(this.onCollectionUpdate);
        });
      } else {
        this.setState({
          isConnected: false,
        });
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    if (this.isConnected) {
      this.authUnsubscribe();
      this.unsubscribe();
    }
  }

  // called when a user sends a message
  onSend(messages = []) {
    // previousState references to the component’s state at the time the change is applied.
    this.setState(previousState => ({
      // the message a user has just sent gets appended to the state messages so that it can be displayed in the chat.
      messages: GiftedChat.append(previousState.messages, messages)
    }),
      () => {
        // storing the messages
        this.saveMessages();
        // Call addMessage with last message in message state
        if (this.state.isConnected === true) {
          this.addMessages(this.state.messages[0]);
        }
      }
    );
  }

  addMessages = (message) => {
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });
  };

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={styles.bubble}
      />
    )
  }

  // hide input filed when user is offline
  renderInputToolbar(props) {
    if (this.state.isConnected === false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  // actions '+'
  renderCustomActions = (props) => <CustomActions {...props} />;

  // for the map, checks if the currentMessage contains location data.
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    let { color } = this.props.route.params;

    return (
      <View style={[{ backgroundColor: color }, styles.container]}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: this.state.user._id,
            name: this.state.user.name,
            avatar: this.state.user.avatar
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
