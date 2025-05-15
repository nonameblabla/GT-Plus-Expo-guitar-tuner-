import React, { useState, useEffect, useRef, useContext } from 'react';
import 
{ View, Text, TouchableOpacity,
  StyleSheet, Animated, Easing 
} from 'react-native';
import { Audio, Video, ResizeMode } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';
import { SettingsContext } from './SettingsContext';
export default function MetronomeScreen() {
  const { darkMode } = useContext(SettingsContext);
  const [bpm, setBpm] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const changeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<Video>(null);
  const isFocused = useIsFocused();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Функція для пульсації кнопки — кожен такт
  const pulseButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,          
        duration: 50,            
        easing: Easing.linear,   
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,             
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Завантаження звуку метронома
  useEffect(() => {
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/click.mp3')
        );
        soundRef.current = sound;
      } catch (e) {
        console.warn('Не вдалося завантажити звук метронома', e);
      }
    })();

    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(changeIntervalRef.current!);
      soundRef.current?.unloadAsync();
    };
  }, []);

  // Зупинка метронома при втраті фокусу
  useEffect(() => {
    if (!isFocused && isPlaying) stopMetronome();
  }, [isFocused]);

  // Оновлення інтервалу та швидкості анімації при зміні BPM
  useEffect(() => {
    if (isPlaying) {
      clearInterval(intervalRef.current!);
      const ms = (60 / bpm) * 1000;
      intervalRef.current = setInterval(playClick, ms);
      videoRef.current?.setRateAsync(bpm / 60, true);
    }
    // Просто оновлюємо speed проп Lottie
  }, [bpm]);

  const playClick = async () => {
    try {
      await soundRef.current?.replayAsync();
      pulseButton();
    } catch (e) {
      console.warn('Помилка відтворення кліку', e);
    }
  };

  const startMetronome = () => {
    playClick();
    const ms = (60 / bpm) * 1000;
    intervalRef.current = setInterval(playClick, ms);
    setIsPlaying(true);
    videoRef.current?.playAsync();
  };

  const stopMetronome = () => {
    clearInterval(intervalRef.current!);
    setIsPlaying(false);
    videoRef.current?.pauseAsync();
  };

  const toggleMetronome = () => {
    isPlaying ? stopMetronome() : startMetronome();
  };

  // Обробники для безперервного натискання
  const handlePressIn = (inc: number) => {
    changeIntervalRef.current = setInterval(() => {
      setBpm(b => Math.max(30, Math.min(300, b + inc)));
    }, 100);
  };
  const handlePressOut = () => clearInterval(changeIntervalRef.current!);

  // Стилі залежно від теми
  const containerStyle = [styles.container, darkMode && styles.darkContainer];
  const textStyle = [styles.text, darkMode && styles.darkText];
  const btnStyle = [styles.button, darkMode && styles.darkButton];
  const btnText = [styles.buttonText, darkMode && styles.darkButtonText];

  return (
    <View style={containerStyle}>
      <Video
        ref={videoRef}
        source={
          darkMode
            ? require('../assets/metronome-negate.mp4')
            : require('../assets/metronome.mp4')
        }
        style={styles.lottie}
        shouldPlay={isPlaying}
        isLooping
        resizeMode={ResizeMode.CONTAIN}
        rate={bpm / 60}
        volume={0}
      />


      <View style={styles.bpmContainer}>
        <TouchableOpacity
          style={btnStyle}
          onPressIn={() => handlePressIn(-1)}
          onPressOut={handlePressOut}
          onPress={() => setBpm(b => Math.max(30, b - 1))}
        >
          <Text style={btnText}>−</Text>
        </TouchableOpacity>

        <Text style={[textStyle, styles.bpmText]}>{bpm} BPM</Text>

        <TouchableOpacity
          style={btnStyle}
          onPressIn={() => handlePressIn(1)}
          onPressOut={handlePressOut}
          onPress={() => setBpm(b => Math.min(300, b + 1))}
        >
          <Text style={btnText}>＋</Text>
        </TouchableOpacity>
      </View>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.toggleButton, isPlaying ? styles.stopButton : styles.startButton]}
          onPress={toggleMetronome}
        >
          <Text style={styles.toggleButtonText}>
            {isPlaying ? 'Стоп' : 'Старт'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  darkContainer: { backgroundColor: '#000000' },
  text: { fontSize: 24, color: '#333', marginBottom: 20 },
  darkText: { color: '#fff' },
  lottie: { width: 300, height: 300, marginBottom: 60 },
  bpmContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  bpmText: { fontSize: 32, marginHorizontal: 20, textAlign: 'center' },
  button: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  darkButton: { backgroundColor: '#388E3C' },
  buttonText: { fontSize: 24, color: '#fff', textAlign: 'center' },
  darkButtonText: { color: '#fff' },
  toggleButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  startButton: { backgroundColor: '#4CAF50' },
  stopButton: { backgroundColor: '#D32F2F' },
  toggleButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});
