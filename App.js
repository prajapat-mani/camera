import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat, useFrameProcessor } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
// import BackgroundTimer from 'react-native-background-timer';

const NoCameraErrorView = () => (
  <View style={styles.noCamera}>
    <Text style={styles.noCameraText}>No Camera Device Found</Text>
  </View>
);
const App = () => {


  const device = useCameraDevice('back');
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [burst, setBurst] = useState(false);
  const [videoPath, setVideoPath] = useState(null);
  const [frameRate, setFrameRate] = useState(10);
  const [selectedFPS, setSelectedFPS] = useState(30); // Default to 30fps
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });

  if (device == null) return <NoCameraErrorView />;
  const saveToGallery = async (filePath) => {
    try {
      await CameraRoll.save(filePath, { type: 'auto' });
      console.log('Saved to gallery:', filePath);
    } catch (e) {
      console.error('Failed to save to gallery', e);
    }
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
        frameRate: selectedFPS, // Set the selected frame rate
      });
      
    } catch (e) {
      console.error('Failed to start recording', e);
    }
    setIsRecording(true);
  };
  const stopRecording = async () => {
    if (cameraRef.current == null) return;
    try {
      await cameraRef.current.stopRecording();
    } catch (e) {
      console.error('Failed to stop recording', e);
    }
    setIsRecording(false);


  };
  const format = useCameraFormat(device, [
    { videoAspectRatio: 16 / 9 },
    { videoResolution: { width:resolution.width, height:resolution.height } },
    {
      photoResolution: { width:resolution.width, height:resolution.height }
    }
  ])
  const handleFPSChange = (fps) => {
    setSelectedFPS(fps);
    console.log(`Selected FPS: ${fps}`);
  };
 

  const takePicture = async (tru=false) => {
   console.log(tru);
    if (cameraRef.current == null) return;
if(tru==true){
  for(let i=0;i<5;i++){
    try {
      const photo = await cameraRef.current.takePhoto({
        quality: 0.85,
        skipMetadata: true,
      });
      const filePath = `${RNFS.DocumentDirectoryPath}/${Date.now()}.jpg`;
      await RNFS.moveFile(photo.path, filePath);
      await saveToGallery(filePath);
      // console.log('Photo saved to GALLEY:', filePath);
    } catch (e) {
      console.error('Failed to take photo', e);
    }
  }
}
else{
  try {
    const photo = await cameraRef.current.takePhoto({
      quality: 0.85,
      skipMetadata: true,
    });
    const filePath = `${RNFS.DocumentDirectoryPath}/${Date.now()}.jpg`;
    await RNFS.moveFile(photo.path, filePath);
    await saveToGallery(filePath);
    // console.log('Photo saved to GALLEY:', filePath);
  } catch (e) {
    console.error('Failed to take photo', e);
  }
}
   
  };

 const burstMode=(t)=>{
  takePicture(true)
    
}
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.absoluteFill}
        device={device}
        // frameRate={selectedFPS}
        // frameProcessor={frameProcessor}
        // frameProcessorFps={30}
        isActive={true}
        photo={true}
        video={true}
        fps={selectedFPS}
        format={format}
        
        
        // videoStabilizationMode="auto"
        // videoSize={`${resolution.width}x${resolution.height}`}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.pic} onPress={()=>takePicture()}>
        </TouchableOpacity>
        {isRecording ? (
          <TouchableOpacity style={styles.pic1} onPress={stopRecording}>
            <View style={{ height: 30, width: 30, borderRadius: 3, backgroundColor: "#000" }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pic1} onPress={startRecording}>
            <View style={{ height: 30, width: 30, borderRadius: 15, backgroundColor: "red" }} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.fpsControls}>
        <TouchableOpacity onPress={() => handleFPSChange(10)}>
          <Text style={[styles.fpsButton, selectedFPS === 10 && styles.selectedFPS]}>10 FPS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFPSChange(20)}>
          <Text style={[styles.fpsButton, selectedFPS === 20 && styles.selectedFPS]}>20 FPS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFPSChange(30)}>
          <Text style={[styles.fpsButton, selectedFPS === 30 && styles.selectedFPS]}>30 FPS</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.resolutionControls}>
        <Text style={styles.resolutionText}>Resolution:</Text>
        <TouchableOpacity style={styles.resolutionButton} onPress={() => setResolution({ width: 1280, height: 720 })}>
          <Text style={[styles.fpsButton, resolution.width === 1280  && styles.selectedFPS]}>1280x720</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resolutionButton} onPress={() => setResolution({ width: 1920, height: 1080 })}>
          <Text style={[styles.fpsButton, resolution.width === 1920  && styles.selectedFPS]}>1920x1080</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.burstButton} onPress={()=>burstMode(true)}>
          <Text style={[styles.fpsButton, styles.selectedFPS]}>burst</Text>
        </TouchableOpacity>
    </View>
  );
};
export default App;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Black background to match the camera preview
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject, // This makes the camera fill the entire container
  },
  noCamera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Black background to indicate an error
  },
  noCameraText: {
    color: '#fff',
    fontSize: 18,
  },
  controls: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  pic: {
    height: 70,
    width: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
  },
  pic1: {
    height: 70,
    width: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameRateControls: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  frameRateButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  frameRateButtonText: {
    color: '#000',
  },
  frameRateText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  fpsControls: {
    position: 'absolute',
    top: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  fpsButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 5,
  },
  selectedFPS: {
    backgroundColor: 'blue',
    color: '#fff',
  },
  resolutionControls: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  resolutionButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  resolutionButtonText: {
    color: '#000',
  },
  resolutionText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  burstButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    position:"absolute",
    top:60,
    left:10
  },

});