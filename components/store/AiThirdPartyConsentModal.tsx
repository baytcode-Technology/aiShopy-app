import { View } from 'react-native'
import { Body, Muted } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { SleekModal } from '@/components/ui/Modal'

type Props = {
  isOpen: boolean
  saving?: boolean
  onClose: () => void
  onAgree: () => void
}

export function AiThirdPartyConsentModal({ isOpen, saving, onClose, onAgree }: Props) {
  return (
    <SleekModal
      isOpen={isOpen}
      onClose={onClose}
      title="Third-party AI consent"
      subtitle="Required before enabling Chat Boat"
      minHeightRatio={0.55}
      maxHeightRatio={0.85}
      footer={
        <View className="gap-2">
          <Button
            label="I agree — enable Chat Boat"
            loading={saving}
            onPress={onAgree}
          />
          <Button label="Not now" variant="outline" onPress={onClose} disabled={saving} />
        </View>
      }
    >
      <Body className="text-gray-700 leading-6">
        Chat Boat uses third-party AI services to draft automatic replies to your customers on
        WhatsApp and Instagram.
      </Body>

      <Muted className="text-sm leading-5">
        Data that may be sent to these providers includes:
      </Muted>
      <View className="gap-1.5">
        {[
          'Customer messages and conversation history from connected inboxes',
          'Your product catalog, store name, and storefront links',
          'Custom instructions you add in Chat Boat settings',
        ].map((item) => (
          <Muted key={item} className="text-sm leading-5">
            • {item}
          </Muted>
        ))}
      </View>

      <Muted className="text-sm leading-5">
        Providers: OpenAI and/or TokenBee (as configured by AiShopy). They process this data only
        to generate reply text for your store. You can turn off Chat Boat or take over any chat
        manually at any time.
      </Muted>

      <Muted className="text-xs leading-5">
        By tapping “I agree”, you consent to this third-party AI processing. See our Privacy Policy
        for more detail.
      </Muted>
    </SleekModal>
  )
}
