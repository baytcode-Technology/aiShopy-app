import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Caption, LinkText, Muted } from '@/components/ui/Typography'
import { deleteAccount } from '@src/api/auth'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { performSignOut } from '@src/lib/safe-sign-out'
import { showError } from '@src/lib/toast'

type Props = {
  storeName?: string | null
  /** Card is for Settings. Link is a quiet footer action on Create store. */
  variant?: 'card' | 'link'
}

export function DeleteAccountSection({ storeName, variant = 'card' }: Props) {
  const { signOut, user } = useAuth()
  const { clearStore, store, role, stores } = useStore()
  const [step, setStep] = useState<'closed' | 'warn' | 'confirm'>('closed')
  const [deleting, setDeleting] = useState(false)

  const ownedStoreNames = useMemo(() => {
    const names = stores
      .filter((item) => item.role === 'owner')
      .map((item) => item.store.name)

    const ownsCurrentStore =
      role === 'owner' ||
      (Boolean(user?.id) && Boolean(store?.owner_id) && store?.owner_id === user?.id)

    if (ownsCurrentStore) {
      const currentName = store?.name ?? storeName
      if (currentName && !names.includes(currentName)) {
        names.push(currentName)
      }
    }

    return names
  }, [stores, role, store?.name, store?.owner_id, storeName, user?.id])

  const deletesOwnedStores = ownedStoreNames.length > 0

  const cardDescription = deletesOwnedStores
    ? 'Permanently delete your account and all stores you own. This action cannot be reversed.'
    : 'Permanently delete your AiShopy account. Stores you access as staff are not deleted.'

  const warnMessage = deletesOwnedStores
    ? ownedStoreNames.length === 1
      ? `Your store “${ownedStoreNames[0]}” and all its products, orders, and messages will be permanently deleted. This also removes your AiShopy account and cannot be undone.`
      : `This permanently deletes your AiShopy account and all ${ownedStoreNames.length} stores you own (including products, orders, and messages). Staff access to other people’s stores is removed. This cannot be undone.`
    : 'This permanently removes your AiShopy account and your staff access to any stores. Stores you work in as staff are not deleted. This cannot be undone.'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      await performSignOut(clearStore, signOut)
    } catch (e) {
      showError(e, 'Could not delete account')
      setDeleting(false)
      setStep('closed')
    }
  }

  const trigger =
    variant === 'link' ? (
      <Pressable onPress={() => setStep('warn')} hitSlop={8} className="items-center py-1">
        <LinkText className="text-[14px] font-semibold no-underline">Delete account</LinkText>
      </Pressable>
    ) : (
      <View className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 gap-3">
        <View className="flex-row items-start gap-3">
          <View className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 items-center justify-center mt-0.5">
            <FontAwesome name="exclamation-triangle" size={16} color="#E11D48" />
          </View>
          <View className="flex-1 gap-1">
            <Caption className="text-[10px] uppercase tracking-widest text-rose-700">
              Danger zone
            </Caption>
            <Muted className="text-[14px] leading-5 text-rose-950">
              {cardDescription}
            </Muted>
          </View>
        </View>

        <Button
          label="Delete account"
          variant="outline"
          onPress={() => setStep('warn')}
          className="border-rose-300 bg-white"
          labelClassName="text-rose-700"
        />
      </View>
    )

  return (
    <>
      {trigger}

      <ConfirmDialog
        visible={step === 'warn'}
        tone="danger"
        title="Delete account?"
        message={warnMessage}
        confirmLabel="Continue"
        confirmVariant="danger"
        onConfirm={() => setStep('confirm')}
        onCancel={() => setStep('closed')}
      />

      <ConfirmDialog
        visible={step === 'confirm'}
        tone="danger"
        title="Delete forever?"
        message={
          deletesOwnedStores
            ? 'All account data and stores you own will be permanently removed. You will be signed out immediately.'
            : 'Your account and staff access will be permanently removed. Stores you work in as staff are not deleted. You will be signed out immediately.'
        }
        confirmLabel="Delete account"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) setStep('closed')
        }}
      />
    </>
  )
}
