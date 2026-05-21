import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import type { Product } from '@src/types/product'
import { theme } from '@src/theme/colors'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

type Props = {
  product: Product
  currency?: string
  onPress?: () => void
}

export function ProductCard({ product, currency = 'INR', onPress }: Props) {
  const symbol = currency === 'INR' ? '₹' : '$'
  const lowStock = product.track_inventory && product.stock_qty > 0 && product.stock_qty < 10

  const content = (
    <>
      <View style={styles.image}>
        {product.thumbnail_url ? (
          <Image
            source={{ uri: product.thumbnail_url }}
            style={styles.thumbImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.initials}>{initials(product.name)}</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.row}>
        <Text style={styles.price}>
          {symbol}
          {product.base_price}
        </Text>
        <Text style={[styles.stock, lowStock && styles.stockLow]}>
          Stock: {product.stock_qty}
        </Text>
      </View>
    </>
  )

  if (onPress) {
    return (
      <Pressable style={styles.card} onPress={onPress}>
        {content}
      </Pressable>
    )
  }

  return <View style={styles.card}>{content}</View>
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 16,
    padding: 12,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    height: 112,
    borderRadius: 10,
    backgroundColor: theme.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.gray400,
    letterSpacing: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.black,
    marginBottom: 8,
    minHeight: 36,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.black,
    letterSpacing: -0.2,
  },
  stock: {
    fontSize: 11,
    color: theme.gray400,
    fontWeight: '600',
  },
  stockLow: {
    color: '#D97706',
  },
})
