import { useCallback, useRef, useState } from 'react'
import { usePreventRemove } from '@react-navigation/native'
import type { NavigationAction } from '@react-navigation/native'
import { useNavigation, useRouter } from 'expo-router'
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog'

type Options = {
  isDirty: boolean
  isLoading?: boolean
  onSave: () => Promise<boolean>
}

export function useUnsavedChangesExit({ isDirty, isLoading = false, onSave }: Options) {
  const router = useRouter()
  const navigation = useNavigation()
  const [visible, setVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const pendingActionRef = useRef<NavigationAction | null>(null)
  const allowExitRef = useRef(false)

  const completeExit = useCallback(() => {
    allowExitRef.current = true
    const action = pendingActionRef.current
    pendingActionRef.current = null
    setVisible(false)

    if (action) {
      navigation.dispatch(action)
      return
    }

    router.back()
  }, [navigation, router])

  usePreventRemove(isDirty && !allowExitRef.current && !isLoading, ({ data }) => {
    pendingActionRef.current = data.action
    setVisible(true)
  })

  const requestBack = useCallback(() => {
    if (isLoading || !isDirty || allowExitRef.current) {
      router.back()
      return
    }

    pendingActionRef.current = null
    setVisible(true)
  }, [isDirty, isLoading, router])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const ok = await onSave()
      if (ok) completeExit()
    } finally {
      setSaving(false)
    }
  }, [completeExit, onSave])

  const dialog = (
    <UnsavedChangesDialog
      visible={visible}
      loading={saving}
      onSave={() => void handleSave()}
      onDiscard={completeExit}
      onCancel={() => {
        pendingActionRef.current = null
        setVisible(false)
      }}
    />
  )

  return { requestBack, dialog }
}
