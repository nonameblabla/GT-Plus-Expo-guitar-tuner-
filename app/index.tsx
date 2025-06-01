/* index.tsx */
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  useMemo
} from 'react';
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
  LogBox
} from 'react-native';
import LiveAudioStream from 'react-native-live-audio-stream';
import { Buffer } from 'buffer';
import { YIN } from 'pitchfinder';
import SpectrumVisualizer from './SpectrumVisualizer';
import { SettingsContext } from './SettingsContext';
import { AudioContext } from 'react-native-audio-api';
import { 
  NOTE_FREQS, NOTE_LABELS, GUITAR_TUNINGS,
  GUITAR_IMG, DARK_GUITAR_IMG 
} from './constants';

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
  const [highlightedString, setHighlighted] = useState<NoteKey | null>(null);

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
    throttle((pcmBase642: string) => {
      const buf = Buffer.from(pcmBase642, 'base64');
      const pcm16 = new Int16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2);
      const floatData = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        floatData[i] = pcm16[i] / 32768;
      }
      setAudioData(floatData);
      const freq = detectPitch(floatData);
      if (freq && freq > 50 && freq < 2000) {
        setFreq(freq);
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

  useEffect(() => {
    if (isOn) {
      setNearest(null);
      setHighlighted(null);
    }
  }, [isOn]);

  useEffect(() => {
    const THRESHOLD = 10;
    if (!isOn && frequency > 0) {
      const match = (Object.keys(NOTE_FREQS) as NoteKey[]).find(
        key => Math.abs(NOTE_FREQS[key] - frequency) <= THRESHOLD
      );
      setHighlighted(match || null);
    } else {
      setHighlighted(null);
    }
  }, [frequency, isOn]);

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

  // === ЗДЕСЬ изменилось ===
  const tuningList = GUITAR_TUNINGS[guitarType];
const chosen = tuningList.find(t => t.label === tuning) || tuningList[0];
const baseStrings = chosen.strings;  // напр. ['E2','A2','D3','G3','B3','E4']

// 2. Розділимо навпіл:
const half = Math.ceil(baseStrings.length / 2);
const firstHalf  = baseStrings.slice(0, half);   // ['E2','A2','D3']
const secondHalf = baseStrings.slice(half);      // ['G3','B3','E4']

// 3. Створимо дві пари масивів: для UI та для даних (частоти)
let displayLeft: NoteKey[],  dataLeft: NoteKey[];
let displayRight: NoteKey[], dataRight: NoteKey[];

if (handedness === 'right') {
  // для правші ліворуч — перша половина, показуємо зверху→вниз → перевернемо:
  dataLeft    = firstHalf;          
  displayLeft = [...firstHalf].reverse();  // ['D3','A2','E2']

  // для правші праворуч — друга половина, але UI повинен бути top→bottom = ['G3','B3','E4']
  dataRight    = secondHalf;
  displayRight = secondHalf;               // ['G3','B3','E4']
} else {
  // для лівші — навпаки
  dataRight    = firstHalf;
  displayRight = [...firstHalf].reverse(); // ['D3','A2','E2']

  dataLeft     = secondHalf;
  displayLeft  = secondHalf;               // ['G3','B3','E4']
}


  const btnConfig = isOn
    ? { bg: '#4CAF50', text: '#fff', label: 'ON' }
    : { bg: '#555', text: '#fff', label: 'OFF' };

  const overlayKey: NoteKey | null = isOn
    ? selectedString
    : highlightedString;

const imgSet = useMemo(() => {
    return darkMode
      ? DARK_GUITAR_IMG[guitarType]
      : GUITAR_IMG[guitarType];
  }, [darkMode, guitarType]);

const baseImg    = imgSet.base;
const overlayImg = overlayKey ? imgSet[overlayKey] : null;
useEffect(() => {
    const sources = Object.values(imgSet) as number[];
    sources.forEach(src => {
      const { uri } = Image.resolveAssetSource(src);
      Image.prefetch(uri);
    });
  }, [imgSet]);

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <TouchableOpacity
        style={[styles.modeBtn, { backgroundColor: btnConfig.bg }]}
        onPress={toggleMode}
      >
        <Text style={[styles.modeBtnText, { color: btnConfig.text }]}>
          {btnConfig.label}
        </Text>
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
        {frequency.toFixed(2)} Гц
      </Text>

      <Text style={[styles.refText, darkMode && styles.darkNoteText]}>
        {getTargetFreq()
         ? `${getTargetFreq()!.toFixed(2)} Гц`
          : '-- Гц'}
      </Text>

      <View style={styles.guitarWrapper}>
        <Image
          source={baseImg}
          style={[
            styles.guitar,
            darkMode && styles.darkGuitar,
            handedness === 'left' && styles.flipHorizontal
          ]}
          resizeMode="contain"
        />
        {overlayImg && (
          <Image
            source={overlayImg}
            style={[
            styles.guitar,
            styles.highlightOverlay,
            handedness === 'left' && styles.flipHorizontal
          ]}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.leftButtons}>
        {displayLeft.map((noteKey, idx) => (
          <TouchableOpacity
            key={noteKey}
            style={[
              styles.stringBtn,
              darkMode && styles.darkBtn,
              // підсвітка вибраної/детектованої струни
              (selectedString === noteKey) && styles.stringBtnActive,
              (overlayKey === noteKey)    && styles.stringBtnHighlighted,
            ]}
            onPress={() => {
              setIsOn(true);
              setSel(noteKey);
              // граємо саме ту ноту з dataLeft
              playTone(NOTE_FREQS[ dataLeft[idx] ]);
            }}
          >
            <Text style={[styles.stringText, darkMode && styles.darkNoteText]}>
              {NOTE_LABELS[noteLang][noteKey]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rightButtons}>
        {displayRight.map((noteKey, idx) => (
          <TouchableOpacity
            key={noteKey}
            style={[
              styles.stringBtn,
              darkMode && styles.darkBtn,
              (selectedString === noteKey) && styles.stringBtnActive,
              (overlayKey === noteKey)    && styles.stringBtnHighlighted,
            ]}
            onPress={() => {
              setIsOn(true);
              setSel(noteKey);
              playTone(NOTE_FREQS[ dataRight[idx] ]);
            }}
          >
            <Text style={[styles.stringText, darkMode && styles.darkNoteText]}>
              {NOTE_LABELS[noteLang][noteKey]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'
  },
  darkContainer: {
    backgroundColor: '#020203'
  },
  modeBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 50, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  modeBtnText: { fontSize: 14, fontWeight: 'bold' },
  spectrum: { top: '30%' },
  noteText: { top: '42%', fontSize: 48, textAlign: 'center', color: '#000' },
  freqText: { top: '45%', fontSize: 24, textAlign: 'center', color: '#666' },
  darkNoteText: { color: '#fff' },
  refText:{
    fontSize: 18,
    marginTop: 4,
    color : '#888',
  },

  guitarWrapper: {
    top: '15%',
    width: '110%',
    height: '110%',
    marginVertical: 15,
    position: 'relative',
  },
  guitar: { width: '100%', height: '100%' },
  darkGuitar: { opacity: 1 },
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  flipHorizontal:{transform:[{ scaleX: -1 }]},

  leftButtons: { position: 'absolute', left: 20, top: '56%', justifyContent: 'center', },
  rightButtons: { position: 'absolute', right: 20, top: '56%', justifyContent: 'center' },
  stringBtn: {
    width: 45, height: 45, borderRadius: 22.5,
    backgroundColor: '#1115', marginVertical: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  darkBtn: { backgroundColor: '#121212' },
  stringText: { fontSize: 16, color: '#fff' },
  stringBtnActive: { backgroundColor: '#4CAF50' },
  stringBtnHighlighted: { backgroundColor: '#2196F3' },
});
