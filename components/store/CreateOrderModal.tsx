import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Caption, SectionTitle } from '@/components/ui/Typography'
import { FormModal } from '@/components/store/FormModal'
import { createOrder } from '@src/api/orders'
import { fetchProducts } from '@src/api/products'
import { cn } from '@src/lib/cn'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Product } from '@src/types/product'

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
      footer={<Button label="Create order (COD)" loading={loading} onPress={handleSubmit} />}
    >
      <Input
        label="Customer WhatsApp *"
        value={whatsapp}
        onChangeText={setWhatsapp}
        placeholder="+919876543210"
        keyboardType="phone-pad"
      />
      <Input
        label="Customer name *"
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="John Doe"
      />

      <SectionTitle className="mt-1">Shipping address *</SectionTitle>
      <Input label="City" value={city} onChangeText={setCity} placeholder="Mumbai" />
      <Input label="District" value={district} onChangeText={setDistrict} placeholder="Mumbai Suburban" />
      <Input label="State" value={state} onChangeText={setState} placeholder="Maharashtra" />
      <Input label="Region" value={region} onChangeText={setRegion} placeholder="West" />
      <Input label="Postcode" value={postcode} onChangeText={setPostcode} placeholder="400001" />

      <View className="flex-row items-center justify-between">
        <SectionTitle>Line items *</SectionTitle>
        <Pressable onPress={addLine}>
          <View className="flex-row items-center gap-1">
            <FontAwesome name="plus" size={12} color={Colors.brand.primary} />
            <Text className="text-xs font-semibold text-ink">Add item</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView className="max-h-[220px]" nestedScrollEnabled>
        {lines.map((line, index) => (
          <Card key={index} className="mb-2 gap-1.5" padded>
            <Caption>Product</Caption>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="grow-0 mb-1">
              {products.map((p) => {
                const active = line.productId === p.id
                return (
                  <Pressable
                    key={p.id}
                    className={cn(
                      'border rounded-lg px-2.5 py-1.5 mr-1.5 max-w-[140px]',
                      active ? 'bg-brand-primary border-ink' : 'border-gray-200'
                    )}
                    onPress={() => {
                      const next = [...lines]
                      next[index] = { ...line, productId: p.id }
                      setLines(next)
                    }}
                  >
                    <Text
                      className={cn(
                        'text-xs',
                        active ? 'text-brand-on-primary font-semibold' : 'text-gray-600'
                      )}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>
            <Input
              label="Qty"
              value={line.quantity}
              onChangeText={(quantity) => {
                const next = [...lines]
                next[index] = { ...line, quantity }
                setLines(next)
              }}
              keyboardType="number-pad"
            />
          </Card>
        ))}
      </ScrollView>

      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Delivery instructions"
        multiline
        numberOfLines={2}
        inputClassName="min-h-16"
        style={{ textAlignVertical: 'top' }}
      />
    </FormModal>
  )
}
