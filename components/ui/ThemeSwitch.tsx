import { Switch, type SwitchProps } from 'react-native'
import { useAppTheme } from '@src/contexts/theme-context'
import { getActivePalette } from '@src/theme/colors'

type Props = Omit<SwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'>

const LIGHT_KNOB = '#FFFFFF'
const DARK_KNOB_OFF = '#FAFAFA'

export function ThemeSwitch({ value, ...props }: Props) {
  const { isDark, colors } = useAppTheme()
  const palette = getActivePalette()
  const offTrack = isDark ? palette.gray500 : palette.gray300
  const knob = !isDark ? LIGHT_KNOB : value ? colors.bg.primary : DARK_KNOB_OFF

  return (
    <Switch
      value={value}
      trackColor={{ false: offTrack, true: colors.brand.primary }}
      thumbColor={knob}
      ios_backgroundColor={offTrack}
      {...props}
    />
  )
}
