import { useEffect, useMemo, useState } from 'react'
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import {
  mediaId,
  mimeFromUri,
  type ProductMediaItem,
} from '@src/lib/product-media'
import { showError } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import { palette } from '@src/theme/palette'
import { ProductImagePreviewModal } from './ProductImagePreviewModal'

const COLS = 3
const GRID_GAP = 12
const H_PADDING = 20

type GridCell = ProductMediaItem | 'add'

type Props = {
  visible: boolean
  items: ProductMediaItem[]
  thumbnailId: string | null
  onClose: () => void
  onChange: (items: ProductMediaItem[], thumbnailId: string | null) => void
  onSave: (items: ProductMediaItem[], thumbnailId: string | null) => Promise<void>
  saving?: boolean
}

function chunkRows(cells: GridCell[]): GridCell[][] {
  const rows: GridCell[][] = []
  for (let i = 0; i < cells.length; i += COLS) {
    rows.push(cells.slice(i, i + COLS))
  }
  return rows
}

function tileSizeForWindow(windowWidth: number) {
  return (windowWidth - H_PADDING * 2 - GRID_GAP * (COLS - 1)) / COLS
}

export function ProductMediaGalleryModal({
  visible,
  items,
  thumbnailId,
  onClose,
  onChange,
  onSave,
  saving = false,
}: Props) {
  const insets = useSafeAreaInsets()
  const tileSize = tileSizeForWindow(Dimensions.get('window').width)
  const [draft, setDraft] = useState<ProductMediaItem[]>(items)
  const [draftThumb, setDraftThumb] = useState<string | null>(thumbnailId)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewItem, setPreviewItem] = useState<ProductMediaItem | null>(null)
  const [snapshot, setSnapshot] = useState<string>('')

  useEffect(() => {
    if (!visible) return
    setDraft(items)
    setDraftThumb(thumbnailId)
    setSelectMode(false)
    setSelectedIds(new Set())
    setSnapshot(JSON.stringify({ items, thumbnailId }))
  }, [visible, items, thumbnailId])

  const dirty = useMemo(() => {
    return JSON.stringify({ items: draft, thumbnailId: draftThumb }) !== snapshot
  }, [draft, draftThumb, snapshot])

  const gridCells = useMemo((): GridCell[] => {
    const cells: GridCell[] = [...draft]
    if (draft.length < 10) cells.push('add')
    return cells
  }, [draft])

  const gridRows = useMemo(() => chunkRows(gridCells), [gridCells])

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      showError('Permission to access photos is required')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.85,
      selectionLimit: 10 - draft.length,
    })
    if (result.canceled || !result.assets.length) return

    const added: ProductMediaItem[] = result.assets.map((asset, index) => ({
      id: mediaId(),
      uri: asset.uri,
      pending: {
        name: asset.fileName ?? `product-${Date.now()}-${index}.jpg`,
        type: asset.mimeType ?? mimeFromUri(asset.uri),
      },
    }))
    const merged = [...draft, ...added].slice(0, 10)
    setDraft(merged)
    if (!draftThumb && merged[0]) setDraftThumb(merged[0].id)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSelected = () => {
    if (selectedIds.size === 0) return
    const next = draft.filter((i) => !selectedIds.has(i.id))
    let thumb = draftThumb
    if (thumb && selectedIds.has(thumb)) {
      thumb = next[0]?.id ?? null
    }
    setDraft(next)
    setDraftThumb(thumb)
    setSelectedIds(new Set())
    setSelectMode(false)
  }

  const handleCancel = () => {
    setDraft(items)
    setDraftThumb(thumbnailId)
    setSelectMode(false)
    setSelectedIds(new Set())
    onClose()
  }

  const handleSave = async () => {
    onChange(draft, draftThumb)
    await onSave(draft, draftThumb)
    onClose()
  }

  const openPreview = (item: ProductMediaItem) => {
    if (selectMode) {
      toggleSelect(item.id)
      return
    }
    setPreviewItem(item)
  }

  const renderImageCell = (item: ProductMediaItem) => {
    const selected = selectedIds.has(item.id)
    const isThumb = draftThumb === item.id

    return (
      <Pressable
        key={item.id}
        onPress={() => openPreview(item)}
        style={{ width: tileSize }}
      >
        <View
          style={[
            styles.tile,
            { width: tileSize, height: tileSize },
            selected && styles.tileSelected,
          ]}
        >
          <Image source={{ uri: item.uri }} style={styles.image} />
          {item.pending ? (
            <View className="absolute top-1 left-1 bg-orange-500 px-1.5 py-0.5 rounded">
              <Text className="text-[9px] font-bold text-white">NEW</Text>
            </View>
          ) : null}
          {isThumb && !selectMode ? (
            <View className="absolute bottom-0 left-0 right-0 bg-ink/80 py-0.5">
              <Text className="text-[8px] font-bold text-white text-center">COVER</Text>
            </View>
          ) : null}
          {selectMode ? (
            <View
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 items-center justify-center"
              style={{
                borderColor: selected ? palette.brandGreen : '#fff',
                backgroundColor: selected ? palette.brandGreen : 'rgba(0,0,0,0.35)',
              }}
            >
              {selected ? <FontAwesome name="check" size={10} color="#fff" /> : null}
            </View>
          ) : null}
        </View>
      </Pressable>
    )
  }

  const renderAddCell = () => (
    <Pressable
      key="add"
      onPress={pickImages}
      style={[styles.addTile, { width: tileSize, height: tileSize }]}
    >
      <FontAwesome name="plus" size={28} color={Colors.text.muted} />
      <Text className="text-[11px] font-semibold text-gray-500 mt-1">Add</Text>
    </Pressable>
  )

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={handleCancel}>
        <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
            <Pressable onPress={handleCancel} hitSlop={12}>
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                <FontAwesome name="times" size={18} color={Colors.brand.primary} />
              </View>
            </Pressable>
            <Text className="flex-1 text-center text-[17px] font-bold text-ink mx-2">
              Product media
            </Text>
            <View className="w-10" />
          </View>

          <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
            <Text className="text-[15px] font-semibold text-ink">
              Media ({draft.length})
            </Text>
            <Pressable
              onPress={() => {
                if (selectMode) {
                  setSelectMode(false)
                  setSelectedIds(new Set())
                } else {
                  setSelectMode(true)
                }
              }}
            >
              <Text className="text-[15px] font-semibold" style={{ color: '#2563EB' }}>
                {selectMode ? 'Done' : 'Select'}
              </Text>
            </Pressable>
          </View>

          {selectMode && selectedIds.size > 0 ? (
            <Pressable
              onPress={deleteSelected}
              className="mx-5 mt-3 py-2.5 rounded-xl border border-red-200 bg-red-50 items-center"
            >
              <Text className="text-[14px] font-bold text-red-600">
                Delete {selectedIds.size} selected
              </Text>
            </Pressable>
          ) : null}

          <ScrollView
            className="flex-1"
            contentContainerStyle={styles.gridScroll}
            showsVerticalScrollIndicator={false}
          >
            {gridRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.row}>
                {[0, 1, 2].map((colIndex) => {
                  const cell = row[colIndex]
                  if (!cell) {
                    return <View key={`empty-${colIndex}`} style={{ width: tileSize }} />
                  }
                  if (cell === 'add') return renderAddCell()
                  return renderImageCell(cell)
                })}
              </View>
            ))}
          </ScrollView>

          {dirty ? (
            <View
              className="flex-row gap-3 px-5 pt-3 border-t border-gray-100 bg-gray-50"
              style={{ paddingBottom: insets.bottom + 12 }}
            >
              <View className="flex-1">
                <Button label="Cancel" variant="outline" onPress={handleCancel} disabled={saving} />
              </View>
              <View className="flex-1">
                <Button label="Save" loading={saving} onPress={handleSave} />
              </View>
            </View>
          ) : (
            <View style={{ paddingBottom: insets.bottom + 12 }} />
          )}
        </View>
      </Modal>

      <ProductImagePreviewModal
        visible={previewItem != null}
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onUpdate={(updated) => {
          setDraft((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
          setPreviewItem(updated)
        }}
        onDelete={() => {
          if (!previewItem) return
          const next = draft.filter((i) => i.id !== previewItem.id)
          let thumb = draftThumb
          if (thumb === previewItem.id) thumb = next[0]?.id ?? null
          setDraft(next)
          setDraftThumb(thumb)
          setPreviewItem(null)
        }}
        onSetCover={() => {
          if (!previewItem) return
          setDraftThumb(previewItem.id)
          setPreviewItem(null)
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  gridScroll: {
    paddingHorizontal: H_PADDING,
    paddingTop: 16,
    paddingBottom: 24,
    gap: GRID_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  tile: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.gray200,
    backgroundColor: palette.gray100,
  },
  tileSelected: {
    borderWidth: 2,
    borderColor: palette.brandGreen,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addTile: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.gray200,
    borderStyle: 'dashed',
    backgroundColor: palette.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
