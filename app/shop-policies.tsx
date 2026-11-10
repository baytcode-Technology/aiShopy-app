import { useEffect, useState, type ReactNode } from 'react'
import { Pressable, Switch, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Muted } from '@/components/ui/Typography'
import { updateMyStore } from '@src/api/stores'
import { useStore } from '@src/contexts/store-context'
import { useAppTheme } from '@src/contexts/theme-context'
import { showError, showSuccess } from '@src/lib/toast'
import { EMPTY_SHOP_POLICIES, parseShopPolicies } from '@src/types/shop-policies'
import { getActivePalette } from '@src/theme/colors'
import { router } from 'expo-router'

function numField(value: number | null): string {
  return value == null ? '' : String(value)
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <View className="gap-4 rounded-[28px] border border-gray-200 bg-surface p-5">
      <View className="gap-1">
        <Text className="text-base font-semibold text-ink">{title}</Text>
        {subtitle ? <Muted className="text-[13px] leading-5">{subtitle}</Muted> : null}
      </View>
      {children}
    </View>
  )
}

function PolicySwitch({
  label,
  value,
  onValueChange,
}: {
  label: string
  value: boolean
  onValueChange: (next: boolean) => void
}) {
  const { colors } = useAppTheme()
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="flex-1 text-[15px] font-medium text-ink">{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: getActivePalette().gray300, true: colors.brand.primary }}
        thumbColor={colors.bg.primary}
      />
    </View>
  )
}

function ReturnsChoice({
  value,
  onChange,
}: {
  value: boolean | null
  onChange: (next: boolean | null) => void
}) {
  return (
    <View className="gap-2">
      <Text className="text-[13px] font-bold tracking-wide text-gray-600">Returns</Text>
      <View className="flex-row gap-1 rounded-xl bg-gray-100 p-1">
        {(
          [
            ['Not set', null],
            ['Yes', true],
            ['No', false],
          ] as const
        ).map(([label, next]) => {
          const selected = value === next
          return (
            <Pressable
              key={label}
              onPress={() => onChange(next)}
              className={`flex-1 items-center rounded-lg px-2 py-2.5 ${selected ? 'bg-ink' : ''}`}
            >
              <Text
                className={`text-center text-[13px] font-semibold ${
                  selected ? 'text-brand-on-primary' : 'text-ink'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function ShopPoliciesScreen() {
  const { store, refreshStore } = useStore()
  const [saving, setSaving] = useState(false)
  const [hasPhysicalStore, setHasPhysicalStore] = useState(false)
  const [address, setAddress] = useState('')
  const [hours, setHours] = useState('')
  const [defaultDays, setDefaultDays] = useState('')
  const [deliveryFee, setDeliveryFee] = useState('')
  const [freeAbove, setFreeAbove] = useState('')
  const [sameDay, setSameDay] = useState(false)
  const [nextDay, setNextDay] = useState(false)
  const [serviceArea, setServiceArea] = useState('')
  const [returnDays, setReturnDays] = useState('')
  const [returnsAllowed, setReturnsAllowed] = useState<boolean | null>(null)
  const [exchangeAllowed, setExchangeAllowed] = useState(false)
  const [refundDays, setRefundDays] = useState('')
  const [returnNote, setReturnNote] = useState('')
  const [offerNote, setOfferNote] = useState('')
  const [pickupNote, setPickupNote] = useState('')

  useEffect(() => {
    if (!store) return
    const p = parseShopPolicies(store.shop_policies ?? EMPTY_SHOP_POLICIES)
    setHasPhysicalStore(p.has_physical_store)
    setAddress(p.address ?? '')
    setHours(p.hours ?? '')
    setDefaultDays(numField(p.default_delivery_business_days))
    setDeliveryFee(numField(p.delivery_fee))
    setFreeAbove(numField(p.free_delivery_above))
    setSameDay(p.same_day_delivery)
    setNextDay(p.next_day_delivery)
    setServiceArea(p.service_area ?? '')
    setReturnDays(numField(p.return_days))
    setReturnsAllowed(p.returns_allowed)
    setExchangeAllowed(p.exchange_allowed)
    setRefundDays(numField(p.refund_days_after_cancel))
    setReturnNote(p.return_note ?? '')
    setOfferNote(p.current_offer_note ?? '')
    setPickupNote(p.pickup_note ?? '')
  }, [store])

  const save = async () => {
    if (!store?.id) return
    setSaving(true)
    try {
      await updateMyStore(store.id, {
        shop_policies: parseShopPolicies({
          has_physical_store: hasPhysicalStore,
          address,
          hours,
          default_delivery_business_days: defaultDays,
          delivery_fee: deliveryFee,
          free_delivery_above: freeAbove,
          same_day_delivery: sameDay,
          next_day_delivery: nextDay,
          service_area: serviceArea,
          return_days: returnDays,
          returns_allowed: returnsAllowed,
          exchange_allowed: exchangeAllowed,
          refund_days_after_cancel: refundDays,
          return_note: returnNote,
          current_offer_note: offerNote,
          pickup_note: pickupNote,
        }),
      })
      await refreshStore({ silent: true })
      showSuccess('Shop policies saved')
    } catch (e) {
      showError(e, 'Could not save shop policies')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen variant="shell" edges={['top']}>
      <ScreenHeader title="Shop policies" onBack={() => router.back()} />
      <ScreenScrollBody className="px-5 pb-10 pt-4 gap-4">
        <SectionCard
          title="Shop"
          subtitle="Leave a field blank if staff should check. Chat Boat will not invent a fee, date, or discount."
        >
          <PolicySwitch
            label="Physical shop"
            value={hasPhysicalStore}
            onValueChange={setHasPhysicalStore}
          />
          <Input label="Address" value={address} onChangeText={setAddress} multiline numberOfLines={3} />
          <Input
            label="Shop hours"
            value={hours}
            onChangeText={setHours}
            placeholder="Mon–Sat 10am–8pm"
          />
        </SectionCard>

        <SectionCard title="Delivery">
          <Input
            label="Default delivery (business days)"
            value={defaultDays}
            onChangeText={setDefaultDays}
            keyboardType="number-pad"
            placeholder="e.g. 2"
          />
          <Input
            label={`Delivery fee (${store?.currency ?? 'INR'})`}
            value={deliveryFee}
            onChangeText={setDeliveryFee}
            keyboardType="decimal-pad"
          />
          <Input
            label={`Free delivery above (${store?.currency ?? 'INR'})`}
            value={freeAbove}
            onChangeText={setFreeAbove}
            keyboardType="decimal-pad"
          />
          <PolicySwitch label="Same-day delivery" value={sameDay} onValueChange={setSameDay} />
          <PolicySwitch label="Next-day delivery" value={nextDay} onValueChange={setNextDay} />
          <Input
            label="Service area"
            value={serviceArea}
            onChangeText={setServiceArea}
            placeholder="Kerala"
          />
        </SectionCard>

        <SectionCard title="Returns">
          <ReturnsChoice value={returnsAllowed} onChange={setReturnsAllowed} />
          <Input
            label="Return window (days)"
            value={returnDays}
            onChangeText={setReturnDays}
            keyboardType="number-pad"
          />
          <PolicySwitch
            label="Exchange allowed"
            value={exchangeAllowed}
            onValueChange={setExchangeAllowed}
          />
          <Input
            label="Refund after cancel (days)"
            value={refundDays}
            onChangeText={setRefundDays}
            keyboardType="number-pad"
          />
          <Input
            label="Return note"
            value={returnNote}
            onChangeText={setReturnNote}
            multiline
            numberOfLines={3}
          />
        </SectionCard>

        <SectionCard title="Notes">
          <Input
            label="Current offer"
            value={offerNote}
            onChangeText={setOfferNote}
            placeholder="Leave blank if none"
            multiline
            numberOfLines={3}
          />
          <Input
            label="Pickup note"
            value={pickupNote}
            onChangeText={setPickupNote}
            multiline
            numberOfLines={3}
          />
        </SectionCard>

        <Muted className="px-1 text-[13px] leading-5">
          Slow items: set extra delivery days on the product. A delayed order: open the order and
          add a promised date, delay note, courier, or tracking link.
        </Muted>
        <Button
          label={saving ? 'Saving…' : 'Save policies'}
          onPress={() => void save()}
          disabled={saving || !store}
        />
      </ScreenScrollBody>
    </Screen>
  )
}
