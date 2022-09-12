import React from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';

export default class Start extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: '' }
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Hello Start!</Text>
        <TextInput style={{ height: 40, width: 300, borderColor: 'gray', borderWidth: 1, marginBottom: 30, marginTop: 25 }}
          onChangeText={(name) => this.setState({ name })}
          value={this.state.name}
          placeholder='Your Name'
        />
        <Button
          title="Go to Chat"
          onPress={() =>
            this.props.navigation.navigate('Chat', { name: this.state.name })}
        />
      </View>
    )
  }
}