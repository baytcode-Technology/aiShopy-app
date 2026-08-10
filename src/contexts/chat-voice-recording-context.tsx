import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Audio } from 'expo-av'

export type VoiceRecordingStatus = 'recording' | 'paused'

export type VoiceRecordingSessionView = {
  conversationId: number
  status: VoiceRecordingStatus
  seconds: number
}

type VoiceRecordingSession = VoiceRecordingSessionView & {
  recording: Audio.Recording
}

type ChatVoiceRecordingContextValue = {
  session: VoiceRecordingSessionView | null
  getSession: (conversationId: number) => VoiceRecordingSessionView | null
  startRecording: (conversationId: number) => Promise<void>
  pauseRecording: (conversationId: number) => Promise<void>
  resumeRecording: (conversationId: number) => Promise<void>
  cancelRecording: (conversationId: number) => Promise<void>
  finishRecording: (conversationId: number) => Promise<string | null>
}

const ChatVoiceRecordingContext = createContext<ChatVoiceRecordingContextValue | null>(null)

async function releaseMic(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    })
  } catch {
    // ignore
  }
}

export function ChatVoiceRecordingProvider({ children }: { children: ReactNode }) {
  const sessionRef = useRef<VoiceRecordingSession | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [session, setSession] = useState<VoiceRecordingSessionView | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      const current = sessionRef.current
      if (!current || current.status !== 'recording') return
      const nextSeconds = current.seconds + 1
      sessionRef.current = { ...current, seconds: nextSeconds }
      setSession({
        conversationId: current.conversationId,
        status: current.status,
        seconds: nextSeconds,
      })
    }, 1000)
  }, [stopTimer])

  const syncSessionState = useCallback((next: VoiceRecordingSession | null) => {
    sessionRef.current = next
    setSession(
      next
        ? {
            conversationId: next.conversationId,
            status: next.status,
            seconds: next.seconds,
          }
        : null,
    )
  }, [])

  const clearSession = useCallback(async () => {
    stopTimer()
    const current = sessionRef.current
    sessionRef.current = null
    setSession(null)
    if (!current) return
    try {
      await current.recording.stopAndUnloadAsync()
    } catch {
      // ignore
    }
    await releaseMic()
  }, [stopTimer])

  const cancelRecording = useCallback(
    async (conversationId: number) => {
      const current = sessionRef.current
      if (!current || current.conversationId !== conversationId) return
      await clearSession()
    },
    [clearSession],
  )

  const startRecording = useCallback(
    async (conversationId: number) => {
      const existing = sessionRef.current
      if (existing?.conversationId === conversationId && existing.status === 'recording') {
        return
      }
      if (existing) {
        await clearSession()
      }

      const permission = await Audio.requestPermissionsAsync()
      if (!permission.granted) {
        throw new Error('Microphone permission denied')
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      await recording.startAsync()

      const next: VoiceRecordingSession = {
        conversationId,
        recording,
        status: 'recording',
        seconds: 0,
      }
      syncSessionState(next)
      startTimer()
    },
    [clearSession, startTimer, syncSessionState],
  )

  const pauseRecording = useCallback(
    async (conversationId: number) => {
      const current = sessionRef.current
      if (!current || current.conversationId !== conversationId) return
      if (current.status === 'paused') return

      stopTimer()
      try {
        await current.recording.pauseAsync()
      } catch {
        // If pause fails, keep recording state but stop timer to avoid drift
      }

      const next: VoiceRecordingSession = {
        ...current,
        status: 'paused',
      }
      syncSessionState(next)
    },
    [stopTimer, syncSessionState],
  )

  const resumeRecording = useCallback(
    async (conversationId: number) => {
      const current = sessionRef.current
      if (!current || current.conversationId !== conversationId) return
      if (current.status !== 'paused') return

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      await current.recording.startAsync()
      const next: VoiceRecordingSession = {
        ...current,
        status: 'recording',
      }
      syncSessionState(next)
      startTimer()
    },
    [startTimer, syncSessionState],
  )

  const finishRecording = useCallback(
    async (conversationId: number) => {
      const current = sessionRef.current
      if (!current || current.conversationId !== conversationId) return null

      stopTimer()
      const recording = current.recording
      sessionRef.current = null
      setSession(null)

      try {
        if (current.status === 'paused') {
          await recording.startAsync()
        }
        const uri = recording.getURI()
        await recording.stopAndUnloadAsync()
        await releaseMic()
        return uri
      } catch {
        await releaseMic()
        return null
      }
    },
    [stopTimer],
  )

  const getSession = useCallback((conversationId: number) => {
    const current = sessionRef.current
    if (!current || current.conversationId !== conversationId) return null
    return {
      conversationId: current.conversationId,
      status: current.status,
      seconds: current.seconds,
    }
  }, [])

  useEffect(() => {
    return () => {
      void clearSession()
    }
  }, [clearSession])

  const value = useMemo(
    () => ({
      session,
      getSession,
      startRecording,
      pauseRecording,
      resumeRecording,
      cancelRecording,
      finishRecording,
    }),
    [
      session,
      getSession,
      startRecording,
      pauseRecording,
      resumeRecording,
      cancelRecording,
      finishRecording,
    ],
  )

  return (
    <ChatVoiceRecordingContext.Provider value={value}>
      {children}
    </ChatVoiceRecordingContext.Provider>
  )
}

export function useChatVoiceRecording() {
  const ctx = useContext(ChatVoiceRecordingContext)
  if (!ctx) {
    throw new Error('useChatVoiceRecording must be used within ChatVoiceRecordingProvider')
  }
  return ctx
}
