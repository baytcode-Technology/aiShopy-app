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

/** Large screen titles (catalog, hero sections). */
export function Title({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn('text-[32px] font-extrabold text-ink tracking-tight leading-tight', className)}
      {...props}
    />
  )
}

export function Subtitle({ className, ...props }: TypographyProps) {
  return (
    <Text className={cn('text-base text-gray-500 leading-6 font-medium', className)} {...props} />
  )
}

export function Body({ className, ...props }: TypographyProps) {
  return <Text className={cn('text-[15px] text-gray-600 leading-6', className)} {...props} />
}

export function Label({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn(
        'text-[11px] font-bold text-gray-500 uppercase tracking-[0.12em] pl-0.5',
        className
      )}
      {...props}
    />
  )
}

export function SectionTitle({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn('text-xs font-bold text-gray-400 uppercase tracking-[0.2em]', className)}
      {...props}
    />
  )
}

export function Caption({ className, ...props }: TypographyProps) {
  return <Text className={cn('text-xs text-gray-500 font-medium', className)} {...props} />
}

export function Muted({ className, ...props }: TypographyProps) {
  return <Text className={cn('text-sm text-gray-500', className)} {...props} />
}

export function LinkText({ className, ...props }: TypographyProps) {
  return (
    <Text className={cn('text-sm font-bold text-ink underline underline-offset-2', className)} {...props} />
  )
}

export function DisplayBrand({ className, ...props }: TypographyProps) {
  return (
    <Text
      className={cn('text-xs font-bold text-ink uppercase tracking-brand', className)}
      {...props}
    />
  )
}
