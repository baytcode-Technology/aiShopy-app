import { Button } from '@/components/ui/Button'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof Button>

export function AuthButton(props: Props) {
  return <Button {...props} />
}
