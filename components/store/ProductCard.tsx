import { Image, StyleSheet, Text, View } from 'react-native'
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
}

export function ProductCard({ product, currency = 'INR' }: Props) {
  const symbol = currency === 'INR' ? '₹' : '$'
  const lowStock = product.track_inventory && product.stock_qty > 0 && product.stock_qty < 10

  return (
    <View style={styles.card}>
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
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 12,
    padding: 12,
    margin: 6,
  },
  image: {
    height: 100,
    borderRadius: 8,
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
    fontSize: 28,
    fontWeight: '700',
    color: theme.gray400,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.black,
    marginBottom: 8,
    minHeight: 36,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.black,
  },
  stock: {
    fontSize: 11,
    color: theme.gray600,
  },
  stockLow: {
    color: '#B45309',
  },
})
