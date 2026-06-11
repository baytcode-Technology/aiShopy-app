import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AuthInput } from '@/components/auth/AuthInput'
import { Input } from '@/components/ui/Input'
import { SleekModal } from '@/components/ui/Modal'
import { Caption } from '@/components/ui/Typography'
import { fetchIndustries } from '@src/api/industries'
import { resolveIndustrySelection } from '@src/lib/industry-selection'
import Colors from '@src/theme/colors'
import type { IndustryGroup } from '@src/types/industry'

type Props = {
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  variant?: 'auth' | 'default'
}

export function IndustryPicker({
  value,
  onChange,
  error,
  label = 'Industry',
  variant = 'default',
}: Props) {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<IndustryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isOther, setIsOther] = useState(false)
  const [customValue, setCustomValue] = useState('')

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

  const resolved = useMemo(() => resolveIndustrySelection(value, groups), [value, groups])

  useEffect(() => {
    if (loading || groups.length === 0) return
    if (resolved.mode === 'other') {
      setIsOther(true)
      setCustomValue(resolved.custom)
    } else if (resolved.mode === 'preset') {
      setIsOther(false)
      setCustomValue('')
    }
  }, [resolved, loading, groups.length])

  const displayLabel =
    resolved.mode === 'preset'
      ? resolved.label
      : resolved.mode === 'other'
        ? resolved.custom || 'Other'
        : ''

  const TextField = variant === 'auth' ? AuthInput : Input

  const handleSelectPreset = (group: IndustryGroup, childName: string) => {
    setIsOther(false)
    setCustomValue('')
    onChange(childName)
    setOpen(false)
  }

  const handleSelectOther = () => {
    setIsOther(true)
    const next = resolved.mode === 'other' ? resolved.custom : ''
    setCustomValue(next)
    onChange(next)
    setOpen(false)
  }

  const handleCustomChange = (text: string) => {
    setCustomValue(text)
    onChange(text.trim())
  }

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
        onPress={() => setOpen(true)}
        className={`flex-row items-center justify-between rounded-xl border px-4 py-3.5 bg-surface ${
          error ? 'border-red-400' : 'border-gray-200'
        }`}
      >
        <Text
          className={`flex-1 text-[15px] ${displayLabel ? 'text-ink font-medium' : 'text-gray-400'}`}
          numberOfLines={1}
        >
          {loading ? 'Loading industries…' : displayLabel || 'Select industry'}
        </Text>
        <FontAwesome name="chevron-down" size={12} color={Colors.text.muted} />
      </Pressable>

      {error ? <Text className="text-red-500 text-xs mt-1.5 pl-1">{error}</Text> : null}
      {loadError ? <Text className="text-amber-600 text-xs mt-1.5 pl-1">{loadError}</Text> : null}

      {isOther ? (
        <View className="mt-3">
          <TextField
            label="Custom industry"
            value={customValue}
            onChangeText={handleCustomChange}
            placeholder="Enter your industry"
          />
        </View>
      ) : null}

      <SleekModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Select industry"
        subtitle="Choose a category or pick Other at the bottom"
        scrollClassName="max-h-[75%]"
      >
        {loading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color={Colors.brand.primary} />
          </View>
        ) : (
          <View className="gap-4 pb-2">
            {groups.map((group) => (
              <View key={group.id}>
                <Caption className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 px-1">
                  {group.name}
                </Caption>
                <View className="rounded-2xl border border-gray-200 overflow-hidden bg-surface">
                  {group.children.map((child, index) => {
                    const selected =
                      resolved.mode === 'preset' && resolved.childId === child.id
                    return (
                      <Pressable
                        key={child.id}
                        onPress={() => handleSelectPreset(group, child.name)}
                        className={`px-4 py-3.5 flex-row items-center justify-between ${
                          index < group.children.length - 1 ? 'border-b border-gray-100' : ''
                        } ${selected ? 'bg-gray-50' : ''}`}
                      >
                        <Text className="text-[15px] font-medium text-ink flex-1 pr-3">
                          {child.name}
                        </Text>
                        {selected ? (
                          <FontAwesome name="check" size={14} color={Colors.brand.primary} />
                        ) : (
                          <FontAwesome name="chevron-right" size={11} color={Colors.text.muted} />
                        )}
                      </Pressable>
                    )
                  })}
                </View>
              </View>
            ))}

            <View>
              <Caption className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 px-1">
                Other
              </Caption>
              <Pressable
                onPress={handleSelectOther}
                className={`rounded-2xl border px-4 py-3.5 flex-row items-center justify-between ${
                  isOther || resolved.mode === 'other'
                    ? 'border-ink bg-gray-50'
                    : 'border-gray-200 bg-surface'
                }`}
              >
                <Text className="text-[15px] font-medium text-ink">Other (custom industry)</Text>
                {isOther || resolved.mode === 'other' ? (
                  <FontAwesome name="check" size={14} color={Colors.brand.primary} />
                ) : (
                  <FontAwesome name="chevron-right" size={11} color={Colors.text.muted} />
                )}
              </Pressable>
            </View>
          </View>
        )}
      </SleekModal>
    </View>
  )
}
