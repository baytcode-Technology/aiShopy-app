import { ReactNode } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { theme } from '@src/theme/colors'

type Props = {
  visible: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function FormModal({ visible, title, onClose, children, footer }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <KeyboardAvoidingView
          style={styles.sheetWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrap: {
    maxHeight: '88%',
  },
  sheet: {
    backgroundColor: theme.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.black,
    maxHeight: '100%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.gray200,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.black,
  },
  close: {
    fontSize: 20,
    color: theme.black,
    fontWeight: '600',
  },
  scroll: {
    maxHeight: 560,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: theme.gray200,
  },
})
