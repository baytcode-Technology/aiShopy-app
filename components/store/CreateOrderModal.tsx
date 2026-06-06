import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Button } from '@/components/ui/Button'
import { SleekModal } from '@/components/ui/Modal'
import { OrderCartLine } from '@/components/store/order-create/OrderCartLine'
import { OrderCustomerPickerModal } from '@/components/store/order-create/OrderCustomerPickerModal'
import { OrderProductPickerModal } from '@/components/store/order-create/OrderProductPickerModal'
import { OrderVariantPickerModal } from '@/components/store/order-create/OrderVariantPickerModal'
import {
  cartLineKey,
  type CartLine,
  unitPrice,
} from '@/components/store/order-create/types'
import { createOrder } from '@src/api/orders'
import { fetchProduct, fetchProducts } from '@src/api/products'
import { customerDisplayName, customerDisplayPhone } from '@src/lib/customer-display'
import { formatMoney } from '@src/lib/format-money'
import { getProductStatus } from '@src/lib/product-status'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Customer } from '@src/types/customer'
import type { Product, ProductVariant } from '@src/types/product'

type Props = {
  visible: boolean
  storeId: string
  currency?: string
  onClose: () => void
  onCreated: () => void
}

export function CreateOrderModal({ visible, storeId, currency, onClose, onCreated }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [cart, setCart] = useState<CartLine[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const [productPickerOpen, setProductPickerOpen] = useState(false)
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false)
  const [variantPickerOpen, setVariantPickerOpen] = useState(false)
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null)
  const [pendingVariants, setPendingVariants] = useState<ProductVariant[]>([])
  const [variantsLoading, setVariantsLoading] = useState(false)

  useEffect(() => {
    if (!visible || !storeId) return
    setProductsLoading(true)
    fetchProducts(storeId)
      .then((res) =>
        setProducts(res.data.products.filter((p) => getProductStatus(p) === 'active'))
      )
      .catch((e) => showError(e))
      .finally(() => setProductsLoading(false))
  }, [visible, storeId])

  const reset = useCallback(() => {
    setCart([])
    setCustomer(null)
    setProductPickerOpen(false)
    setCustomerPickerOpen(false)
    setVariantPickerOpen(false)
    setPendingProduct(null)
    setPendingVariants([])
  }, [])

  const handleClose = () => {
    reset()
    onClose()
  }

  const addToCart = (product: Product, variant: ProductVariant | null) => {
    const key = cartLineKey(product.id, variant?.id ?? null)
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key)
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + 1 } : l
        )
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          variantId: variant?.id ?? null,
          quantity: 1,
          product,
          variant,
        },
      ]
    })
    setProductPickerOpen(false)
    setVariantPickerOpen(false)
    setPendingProduct(null)
    setPendingVariants([])
  }

  const handleProductSelect = async (product: Product) => {
    setPendingProduct(product)
    setVariantsLoading(true)
    try {
      const res = await fetchProduct(product.id, storeId)
      const active = res.data.variants.filter((v) => v.is_active)
      if (active.length > 0) {
        setPendingVariants(active)
        setProductPickerOpen(false)
        requestAnimationFrame(() => setVariantPickerOpen(true))
      } else {
        addToCart(product, null)
      }
    } catch (e) {
      showError(e, 'Could not load product')
      setPendingProduct(null)
    } finally {
      setVariantsLoading(false)
    }
  }

  const updateQuantity = (key: string, quantity: number) => {
    setCart((prev) =>
      prev.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, quantity) } : l))
    )
  }

  const removeLine = (key: string) => {
    setCart((prev) => prev.filter((l) => l.key !== key))
  }

  const subtotal = useMemo(
    () => cart.reduce((sum, l) => sum + unitPrice(l.product, l.variant) * l.quantity, 0),
    [cart]
  )

  const taxAmount = 0
  const total = subtotal

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showError('Add at least one item')
      return
    }

    const items = cart.map((l) => ({
      product_id: l.productId,
      quantity: l.quantity,
      ...(l.variantId ? { variant_id: l.variantId } : {}),
    }))

    const phone = customer ? customerDisplayPhone(customer) : null
    const name = customer?.name?.trim()

    setCheckoutLoading(true)
    try {
      await createOrder({
        store_id: storeId,
        items,
        payment_method: 'cod',
        ...(customer ? { customer_id: customer.id } : {}),
        ...(phone && phone.length >= 8 ? { whatsapp_number: phone } : {}),
        ...(name ? { name } : {}),
        ...(name || phone
          ? {
              shipping_address: {
                ...(name ? { name } : {}),
                ...(phone ? { phone_number: phone, whatsapp_number: phone } : {}),
              },
            }
          : {}),
      })
      reset()
      onCreated()
      onClose()
      showSuccess(customer ? 'Order created' : 'Walk-in order created')
    } catch (e) {
      showError(e)
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <>
      <SleekModal
        isOpen={visible}
        onClose={handleClose}
        title="Create order"
        minHeightRatio={0.5}
        maxHeightRatio={0.8}
        footer={
          <Button
            label={`Checkout · ${formatMoney(total, currency)}`}
            loading={checkoutLoading}
            disabled={cart.length === 0}
            onPress={handleCheckout}
            size="lg"
            className="bg-ink border-ink"
          />
        }
      >
        <Pressable
          className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 bg-surface active:opacity-80"
          onPress={() => setProductPickerOpen(true)}
        >
          <Text className="text-lg text-ink">+</Text>
          <Text className="text-[15px] font-semibold text-ink">Add item</Text>
        </Pressable>

        <View className="flex-row gap-2">
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 active:opacity-80"
            onPress={() => setCustomerPickerOpen(true)}
          >
            <FontAwesome name="user-o" size={14} color={Colors.text.primary} />
            <Text className="text-[14px] font-semibold text-ink">Add customer</Text>
          </Pressable>
        </View>

        {customer ? (
          <View className="flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <Pressable
              className="flex-1 min-w-0 active:opacity-80"
              onPress={() => setCustomerPickerOpen(true)}
            >
              <Text className="text-[14px] font-semibold text-ink" numberOfLines={1}>
                {customerDisplayName(customer)}
              </Text>
              {customerDisplayPhone(customer) || customer.email ? (
                <Text className="text-[13px] text-gray-500 mt-0.5" numberOfLines={1}>
                  {customerDisplayPhone(customer) ?? customer.email}
                </Text>
              ) : null}
            </Pressable>
            <Pressable onPress={() => setCustomer(null)} hitSlop={8} className="p-1">
              <Text className="text-sm text-gray-400 font-bold">✕</Text>
            </Pressable>
          </View>
        ) : null}

        {cart.length > 0 ? (
          <View className="gap-0">
            {cart.map((line) => (
              <OrderCartLine
                key={line.key}
                line={line}
                currency={currency}
                onQuantityChange={(q) => updateQuantity(line.key, q)}
                onRemove={() => removeLine(line.key)}
              />
            ))}

            <View className="border-t border-gray-200 pt-4 mt-1 gap-2">
              <View className="flex-row justify-between">
                <Text className="text-[14px] text-gray-500">Items total</Text>
                <Text className="text-[14px] text-ink">{formatMoney(subtotal, currency)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-[14px] text-gray-500">Subtotal (incl. tax)</Text>
                <Text className="text-[14px] text-ink">{formatMoney(subtotal, currency)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-[14px] text-gray-500">Tax (0%)</Text>
                <Text className="text-[14px] text-ink">{formatMoney(taxAmount, currency)}</Text>
              </View>
              <View className="flex-row justify-between border-t border-gray-200 pt-3 mt-1">
                <Text className="text-[16px] font-bold text-ink">Total</Text>
                <Text className="text-[16px] font-bold text-ink">
                  {formatMoney(total, currency)}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text className="text-center text-gray-400 text-[14px] py-6">
            Add items to start building this order
          </Text>
        )}
      </SleekModal>

      <OrderProductPickerModal
        visible={productPickerOpen}
        products={products}
        loading={productsLoading}
        currency={currency}
        onClose={() => setProductPickerOpen(false)}
        onSelectProduct={handleProductSelect}
      />

      <OrderVariantPickerModal
        visible={variantPickerOpen}
        product={pendingProduct}
        variants={pendingVariants}
        loading={variantsLoading}
        currency={currency}
        onClose={() => {
          setVariantPickerOpen(false)
          setPendingProduct(null)
          setPendingVariants([])
          setProductPickerOpen(true)
        }}
        onSelectVariant={(variant) => {
          if (pendingProduct) addToCart(pendingProduct, variant)
        }}
      />

      <OrderCustomerPickerModal
        visible={customerPickerOpen}
        storeId={storeId}
        selectedCustomerId={customer?.id ?? null}
        onClose={() => setCustomerPickerOpen(false)}
        onSelectCustomer={setCustomer}
      />
    </>
  )
}
