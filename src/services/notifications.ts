import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Show notifications as banners even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Asks for permission, gets this device's Expo push token and stores it on the
 * user's Firestore document so other users' publish actions can reach it.
 * Returns null on simulators, web, or when permission is denied.
 */
export async function registerForPushNotificationsAsync(uid: string): Promise<string | null> {
  if (Platform.OS === 'web' || !Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Campus notices',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#6C5CE7',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return null;

  const projectId =
    (Constants.expoConfig?.extra as any)?.eas?.projectId ??
    (Constants as any).easConfig?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  const token = (
    await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
  ).data;

  await updateDoc(doc(db, 'users', uid), { pushToken: token });
  return token;
}

/**
 * Sends a push notification to every registered device except the sender's,
 * through Expo's push service. (A production app would do this from a Cloud
 * Function; calling it from the client keeps this project backend-free.)
 */
export async function sendPushToEveryone(title: string, body: string, excludeUid?: string) {
  const snap = await getDocs(collection(db, 'users'));
  const tokens: string[] = [];
  snap.forEach((d) => {
    const data = d.data();
    if (d.id !== excludeUid && typeof data.pushToken === 'string') tokens.push(data.pushToken);
  });
  if (tokens.length === 0) return;

  // Expo accepts batches of up to 100 messages per request.
  for (let i = 0; i < tokens.length; i += 100) {
    const batch = tokens.slice(i, i + 100).map((to) => ({
      to,
      title,
      body: body.length > 120 ? body.slice(0, 117) + '...' : body,
      sound: 'default',
      channelId: 'default',
    }));
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
  }
}
