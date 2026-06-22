import { useState } from 'react'
import { Image, Modal, Pressable, Text, View } from 'react-native'
import { DetailSection } from '@/components/store/detail/DetailSection'

type Props = {
  url: string
}

export function OrderPaymentProofCard({ url }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <DetailSection className="p-3.5">
      <View className="flex-row items-center justify-between mb-2.5">
        <Text className="text-[13px] font-bold text-ink">Payment proof</Text>
      </View>

      <Pressable onPress={() => setOpen(true)} className="rounded-xl overflow-hidden">
        <Image
          source={{ uri: url }}
          style={{ width: '100%', height: 140 }}
          resizeMode="cover"
        />
      </Pressable>

      <Modal visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 bg-ink px-4 pt-10">
          <Pressable
            onPress={() => setOpen(false)}
            className="self-start px-3 py-2 rounded-full bg-white/10 mb-3"
          >
            <Text className="text-brand-on-primary font-bold">Close</Text>
          </Pressable>

          <View className="flex-1 items-center justify-center">
            <Image
              source={{ uri: url }}
              style={{ width: '100%', height: '70%' }}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    </DetailSection>
  )
}

