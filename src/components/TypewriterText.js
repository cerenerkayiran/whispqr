// TypewriterText Component - Typewriter animation with cursor
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const TypewriterText = ({
  text,
  style = {},
  typingSpeed = 50,
  initialDelay = 1000,
  pauseDuration = 1800,
  deletingSpeed = 25,
  loop = true,
  showCursor = true,
  cursorCharacter = "_",
  cursorStyle = {},
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);

  const cursorOpacity = useSharedValue(1);
  const messages = Array.isArray(text) ? text : [text];

  // Cursor blinking animation
  useEffect(() => {
    if (showCursor) {
      cursorOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        true
      );
    }
  }, [showCursor]);

  // Typing animation logic
  useEffect(() => {
    let timeoutId;

    const type = () => {
      const currentMessage = messages[currentIndex];

      if (isWaiting) {
        timeoutId = setTimeout(() => {
          setIsWaiting(false);
        }, isDeleting ? pauseDuration : initialDelay);
        return;
      }

      if (isDeleting) {
        if (displayText === '') {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % messages.length);
          setIsWaiting(true);
        } else {
          timeoutId = setTimeout(() => {
            setDisplayText(displayText.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (displayText === currentMessage) {
          setIsDeleting(true);
          setIsWaiting(true);
        } else {
          timeoutId = setTimeout(() => {
            setDisplayText(currentMessage.slice(0, displayText.length + 1));
          }, typingSpeed);
        }
      }
    };

    type();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    displayText,
    currentIndex,
    isDeleting,
    isWaiting,
    messages,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    initialDelay,
  ]);

  const cursorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Text style={style}>
        {displayText}
        {showCursor && (
          <Animated.Text
            style={[
              style,
              cursorStyle,
              cursorAnimatedStyle,
            ]}
          >
            {cursorCharacter}
          </Animated.Text>
        )}
      </Text>
    </View>
  );
};

export default TypewriterText;