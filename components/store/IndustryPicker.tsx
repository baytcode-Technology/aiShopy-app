import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AuthInput } from '@/components/auth/AuthInput'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SleekModal } from '@/components/ui/Modal'
import { Caption } from '@/components/ui/Typography'
import { fetchIndustries } from '@src/api/industries'
import {
  buildStoredIndustryValue,
  formatIndustryDisplay,
  isGroupFullySelected,
  isGroupPartiallySelected,
  splitIndustryValues,
  toggleGroupSelection,
  toggleIndustrySelection,
} from '@src/lib/industry-selection'
import Colors from '@src/theme/colors'
import type { IndustryGroup } from '@src/types/industry'

type Props = {
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  variant?: 'auth' | 'default'
}

function SelectionCheckbox({
  checked,
  partial,
  onPress,
}: {
  checked: boolean
  partial?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className={`w-[22px] h-[22px] rounded-md border items-center justify-center ${
        checked || partial ? 'bg-brand-primary border-ink' : 'bg-surface border-gray-300'
      }`}
    >
      {checked ? (
        <FontAwesome name="check" size={12} color={Colors.brand.onPrimary} />
      ) : partial ? (
        <View className="w-2.5 h-0.5 bg-brand-on-primary rounded-full" />
      ) : null}
    </Pressable>
  )
}

export function IndustryPicker({
  value,
  onChange,
  error,
  label = 'Industries',
  variant = 'default',
}: Props) {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<IndustryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [draftSelected, setDraftSelected] = useState<Set<string>>(new Set())
  const [draftOtherEnabled, setDraftOtherEnabled] = useState(false)
  const [draftCustom, setDraftCustom] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const res = await fetchIndustries()
        if (!cancelled) {
          setGroups(res.data.industries)
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load industries')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const displayLabel = useMemo(
    () => formatIndustryDisplay(value, groups),
    [value, groups]
  )

  const { selected: savedSelected, custom: savedCustom } = useMemo(
    () => splitIndustryValues(value, groups),
    [value, groups]
  )

  const openModal = () => {
    setDraftSelected(new Set(savedSelected))
    setDraftOtherEnabled(savedCustom.length > 0)
    setDraftCustom(savedCustom.join(', '))
    setOpen(true)
  }

  const applySelection = () => {
    const customValues =
      draftOtherEnabled && draftCustom.trim() ? [draftCustom.trim()] : []
    onChange(
      buildStoredIndustryValue({
        selected: draftSelected,
        customValues,
      })
    )
    setOpen(false)
  }

  const TextField = variant === 'auth' ? AuthInput : Input
  const showOtherFieldOutside = savedCustom.length > 0

  return (
    <View>
      <Text
        className={
          variant === 'auth'
            ? 'text-[13px] font-bold text-gray-600 mb-2 tracking-wide'
            : 'text-[13px] font-bold text-gray-600 mb-2'
        }
      >
        {label}
      </Text>

      <Pressable
        onPress={openModal}
        className={`flex-row items-center justify-between rounded-xl border px-4 py-3.5 bg-surface ${
          error ? 'border-red-400' : 'border-gray-200'
        }`}
      >
        <Text
          className={`flex-1 text-[15px] ${displayLabel ? 'text-ink font-medium' : 'text-gray-400'}`}
          numberOfLines={2}
        >
          {loading ? 'Loading industries…' : displayLabel || 'Select industries'}
        </Text>
        <FontAwesome name="chevron-down" size={12} color={Colors.text.muted} />
      </Pressable>

      {error ? <Text className="text-red-500 text-xs mt-1.5 pl-1">{error}</Text> : null}
      {loadError ? <Text className="text-amber-600 text-xs mt-1.5 pl-1">{loadError}</Text> : null}

      {showOtherFieldOutside ? (
        <View className="mt-3">
          <TextField
            label="Custom industry"
            value={savedCustom.join(', ')}
            onChangeText={(text) => {
              onChange(
                buildStoredIndustryValue({
                  selected: new Set(savedSelected),
                  customValues: text.trim() ? [text.trim()] : [],
                })
              )
            }}
            placeholder="Enter your industry"
          />
        </View>
      ) : null}

      <SleekModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Select industries"
        subtitle="Pick one or more — or select all under a category"
        scrollClassName="max-h-[60%]"
        footer={
          <Button
            label={`Done${draftSelected.size > 0 ? ` (${draftSelected.size})` : ''}`}
            onPress={applySelection}
          />
        }
      >
        {loading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color={Colors.brand.primary} />
          </View>
        ) : (
          <View className="gap-4 pb-2">
            {groups.map((group) => {
              const allSelected = isGroupFullySelected(group, draftSelected)
              const partial = isGroupPartiallySelected(group, draftSelected)

              return (
                <View key={group.id}>
                  <View className="flex-row items-center justify-between mb-2 px-1 gap-3">
                    <Caption className="text-[10px] uppercase tracking-widest text-gray-400 flex-1">
                      {group.name}
                    </Caption>
                    <SelectionCheckbox
                      checked={allSelected}
                      partial={partial}
                      onPress={() => setDraftSelected(toggleGroupSelection(group, draftSelected))}
                    />
                  </View>
                  <View className="rounded-2xl border border-gray-200 overflow-hidden bg-surface">
                    {group.children.map((child, index) => {
                      const selected = draftSelected.has(child.name)
                      return (
                        <Pressable
                          key={child.id}
                          onPress={() =>
                            setDraftSelected(toggleIndustrySelection(child.name, draftSelected))
                          }
                          className={`px-4 py-3.5 flex-row items-center gap-3 ${
                            index < group.children.length - 1 ? 'border-b border-gray-100' : ''
                          } ${selected ? 'bg-gray-50' : ''}`}
                        >
                          <SelectionCheckbox
                            checked={selected}
                            onPress={() =>
                              setDraftSelected(toggleIndustrySelection(child.name, draftSelected))
                            }
                          />
                          <Text className="text-[15px] font-medium text-ink flex-1">
                            {child.name}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              )
            })}

            <View>
              <View className="flex-row items-center justify-between mb-2 px-1 gap-3">
                <Caption className="text-[10px] uppercase tracking-widest text-gray-400 flex-1">
                  Other
                </Caption>
                <SelectionCheckbox
                  checked={draftOtherEnabled}
                  onPress={() => setDraftOtherEnabled((v) => !v)}
                />
              </View>
              <View
                className={`rounded-2xl border px-4 py-3.5 ${
                  draftOtherEnabled ? 'border-ink bg-gray-50' : 'border-gray-200 bg-surface'
                }`}
              >
                <Pressable
                  onPress={() => setDraftOtherEnabled((v) => !v)}
                  className="flex-row items-center gap-3"
                >
                  <SelectionCheckbox
                    checked={draftOtherEnabled}
                    onPress={() => setDraftOtherEnabled((v) => !v)}
                  />
                  <Text className="text-[15px] font-medium text-ink flex-1">
                    Other (custom industry)
                  </Text>
                </Pressable>
                {draftOtherEnabled ? (
                  <Input
                    label="Custom industry"
                    value={draftCustom}
                    onChangeText={setDraftCustom}
                    placeholder="Enter your industry"
                    className="mt-3"
                  />
                ) : null}
              </View>
            </View>
          </View>
        )}
      </SleekModal>
    </View>
  )
}
