import { createContext, useContext } from 'react'

type AuthKeyboardContextValue = {
  notifyInputFocus: () => void
}

export const AuthKeyboardContext = createContext<AuthKeyboardContextValue>({
  notifyInputFocus: () => {},
})

export function useAuthKeyboard() {
  return useContext(AuthKeyboardContext)
}
