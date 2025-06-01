import React, { createContext, useContext, useState, useRef, useEffect, useMemo, memo, useCallback } from "react";
import { Slot, useRouter, usePathname } from "expo-router";
import Constants from 'expo-constants';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Linking,
  FlatList,
  Share,
} from "react-native";
import { SettingsProvider, SettingsContext } from "./SettingsContext";

/*** Drawer Context ***/
const DrawerContext = createContext<{ open: () => void; close: () => void; }>({ open: () => {}, close: () => {} });

/*** Menu Items ***/
const MENU_ITEMS = [
  { label: "Тюнер",       route: "/" as const },
  { label: "Метроном",     route: "/metronome" as const },
  { label: "Налаштування", route: "/main_options" as const },
  { label: "Довідка",      route: "/manual" as const },
];

/*** Drawer Item Component ***/
interface DrawerItemProps {
  label: string;
  route: (typeof MENU_ITEMS)[number]['route'];
  isLast: boolean;
}

const DrawerItem = memo<DrawerItemProps>(({ label, route, isLast }) => {
  const { close } = useContext(DrawerContext);
  const { darkMode } = useContext(SettingsContext);
  const router = useRouter();

  const onPress = useCallback(() => {
    close();
    router.push(route);
  }, [close, router, route]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.drawerItem, !isLast && styles.drawerItemSeparator]}
    >
      <Text style={[styles.drawerText, darkMode && styles.darkDrawerText]}> {label} </Text>
    </TouchableOpacity>
  );
});

/*** Root Layout ***/
export default function RootLayout() {
  return (
    <SettingsProvider>
      <LayoutWithDrawer />
    </SettingsProvider>
  );
}

function LayoutWithDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-drawerWidth())).current;
  const { darkMode } = useContext(SettingsContext);

  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: isOpen ? 0 : -drawerWidth(),
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <DrawerContext.Provider value={{ open, close }}>
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        <AppHeader />
        <Slot />
        {isOpen && (
          <TouchableWithoutFeedback onPress={close}>
            <View style={[styles.overlay, darkMode && styles.darkOverlay]} />
          </TouchableWithoutFeedback>
        )}
        <Animated.View
          style={[
            styles.drawer,
            darkMode && styles.darkDrawer,
            { width: drawerWidth(), transform: [{ translateX: drawerAnim }] },
          ]}
        >
          <DrawerContent />
        </Animated.View>
      </View>
    </DrawerContext.Provider>
  );
}

/*** Header ***/
function AppHeader() {
  const { open } = useContext(DrawerContext);
  const router = useRouter();
  const pathname = usePathname();
  const isRoot = pathname === "/";

  const handlePress = () => {
    if (isRoot) open(); else router.push("/" as const);
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handlePress} style={styles.burgerButton}>
        <Text style={styles.burgerText}>{isRoot ? "☰" : "<<"}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>GT++</Text>
      <View style={styles.burgerButton} />
    </View>
  );
}

/*** Drawer Content ***/
function DrawerContent() {
  const { close } = useContext(DrawerContext);
  const { darkMode } = useContext(SettingsContext);
  const [showContacts, setShowContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (selectedContact) {
      Linking.openURL(selectedContact);
      setSelectedContact(undefined);
      close();
    }
  }, [selectedContact]);

  const items = useMemo(() => MENU_ITEMS, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Спробуйте GT++ — зручний тюнер та метроном! Завантажити останню версію: https://expo.dev/accounts/gra1488/projects/expo-tuner/builds/31d88ecd-0ee1-4bf4-9233-39baa4388628',
      });
      close();
    } catch (error) {
      console.error('Помилка при спробі поділитися:', error);
    }
  };

  return (
    <View style={[styles.drawerContainer, darkMode && styles.darkDrawerContainer]}>
      {/* Brand */}
      <View style={styles.brandContainer}>
        <View style={styles.logoBackground}>
          <Image source={require("../assets/icon1.png")} style={styles.drawerIconMain} />
        </View>
        <Text style={styles.appName}>GT++</Text>
      </View>

      {/* Menu Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.route}
        renderItem={({ item, index }) => (
          <DrawerItem
            label={item.label}
            route={item.route}
            isLast={index === items.length - 1}
          />
        )}
        initialNumToRender={items.length}
        removeClippedSubviews
      />

      {/* Contacts Toggle */}
      <TouchableOpacity
        style={[styles.drawerItem, styles.drawerItemSeparator]}
        onPress={() => setShowContacts(prev => !prev)}
      >
        <Text style={[styles.drawerText, darkMode && styles.darkDrawerText]}>Зв'яжіться з нами</Text>
      </TouchableOpacity>

      {showContacts && (
        <View style={[styles.dropdownContainer, darkMode && styles.darkContainer]}>
          <TouchableOpacity
            onPress={() => setSelectedContact("tel:+380954876439")}
            style={styles.dropdownItem}
          >
            <Text style={[styles.drawerText, darkMode && styles.darkDrawerText]}>Телефон: +38 095 487 6439</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedContact("mailto:georgievrodion@gmail.com")}
            style={styles.dropdownItem}
          >
            <Text style={[styles.drawerText, darkMode && styles.darkDrawerText]}>Email: georgievrodion@gmail.com</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Share App */}
      <TouchableOpacity
        style={[styles.drawerItem, styles.drawerItemSeparator]}
        onPress={handleShare}
      >
        <Text style={[styles.drawerText, darkMode && styles.darkDrawerText]}>Поділитися застосунком</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, darkMode && styles.darkDrawerText]}>Розробник: YourName</Text>
        <Text style={[styles.footerText, darkMode && styles.darkDrawerText]}>Версія: 1.3</Text>
      </View>
    </View>
  );
}

/*** Helpers & Styles ***/
function drawerWidth() {
  return Dimensions.get("window").width * 0.75;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: "#000" },

  header: {
    height: 48,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  burgerButton: { width: 48, alignItems: "center" },
  burgerText: { fontSize: 30, color: "#fff" },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  overlay: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  darkOverlay: { backgroundColor: "rgba(0,0,0,0.8)" },

  drawer: { position: "absolute", top: 48, bottom: 0, left: 0, backgroundColor: "#fff", borderRadius: 5 },
  darkDrawer: { backgroundColor: "#121212" },

  drawerContainer: { flex: 1, paddingTop: 0 },
  darkDrawerContainer: { backgroundColor: "#121212" },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#66BB6A",
  },
  logoBackground: { padding: 8, borderRadius: 8, marginRight: 10 },
  drawerIconMain: { width: 40, height: 40 },
  appName: { fontSize: 24, fontWeight: "bold", color: "#fff" },

  drawerItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 20 },
  drawerItemSeparator: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ccc" },
  drawerText: { fontSize: 16, color: "#000" },
  darkDrawerText: { color: "#fff" },

  dropdownContainer: { marginLeft: 20, marginRight: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  dropdownItem: { paddingVertical: 12 },

  footer: { marginTop: 'auto', padding: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ccc' },
  footerText: { fontSize: 14, textAlign: 'center', color: '#666' },
});
