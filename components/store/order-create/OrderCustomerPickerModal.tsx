import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { SleekModal } from '@/components/ui/Modal'
import { Caption } from '@/components/ui/Typography'
import { fetchCustomers } from '@src/api/customers'
import { customerDisplayName, customerDisplayPhone } from '@src/lib/customer-display'
import { showError } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Customer } from '@src/types/customer'
import { OrderSearchBar } from './OrderSearchBar'
import { OrderNewCustomerModal } from './OrderNewCustomerModal'

type Props = {
  visible: boolean
  storeId: number
  selectedCustomerId: number | null
  onClose: () => void
  onSelectCustomer: (customer: Customer) => void
}

export function OrderCustomerPickerModal({
  visible,
  storeId,
  selectedCustomerId,
  onClose,
  onSelectCustomer,
}: Props) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [newOpen, setNewOpen] = useState(false)

  useEffect(() => {
    if (!visible || !storeId) return
    setLoading(true)
    fetchCustomers(storeId)
      .then((res) => setCustomers(res.data.customers))
      .catch((e) => showError(e, 'Could not load customers'))
      .finally(() => setLoading(false))
  }, [visible, storeId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => {
      const name = c.name?.toLowerCase() ?? ''
      const email = c.email?.toLowerCase() ?? ''
      const phone = customerDisplayPhone(c)?.toLowerCase() ?? ''
      return name.includes(q) || email.includes(q) || phone.includes(q)
    })
  }, [customers, search])

  const handleCreated = (customer: Customer) => {
    setCustomers((prev) => [customer, ...prev])
    onSelectCustomer(customer)
    onClose()
  }

  return (
    <>
      <SleekModal
        isOpen={visible}
        onClose={onClose}
        title="Customer"
        scrollClassName="max-h-[70%]"
      >
        <OrderSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, phone, or email"
        />

        <Pressable
          className="flex-row items-center gap-3 py-3 active:opacity-80"
          onPress={() => setNewOpen(true)}
        >
          <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
            <FontAwesome name="plus" size={14} color="#2563EB" />
          </View>
          <Text className="text-[15px] font-semibold text-ink">Add new customer</Text>
        </Pressable>

        {loading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color={Colors.brand.primary} />
          </View>
        ) : (
          <>
            <Caption className="text-gray-400 uppercase tracking-wide">
              {customers.length > 0 ? 'Customers' : 'No customers yet'}
            </Caption>
            <ScrollView className="max-h-[360px]" nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {filtered.map((customer) => {
                const phone = customerDisplayPhone(customer)
                const selected = selectedCustomerId === customer.id
                return (
                  <Pressable
                    key={customer.id}
                    className={`rounded-2xl px-4 py-3.5 mb-2 border ${
                      selected ? 'border-ink bg-gray-50' : 'border-gray-200 bg-gray-50/60'
                    } active:opacity-80`}
                    onPress={() => {
                      onSelectCustomer(customer)
                      onClose()
                    }}
                  >
                    <Text className="text-[15px] font-semibold text-ink">
                      {customerDisplayName(customer)}
                    </Text>
                    {phone ? (
                      <Text className="text-[13px] text-gray-500 mt-0.5">{phone}</Text>
                    ) : customer.email ? (
                      <Text className="text-[13px] text-gray-500 mt-0.5">{customer.email}</Text>
                    ) : null}
                  </Pressable>
                )
              })}
            </ScrollView>
          </>
        )}
      </SleekModal>

      <OrderNewCustomerModal
        visible={newOpen}
        storeId={storeId}
        onClose={() => setNewOpen(false)}
        onCreated={handleCreated}
      />
    </>
  )
}
