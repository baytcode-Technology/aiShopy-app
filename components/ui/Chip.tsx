import { Pressable, StyleSheet, Text, View } from 'react-native'

import { cn } from '@src/lib/cn'

import { palette } from '@src/theme/palette'



type Props = {

  label: string

  active?: boolean

  onPress: () => void

  className?: string

}



export function Chip({ label, active = false, onPress, className }: Props) {

  return (

    <View className={cn('mr-2.5', className)}>

      <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }}>

        <View

          style={[

            styles.chip,

            active ? styles.chipActive : styles.chipInactive,

          ]}

        >

          <Text

            className={cn(

              'text-[13px] font-semibold tracking-tight',

              active ? 'text-brand-on-primary' : 'text-gray-600'

            )}

          >

            {label}

          </Text>

        </View>

      </Pressable>

    </View>

  )

}



const CHIP_RADIUS = 9999



const styles = StyleSheet.create({

  chip: {

    borderRadius: CHIP_RADIUS,

    paddingHorizontal: 16,

    paddingVertical: 10,

    overflow: 'hidden',

    borderWidth: 1,

  },

  chipActive: {

    backgroundColor: palette.ink,

    borderColor: palette.ink,

  },

  chipInactive: {

    backgroundColor: palette.surface,

    borderColor: palette.gray200,

  },

})


