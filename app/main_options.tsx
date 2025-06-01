import React, { useContext, useState, useCallback, useEffect, version } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SettingsContext } from './SettingsContext';
import { GUITAR_TUNINGS } from './constants';
import type { NoteKey } from './constants';
import Constants from 'expo-constants';

// Отримуємо версію застосунку з expo-constants
const appVersionFromExpo = Constants.expoConfig?.version || 'невідомо';

type GuitarType = typeof GUITAR_TUNINGS extends Record<infer K, any>
  ? K extends string
    ? K
    : never
  : never;

type TuningOption = { label: string; strings: NoteKey[] };

const guitarTypeOptions = [
  { label: '6-струнна', value: 'six' as const },
  { label: '7-струнна', value: 'seven' as const },
  { label: '8-струнна', value: 'eight' as const },
];

export default function MainOptions() {
  const {
    darkMode,
    setDarkMode,
    noteLang,
    setNoteLang,
    tuning,
    setTuning,
    handedness,
    setHandedness,
    guitarType,
    setGuitarType,
    isReady,
  } = useContext(SettingsContext);

  const [appVersion, setAppVersion] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    setAppVersion(appVersionFromExpo);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setAppVersion(appVersionFromExpo);
    Alert.alert('Версія застосунку', `Поточна версія: ${appVersionFromExpo}`);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const tuningList = GUITAR_TUNINGS[guitarType as GuitarType] as TuningOption[];
  const tuningOptions = tuningList.map(opt => ({ label: opt.label, value: opt.label }));

  return (
    <ScrollView
      contentContainerStyle={[styles.container, darkMode && styles.darkContainer]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={darkMode ? '#fff' : '#000'}
        />
      }
    >
      {!isReady && (
        <ActivityIndicator
          size="small"
          color={darkMode ? '#fff' : '#000'}
          style={styles.loading}
        />
      )}

      <View style={[styles.blockTitle, darkMode && styles.darkBlock]}>
        <Text style={[styles.title, darkMode && styles.darkText]}>
          Налаштування застосунку
        </Text>
      </View>

      <View style={[styles.option, darkMode && styles.darkBlock]}>
        <Text style={[styles.label, darkMode && styles.darkText]}>Темний режим</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          disabled={!isReady}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      <View style={[styles.option, darkMode && styles.darkBlock]}>
        <Text style={[styles.label, darkMode && styles.darkText]}>Мова позначень нот</Text>
        <View style={[styles.pickerWrapper, darkMode && styles.darkPickerWrapper]}>
          <Picker
            selectedValue={noteLang}
            onValueChange={setNoteLang}
            enabled={isReady}
            style={[styles.picker, darkMode && styles.darkPicker]}
            dropdownIconColor={darkMode ? '#fff' : '#000'}
          >
            <Picker.Item label="Українська" value="uk" />
            <Picker.Item label="English" value="en" />
          </Picker>
        </View>
      </View>

      <View style={[styles.option, darkMode && styles.darkBlock]}>
        <Text style={[styles.label, darkMode && styles.darkText]}>Стрій гітари</Text>
        <View style={[styles.pickerWrapper, darkMode && styles.darkPickerWrapper]}>
          <Picker
            selectedValue={tuning}
            onValueChange={setTuning}
            enabled={isReady}
            style={[styles.picker, darkMode && styles.darkPicker]}
            dropdownIconColor={darkMode ? '#fff' : '#000'}
          >
            {tuningOptions.map(opt => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={[styles.option, darkMode && styles.darkBlock]}>
        <Text style={[styles.label, darkMode && styles.darkText]}>Режим руки</Text>
        <View style={[styles.pickerWrapper, darkMode && styles.darkPickerWrapper]}>
          <Picker
            selectedValue={handedness}
            onValueChange={setHandedness}
            enabled={isReady}
            style={[styles.picker, darkMode && styles.darkPicker]}
            dropdownIconColor={darkMode ? '#fff' : '#000'}
          >
            <Picker.Item label="Правша" value="right" />
            <Picker.Item label="Лівша" value="left" />
          </Picker>
        </View>
      </View>

      <View style={[styles.option, darkMode && styles.darkBlock]}>
        <Text style={[styles.label, darkMode && styles.darkText]}>Тип гітари</Text>
        <View style={[styles.pickerWrapper, darkMode && styles.darkPickerWrapper]}>
          <Picker
            selectedValue={guitarType}
            onValueChange={value => setGuitarType(value as GuitarType)}
            enabled={isReady}
            style={[styles.picker, darkMode && styles.darkPicker]}
            dropdownIconColor={darkMode ? '#fff' : '#000'}
          >
            {guitarTypeOptions.map(opt => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={[styles.version, darkMode && styles.darkVersion]}>
        <Text style={[styles.labelV, darkMode && styles.darkText]}>Версія застосунку</Text>
        <Text style={[styles.value, darkMode && styles.darkText]}>{appVersion}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 10, backgroundColor: '#f5f5f5' },
  darkContainer: { backgroundColor: '#121212' },
  loading: { marginBottom: 10 },
  block: { marginBottom: 20, padding: 10, backgroundColor: '#e0e0e0', borderRadius: 5 },
  darkBlock: { backgroundColor: '#1e1e1e' },
  title: { fontSize: 18, color: '#333' },
  blockTitle: { marginBottom: 20, padding: 10, backgroundColor: '#fff', borderRadius: 5, alignItems:"center" },
  darkText: { color: '#fff' },
  option: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  version:{
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    top:"3%"
  },
  darkVersion:{
    backgroundColor: '#1e1e1e'
  },
  label: { fontSize: 16, color: '#333', marginBottom: 6 },
  value: { fontSize: 12, color: '#333' },
  labelV: { fontSize: 12 },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    borderColor: '#ccc',
    width: '100%',
  },
  darkPickerWrapper: { borderColor: '#555' },
  picker: { height: 48, width: '100%', color: '#000', backgroundColor: '#fff' },
  darkPicker: { color: '#fff', backgroundColor: '#2a2a2a' },
});