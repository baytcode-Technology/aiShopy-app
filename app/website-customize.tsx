import { useEffect, useMemo, useState } from 'react'
import {
  LayoutAnimation,
  Platform,
  Text,
  UIManager,
  View,
} from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'
import { AppPressable } from '@/components/ui/AppPressable'
import { Button } from '@/components/ui/Button'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { StorefrontUrlActions } from '@/components/store/StorefrontUrlActions'
import { Label, Muted, SectionTitle } from '@/components/ui/Typography'
import { updateMyStore } from '@src/api/stores'
import { env } from '@src/config/env'
import { useStore } from '@src/contexts/store-context'
import { shadows } from '@src/lib/shadows'
import { buildSubdomainUrl } from '@src/lib/storefront'
import { showError, showSuccess } from '@src/lib/toast'
import { cn } from '@src/lib/cn'
import {
  DARK_SURFACE,
  DEFAULT_PRIMARY,
  getSurfaceColors,
  isDarkBackground,
  isValidThemeHex,
  LIGHT_SURFACE,
  mapPrimaryAcrossModes,
  presetsForMode,
  snapPrimaryToMode,
  type ThemeMode,
  type ThemePreset,
} from '@src/lib/storefront-theme-presets'
import type { Store, ThemeConfig, ThemeTemplate } from '@src/types/store'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const TEMPLATES: {
  id: ThemeTemplate
  name: string
  tagline: string
}[] = [
  { id: 'classic', name: 'Classic', tagline: 'Search & filter · product grid' },
  { id: 'boutique', name: 'Marketplace', tagline: 'Category sidebar · dense grid' },
  { id: 'modern', name: 'Modern', tagline: 'Sticky nav · clean checkout' },
]

function normalizeTheme(raw: Store['theme_config']): ThemeConfig {
  const template: ThemeTemplate =
    raw?.template === 'boutique' || raw?.template === 'modern'
      ? raw.template
      : 'classic'
  const isDark = isDarkBackground(raw?.colors?.background)
  const mode: ThemeMode = isDark ? 'dark' : 'light'
  const primaryRaw =
    raw?.colors?.primary && isValidThemeHex(raw.colors.primary)
      ? raw.colors.primary.toUpperCase()
      : DEFAULT_PRIMARY
  const primary = snapPrimaryToMode(primaryRaw, mode)
  return {
    template,
    colors: { primary, ...(isDark ? DARK_SURFACE : LIGHT_SURFACE) },
  }
}

function DummyImage({ size = 28, tint }: { size?: number; tint?: string }) {
  return (
    <View
      className="items-center justify-center rounded-lg"
      style={{
        width: size + 16,
        height: size + 16,
        backgroundColor: tint ? `${tint}22` : '#E8E8EC',
      }}
    >
      <FontAwesome name="image" size={size * 0.55} color={tint ?? '#9CA3AF'} />
    </View>
  )
}

/** Large full-width mock storefront — icons only, no real photos. */
function TemplateMockPreview({
  variant,
  accent,
}: {
  variant: ThemeTemplate
  accent: string
}) {
  if (variant === 'boutique') {
    return (
      <View className="w-full overflow-hidden rounded-t-2xl bg-[#F3F4F6]">
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-3 py-2.5">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 rounded-full" style={{ backgroundColor: accent }} />
            <View className="h-2.5 w-16 rounded-full bg-gray-300" />
          </View>
          <FontAwesome name="shopping-cart" size={14} color={accent} />
        </View>
        <View className="flex-row gap-2 px-3 py-3">
          <View className="w-14 gap-1.5 pt-1">
            <View className="h-2 w-full rounded-full" style={{ backgroundColor: accent }} />
            <View className="h-2 w-full rounded-full bg-gray-300" />
            <View className="h-2 w-3/4 rounded-full bg-gray-300" />
            <View className="h-2 w-full rounded-full bg-gray-300" />
          </View>
          <View className="flex-1 flex-row flex-wrap gap-2">
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                className="w-[47%] items-center rounded-xl border border-gray-200 bg-white py-3"
              >
                <DummyImage size={28} tint={accent} />
                <View className="mt-1.5 h-1.5 w-10 rounded-full bg-gray-300" />
              </View>
            ))}
          </View>
        </View>
      </View>
    )
  }

  if (variant === 'modern') {
    return (
      <View className="w-full overflow-hidden rounded-t-2xl bg-[#F3F4F6]">
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-3 py-2.5">
          <View className="h-2.5 w-20 rounded-full bg-gray-800" />
          <FontAwesome name="shopping-cart" size={14} color={accent} />
        </View>
        <View className="flex-row gap-2 border-b border-gray-100 bg-white px-3 py-2.5">
          <View className="h-7 rounded-full px-3 items-center justify-center" style={{ backgroundColor: accent }}>
            <View className="h-1.5 w-8 rounded-full bg-white/90" />
          </View>
          <View className="h-7 rounded-full bg-gray-100 px-3 items-center justify-center">
            <View className="h-1.5 w-8 rounded-full bg-gray-400" />
          </View>
          <View className="h-7 rounded-full bg-gray-100 px-3 items-center justify-center">
            <View className="h-1.5 w-8 rounded-full bg-gray-400" />
          </View>
        </View>
        <View className="flex-row gap-2 px-3 py-4">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              className="flex-1 items-center rounded-xl border border-gray-200 bg-white py-3"
            >
              <DummyImage size={32} tint={accent} />
              <View className="mt-2 h-1.5 w-10 rounded-full bg-gray-300" />
              <View className="mt-1 h-1.5 w-6 rounded-full" style={{ backgroundColor: accent }} />
            </View>
          ))}
        </View>
      </View>
    )
  }

  // classic — search + filter button, no persistent sidebar
  return (
    <View className="w-full overflow-hidden rounded-t-2xl bg-[#F3F4F6]">
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-3 py-2.5">
        <View className="flex-row items-center gap-2">
          <View className="h-6 w-6 rounded-full" style={{ backgroundColor: accent }} />
          <View className="h-2.5 w-16 rounded-full bg-gray-300" />
        </View>
        <FontAwesome name="shopping-cart" size={14} color={accent} />
      </View>
      <View className="mx-3 mt-3 flex-row items-center gap-2">
        <View className="h-9 w-9 rounded-lg border border-gray-200 bg-white" />
        <View className="h-9 flex-1 rounded-full bg-white border border-gray-200" />
      </View>
      <View className="flex-row flex-wrap gap-2 px-3 py-3 pb-4">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className="w-[47%] items-center rounded-xl border border-gray-200 bg-white py-3"
          >
            <DummyImage size={28} tint={accent} />
            <View className="mt-1.5 h-1.5 w-10 rounded-full bg-gray-300" />
          </View>
        ))}
      </View>
    </View>
  )
}

function TemplateCard({
  name,
  tagline,
  selected,
  accent,
  variant,
  onSelect,
  onPreview,
}: {
  name: string
  tagline: string
  selected: boolean
  accent: string
  variant: ThemeTemplate
  onSelect: () => void
  onPreview: () => void
}) {
  return (
    <View
      className={cn(
        'w-full overflow-hidden rounded-2xl border-2 bg-white',
        selected ? undefined : 'border-gray-200'
      )}
      style={[
        shadows.card,
        selected ? { borderColor: accent } : undefined,
      ]}
    >
      <AppPressable
        onPress={onSelect}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`Select ${name} template`}
        style={{ width: undefined, alignSelf: 'stretch' }}
      >
        <TemplateMockPreview variant={variant} accent={accent} />
      </AppPressable>

      <View className="flex-row items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3.5">
        <AppPressable
          onPress={onSelect}
          style={{ flex: 1, width: undefined, alignSelf: 'auto' }}
        >
          <Text className="text-[17px] font-bold" style={{ color: accent }}>
            {name}
          </Text>
          <Text className="mt-0.5 text-[12px] text-gray-500">{tagline}</Text>
          {selected ? (
            <Text className="mt-1 text-[11px] font-semibold" style={{ color: accent }}>
              Selected
            </Text>
          ) : null}
        </AppPressable>

        <AppPressable
          onPress={onPreview}
          accessibilityRole="button"
          accessibilityLabel={`Preview ${name} demo`}
          style={{ width: undefined, alignSelf: 'auto' }}
        >
          <View className="rounded-xl border border-gray-300 bg-white px-4 py-2.5">
            <Text className="text-[14px] font-semibold text-ink">Preview</Text>
          </View>
        </AppPressable>
      </View>
    </View>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <View
      className="rounded-[28px] border border-gray-200 bg-surface p-5 gap-4"
      style={shadows.card}
    >
      <View className="gap-1">
        <SectionTitle>{title}</SectionTitle>
        {subtitle ? <Muted className="text-[13px] leading-5">{subtitle}</Muted> : null}
      </View>
      {children}
    </View>
  )
}

function ColorCombinationCard({
  preset,
  mode,
  selected,
  onSelect,
}: {
  preset: ThemePreset
  mode: ThemeMode
  selected: boolean
  onSelect: () => void
}) {
  const surface = getSurfaceColors(mode)

  return (
    <AppPressable
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`${preset.label} — ${preset.hint}`}
      accessibilityState={{ selected }}
      style={{ width: '48%', alignSelf: 'auto' }}
      hitSlop={4}
    >
      <View
        className={cn(
          'overflow-hidden rounded-2xl border-2',
          selected ? 'border-ink' : 'border-gray-200',
        )}
        style={{ minHeight: 132 }}
      >
        <View
          className="flex-1 justify-between px-3 py-3"
          style={{ backgroundColor: surface.background, minHeight: 88 }}
        >
          <Text className="text-[13px] font-semibold" style={{ color: surface.text }}>
            Product name
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px]" style={{ color: surface.text, opacity: 0.65 }}>
              ₹499
            </Text>
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: preset.primary }}
            >
              <Text className="text-[10px] font-bold text-white">Buy</Text>
            </View>
          </View>
        </View>
        <View
          className={cn(
            'flex-row items-center justify-between border-t px-3 py-2.5',
            selected ? 'border-ink/10 bg-gray-50' : 'border-gray-100 bg-white',
          )}
        >
          <View className="flex-1 pr-2">
            <Text className="text-[13px] font-semibold text-ink">{preset.label}</Text>
            <Text className="text-[11px] text-gray-500">{preset.hint}</Text>
          </View>
          {selected ? (
            <FontAwesome name="check-circle" size={18} color={preset.primary} />
          ) : (
            <View
              className="h-4 w-4 rounded-full border border-gray-300"
              style={{ backgroundColor: preset.primary }}
            />
          )}
        </View>
      </View>
    </AppPressable>
  )
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: ThemeMode
  onChange: (next: ThemeMode) => void
}) {
  return (
    <View className="flex-row gap-3">
      {(
        [
          {
            key: 'light' as const,
            label: 'Light',
            bg: LIGHT_SURFACE.background,
            fg: LIGHT_SURFACE.text,
            hint: 'White background',
          },
          {
            key: 'dark' as const,
            label: 'Dark',
            bg: DARK_SURFACE.background,
            fg: DARK_SURFACE.text,
            hint: 'Dark background',
          },
        ] as const
      ).map((opt) => {
        const selected = mode === opt.key
        return (
          <AppPressable
            key={opt.key}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
              onChange(opt.key)
            }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{ flex: 1, width: undefined, alignSelf: 'auto' }}
          >
            <View
              className={cn(
                'overflow-hidden rounded-2xl border-2',
                selected ? 'border-ink' : 'border-gray-200'
              )}
            >
              <View
                className="h-16 items-center justify-center px-3"
                style={{ backgroundColor: opt.bg }}
              >
                <Text
                  className="text-[15px] font-bold"
                  style={{ color: opt.fg }}
                >
                  Aa
                </Text>
                <Text
                  className="mt-1 text-[11px]"
                  style={{ color: opt.fg, opacity: 0.7 }}
                >
                  Sample text
                </Text>
              </View>
              <View
                className={cn(
                  'flex-row items-center justify-center gap-2 py-2.5',
                  selected ? 'bg-ink' : 'bg-gray-50'
                )}
              >
                <View
                  className="h-3 w-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: opt.bg }}
                />
                <Text
                  className={cn(
                    'text-[13px] font-bold',
                    selected ? 'text-white' : 'text-gray-600'
                  )}
                >
                  {opt.label}
                </Text>
              </View>
            </View>
          </AppPressable>
        )
      })}
    </View>
  )
}

export default function WebsiteCustomizeScreen() {
  const { store, role, subdomainUrl, activateStoreSession, refreshStore } = useStore()

  const [template, setTemplate] = useState<ThemeTemplate>('classic')
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [initialConfig, setInitialConfig] = useState<ThemeConfig | null>(null)
  const [initializedStoreId, setInitializedStoreId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!store || store.id === initializedStoreId) return
    const normalized = normalizeTheme(store.theme_config)
    setTemplate(normalized.template)
    setPrimary(normalized.colors.primary)
    setMode(
      isDarkBackground(normalized.colors.background) ? 'dark' : 'light'
    )
    setInitialConfig(normalized)
    setInitializedStoreId(store.id)
  }, [store, initializedStoreId])

  const colorPresets = useMemo(() => presetsForMode(mode), [mode])

  const currentConfig: ThemeConfig = useMemo(
    () => ({
      template,
      colors: { primary, ...getSurfaceColors(mode) },
    }),
    [template, primary, mode]
  )

  const dirty =
    initialConfig != null &&
    JSON.stringify(currentConfig) !== JSON.stringify(initialConfig)

  const selectSwatch = (color: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setPrimary(snapPrimaryToMode(color, mode))
  }

  const handleModeChange = (next: ThemeMode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    const nextPrimary = mapPrimaryAcrossModes(primary, mode, next)
    setMode(next)
    setPrimary(nextPrimary)
  }

  const handleSave = async () => {
    if (!store || saving) return
    setSaving(true)
    try {
      const res = await updateMyStore(store.id, { theme_config: currentConfig })
      const updated = res.data.store
      const url = subdomainUrl ?? buildSubdomainUrl(updated.slug)
      await activateStoreSession(updated, url, role ?? 'owner')
      await refreshStore({ silent: true })
      setInitialConfig(currentConfig)
      showSuccess('Website updated', 'Changes are live on your storefront')
    } catch (e) {
      showError(e)
    } finally {
      setSaving(false)
    }
  }

  const openPreview = (previewTemplate: ThemeTemplate) => {
    router.push({
      pathname: '/template-preview',
      params: {
        template: previewTemplate,
        primary,
        mode,
      },
    })
  }

  const storefrontHost = store?.slug
    ? `${store.slug}.${env.storefrontBaseDomain}`
    : null
  const storefrontUrl =
    subdomainUrl ?? (store?.slug ? buildSubdomainUrl(store.slug) : null)

  return (
    <Screen>
      <ScreenHeader
        title="Website"
        subtitle="Design & customization"
        onBack={() => router.back()}
        showSettings={false}
      />
      <ScreenScrollBody contentContainerClassName="gap-5 pb-12">
        <SectionCard
          title="Templates"
          subtitle="Pick a full storefront layout. Tap Preview to try a demo store."
        >
          <View className="gap-4">
            {TEMPLATES.map((item) => (
              <TemplateCard
                key={item.id}
                name={item.name}
                tagline={item.tagline}
                variant={item.id}
                selected={template === item.id}
                accent={primary}
                onSelect={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                  setTemplate(item.id)
                }}
                onPreview={() => openPreview(item.id)}
              />
            ))}
          </View>
        </SectionCard>

        <SectionCard
          title="Colors"
          subtitle="Background and text are fixed per theme. Pick a tested accent for your storefront."
        >
          <View className="gap-2">
            <Label>Background & text</Label>
            <ModeToggle mode={mode} onChange={handleModeChange} />
          </View>

          <View className="gap-2">
            <Label>Brand accent</Label>
            <Muted className="text-[12px] leading-5">
              {mode === 'light'
                ? 'White page, dark text — pick one of four accents'
                : 'Dark page, light text — two accents that stay readable'}
            </Muted>
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {colorPresets.map((preset) => {
                const selected = primary.toUpperCase() === preset.primary.toUpperCase()
                return (
                  <ColorCombinationCard
                    key={preset.id}
                    preset={preset}
                    mode={mode}
                    selected={selected}
                    onSelect={() => selectSwatch(preset.primary)}
                  />
                )
              })}
            </View>
          </View>
        </SectionCard>

        {storefrontHost && storefrontUrl ? (
          <SectionCard title="View website" subtitle="Open your live site to check the result.">
            <StorefrontUrlActions url={storefrontUrl} displayHost={storefrontHost} />
          </SectionCard>
        ) : null}

        <View className="pt-1">
          <Button
            label={dirty ? 'Save changes' : 'Saved'}
            loading={saving}
            disabled={!store || !dirty}
            onPress={() => void handleSave()}
          />
        </View>
      </ScreenScrollBody>
    </Screen>
  )
}
