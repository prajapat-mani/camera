import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert, Dimensions, Switch } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';


const NoCameraErrorView = () => (
  <View style={styles.noCamera}>
    <Text style={styles.noCameraText}>No Camera Device Found</Text>
  </View>
);
const calculatePPI = (width, height, diagonalInches) => {
  const diagonalInPixels = Math.sqrt(width * width + height * height);
  const ppi = diagonalInPixels / diagonalInches;
  return ppi;
};

const MIN_PPI = 113;

const App = () => {
  const [show, setShow] = useState('back');
  const device = useCameraDevice(show);
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [fps, setFps] = useState(30);
  const [resoWidth, setResoWidth] = useState(1920);
  const [resoHeight, setResoHeight] = useState(1080);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isVideoStabilizationEnabled, setIsVideoStabilizationEnabled] = useState(false);

  const format = useCameraFormat(device, [
    { videoAspectRatio: 16 / 9 },
    { videoResolution: { width: resoWidth, height: resoHeight } },
    { photoResolution: { width: resoWidth, height: resoHeight } },
    { maxFps: 60 },
    { minFps: 24 },
  ]);

  const getRandomInteger = (min = 113, max = 300) => {
    if (min > max) {
      throw new Error("Min value should be less than or equal to max value.");
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const calculateDiagonalSizeInInches = (width, height) => {
    ppi = getRandomInteger(113, 300);
    const diagonalInPixels = Math.sqrt(width * width + height * height);
    const diagonalInInches = diagonalInPixels / ppi;
    return diagonalInInches;
  };



  useEffect(() => {
    const ppi = calculatePPI(resoWidth, resoHeight);
    if (ppi < MIN_PPI) {
      Alert.alert('Low Quality Warning', 'Selected resolution does not meet the minimum PPI requirement of 113.');
    }
  }, [resoWidth, resoHeight]);

  if (device == null) return <NoCameraErrorView />;

  const saveToGallery = async (filePath) => {
    try {
      await CameraRoll.save(filePath, { type: 'auto' });
      console.log('Saved to gallery:', filePath);
    } catch (e) {
      console.error('Failed to save to gallery', e);
    }
  };

  const handleShow = () => {
    setShow(show === 'back' ? 'front' : 'back');
  };

  const startRecording = async () => {
    if (cameraRef.current == null) return;
    try {
      await cameraRef.current.startRecording({
        onRecordingFinished: async (video) => {
          const filePath = `${RNFS.DocumentDirectoryPath}/${Date.now()}.mp4`;
          await RNFS.moveFile(video.path, filePath);
          await saveToGallery(filePath);
        },
        onRecordingError: (error) => console.error('Recording failed', error),
      });
      setIsRecording(true);
    } catch (e) {
      console.error('Failed to start recording', e);
    }
  };

  const toggleSwitch = () => setIsVideoStabilizationEnabled(previousState => !previousState);


  const stopRecording = async () => {
    if (cameraRef.current == null) return;
    try {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (e) {
      console.error('Failed to stop recording', e);
    }
  };

  const takePicture = async (isBurst = false, count) => {
    if (cameraRef.current == null) return;

    if (isBurst == true) {
      for (let i = 0; i < count; i++) {
        try {
          const photo = await cameraRef.current.takePhoto({
            quality: 0.85,
            skipMetadata: true,
          });
          const filePath = `${RNFS.DocumentDirectoryPath}/${Date.now()}.jpg`;
          await RNFS.moveFile(photo.path, filePath);
          await saveToGallery(filePath);
          console.log('Photo saved to gallery:', filePath);
        } catch (e) {
          console.error('Failed to take photo', e);
        }
      }
    } else {
      try {
        const photo = await cameraRef.current.takePhoto({
          quality: 0.85,
          skipMetadata: true,
        });
        const filePath = `${RNFS.DocumentDirectoryPath}/${Date.now()}.jpg`;
        await RNFS.moveFile(photo.path, filePath);
        await saveToGallery(filePath);
        console.log('Photo saved to gallery:', filePath);
      } catch (e) {
        console.error('Failed to take photo', e);
      }
    }
  };
  const burstMode = () => {
    takePicture(true, 6);
  };

  console.log(isVideoStabilizationEnabled, "stable")
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.absoluteFill}
        device={device}
        isActive={true}
        format={format}
        photo={true}
        video={true}
        fps={fps}
        videoStabilizationMode={isVideoStabilizationEnabled ? 'standard' : 'off'}
        // videoStabilizationMode="cinematic"

      />

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
      >
        <AntDesign name="setting" size={30} color={'#fff'} />
      </TouchableOpacity>

      <View style={styles.controls}>
        {isRecording ? (
          <TouchableOpacity style={styles.controlButton} onPress={stopRecording}>
            <View style={styles.stopIcon} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.controlButton} onPress={startRecording}>
            <View style={styles.recordIcon} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={handleShow}>
          <MaterialIcons name="flip-camera-android" size={30} color={'#fff'} />
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Text style={styles.modalSubtitle}>Resolution</Text>
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  const diagonal = calculateDiagonalSizeInInches(1280, 720)
                  const ppi = calculatePPI(1280, 720, diagonal);
                  console.log(ppi, "PPI")
                  if (ppi >= MIN_PPI) {
                    setResoHeight(720);
                    setResoWidth(1280);
                  } else {
                    Alert.alert('Low Quality Warning', 'Selected resolution does not meet the minimum PPI requirement of 113.');
                  }
                }
                }
              >
                <Text style={styles.optionText}>1280 x 720</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  const diagonal = calculateDiagonalSizeInInches(1920, 1080)
                  const ppi = calculatePPI(1980, 1080, diagonal);
                  console.log(ppi, "PPI")
                  if (ppi >= MIN_PPI) {
                    setResoHeight(1080);
                    setResoWidth(1920);
                  } else {
                    Alert.alert('Low Quality Warning', 'Selected resolution does not meet the minimum PPI requirement of 113.');
                  }
                }}
              >
                <Text style={styles.optionText}>1920 x 1080</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Frame Rate</Text>
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => setFps(15)}
              >
                <Text style={styles.optionText}>15 FPS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => setFps(20)}
              >
                <Text style={styles.optionText}>20 FPS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => setFps(30)}
              >
                <Text style={styles.optionText}>30 FPS</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>BurstMode</Text>
            <TouchableOpacity onPress={burstMode} style={styles.burstButton}>
              <Text style={styles.burstButtonText}>Burst</Text>
            </TouchableOpacity>

            <View style={styles.stabilizationToggle}>
              <Text style={styles.stabilizationText}>Video Stabilization</Text>
              <Switch
                value={isVideoStabilizationEnabled}
                onValueChange={toggleSwitch}
              />
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSettingsVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  noCamera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  noCameraText: {
    color: '#fff',
    fontSize: 18,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    width: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
  },
  controlBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    width: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 35,
  },
  captureButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    width: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
  },
  recordIcon: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: 'red',
  },
  stopIcon: {
    height: 30,
    width: 30,
    borderRadius: 3,
    backgroundColor: '#000',
  },
  captureIcon: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222'
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    color: '#222'
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionButton: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff'
  },
  burstButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 4,
    width: '50%',
    marginLeft: 10,
  },
  burstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  stabilizationToggle: {
    // left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  stabilizationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222'
  },
});






