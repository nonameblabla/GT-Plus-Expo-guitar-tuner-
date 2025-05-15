// app/_layout.tsx
import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { SettingsProvider, SettingsContext } from "./SettingsContext";

const DrawerContext = createContext({
  open: () => {},
  close: () => {},
});

export default function RootLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(0)).current;
  const width = Dimensions.get("window").width * 0.75;
  const { darkMode } = useContext(SettingsContext);

  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: isOpen ? 0 : -width,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <SettingsProvider>
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
              { width, transform: [{ translateX: drawerAnim }] },
            ]}
          >
            <DrawerContent />
          </Animated.View>
        </View>
      </DrawerContext.Provider>
    </SettingsProvider>
  );
}

function AppHeader() {
  const { open } = useContext(DrawerContext);
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={open} style={styles.burgerButton}>
        <Text style={styles.burgerText}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.title}>GT++</Text>
      <View style={styles.burgerButton} />
    </View>
  );
}

function DrawerContent() {
  const router = useRouter();
  const { close } = useContext(DrawerContext);
  const { darkMode } = useContext(SettingsContext);

  const items = [
    { label: "Тюнер", route: "/" },
    { label: "Метроном", route: "/metronome" },
    { label: "Налаштування", route: "/main_options" },
  ] as const;

  return (
    <View style={[styles.drawerContainer, darkMode && styles.darkDrawerContainer]}>
      {items.map((it) => (
        <TouchableOpacity
          key={it.route}
          style={styles.drawerItem}
          onPress={() => {
            close();
            router.push(it.route);
          }}
        >
          <Text style={[styles.drawerText, darkMode && styles.darkDrawerText]}>
            {it.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: "#000",
  },
  header: {
    height: 48,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  burgerButton: {
    width: 48,
    alignItems: "center",
  },
  burgerText: {
    fontSize: 24,
    color: "#fff",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  darkOverlay: {
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  drawer: {
    position: "absolute",
    top: 48,
    bottom: 0,
    left: 0,
    backgroundColor: "#fff",
  },
  darkDrawer: {
    backgroundColor: "#121212",
  },
  drawerContainer: {
    flex: 1,
    paddingTop: 20,
  },
  darkDrawerContainer: {
    backgroundColor: "#121212",
  },
  drawerItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  drawerText: {
    fontSize: 16,
    color: "#000",
  },
  darkDrawerText: {
    color: "#fff",
  },
});
