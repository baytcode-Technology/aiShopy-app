import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'

type ActivePlayer = {
  messageId: string
  pause: () => Promise<void>
}

type ChatVoicePlayerContextValue = {
  requestPlay: (messageId: string, pauseSelf: () => Promise<void>) => Promise<void>
  release: (messageId: string) => void
  isActive: (messageId: string) => boolean
}

const ChatVoicePlayerContext = createContext<ChatVoicePlayerContextValue | null>(null)

export function ChatVoicePlayerProvider({ children }: { children: ReactNode }) {
  const activeRef = useRef<ActivePlayer | null>(null)

  const release = useCallback((messageId: string) => {
    if (activeRef.current?.messageId === messageId) {
      activeRef.current = null
    }
  }, [])

  const requestPlay = useCallback(async (messageId: string, pauseSelf: () => Promise<void>) => {
    const current = activeRef.current
    if (current && current.messageId !== messageId) {
      await current.pause()
    }
    activeRef.current = { messageId, pause: pauseSelf }
  }, [])

  const isActive = useCallback((messageId: string) => {
    return activeRef.current?.messageId === messageId
  }, [])

  useEffect(() => {
    return () => {
      const current = activeRef.current
      if (current) {
        void current.pause()
        activeRef.current = null
      }
    }
  }, [])

  const value = useMemo(
    () => ({
      requestPlay,
      release,
      isActive,
    }),
    [requestPlay, release, isActive],
  )

  return (
    <ChatVoicePlayerContext.Provider value={value}>{children}</ChatVoicePlayerContext.Provider>
  )
}

export function useChatVoicePlayer() {
  const ctx = useContext(ChatVoicePlayerContext)
  if (!ctx) {
    throw new Error('useChatVoicePlayer must be used within ChatVoicePlayerProvider')
  }
  return ctx
}
