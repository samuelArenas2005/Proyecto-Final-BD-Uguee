import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function OlaAnimada(): React.ReactElement {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -width,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const olaSVG = `
    <svg width="${width * 2}" height="120" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#7E57C2"
        d="M0,224 C360,320 1080,160 1440,256 L1440,320 L0,320 Z"
      />
    </svg>
  `;

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <SvgXml xml={olaSVG} width={width * 2} height={120} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
    width: width,
    height: 120,
    zIndex: -1,
  },
});
