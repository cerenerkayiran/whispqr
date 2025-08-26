// Reusable Card component with modern pastel styling
// Provides consistent container styling with subtle shadows

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';

const Card = ({
  children,
  style,
  onPress,
  shadowType = 'sm',
  backgroundColor = colors.surface,
  padding = spacing.lg,
  margin = 0,
  borderColor = colors.border,
  borderWidth = 0,
  ...props
}) => {
  // Get shadow style based on type
  const getShadowStyle = () => {
    switch (shadowType) {
      case 'none':
        return {};
      case 'sm':
        return shadows.sm;
      case 'md':
        return shadows.md;
      case 'lg':
        return shadows.lg;
      default:
        return shadows.sm;
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        {
          backgroundColor,
          padding,
          margin,
          borderColor,
          borderWidth,
        },
        getShadowStyle(),
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
});

export default Card; 