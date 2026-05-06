import { useWindowDimensions } from 'react-native'

export function useLayout() {
  const { width, height } = useWindowDimensions()
  const isTablet = width >= 600

  return {
    width,
    height,
    isTablet,
    cardMaxWidth: isTablet ? 480 : undefined,
    heroHeight: isTablet ? 280 : 220,
    cardMarginTop: isTablet ? -48 : -32,
    cardPadding: isTablet ? 36 : 24,
    cardMx: isTablet ? 40 : 16,
    fontSize: {
      label: isTablet ? 13 : 12,
      input: isTablet ? 17 : 16,
      button: isTablet ? 15 : 14,
      heroTitle: isTablet ? 34 : 28,
      heroSub: isTablet ? 15 : 14,
    },
  }
}
