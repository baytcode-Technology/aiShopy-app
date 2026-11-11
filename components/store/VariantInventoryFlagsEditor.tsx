import { Text, View } from 'react-native'
import { ThemeSwitch } from '@/components/ui/ThemeSwitch'



type Props = {

  markAsSold: boolean

  markAsNonInventory: boolean

  onMarkAsSoldChange: (value: boolean) => void

  onMarkAsNonInventoryChange: (value: boolean) => void

  disabled?: boolean

}



export function VariantInventoryFlagsEditor({

  markAsSold,

  markAsNonInventory,

  onMarkAsSoldChange,

  onMarkAsNonInventoryChange,

  disabled,

}: Props) {

  return (

    <View className="gap-2">

      <View className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">

        <View className="flex-1 pr-3">

          <Text className="text-[13px] font-semibold text-ink">Mark as sold</Text>

          <Text className="text-[11px] text-gray-500 mt-0.5 leading-4">

            This variant only — shows 0 stock. Offline orders still allowed.

          </Text>

        </View>

        <ThemeSwitch
          value={markAsSold}
          onValueChange={(value) => {
            onMarkAsSoldChange(value)
            if (value) onMarkAsNonInventoryChange(false)
          }}
          disabled={disabled}
        />

      </View>



      <View className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">

        <View className="flex-1 pr-3">

          <Text className="text-[13px] font-semibold text-ink">Mark as non-inventory</Text>

          <Text className="text-[11px] text-gray-500 mt-0.5 leading-4">

            This variant only — unlimited orders, no stock updates.

          </Text>

        </View>

        <ThemeSwitch
          value={markAsNonInventory}
          onValueChange={(value) => {
            onMarkAsNonInventoryChange(value)
            if (value) onMarkAsSoldChange(false)
          }}
          disabled={disabled}
        />

      </View>

    </View>

  )

}

