import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, type Href } from 'expo-router'
import { IconButton } from '@/components/ui/IconButton'
import Colors from '@src/theme/colors'

type Props = {
  /** Use on dark / colored headers (e.g. chat detail). */
  tone?: 'default' | 'onPrimary'
  size?: 'sm' | 'md'
}

export function SettingsHeaderButton({ tone = 'default', size = 'sm' }: Props) {
  const iconColor = tone === 'onPrimary' ? Colors.brand.onPrimary : Colors.brand.primary
  const variant = tone === 'onPrimary' ? 'ghost' : 'default'

  return (
    <IconButton
      size={size}
      variant={variant}
      onPress={() => router.push('/settings' as Href)}
      accessibilityLabel="Settings"
    >
      <FontAwesome name="cog" size={size === 'md' ? 18 : 16} color={iconColor} />
    </IconButton>
  )
}
