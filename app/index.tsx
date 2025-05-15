/* index.tsx */
import React,
  { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  LogBox,
} from 'react-native';
import LiveAudioStream from 'react-native-live-audio-stream';
import { Buffer } from 'buffer';
import { YIN } from 'pitchfinder';
import SpectrumVisualizer from './SpectrumVisualizer';
import { SettingsContext } from './SettingsContext';
import { AudioContext } from 'react-native-audio-api';

import { NOTE_FREQS, NOTE_LABELS, GUITAR_TUNINGS } from './constants';

type NoteKey = keyof typeof NOTE_FREQS;

export default function MainApp() {
  const {
    darkMode,
    tuning,
    handedness,
    noteLang,
    guitarType,
  } = useContext(SettingsContext);

  const [isOn, setIsOn] = useState(false);
  const [selectedString, setSel] = useState<NoteKey | null>(null);
  const [currentNote, setNote] = useState<NoteKey | null>(null);
  const [frequency, setFreq] = useState(0);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [nearestString, setNearest] = useState<NoteKey | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    audioCtxRef.current = new AudioContext();
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const playTone = (freq: number, duration = 300) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(audioCtx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      osc.disconnect();
    }, duration);
  };

  const subscriptionRef = useRef<any>(null);
  const detectPitch = useRef(
    YIN({ sampleRate: 44100, threshold: 0.15, probabilityThreshold: 0.1 })
  ).current;

  const throttle = <T extends any[]>(fn: (...args: T) => void, ms: number) => {
    let last = 0;
    return (...args: T) => {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn(...args);
      }
    };
  };

  const handleAudioData = useCallback(
    throttle((pcmBase64: string) => {
      const buf = Buffer.from(pcmBase64, 'base64');
      const pcm16 = new Int16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2);
      const floatData = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        floatData[i] = pcm16[i] / 32768;
      }
      setAudioData(floatData);
      const freq = detectPitch(floatData);
      if (freq && freq > 50 && freq < 2000) {
        setFreq(freq);
        // В режиме «слушать» (isOn = false) автоматом выбрасываем ближайшую струну
        if (!isOn) {
          const keys = Object.keys(NOTE_FREQS) as NoteKey[];
          const best = keys.reduce(
            (prev, n) =>
              Math.abs(NOTE_FREQS[n] - freq) < Math.abs(NOTE_FREQS[prev] - freq)
                ? n
                : prev,
            keys[0]
          );
          setNearest(best);
          setNote(best);
        }
      }
     }, 100),
     [isOn]
   );

  // При ручном включении режима (ON→OFF) сбрасываем авто-выбор
 useEffect(() => {
  if (isOn) setNearest(null);
  }, [isOn]);

  async function requestAudioPermission() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Доступ до мікрофону',
          message: 'Потрібен доступ до мікрофону для тюнінгу',
          buttonPositive: 'Дозволити',
          buttonNegative: 'Відхилити',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  const audioEmitter = useRef(
    new NativeEventEmitter(NativeModules.LiveAudioStream)
  ).current;
  const startStreaming = useCallback(async () => {
    if (!(await requestAudioPermission())) return;
    LiveAudioStream.init({
      sampleRate: 44100,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      bufferSize: 2048,
      wavFile: 'temp.wav',
    });
    LiveAudioStream.start();
    subscriptionRef.current = audioEmitter.addListener('data', handleAudioData);
  }, [audioEmitter, handleAudioData]);

  const stopStreaming = useCallback(() => {
    subscriptionRef.current?.remove();
    LiveAudioStream.stop();
  }, []);

  useEffect(() => {
    LogBox.ignoreLogs(['new NativeEventEmitter']);
    startStreaming();
    return () => stopStreaming();
  }, [startStreaming, stopStreaming]);

  const toggleMode = () => {
    setIsOn(prev => {
      const next = !prev;
      if (!next) {
        setSel(null);
        setNote(null);
      }
      return next;
    });
  };

  const getTargetFreq = (): number | undefined => {
    if (!isOn && currentNote) return NOTE_FREQS[currentNote];
    if (isOn && selectedString) return NOTE_FREQS[selectedString];
    return undefined;
  };

  // Динамічний поділ струн залежно від налаштувань
  // Получаем список всех настроек для выбранного типа гитары
const tuningList = GUITAR_TUNINGS[guitarType];

// Ищем настройки по метке (label), которую хранит контекст
const chosen = tuningList.find(t => t.label === tuning);

// Берём массив нот: либо из найденного объекта, либо из первого по умолчанию
const strings: NoteKey[] = chosen
  ? chosen.strings
  : tuningList[0].strings;

// Далее делим на «левую» и «правую» половину, как было у вас:
const half = Math.ceil(strings.length / 2);
let leftStrings: NoteKey[];
let rightStrings: NoteKey[];

if (handedness === 'right') {
  leftStrings  = strings.slice(0, half);
  rightStrings = strings.slice(half);
} else {
  rightStrings = strings.slice(0, half);
  leftStrings  = strings.slice(half);
}


  const btnConfig = isOn
    ? { bg: '#4CAF50', text: '#fff', label: 'ON' }
    : { bg: '#555', text: '#fff', label: 'OFF' };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <TouchableOpacity
        style={[styles.modeBtn, { backgroundColor: btnConfig.bg }]}
        onPress={toggleMode}
      >
        <Text style={[styles.modeBtnText, { color: btnConfig.text }]}>
{btnConfig.label}</Text>
      </TouchableOpacity>

      <View style={styles.spectrum}>
        <SpectrumVisualizer
          audioData={audioData}
          size={32}
          width={250}
          height={80}
          targetFreq={getTargetFreq()}
          currentFreq={frequency}
          darkMode={darkMode}
        />
      </View>

      <Text style={[styles.noteText, darkMode && styles.darkNoteText]}>
        {selectedString
          ? NOTE_LABELS[noteLang][selectedString]
          : (currentNote && NOTE_LABELS[noteLang][currentNote]) || '--'}
      </Text>
      <Text style={[styles.freqText, darkMode && styles.darkNoteText]}>
{frequency.toFixed(2)} Гц</Text>

      <Image
        source={
          darkMode
            ? require('../assets/dark_guitar.jpg')
            : require('../assets/guitar.jpg')
        }
        style={[styles.guitar, darkMode && styles.darkGuitar]}
        resizeMode="contain"
      />

      <View style={styles.leftButtons}>
        {leftStrings.map(s => (
          <TouchableOpacity
            key={s}
            style={[
              styles.stringBtn,
              darkMode && styles.darkBtn,
              selectedString === s && styles.stringBtnActive,
            ]}
            onPress={() => {
              setIsOn(true);
              setSel(s);
              playTone(NOTE_FREQS[s]);
            }}
          >
            <Text style={[styles.stringText, darkMode && styles.darkNoteText]}>
              {NOTE_LABELS[noteLang][s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rightButtons}>
        {rightStrings.map(s => (
          <TouchableOpacity
            key={s}
            style={[
              styles.stringBtn,
              darkMode && styles.darkBtn,
              selectedString === s && styles.stringBtnActive,
            ]}
            onPress={() => {
              setIsOn(true);
              setSel(s);
              playTone(NOTE_FREQS[s]);
            }}
          >
            <Text style={[styles.stringText, darkMode && styles.darkNoteText]}>
              {NOTE_LABELS[noteLang][s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#020203' },
  modeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 50,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnText: { fontSize: 14, fontWeight: 'bold' },
  spectrum: { top: '30%' },
  noteText: { top: '35%', fontSize: 48, textAlign: 'center', color: '#000' },
  freqText: { top: '42%', fontSize: 24, textAlign: 'center', color: '#666' },
  darkNoteText: { color: '#fff' },
  guitar: { top: '15%', width: '110%', height: '110%', marginVertical: 15 },
  darkGuitar: { opacity: 0.5 },
  leftButtons: { position: 'absolute', left: 20, top: '58%', justifyContent: 'center' },
  rightButtons: { position: 'absolute', right: 20, top: '58%', justifyContent: 'center' },
  stringBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#1115',
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkBtn: { backgroundColor: '#121212' },
  stringText: { fontSize: 16, color: '#fff' },
  stringBtnActive: { backgroundColor: '#4CAF50' },
});