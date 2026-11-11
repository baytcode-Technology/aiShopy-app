import { useEffect, useState, type ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DetailSection } from '@/components/store/detail/DetailSection'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { ThemeSwitch } from '@/components/ui/ThemeSwitch'
import { Muted } from '@/components/ui/Typography'
import { updateMyStore } from '@src/api/stores'
import { useStore } from '@src/contexts/store-context'
import { formatMoney } from '@src/lib/format-money'
import { showError, showSuccess } from '@src/lib/toast'
import { EMPTY_SHOP_POLICIES, parseShopPolicies } from '@src/types/shop-policies'
import Colors from '@src/theme/colors'
import { router } from 'expo-router'

function numField(value: number | null): string {
  return value == null ? '' : String(value)
}

function joinSummary(parts: Array<string | false>, empty: string): string {
  const line = parts.filter((part): part is string => Boolean(part)).join(' · ')
  return line || empty
}

function SectionCard({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string
  summary: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <DetailSection>
      <Pressable
        onPress={onToggle}
        className="flex-row items-center gap-3 px-4 py-4"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-base font-semibold text-ink">{title}</Text>
          <Muted className="text-[13px]" numberOfLines={1}>
            {summary}
          </Muted>
        </View>
        <FontAwesome
          name={open ? 'chevron-down' : 'chevron-right'}
          size={13}
          color={Colors.brand.primary}
        />
      </Pressable>
      {open ? (
        <View className="gap-4 border-t border-gray-200 px-4 pb-4 pt-3">{children}</View>
      ) : null}
    </DetailSection>
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
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="flex-1 text-[15px] font-medium text-ink">{label}</Text>
      <ThemeSwitch value={value} onValueChange={onValueChange} />
    </View>
  )
}

function SwitchGroup({ children }: { children: ReactNode }) {
  return <View className="overflow-hidden rounded-2xl border border-gray-200">{children}</View>
}

function SwitchRow({
  children,
  divided,
}: {
  children: ReactNode
  divided?: boolean
}) {
  return (
    <View className={`px-3 py-3 ${divided ? 'border-t border-gray-200' : ''}`}>{children}</View>
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
  const insets = useSafeAreaInsets()
  const [saving, setSaving] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [returnsOpen, setReturnsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
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
  const [courierTracking, setCourierTracking] = useState(false)

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
    setCourierTracking(p.courier_tracking)
  }, [store])

  const feeNumber = Number(deliveryFee)
  const shopSummary = hasPhysicalStore
    ? joinSummary(['Physical shop', hours.trim()], 'Physical shop')
    : 'Online only'
  const deliverySummary = joinSummary(
    [
      defaultDays.trim() ? `${defaultDays.trim()} days` : false,
      deliveryFee.trim() && Number.isFinite(feeNumber)
        ? `${formatMoney(feeNumber, store?.currency)} fee`
        : false,
      courierTracking ? 'Courier tracking on' : false,
    ],
    'Not set',
  )
  const returnsSummary = joinSummary(
    [
      returnsAllowed === true ? 'Returns yes' : returnsAllowed === false ? 'Returns no' : false,
      returnDays.trim() ? `${returnDays.trim()} days` : false,
      exchangeAllowed ? 'Exchange' : false,
    ],
    'Not set',
  )
  const notesSummary = joinSummary(
    [offerNote.trim() ? 'Offer set' : false, pickupNote.trim() ? 'Pickup note set' : false],
    'None',
  )

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
          courier_tracking: courierTracking,
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
      <ScreenScrollBody contentContainerClassName="gap-4 pt-4">
        <Muted className="px-1 text-[13px] leading-5">
          Leave a field blank if staff should check. Chat Boat will not invent a fee, date, or
          discount.
        </Muted>

        <SectionCard
          title="Shop"
          summary={shopSummary}
          open={shopOpen}
          onToggle={() => setShopOpen((open) => !open)}
        >
          <SwitchGroup>
            <SwitchRow>
              <PolicySwitch
                label="Physical shop"
                value={hasPhysicalStore}
                onValueChange={setHasPhysicalStore}
              />
            </SwitchRow>
          </SwitchGroup>
          <Input label="Address" value={address} onChangeText={setAddress} multiline numberOfLines={3} />
          <Input
            label="Shop hours"
            value={hours}
            onChangeText={setHours}
            placeholder="Mon–Sat 10am–8pm"
          />
        </SectionCard>

        <SectionCard
          title="Delivery"
          summary={deliverySummary}
          open={deliveryOpen}
          onToggle={() => setDeliveryOpen((open) => !open)}
        >
          <SwitchGroup>
            <SwitchRow>
              <PolicySwitch
                label="Courier tracking"
                value={courierTracking}
                onValueChange={setCourierTracking}
              />
            </SwitchRow>
            <View className="border-t border-gray-200 px-3 py-3">
              <Muted className="text-[13px] leading-5">
                Promised date and delay note always show on an order. Courier and tracking appear
                when Courier tracking is on.
              </Muted>
            </View>
            <SwitchRow divided>
              <PolicySwitch label="Same-day delivery" value={sameDay} onValueChange={setSameDay} />
            </SwitchRow>
            <SwitchRow divided>
              <PolicySwitch label="Next-day delivery" value={nextDay} onValueChange={setNextDay} />
            </SwitchRow>
          </SwitchGroup>
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
          <Input
            label="Service area"
            value={serviceArea}
            onChangeText={setServiceArea}
            placeholder="Kerala"
          />
        </SectionCard>

        <SectionCard
          title="Returns"
          summary={returnsSummary}
          open={returnsOpen}
          onToggle={() => setReturnsOpen((open) => !open)}
        >
          <SwitchGroup>
            <SwitchRow>
              <PolicySwitch
                label="Exchange allowed"
                value={exchangeAllowed}
                onValueChange={setExchangeAllowed}
              />
            </SwitchRow>
          </SwitchGroup>
          <Input
            label="Return window (days)"
            value={returnDays}
            onChangeText={setReturnDays}
            keyboardType="number-pad"
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
          <ReturnsChoice value={returnsAllowed} onChange={setReturnsAllowed} />
        </SectionCard>

        <SectionCard
          title="Notes"
          summary={notesSummary}
          open={notesOpen}
          onToggle={() => setNotesOpen((open) => !open)}
        >
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
      </ScreenScrollBody>
      <View
        className="border-t border-gray-200 bg-surface px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Button
          label={saving ? 'Saving…' : 'Save policies'}
          onPress={() => void save()}
          disabled={saving || !store}
        />
      </View>
    </Screen>
  )
}
