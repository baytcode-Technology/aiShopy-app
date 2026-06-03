import { Input } from '@/components/ui/Input'
import type { ComponentProps } from 'react'
import { useAuthKeyboard } from './auth-keyboard-context'

type Props = ComponentProps<typeof Input>

export function AuthInput({ onFocus, ...props }: Props) {
  const { notifyInputFocus } = useAuthKeyboard()

  return (
    <Input
      {...props}
      onFocus={(e) => {
        onFocus?.(e)
        setTimeout(() => notifyInputFocus(), 320)
      }}
    />
  )
}
