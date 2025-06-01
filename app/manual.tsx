import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  ViewToken,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width;
const IMAGE_WIDTH = width;

interface ManualItem {
  key: string;
  image: any;
  title: string;
  description: string;
}

const manualData: ManualItem[] = [
  { key: '1', image: require('../assets/manual/first.jpg'), title: 'Поле частоти', description: 'Показує поточну частоту струни в герцах, відповідну ноту та еталонну для струни частоту.', },
  { key: '2', image: require('../assets/manual/second.jpg'), title: 'Графіка', description: 'Зігравши струну, додаток проаналізує звук та підсвітить відповідні елементи.', },
  { key: '3', image: require('../assets/manual/third.jpg'), title: 'Кольори спектру', description: 'Зелений колір спектру показує що струна налаштована правильно.', },
  { key: '4', image: require('../assets/manual/fourth.jpg'), title: 'Кольори спектру', description: 'Жовтий колір спектру вказує що струна налаштована приблизно правильно.', },
  { key: '5', image: require('../assets/manual/fifth.jpg'), title: 'Кольори спектру', description: 'Червоний колір говорить про те, що струна налаштована неправильно.', },
  { key: '6', image: require('../assets/manual/six.jpg'), title: 'Ручний режим', description: 'Натиснувши на кнопку в правому верхньому куті, ви можете обирати яку саме струну налаштовувати! Окрім цього, натисніть на кнопку струни та почуєте тон еталонної частоти.', },
  { key: '7', image: require('../assets/manual/options.jpg'), title: 'Налаштування', description: 'Ви можете вибирати вид гітари, стрій, тему застосунку, а також змінювати порядок позначок струн!', },
  { key: '8', image: require('../assets/manual/seven.jpg'), title: 'Вид гітари та стрій', description: 'Виберіть потрібний стрій гітари та тип гітари (6, 7, 8 струн) в налаштуваннях.', },
  { key: '9', image: require('../assets/manual/eight.jpg'), title: 'Мова позначень', description: 'Виберіть комфортну для вас мову позначень нот (англійську або українську).', },
  { key: '10', image: require('../assets/manual/nine.jpg'), title: 'Для шульг', description: 'Оберіть режим шульги в налаштуваннях, переверніть свою гітару та налаштовуйте як вам комфортно.', },
  { key: '11', image: require('../assets/manual/like.png'), title: 'Це все. Дякуємо за використання!', description: 'Дякую за використання мого застосунку!', },
];

export default function ManualScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={manualData}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={CARD_WIDTH}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>        
        {manualData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  card: {
    width: CARD_WIDTH,
    alignItems: 'center',
    paddingVertical: 20,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pagination: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#333',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
