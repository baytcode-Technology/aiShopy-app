import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { FormModal } from '@/components/store/FormModal'
import { createOrder } from '@src/api/orders'
import { fetchProducts } from '@src/api/products'
import { showError, showSuccess } from '@src/lib/toast'
import type { Product } from '@src/types/product'
import { theme } from '@src/theme/colors'

type LineItem = {
  productId: string
  quantity: string
}

type Props = {
  visible: boolean
  storeId: string
  onClose: () => void
  onCreated: () => void
}

export function CreateOrderModal({ visible, storeId, onClose, onCreated }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [whatsapp, setWhatsapp] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [state, setState] = useState('')
  const [region, setRegion] = useState('')
  const [postcode, setPostcode] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineItem[]>([{ productId: '', quantity: '1' }])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visible || !storeId) return
    fetchProducts(storeId)
      .then((res) => setProducts(res.data.products.filter((p) => p.is_active)))
      .catch((e) => showError(e))
  }, [visible, storeId])

  const reset = () => {
    setWhatsapp('')
    setCustomerName('')
    setCity('')
    setDistrict('')
    setState('')
    setRegion('')
    setPostcode('')
    setNotes('')
    setLines([{ productId: '', quantity: '1' }])
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const addLine = () => setLines([...lines, { productId: '', quantity: '1' }])

  const handleSubmit = async () => {
    const phone = whatsapp.trim()
    const name = customerName.trim()
    if (!phone || phone.length < 8) {
      showError('Customer WhatsApp number is required')
      return
    }
    if (!name) {
      showError('Customer name is required')
      return
    }
    if (!city.trim() || !district.trim() || !state.trim() || !region.trim() || !postcode.trim()) {
      showError('Complete shipping address is required')
      return
    }

    const items = lines
      .filter((l) => l.productId)
      .map((l) => ({
        product_id: l.productId,
        quantity: Math.max(1, Number(l.quantity) || 1),
      }))

    if (items.length === 0) {
      showError('Add at least one product')
      return
    }

    setLoading(true)
    try {
      await createOrder({
        store_id: storeId,
        whatsapp_number: phone,
        name,
        payment_method: 'cod',
        items,
        shipping_address: {
          name,
          phone_number: phone,
          whatsapp_number: phone,
          city: city.trim(),
          district: district.trim(),
          state: state.trim(),
          region: region.trim(),
          postcode: postcode.trim(),
        },
        notes: notes.trim() || undefined,
      })
      reset()
      onCreated()
      onClose()
      showSuccess('Order created successfully')
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormModal
      visible={visible}
      title="New order"
      onClose={handleClose}
      footer={<AuthButton label="Create order (COD)" loading={loading} onPress={handleSubmit} />}
    >
      <AuthInput
        label="Customer WhatsApp *"
        value={whatsapp}
        onChangeText={setWhatsapp}
        placeholder="+919876543210"
        keyboardType="phone-pad"
      />
      <AuthInput label="Customer name *" value={customerName} onChangeText={setCustomerName} placeholder="John Doe" />

      <Text style={styles.section}>Shipping address *</Text>
      <AuthInput label="City" value={city} onChangeText={setCity} placeholder="Mumbai" />
      <AuthInput label="District" value={district} onChangeText={setDistrict} placeholder="Mumbai Suburban" />
      <AuthInput label="State" value={state} onChangeText={setState} placeholder="Maharashtra" />
      <AuthInput label="Region" value={region} onChangeText={setRegion} placeholder="West" />
      <AuthInput label="Postcode" value={postcode} onChangeText={setPostcode} placeholder="400001" />

      <View style={styles.lineHeader}>
        <Text style={styles.section}>Line items *</Text>
        <Pressable onPress={addLine} style={styles.addLine}>
          <FontAwesome name="plus" size={12} color={theme.black} />
          <Text style={styles.addLineText}>Add item</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.lines} nestedScrollEnabled>
        {lines.map((line, index) => (
          <View key={index} style={styles.lineRow}>
            <Text style={styles.lineLabel}>Product</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productPick}>
              {products.map((p) => (
                <Pressable
                  key={p.id}
                  style={[styles.productChip, line.productId === p.id && styles.productChipActive]}
                  onPress={() => {
                    const next = [...lines]
                    next[index] = { ...line, productId: p.id }
                    setLines(next)
                  }}
                >
                  <Text
                    style={[
                      styles.productChipText,
                      line.productId === p.id && styles.productChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {p.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <AuthInput
              label="Qty"
              value={line.quantity}
              onChangeText={(quantity) => {
                const next = [...lines]
                next[index] = { ...line, quantity }
                setLines(next)
              }}
              keyboardType="number-pad"
            />
          </View>
        ))}
      </ScrollView>

      <AuthInput
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Delivery instructions"
        multiline
        numberOfLines={2}
      />
    </FormModal>
  )
}

const styles = StyleSheet.create({
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  lineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addLineText: { fontSize: 12, fontWeight: '600', color: theme.black },
  lines: { maxHeight: 220 },
  lineRow: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 6,
  },
  lineLabel: { fontSize: 12, color: theme.gray600 },
  productPick: { flexGrow: 0, marginBottom: 4 },
  productChip: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    maxWidth: 140,
  },
  productChipActive: { backgroundColor: theme.black, borderColor: theme.black },
  productChipText: { fontSize: 12, color: theme.gray600 },
  productChipTextActive: { color: theme.white },
})
