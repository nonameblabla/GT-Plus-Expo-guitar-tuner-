// MainOptions.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SettingsContext } from './SettingsContext';
import { GUITAR_TUNINGS } from './constants';
import type { NoteKey } from './constants';

const noteLangDescriptions = {
  uk: 'До Ре Мі Фа Соль Ля Сі',
  en: 'C D E F G A B',
};

const guitarTypeOptions = [
  { label: '6-струнна', value: 'six' as const },
  { label: '7-струнна', value: 'seven' as const },
  { label: '8-струнна', value: 'eight' as const },
];

type GuitarType = typeof guitarTypeOptions[number]['value'];

type TuningOption = { label: string; strings: NoteKey[] };

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

  // Створюємо список стріїв для поточного типу гітари
  const tuningList = GUITAR_TUNINGS[guitarType as GuitarType] as TuningOption[];
  // Створюємо опції для Picker: label і value (тут значення — це ярлик строю)
  const tuningOptions = tuningList.map((opt: TuningOption) => ({
    label: opt.label,
    value: opt.label,
  }));

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {!isReady && (
        <ActivityIndicator
          size="small"
          color={darkMode ? '#fff' : '#000'}
          style={styles.loading}
        />
      )}

      <View style={[styles.block, darkMode && styles.darkBlock]}>
        <Text style={[styles.title, darkMode && styles.darkText]}>Налаштування застосунку</Text>
      </View>

      {/* Темний режим */}
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

      {/* Мова позначень */}
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

      {/* Стрій гітари */}
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

      {/* Режим руки */}
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

      {/* Тип гітари */}
      <View style={[styles.option, darkMode && styles.darkBlock]}>
        <Text style={[styles.label, darkMode && styles.darkText]}>Тип гітари</Text>
        <View style={[styles.pickerWrapper, darkMode && styles.darkPickerWrapper]}>
          <Picker
            selectedValue={guitarType}
            onValueChange={(value) => setGuitarType(value as GuitarType)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  darkContainer: { backgroundColor: '#121212' },
  loading: { marginBottom: 10 },
  block: { marginBottom: 20, padding: 10, backgroundColor: '#e0e0e0', borderRadius: 5 },
  darkBlock: { backgroundColor: '#1e1e1e' },
  title: { fontSize: 18, color: '#333' },
  darkText: { color: '#ffffff' },
  option: { flexDirection: 'column', alignItems: 'flex-start', padding: 12, backgroundColor: '#ffffff', borderRadius: 5, marginBottom: 10 },
  label: { fontSize: 16, color: '#333', marginBottom: 6 },
  pickerWrapper: { borderWidth: 1, borderRadius: 5, overflow: 'hidden', borderColor: '#ccc', width: '100%' },
  darkPickerWrapper: { borderColor: '#555' },
  picker: { height: 48, width: '100%', color: '#000', backgroundColor: '#fff' },
  darkPicker: { color: '#fff', backgroundColor: '#2a2a2a' },
});