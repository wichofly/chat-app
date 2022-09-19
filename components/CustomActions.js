import React, { Component } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import firebase from 'firebase';
import 'firebase/firestore';

export default class CustomActions extends Component {
  render() {
    // upload images to firebase
    uploadImageFetch = async (uri) => {
      const blob = await new Promise((resolve, reject) => {
        // create a new XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      const imageNameBefore = uri.split('/');
      const imageName = imageNameBefore[imageNameBefore.length - 1];

      // refernece to the storage
      const ref = firebase.storage().ref().child(`images/${imageName}`);

      const snapshot = await ref.put(blob);

      // close the connection
      blob.close();

      return await snapshot.ref.getDownloadURL();
    };

    // select image from library
    pickImage = async () => {
      // const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status === 'granted') {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        }).catch((error) => {
          console.log(error);
          Alert(error.message || 'An error has occurred!');
        });

        console.log(result);

        if (!result.cancelled) {
          this.setState({
            image: result.uri,
          });
        }
      }
    };

    // take a picture with camera
    takePhoto = async () => {
      const { status } = await Permissions.askAsync(
        Permissions.MEDIA_LIBRARY && Permissions.CAMERA
      );

      if (status === 'granted') {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'Images',
        }).catch((error) => {
          console.log(error);
          Alert(error.message || 'An error has occurred!');
        });
        if (!result.cancelled) {
          this.setState({
            image: result.uri,
          });
        }
      }
    };

    // share users location
    getLocation = async () => {
      // const { status } = await Permissions.askAsync(Permissions.LOCATION);
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        let result = await Location.getCurrentPositionAsync({});

        if (result) {
          this.setState({
            location: result,
          });
        }
      }
    };

    onActionPress = () => {
      const options = [
        'Choose From Library',
        'Take Picture',
        'Send Location',
        'Cancel',
      ];
      const cancelButtonIndex = options.length - 1;
      this.context.actionSheet().showActionWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              console.log('user wants to pick an image');
              return;
            case 1:
              console.log('user wants to take a photo');
              return;
            case 2:
              console.log('user wants to get their location');
            default:
          }
        }
      );
    };
    return (
      <>
        <TouchableOpacity
          accessible={true}
          accessibilityLabel="More options"
          accessibilityHint="Send an image or your location"
          accessibilityRole="button"
          style={[styles.container]}
          onPress={this.onActionPress}
        >
          <View style={[styles.iconText, this.props.wrapperStyle]}>
            <Text style={[styles.iocnText, this.props.iconTextStyle]}>+</Text>
          </View>
        </TouchableOpacity>
      </>
    );
  }
}

CustomActions.contextType = {
  actionSheet: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },

  wrapper: {
    broderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },

  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroungColor: 'transparent',
    textAlign: 'center',
  }
});