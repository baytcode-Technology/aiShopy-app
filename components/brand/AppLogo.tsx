import { Image, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native'
import { cn } from '@src/lib/cn'
import { APP_ICON, APP_NAME, APP_WORDMARK } from '@/constants/brand'

/** Matches `DisplayBrand` (text-xs, uppercase wordmark line). */
const WORDMARK_HEIGHT = 14
const WORDMARK_WIDTH = 108

type Variant = 'wordmark' | 'mark'

type Props = {
  /**
   * `wordmark` — same slot & scale as the old “Katlogue” `DisplayBrand` line.
   * `mark` — slightly larger icon for loaders / empty states.
   */
  variant?: Variant
  align?: 'start' | 'center'
  className?: string
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
}

export function AppLogo({
  variant = 'wordmark',
  align = 'start',
  className,
  style,
  imageStyle,
}: Props) {
  const isWordmark = variant === 'wordmark'
  const height = isWordmark ? WORDMARK_HEIGHT : 40
  const width = isWordmark ? WORDMARK_WIDTH : 40
  const source = isWordmark ? APP_WORDMARK : APP_ICON

  return (
    <View
      className={cn(align === 'center' ? 'items-center' : 'items-start', className)}
      style={style}
    >
      <Image
        source={source}
        accessibilityLabel={`${APP_NAME} logo`}
        style={[
          {
            height,
            width,
            resizeMode: 'contain',
          },
          imageStyle,
        ]}
      />
    </View>
  )
}
