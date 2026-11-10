import { Share } from 'react-native'

export async function shareLink(input: { title: string; url: string }): Promise<void> {
  try {
    await Share.share({
      title: input.title,
      message: input.url,
      url: input.url,
    })
  } catch {
    // The share sheet was dismissed.
  }
}
