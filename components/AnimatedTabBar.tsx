import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import DeviceInfo from 'react-native-device-info';

const { width: screenWidth } = Dimensions.get('window');

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface TabItem {
  key: string;
  name: string;
  icon: React.ReactNode;
  label: string;
}

export default function AnimatedTabBar({ state, descriptors, navigation }: TabBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const tabBarWidth = screenWidth - 27; // Account for horizontal margins (13.5 * 2)
  const tabWidth = tabBarWidth / state.routes.length;
  const indicatorWidth = tabWidth * 0.7; // 70% of tab width for compact look
  const indicatorOffset = (tabWidth - indicatorWidth) / 2;

  useEffect(() => {
    const toValue = state.index * tabWidth + indicatorOffset;
    
    // Combined bouncy animation sequence
    Animated.parallel([
      // Horizontal slide with spring
      Animated.spring(translateX, {
        toValue,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
      }),
      // Bouncy scale effect
      Animated.sequence([
        Animated.timing(scaleY, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleX, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleY, {
          toValue: 1,
          tension: 400,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleX, {
          toValue: 1,
          tension: 400,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [state.index, tabWidth, indicatorOffset]);

  const renderTabButton = (route: any, index: number) => {
    const { options } = descriptors[route.key];
    const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
    const isFocused = state.index === index;
    
    // Create individual animated values for each tab's icon
    const iconScale = useRef(new Animated.Value(1)).current;
    
    useEffect(() => {
      if (isFocused) {
        // Pulse animation for active tab icon
        Animated.sequence([
          Animated.timing(iconScale, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(iconScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Reset scale for inactive tabs
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }
    }, [isFocused]);

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        // Haptic feedback on tab press
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
          zIndex: 2,
        }}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {/* Icon */}
          <Animated.View 
            style={{ 
              marginBottom: 2,
              transform: [{ scale: iconScale }],
            }}
          >
            {options.tabBarIcon &&
              options.tabBarIcon({
                color: isFocused ? '#FFFFFF' : "#616161",
                size: 18,
              })}
          </Animated.View>
          
          {/* Label */}
          <Text
            style={{
              fontSize: 12,
              fontWeight: isFocused ? '600' : '500',
              color: isFocused ? '#FFFFFF' : "#616161",
              textAlign: 'center',
            }}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: DeviceInfo.isTablet() === true ? 5 : Platform.OS === 'ios' ? 20 : 10,
        left: 13,
        right: 13,
        height: 75,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: colorScheme === 'dark' ? '#444444' : '#CCCCCC',
        // ...(Platform.OS === 'android' && {
        //   elevation: 10,
        // }),
      }}
    >
      {/* Glassmorphic Background */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 0}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      
      {/* Fallback background for Android */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
          opacity: Platform.OS === 'ios' ? 0.1 : 1,
        }}
      />

      {/* Animated Liquid Indicator */}
      <Animated.View
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 6 : 6,
          left: 0,
          width: indicatorWidth,
          height: 62,
          borderRadius: 50,
          transform: [
            { translateX },
            { scaleY },
            { scaleX },
          ],
          zIndex: 1,
        }}
      >
        <LinearGradient
          colors={['#2563eb', '#9333ea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flex: 1,
            borderRadius: 60,
            shadowColor: colorScheme === 'dark' ? '#8B5CF6' : '#6366F1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            ...(Platform.OS === 'android' && {
              elevation: 8,
            }),
          }}
        />
      </Animated.View>

      {/* Tab Buttons */}
      <View
        style={{
          flexDirection: 'row',
          height: '100%',
          alignItems: 'center',
        //   paddingTop: Platform.OS === 'ios' ? 15 : 11,
        }}
      >
        {state.routes.map(renderTabButton)}
      </View>
    </View>
  );
}
