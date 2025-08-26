// Reusable Button component with modern pastel styling
// Supports various variants and sizes with subtle animations

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../utils/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) => {
  // Get button styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? colors.textLight : colors.primary,
          borderColor: disabled ? colors.textLight : colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? colors.surfaceLight : colors.secondary,
          borderColor: disabled ? colors.border : colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? colors.border : colors.primary,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      case 'success':
        return {
          backgroundColor: disabled ? colors.textLight : colors.success,
          borderColor: disabled ? colors.textLight : colors.success,
        };
      case 'warning':
        return {
          backgroundColor: disabled ? colors.textLight : colors.warning,
          borderColor: disabled ? colors.textLight : colors.warning,
        };
      case 'error':
        return {
          backgroundColor: disabled ? colors.textLight : colors.error,
          borderColor: disabled ? colors.textLight : colors.error,
        };
      default:
        return {
          backgroundColor: disabled ? colors.textLight : colors.primary,
          borderColor: disabled ? colors.textLight : colors.primary,
        };
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    if (disabled) return colors.textOnPrimary; // Always use visible text color when disabled
    
    switch (variant) {
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.textOnPrimary;
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          minHeight: 36,
        };
      case 'medium':
        return {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          minHeight: 44,
        };
      case 'large':
        return {
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.lg,
          minHeight: 52,
        };
      default:
        return {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          minHeight: 44,
        };
    }
  };

  // Get font size based on size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return fontSize.sm;
      case 'medium':
        return fontSize.md;
      case 'large':
        return fontSize.lg;
      default:
        return fontSize.md;
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textColor = getTextColor();
  const textSize = getFontSize();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles,
        sizeStyles,
        disabled && styles.disabled,
        !disabled && variant !== 'ghost' && shadows.sm,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={textColor} 
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: textSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button; 