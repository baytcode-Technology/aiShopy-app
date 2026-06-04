import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'
import { palette } from '@src/theme/palette'

type Props = {
  value: string
  onSave: (value: string) => Promise<void>
  editable?: boolean
  keyboardType?: TextInputProps['keyboardType']
  /** Large price display vs compact stat value */
  size?: 'lg' | 'md'
  prefix?: string
  className?: string
}

export function InlineEditableValue({
  value,
  onSave,
  editable = true,
  keyboardType = 'decimal-pad',
  size = 'md',
  prefix,
  className,
}: Props) {
  const [mode, setMode] = useState<'idle' | 'selected' | 'editing'>('idle')
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (mode !== 'editing') setDraft(value)
  }, [value, mode])

  if (!editable) {
    return (
      <View className={className}>
        <DisplayValue size={size} prefix={prefix} value={value} />
      </View>
    )
  }

  const startEdit = () => {
    setDraft(value)
    setMode('editing')
  }

  const cancel = () => {
    setDraft(value)
    setMode('idle')
  }

  const save = async () => {
    if (draft.trim() === value.trim()) {
      setMode('idle')
      return
    }
    setSaving(true)
    try {
      await onSave(draft.trim())
      setMode('idle')
    } catch {
      // parent shows toast
    } finally {
      setSaving(false)
    }
  }

  const selected = mode === 'selected'
  const editing = mode === 'editing'

  return (
    <View className={cn('self-start', className)}>
      <Pressable
        onPress={() => {
          if (editing) return
          setMode((m) => (m === 'selected' ? 'idle' : 'selected'))
        }}
        disabled={editing}
      >
        <View
          className={cn(
            'rounded-xl px-3 py-2',
            (selected || editing) && 'border-2',
            selected && 'border-brand-green bg-[#E8F8EC]/40',
            editing && 'border-ink bg-gray-50'
          )}
          style={
            selected || editing
              ? undefined
              : { borderWidth: 2, borderColor: 'transparent' }
          }
        >
          {editing ? (
            <View className="flex-row items-center">
              {prefix ? (
                <Text
                  className={cn(
                    'font-extrabold text-ink mr-0.5',
                    size === 'lg' ? 'text-[32px]' : 'text-base'
                  )}
                >
                  {prefix}
                </Text>
              ) : null}
              <TextInput
                className={cn(
                  'font-extrabold text-ink p-0 min-w-[80px]',
                  size === 'lg' ? 'text-[32px]' : 'text-base'
                )}
                value={draft}
                onChangeText={setDraft}
                keyboardType={keyboardType}
                autoFocus
                selectTextOnFocus
                selectionColor={Colors.brand.primary}
              />
            </View>
          ) : (
            <DisplayValue size={size} prefix={prefix} value={value} />
          )}
        </View>
      </Pressable>

      {selected && !editing ? (
        <Pressable onPress={startEdit} className="mt-2 self-center" hitSlop={8}>
          <View className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 items-center justify-center">
            <FontAwesome name="pencil" size={14} color={Colors.brand.primary} />
          </View>
        </Pressable>
      ) : null}

      {editing ? (
        <View className="flex-row items-center gap-3 mt-2">
          <Pressable onPress={save} disabled={saving} hitSlop={8}>
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: palette.brandGreen }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <FontAwesome name="check" size={16} color="#fff" />
              )}
            </View>
          </Pressable>
          <Pressable onPress={cancel} disabled={saving} hitSlop={8}>
            <FontAwesome name="times" size={18} color={Colors.text.muted} />
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

function DisplayValue({
  size,
  prefix,
  value,
}: {
  size: 'lg' | 'md'
  prefix?: string
  value: string
}) {
  return (
    <Text
      className={cn(
        'font-extrabold text-ink tracking-tight',
        size === 'lg' ? 'text-[32px] tracking-tighter' : 'text-base'
      )}
    >
      {prefix}
      {value}
    </Text>
  )
}
