import { useState } from 'react'
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
  const { signOut } = useAuth()
  const { clearStore } = useStore()
  const [step, setStep] = useState<'closed' | 'warn' | 'confirm'>('closed')
  const [deleting, setDeleting] = useState(false)

  const warnMessage = storeName
    ? `Your store “${storeName}” and all its products, orders, and messages will be permanently deleted. This also removes your AiShopy account and cannot be undone.`
    : 'This permanently removes your AiShopy account and all associated data. This cannot be undone.'

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
              Permanently delete your account and all store data. This action cannot be reversed.
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
        message="All account data will be permanently removed. You will be signed out immediately."
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
