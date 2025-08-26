import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';

const AnimatedSplitText = ({
  text,
  style = {},
  delay = 100,
  duration = 800,
  splitType = 'chars',
  from = { opacity: 0, translateY: 40 },
  to = { opacity: 1, translateY: 0 },
  onAnimationComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const animatedValues = useRef([]);

  // Split text based on type
  const splitText = () => {
    if (splitType === 'words') {
      return text.split(' ').map((word, index) => ({ text: word + (index < text.split(' ').length - 1 ? ' ' : ''), key: `word-${index}` }));
    } else {
      // Default to chars
      return text.split('').map((char, index) => ({ text: char, key: `char-${index}` }));
    }
  };

  const textParts = splitText();

  useEffect(() => {
    // Initialize animated values
    animatedValues.current = textParts.map(() => ({
      opacity: new Animated.Value(from.opacity || 0),
      translateY: new Animated.Value(from.translateY || 0),
      scale: new Animated.Value(from.scale || 1),
    }));

    // Start animation after a small delay to ensure component is mounted
    const timer = setTimeout(() => {
      setIsVisible(true);
      animateText();
    }, 100);

    return () => clearTimeout(timer);
  }, [text]);

  const animateText = () => {
    const animations = animatedValues.current.map((animatedValue, index) => {
      return Animated.parallel([
        Animated.timing(animatedValue.opacity, {
          toValue: to.opacity !== undefined ? to.opacity : 1,
          duration,
          delay: index * delay,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue.translateY, {
          toValue: to.translateY !== undefined ? to.translateY : 0,
          duration,
          delay: index * delay,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue.scale, {
          toValue: to.scale !== undefined ? to.scale : 1,
          duration,
          delay: index * delay,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(0, animations).start(() => {
      onAnimationComplete?.();
    });
  };

  if (!isVisible) {
    return (
      <Text style={[style, { opacity: 0 }]}>
        {text}
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {textParts.map((part, index) => {
        const animatedValue = animatedValues.current[index];
        if (!animatedValue) return null;

        return (
          <Animated.Text
            key={part.key}
            style={[
              style,
              {
                opacity: animatedValue.opacity,
                transform: [
                  { translateY: animatedValue.translateY },
                  { scale: animatedValue.scale },
                ],
              },
            ]}
          >
            {part.text}
          </Animated.Text>
        );
      })}
    </View>
  );
};

export default AnimatedSplitText;
