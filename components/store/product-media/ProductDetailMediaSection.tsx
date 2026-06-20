import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  mediaId,
  mimeFromUri,
  productToMediaItems,
  resolveProductMediaForSave,
  resolveThumbnailId,
  type ProductMediaItem,
} from '@src/lib/product-media'
import { CancelSaveRow } from '@/components/ui/CancelSaveRow'
import { updateProduct } from '@src/api/products'
import { uploadProductImages } from '@src/api/uploads'
import { showError, showSuccess } from '@src/lib/toast'
import type { Product } from '@src/types/product'
import Colors from '@src/theme/colors'
import { palette } from '@src/theme/palette'
import { ProductMediaGalleryModal } from './ProductMediaGalleryModal'
import { ProductImagePreviewModal } from './ProductImagePreviewModal'

const TILE = 88

type Props = {
  product: Product
  storeId: number
  onProductUpdated: (product: Product) => void
}

export function ProductDetailMediaSection({ product, storeId, onProductUpdated }: Props) {
  const [items, setItems] = useState<ProductMediaItem[]>(() => productToMediaItems(product))
  const [thumbnailId, setThumbnailId] = useState<string | null>(() =>
    resolveThumbnailId(productToMediaItems(product), product.thumbnail_url)
  )
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<ProductMediaItem | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const next = productToMediaItems(product)
    setItems(next)
    setThumbnailId(resolveThumbnailId(next, product.thumbnail_url))
  }, [product.id, product.updated_at, product.images.join('|'), product.thumbnail_url])

  const hasPending = useMemo(() => items.some((i) => i.pending), [items])

  const persistMedia = useCallback(
    async (nextItems: ProductMediaItem[], nextThumbId: string | null) => {
      const { images, thumbnail_url } = await resolveProductMediaForSave(
        storeId,
        nextItems,
        nextThumbId,
        uploadProductImages
      )

      const res = await updateProduct(product.id, {
        images,
        thumbnail_url,
      })

      const synced = productToMediaItems(res.data)
      setItems(synced)
      setThumbnailId(resolveThumbnailId(synced, res.data.thumbnail_url))
      onProductUpdated(res.data)
      return res.data
    },
    [product.id, storeId, onProductUpdated]
  )

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      showError('Permission to access photos is required')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 10 - items.length,
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
    const merged = [...items, ...added].slice(0, 10)
    setItems(merged)
    if (!thumbnailId && merged[0]) setThumbnailId(merged[0].id)
  }

  const cancelPending = () => {
    const synced = productToMediaItems(product)
    setItems(synced)
    setThumbnailId(resolveThumbnailId(synced, product.thumbnail_url))
  }

  const savePending = async () => {
    setSaving(true)
    try {
      await persistMedia(items, thumbnailId)
      showSuccess('Images saved')
    } catch (e) {
      showError(e, 'Could not save images')
    } finally {
      setSaving(false)
    }
  }

  const handleGallerySave = async (
    nextItems: ProductMediaItem[],
    nextThumbId: string | null
  ) => {
    setSaving(true)
    try {
      setItems(nextItems)
      setThumbnailId(nextThumbId)
      await persistMedia(nextItems, nextThumbId)
      showSuccess('Media updated')
    } catch (e) {
      showError(e, 'Could not save media')
      throw e
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className="border border-gray-300 rounded-2xl bg-surface overflow-hidden">
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-[15px] font-semibold text-ink">Media ({items.length})</Text>
          <Pressable onPress={() => setGalleryOpen(true)} hitSlop={8}>
            <Text className="text-[15px] font-semibold" style={{ color: '#2563EB' }}>
              View all
            </Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2.5 pr-2">
            {items.map((item) => (
              <Pressable key={item.id} onPress={() => setPreviewItem(item)}>
                <View style={styles.tile}>
                  <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
                  {item.pending ? (
                    <View className="absolute top-1 left-1 bg-orange-500 px-1 py-0.5 rounded">
                      <Text className="text-[8px] font-bold text-white">NEW</Text>
                    </View>
                  ) : null}
                  {thumbnailId === item.id ? (
                    <View className="absolute bottom-0 left-0 right-0 bg-ink/75 py-0.5">
                      <Text className="text-[7px] font-bold text-white text-center">COVER</Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            ))}
            {items.length < 10 ? (
              <Pressable onPress={pickImages} style={styles.addTile}>
                <FontAwesome name="plus" size={24} color={Colors.text.muted} />
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </View>

      {hasPending ? (
        <View className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50">
          <Text className="text-[13px] font-medium text-gray-600 mb-3 text-center">
            New images — save or discard
          </Text>
          <CancelSaveRow onCancel={cancelPending} onSave={savePending} saving={saving} />
        </View>
      ) : (
        <View className="pb-1" />
      )}

      <ProductMediaGalleryModal
        visible={galleryOpen}
        items={items}
        thumbnailId={thumbnailId}
        onClose={() => setGalleryOpen(false)}
        onChange={(next, thumb) => {
          setItems(next)
          setThumbnailId(thumb)
        }}
        onSave={handleGallerySave}
        saving={saving}
      />

      <ProductImagePreviewModal
        visible={previewItem != null}
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onUpdate={(updated) => {
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
          setPreviewItem(updated)
        }}
        onDelete={() => {
          if (!previewItem) return
          const next = items.filter((i) => i.id !== previewItem.id)
          let thumb = thumbnailId
          if (thumb === previewItem.id) thumb = next[0]?.id ?? null
          setItems(next)
          setThumbnailId(thumb)
          setPreviewItem(null)
        }}
        onSetCover={() => {
          if (!previewItem) return
          setThumbnailId(previewItem.id)
          setPreviewItem(null)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.gray200,
    backgroundColor: palette.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addTile: {
    width: TILE,
    height: TILE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.gray200,
    backgroundColor: palette.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
