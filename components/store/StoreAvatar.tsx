import { Image, Text, View } from 'react-native'
import type { Store } from '@src/types/store'
import { cn } from '@src/lib/cn'

type Props = {
  store: Pick<Store, 'name' | 'logo_url'> | null
  size?: 'sm' | 'md'
}

const sizeStyles = {
  sm: {
    box: 'w-14 h-14 rounded-2xl',
    letter: 'text-xl',
  },
  md: {
    box: 'w-16 h-16 rounded-2xl',
    letter: 'text-2xl',
  },
} as const

export function StoreAvatar({ store, size = 'md' }: Props) {
  const letter = store?.name?.slice(0, 1).toUpperCase() ?? 'S'
  const styles = sizeStyles[size]
  const boxClass = cn(styles.box, 'border border-gray-200 overflow-hidden')

  if (store?.logo_url) {
    return (
      <Image
        source={{ uri: store.logo_url }}
        className={cn(boxClass, 'bg-gray-50')}
        resizeMode="cover"
      />
    )
  }

  return (
    <View className={cn(boxClass, 'bg-gray-100 items-center justify-center')}>
      <Text className={cn('font-extrabold text-ink', styles.letter)}>{letter}</Text>
    </View>
  )
}
