import { Input } from '@/components/ui/Input'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof Input>

export function AuthInput(props: Props) {
  return <Input {...props} />
}
