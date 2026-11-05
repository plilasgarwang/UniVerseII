import AsyncStorage from '@react-native-async-storage/async-storage';
import { LibraryCard } from '../types';

// Keyed per user so two accounts on one phone don't see each other's card.
const key = (uid: string) => `library_card_${uid}`;

export async function loadCard(uid: string): Promise<LibraryCard | null> {
  try {
    const raw = await AsyncStorage.getItem(key(uid));
    return raw ? (JSON.parse(raw) as LibraryCard) : null;
  } catch {
    return null;
  }
}

export async function saveCard(uid: string, card: LibraryCard) {
  await AsyncStorage.setItem(key(uid), JSON.stringify(card));
}

export async function clearCard(uid: string) {
  await AsyncStorage.removeItem(key(uid));
}
