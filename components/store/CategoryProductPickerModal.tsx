import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AuthButton } from '@/components/auth/AuthButton'
import { FormModal } from '@/components/store/FormModal'
import { syncCategoryProducts } from '@src/api/categories'
import { showError, showSuccess } from '@src/lib/toast'
import type { Product } from '@src/types/product'
import { theme } from '@src/theme/colors'

type Mode = 'assign' | 'edit'

type Props = {
  visible: boolean
  mode: Mode
  storeId: string
  categoryId: string
  categoryName: string
  allProducts: Product[]
  onClose: () => void
  onSaved: () => void
}

export function CategoryProductPickerModal({
  visible,
  mode,
  storeId,
  categoryId,
  categoryName,
  allProducts,
  onClose,
  onSaved,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const inCategoryIds = useMemo(
    () => new Set(allProducts.filter((p) => p.category_id === categoryId).map((p) => p.id)),
    [allProducts, categoryId]
  )

  useEffect(() => {
    if (!visible) return
    if (mode === 'edit') {
      setSelected(new Set(inCategoryIds))
    } else {
      setSelected(new Set(inCategoryIds))
    }
    setSearch('')
  }, [visible, mode, categoryId, inCategoryIds])

  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  )

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await syncCategoryProducts(storeId, categoryId, [...selected])
      showSuccess(
        mode === 'edit'
          ? 'Category products updated'
          : `${selected.size} product(s) added to ${categoryName}`
      )
      onSaved()
      onClose()
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'edit' ? `Edit · ${categoryName}` : `Add to ${categoryName}`
  const submitLabel =
    mode === 'edit' ? `Save (${selected.size} in category)` : `Add selected (${selected.size})`

  return (
    <FormModal
      visible={visible}
      title={title}
      onClose={onClose}
      footer={<AuthButton label={submitLabel} loading={loading} onPress={handleSubmit} />}
    >
      <Text style={styles.subtitle}>
        {mode === 'edit'
          ? 'Uncheck products to remove them from this category.'
          : 'Select existing products to include in this category.'}
      </Text>

      <View style={styles.searchWrap}>
        <FontAwesome name="search" size={14} color={theme.gray400} />
        <TextInput
          style={styles.search}
          placeholder="Search your catalog..."
          placeholderTextColor={theme.gray400}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.list} nestedScrollEnabled>
        {filtered.map((product) => {
          const isSelected = selected.has(product.id)
          const wasInCategory = inCategoryIds.has(product.id)
          return (
            <Pressable
              key={product.id}
              style={({ pressed }) => [
                styles.row,
                isSelected && styles.rowSelected,
                pressed && styles.rowPressed,
              ]}
              onPress={() => toggle(product.id)}
            >
              <View style={styles.thumb}>
                {product.thumbnail_url ? (
                  <Image source={{ uri: product.thumbnail_url }} style={styles.thumbImg} />
                ) : (
                  <Text style={styles.thumbLetter}>{product.name[0]?.toUpperCase()}</Text>
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.meta}>
                  ₹{product.base_price} · Stock {product.stock_qty}
                  {wasInCategory && !isSelected ? ' · was in category' : ''}
                </Text>
              </View>
              <View style={[styles.check, isSelected && styles.checkOn]}>
                {isSelected ? (
                  <FontAwesome name="check" size={14} color={theme.white} />
                ) : null}
              </View>
            </Pressable>
          )
        })}
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No products match your search.</Text>
        ) : null}
      </ScrollView>
    </FormModal>
  )
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 13, color: theme.gray600, lineHeight: 18 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.gray100,
  },
  search: { flex: 1, paddingVertical: 10, fontSize: 15, color: theme.black },
  list: { maxHeight: 360 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: theme.white,
    gap: 12,
  },
  rowSelected: { borderColor: theme.black, borderWidth: 2 },
  rowPressed: { opacity: 0.92 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: theme.gray100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbLetter: { fontSize: 20, fontWeight: '700', color: theme.gray400 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: theme.black },
  meta: { fontSize: 12, color: theme.gray600, marginTop: 4 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: theme.black, borderColor: theme.black },
  empty: { textAlign: 'center', color: theme.gray600, padding: 24 },
})
