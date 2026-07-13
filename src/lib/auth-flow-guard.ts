let googleAuthInProgress = false

export function setGoogleAuthFlowInProgress(value: boolean): void {
  googleAuthInProgress = value
}

export function isGoogleAuthFlowInProgress(): boolean {
  return googleAuthInProgress
}
