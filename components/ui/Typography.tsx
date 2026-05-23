import { Text, type TextProps } from 'react-native'
import { cn } from '@src/lib/cn'

type TypographyProps = TextProps & {
  className?: string
}

export function Heading({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn('text-2xl font-extrabold text-ink tracking-tight', className)}
      {...props}
    />
  )
}

export function Subtitle({ className, ...props }: TypographyProps) {
  return (
    <Text className={cn('text-base text-gray-600 leading-6', className)} {...props} />
  )
}

export function Body({ className, ...props }: TypographyProps) {
  return <Text className={cn('text-[15px] text-gray-600 leading-6', className)} {...props} />
}

export function Label({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn(
        'text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-1',
        className
      )}
      {...props}
    />
  )
}

export function SectionTitle({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn('text-[13px] font-extrabold text-ink uppercase tracking-wider', className)}
      {...props}
    />
  )
}

export function Caption({ className, ...props }: TypographyProps) {
  return <Text className={cn('text-xs text-gray-400 font-semibold', className)} {...props} />
}

export function Muted({ className, ...props }: TypographyProps) {
  return <Text className={cn('text-sm text-gray-600', className)} {...props} />
}

export function LinkText({ className, ...props }: TypographyProps) {
  return (
    <Text className={cn('text-sm font-bold text-ink underline', className)} {...props} />
  )
}
