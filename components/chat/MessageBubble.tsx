import { useCallback, useState } from 'react'
import { Linking, Pressable, Text, View } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { BubbleMeta } from '@/components/chat/BubbleMeta'
import { ChatImageBubble } from '@/components/chat/ChatImageBubble'
import { ChatMediaViewerModal } from '@/components/chat/ChatMediaViewerModal'
import { ChatVideoBubble } from '@/components/chat/ChatVideoBubble'
import { ChatVoiceBubble } from '@/components/chat/ChatVoiceBubble'
import { cn } from '@src/lib/cn'
import { FormattedMessageText } from '@src/lib/parse-inline-markdown'
import { showError } from '@src/lib/toast'
import { getWhatsAppMediaAuthHeaders } from '@src/lib/whatsapp-media'
import type { ChatMessage } from '@src/types/chat'
import Colors from '@src/theme/colors'

type Props = {
  message: ChatMessage
  storeId?: number
  onLongPress?: (message: ChatMessage) => void
  onForward?: (message: ChatMessage) => void
}

function WhatsAppDocumentBubble({ uri, label }: { uri: string; label: string }) {
  const openDocument = useCallback(async () => {
    try {
      const headers = await getWhatsAppMediaAuthHeaders()
      const ext = label.includes('.') ? label.split('.').pop() : 'bin'
      const fileUri = `${FileSystem.cacheDirectory}wa-doc-${Date.now()}.${ext}`
      const result = await FileSystem.downloadAsync(uri, fileUri, { headers })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri)
      } else {
        await Linking.openURL(result.uri)
      }
    } catch (e: unknown) {
      showError('Failed to open document', e instanceof Error ? e.message : 'Unknown error')
    }
  }, [label, uri])

  return (
    <Pressable className="flex-row items-center gap-3 min-w-[200px]" onPress={() => void openDocument()}>
      <View className="w-9 h-9 rounded-lg bg-brand-primary/15 items-center justify-center">
        <FontAwesome name="file-text-o" size={16} color={Colors.brand.primary} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-[15px] text-ink font-medium" numberOfLines={2}>
          {label}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">Tap to open</Text>
      </View>
    </Pressable>
  )
}

function TextBubbleContent({ message, outgoing }: { message: ChatMessage; outgoing: boolean }) {
  if (outgoing) {
    return (
      <Text className={cn('text-[15px] leading-[21px]', 'text-brand-on-primary')}>
        {message.text}
      </Text>
    )
  }

  return (
    <FormattedMessageText
      text={message.text}
      className="text-[15px] leading-[21px] text-ink"
    />
  )
}

function ReactionBadge({ reactions, outgoing }: { reactions: string[]; outgoing: boolean }) {
  return (
    <View className={cn('absolute -bottom-3 z-10', outgoing ? 'right-3' : 'left-3')}>
      <View className="rounded-full bg-surface border border-gray-200 px-2 py-0.5 shadow-sm min-w-[28px] items-center">
        <Text className="text-[15px] leading-[18px]">{reactions.join('')}</Text>
      </View>
    </View>
  )
}

function ForwardIconButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="w-9 h-9 rounded-full bg-black/60 items-center justify-center mb-1"
      accessibilityLabel="Forward message"
    >
      <FontAwesome name="angle-double-right" size={16} color="#ffffff" />
    </Pressable>
  )
}

export function MessageBubble({ message, storeId, onLongPress, onForward }: Props) {
  const outgoing = message.outgoing
  const type = message.type ?? 'text'
  const mediaUrl = message.mediaUrl
  const showMedia = Boolean(mediaUrl && storeId)
  const isMediaMessage =
    showMedia && ['image', 'sticker', 'video', 'audio', 'document'].includes(type)
  const hasReactions = Boolean(message.reactions?.length)
  const showForwardIcon = Boolean(onForward && ['image', 'sticker', 'video'].includes(type))
  const [viewerMode, setViewerMode] = useState<'image' | 'video' | null>(null)

  const handleLongPress = () => onLongPress?.(message)
  const handleForward = () => onForward?.(message)

  const bubbleBody = (
    <View className="relative">
      <View
        className={cn(
          'rounded-2xl gap-1.5 overflow-hidden',
          isMediaMessage ? 'p-1' : 'px-3.5 py-2.5',
          outgoing ? 'bg-brand-primary' : 'bg-surface border border-gray-200',
        )}
      >
        {showMedia && (type === 'image' || type === 'sticker') ? (
          <View>
            <ChatImageBubble
              uri={mediaUrl!}
              variant={type === 'sticker' ? 'sticker' : 'image'}
              onPress={type === 'image' ? () => setViewerMode('image') : undefined}
              onLongPress={handleLongPress}
            />
            {message.caption ? (
              <View className="px-2.5 pt-1.5 pb-1">
                {outgoing ? (
                  <Text className="text-[15px] leading-[21px] text-brand-on-primary">
                    {message.caption}
                  </Text>
                ) : (
                  <FormattedMessageText
                    text={message.caption}
                    className="text-[15px] leading-[21px] text-ink"
                  />
                )}
              </View>
            ) : null}
            <View className="px-2.5 pb-1">
              <BubbleMeta message={message} outgoing={outgoing} overlay={type === 'image'} />
            </View>
          </View>
        ) : showMedia && type === 'video' ? (
          <>
            <ChatVideoBubble
              uri={mediaUrl!}
              onPress={() => setViewerMode('video')}
              onLongPress={handleLongPress}
            />
            {message.caption ? (
              <View className="px-2.5 pt-1">
                <FormattedMessageText
                  text={message.caption}
                  className={cn(
                    'text-[15px] leading-[21px]',
                    outgoing ? 'text-brand-on-primary' : 'text-ink',
                  )}
                />
              </View>
            ) : null}
            <View className="px-2.5 pb-1">
              <BubbleMeta message={message} outgoing={outgoing} />
            </View>
          </>
        ) : showMedia && type === 'audio' ? (
          <>
            <View className="px-2.5 pt-1.5">
              <ChatVoiceBubble
                messageId={String(message.clientKey ?? message.id)}
                uri={mediaUrl!}
                outgoing={outgoing}
              />
            </View>
            <View className="px-2.5 pb-1">
              <BubbleMeta message={message} outgoing={outgoing} />
            </View>
          </>
        ) : showMedia && type === 'document' ? (
          <>
            <View className="px-2.5 pt-1.5">
              <WhatsAppDocumentBubble uri={mediaUrl!} label={message.caption || message.text} />
            </View>
            <View className="px-2.5 pb-1">
              <BubbleMeta message={message} outgoing={outgoing} />
            </View>
          </>
        ) : (
          <>
            <TextBubbleContent message={message} outgoing={outgoing} />
            <BubbleMeta message={message} outgoing={outgoing} />
          </>
        )}
      </View>

      {hasReactions ? (
        <ReactionBadge reactions={message.reactions!} outgoing={outgoing} />
      ) : null}
    </View>
  )

  return (
    <>
      {showForwardIcon ? (
        <View
          className={cn(
            'max-w-[88%]',
            hasReactions ? 'mb-5' : 'mb-3',
            outgoing ? 'self-end' : 'self-start',
          )}
        >
          <View
            className={cn(
              'flex-row items-end gap-2',
              outgoing ? 'justify-end' : 'justify-start',
            )}
          >
            {outgoing ? <ForwardIconButton onPress={handleForward} /> : null}
            <View className="max-w-[82%] shrink">{bubbleBody}</View>
            {!outgoing ? <ForwardIconButton onPress={handleForward} /> : null}
          </View>
        </View>
      ) : (
        <Pressable
          className={cn(
            'max-w-[82%]',
            hasReactions ? 'mb-5' : 'mb-3',
            outgoing ? 'self-end' : 'self-start',
          )}
          onLongPress={handleLongPress}
          delayLongPress={350}
        >
          {bubbleBody}
        </Pressable>
      )}

      <ChatMediaViewerModal
        visible={viewerMode !== null}
        mode={viewerMode}
        uri={mediaUrl ?? null}
        onClose={() => setViewerMode(null)}
      />
    </>
  )
}
