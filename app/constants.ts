// constants.ts

// Частоти нот від C1 до B5 (першої–п’ятої октави)
export const NOTE_FREQS = {
  // Октава 1
  C1: 32.70,   'C#1': 34.65,  D1: 36.71,   'D#1': 38.89,
  E1: 41.20,   F1: 43.65,    'F#1': 46.25, G1: 49.00,
  'G#1': 51.91, A1: 55.00,   'A#1': 58.27, B1: 61.74,

  // Октава 2
  C2: 65.41,   'C#2': 69.30, D2: 73.42,   'D#2': 77.78,
  E2: 82.41,   F2: 87.31,    'F#2': 92.50, G2: 98.00,
  'G#2':103.83, A2:110.00,   'A#2':116.54, B2:123.47,

  // Октава 3
  C3:130.81,   'C#3':138.59, D3:146.83,   'D#3':155.56,
  E3:164.81,   F3:174.61,    'F#3':185.00, G3:196.00,
  'G#3':207.65, A3:220.00,   'A#3':233.08, B3:246.94,

  // Октава 4
  C4:261.63,   'C#4':277.18, D4:293.66,   'D#4':311.13,
  E4:329.63,   F4:349.23,    'F#4':369.99, G4:392.00,
  'G#4':415.30, A4:440.00,   'A#4':466.16, B4:493.88,

  // Октава 5
  C5:523.25,   'C#5':554.37, D5:587.33,   'D#5':622.25,
  E5:659.25,   F5:698.46,    'F#5':739.99, G5:783.99,
  'G#5':830.61, A5:880.00,   'A#5':932.33, B5:987.77,
} as const;

export type NoteKey = keyof typeof NOTE_FREQS;

// Локалізовані назви нот (укр. та англ.)
export const NOTE_LABELS: Record<'uk'|'en', Record<NoteKey, string>> = {
  uk: {
    // Октава 1
    C1: 'До1',    'C#1':'До♯1', D1:'Ре1',    'D#1':'Ре♯1',
    E1:'Мі1',     F1:'Фа1',     'F#1':'Фа♯1', G1:'Соль1',
    'G#1':'Соль♯1', A1:'Ля1',   'A#1':'Ля♯1',  B1:'Сі1',

    // Октава 2
    C2:'До2',     'C#2':'До♯2', D2:'Ре2',    'D#2':'Ре♯2',
    E2:'Мі2',     F2:'Фа2',     'F#2':'Фа♯2', G2:'Соль2',
    'G#2':'Соль♯2', A2:'Ля2',   'A#2':'Ля♯2',  B2:'Сі2',

    // Октава 3
    C3:'До3',     'C#3':'До♯3', D3:'Ре3',    'D#3':'Ре♯3',
    E3:'Мі3',     F3:'Фа3',     'F#3':'Фа♯3', G3:'Соль3',
    'G#3':'Соль♯3', A3:'Ля3',   'A#3':'Ля♯3',  B3:'Сі3',

    // Октава 4
    C4:'До4',     'C#4':'До♯4', D4:'Ре4',    'D#4':'Ре♯4',
    E4:'Мі4',     F4:'Фа4',     'F#4':'Фа♯4', G4:'Соль4',
    'G#4':'Соль♯4', A4:'Ля4',   'A#4':'Ля♯4',  B4:'Сі4',

    // Октава 5
    C5:'До5',     'C#5':'До♯5', D5:'Ре5',    'D#5':'Ре♯5',
    E5:'Мі5',     F5:'Фа5',     'F#5':'Фа♯5', G5:'Соль5',
    'G#5':'Соль♯5', A5:'Ля5',   'A#5':'Ля♯5',  B5:'Сі5',
  },
  en: Object.fromEntries(
    Object.keys(NOTE_FREQS).map(k => [k, k])
  ) as Record<NoteKey, string>,
};

// Утримуємо мінімальні строї (6,7,8 струн) — можна доповнити за потреби
export const GUITAR_TUNINGS: Record<'six'|'seven'|'eight', {
  label: string;
  strings: NoteKey[];
}[]> = {
  six: [
    { label: 'Standard', strings: ['E2','A2','D3','G3','B3','E4'] },
    { label: 'Drop D',  strings: ['D2','A2','D3','G3','B3','E4'] },
    { label: 'DADGAD',  strings: ['D2','A2','D3','G3','A3','D4'] },
    { label: 'Open G',  strings: ['D2','G2','D3','G3','B3','D4'] },
    { label: 'Half-Down', strings: ['D#2','G#2','C#3','F#3','A#3','D#4'] },
  ],
  seven: [
    { label: 'Standard 7', strings: ['B1','E2','A2','D3','G3','B3','E4'] },
    { label: 'Drop A',      strings: ['A1','E2','A2','D3','G3','B3','E4'] },
    { label: 'Open G7',     strings: ['B1','D2','G2','D3','G3','B3','D4'] },
    { label: 'Half-Down 7', strings: ['A#1','D#2','G#2','C#3','F#3','A#3','D#4'] },
    { label: 'Drop E7',     strings: ['E1','E2','A2','D3','G3','B3','E4'] },
  ],
  eight: [
    { label: 'Standard 8',   strings: ['F#1','B1','E2','A2','D3','G3','B3','E4'] },
    { label: 'Drop E',       strings: ['E1','B1','E2','A2','D3','G3','B3','E4'] },
    { label: 'Open Cmaj',    strings: ['C2','G2','C3','G3','C4','E4','G4','C5'] },
    { label: 'Half-Down 8',  strings: ['D#1','G#1','C#2','F#2','B2','E3','A3','D#4'] },
    { label: 'Drop A8',      strings: ['A1','E2','A2','D3','G3','B3','E4','A4'] },
  ],
};

export const GUITAR_IMG: Record<'six'|'seven'|'eight', Record<string, any>> = {
  six: {
    base: require('../assets/guitar/6strings/guitar.jpg'),
    E2:   require('../assets/guitar/6strings/guitar6.jpg'),
    A2:   require('../assets/guitar/6strings/guitar5.jpg'),
    D3:   require('../assets/guitar/6strings/guitar4.jpg'),
    G3:   require('../assets/guitar/6strings/guitar3.jpg'),
    B3:   require('../assets/guitar/6strings/guitar2.jpg'),
    E4:   require('../assets/guitar/6strings/guitar1.jpg'),

    D2:   require('../assets/guitar/6strings/guitar6.jpg'),
    A3:   require('../assets/guitar/6strings/guitar2.jpg'),
    D4:   require('../assets/guitar/6strings/guitar1.jpg'),
    G2:   require('../assets/guitar/6strings/guitar5.jpg'),

    "D#2":   require('../assets/guitar/6strings/guitar6.jpg'),
    "G#2":   require('../assets/guitar/6strings/guitar5.jpg'),
    "C#3":   require('../assets/guitar/6strings/guitar4.jpg'),
    "F#3":   require('../assets/guitar/6strings/guitar3.jpg'),
    "A#3":   require('../assets/guitar/6strings/guitar2.jpg'),
    "D#4":   require('../assets/guitar/6strings/guitar1.jpg'),

  },
  seven: {
    base: require('../assets/guitar/7strings/7string_guitar_base.jpg'),
    B1:   require('../assets/guitar/7strings/7string_guitar_7.jpg'),
    E2:   require('../assets/guitar/7strings/7string_guitar_6.jpg'),
    A2:   require('../assets/guitar/7strings/7string_guitar_5.jpg'),
    D3:   require('../assets/guitar/7strings/7string_guitar_4.jpg'),
    G3:   require('../assets/guitar/7strings/7string_guitar_3.jpg'),
    B3:   require('../assets/guitar/7strings/7string_guitar_2.jpg'),
    E4:   require('../assets/guitar/7strings/7string_guitar_1.jpg'),

    A1:   require('../assets/guitar/7strings/7string_guitar_7.jpg'),
    D2:   require('../assets/guitar/7strings/7string_guitar_6.jpg'),
    G2:   require('../assets/guitar/7strings/7string_guitar_5.jpg'),
    D4:   require('../assets/guitar/7strings/7string_guitar_1.jpg'),

    "A#1":   require('../assets/guitar/7strings/7string_guitar_7.jpg'),
    "D#2":   require('../assets/guitar/7strings/7string_guitar_6.jpg'),
    "G#2":   require('../assets/guitar/7strings/7string_guitar_5.jpg'),
    "C#3":   require('../assets/guitar/7strings/7string_guitar_4.jpg'),
    "F#3":   require('../assets/guitar/7strings/7string_guitar_3.jpg'),
    "A#3":   require('../assets/guitar/7strings/7string_guitar_2.jpg'),
    "D#4":   require('../assets/guitar/7strings/7string_guitar_1.jpg'),
    E1:   require('../assets/guitar/7strings/7string_guitar_7.jpg'),


  },
  eight: {
    base: require('../assets/guitar/8strings/8string_guitar_base.jpg'),
    "F#1": require('../assets/guitar/8strings/8string_guitar_8.jpg'),
    B1:   require('../assets/guitar/8strings/8string_guitar_7.jpg'),
    E2:   require('../assets/guitar/8strings/8string_guitar_6.jpg'),
    A2:   require('../assets/guitar/8strings/8string_guitar_5.jpg'),
    D3:   require('../assets/guitar/8strings/8string_guitar_4.jpg'),
    G3:   require('../assets/guitar/8strings/8string_guitar_3.jpg'),
    B3:   require('../assets/guitar/8strings/8string_guitar_2.jpg'),
    E4:   require('../assets/guitar/8strings/8string_guitar_1.jpg'),

    E1: require('../assets/guitar/8strings/8string_guitar_8.jpg'),


  },
};

export const DARK_GUITAR_IMG: Record<'six'|'seven'|'eight', Record<string, any>> = {
  six: {
    base: require('../assets/dark_guitar/6strings/dark_guitar.jpg'),
    E2:   require('../assets/dark_guitar/6strings/dark_guitar1.jpg'),
    A2:   require('../assets/dark_guitar/6strings/dark_guitar2.jpg'),
    D3:   require('../assets/dark_guitar/6strings/dark_guitar3.jpg'),
    G3:   require('../assets/dark_guitar/6strings/dark_guitar4.jpg'),
    B3:   require('../assets/dark_guitar/6strings/dark_guitar5.jpg'),
    E4:   require('../assets/dark_guitar/6strings/dark_guitar6.jpg'),

    D2:   require('../assets/dark_guitar/6strings/dark_guitar1.jpg'),
    A3:   require('../assets/dark_guitar/6strings/dark_guitar5.jpg'),
    D4:   require('../assets/dark_guitar/6strings/dark_guitar6.jpg'),
    G2:   require('../assets/dark_guitar/6strings/dark_guitar2.jpg'),

    "D#2":   require('../assets/dark_guitar/6strings/dark_guitar1.jpg'),
    "G#2":   require('../assets/dark_guitar/6strings/dark_guitar2.jpg'),
    "C#3":   require('../assets/dark_guitar/6strings/dark_guitar3.jpg'),
    "F#3":   require('../assets/dark_guitar/6strings/dark_guitar4.jpg'),
    "A#3":   require('../assets/dark_guitar/6strings/dark_guitar5.jpg'),
    "D#4":   require('../assets/dark_guitar/6strings/dark_guitar6.jpg'),

  },
  seven: {
    base: require('../assets/dark_guitar/7strings/7string_guitar_base.jpg'),
    B1:   require('../assets/dark_guitar/7strings/7string_guitar_7.jpg'),
    E2:   require('../assets/dark_guitar/7strings/7string_guitar_6.jpg'),
    A2:   require('../assets/dark_guitar/7strings/7string_guitar_5.jpg'),
    D3:   require('../assets/dark_guitar/7strings/7string_guitar_4.jpg'),
    G3:   require('../assets/dark_guitar/7strings/7string_guitar_3.jpg'),
    B3:   require('../assets/dark_guitar/7strings/7string_guitar_2.jpg'),
    E4:   require('../assets/dark_guitar/7strings/7string_guitar_1.jpg'),

    A1:   require('../assets/dark_guitar/7strings/7string_guitar_7.jpg'),
    D2:   require('../assets/dark_guitar/7strings/7string_guitar_6.jpg'),
    G2:   require('../assets/dark_guitar/7strings/7string_guitar_5.jpg'),
    D4:   require('../assets/dark_guitar/7strings/7string_guitar_1.jpg'),

    "A#1":   require('../assets/dark_guitar/7strings/7string_guitar_7.jpg'),
    "D#2":   require('../assets/dark_guitar/7strings/7string_guitar_6.jpg'),
    "G#2":   require('../assets/dark_guitar/7strings/7string_guitar_5.jpg'),
    "C#3":   require('../assets/dark_guitar/7strings/7string_guitar_4.jpg'),
    "F#3":   require('../assets/dark_guitar/7strings/7string_guitar_3.jpg'),
    "A#3":   require('../assets/dark_guitar/7strings/7string_guitar_2.jpg'),
    "D#4":   require('../assets/dark_guitar/7strings/7string_guitar_1.jpg'),
    E1:   require('../assets/dark_guitar/7strings/7string_guitar_7.jpg'),

  },
  eight: {
    base: require('../assets/dark_guitar/8strings/8string_guitar_base.jpg'),
    "F#1": require('../assets/dark_guitar/8strings/8string_guitar_8.jpg'),
    B1:   require('../assets/dark_guitar/8strings/8string_guitar_7.jpg'),
    E2:   require('../assets/dark_guitar/8strings/8string_guitar_6.jpg'),
    A2:   require('../assets/dark_guitar/8strings/8string_guitar_5.jpg'),
    D3:   require('../assets/dark_guitar/8strings/8string_guitar_4.jpg'),
    G3:   require('../assets/dark_guitar/8strings/8string_guitar_3.jpg'),
    B3:   require('../assets/dark_guitar/8strings/8string_guitar_2.jpg'),
    E4:   require('../assets/dark_guitar/8strings/8string_guitar_1.jpg'),

    E1: require('../assets/dark_guitar/8strings/8string_guitar_8.jpg'),

  },
};
