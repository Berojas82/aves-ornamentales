import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { IncubationBirdType, INCUBATION_CYCLES } from '../types';
import { addDays } from 'date-fns';

// NOTE: setNotificationHandler is configured in App.tsx (root level).

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('incubacion', {
      name: '🥚 Incubadora',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('tareas', {
      name: '✅ Tareas del Gallinero',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  return true;
}

export interface IncubationNotificationIds {
  notif7Id: string;
  notif18Id: string;
  notif21Id: string;
}

export async function scheduleIncubationNotifications(
  startDate: Date,
  birdType: IncubationBirdType,
  eggCount: number,
  incubationId?: number
): Promise<IncubationNotificationIds> {
  const totalDays = INCUBATION_CYCLES[birdType];
  const birdName = birdType.charAt(0).toUpperCase() + birdType.slice(1);

  // Day 7 → Ovoscopy
  const day7Date = addDays(startDate, 7);
  day7Date.setHours(9, 0, 0, 0);
  const notif7Id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🔦 Ovoscopia - ${birdName}`,
      body: `Día 7: Revisa la fertilidad de tus ${eggCount} huevos con una linterna. ¡Es el momento ideal!`,
      data: { type: 'incubacion', day: 7, incubationId },
      sound: 'default',
    },
    trigger: {
      channelId: 'incubacion',
      date: day7Date,
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });

  // Day 18 (or totalDays - 3) → Move to hatch tray
  const lockdownDay = Math.max(totalDays - 3, 7);
  const day18Date = addDays(startDate, lockdownDay);
  day18Date.setHours(9, 0, 0, 0);
  const notif18Id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🏠 Bandeja de Nacimiento - ${birdName}`,
      body: `Día ${lockdownDay}: Mueve los huevos a la bandeja de nacimiento y detén el volteo. ¡Preparado para la eclosión!`,
      data: { type: 'incubacion', day: lockdownDay, incubationId },
      sound: 'default',
    },
    trigger: {
      channelId: 'incubacion',
      date: day18Date,
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });

  // Day 21 (totalDays) → Hatch day!
  const hatchDate = addDays(startDate, totalDays);
  hatchDate.setHours(7, 0, 0, 0);
  const notif21Id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🐣 ¡Día de Eclosión! - ${birdName}`,
      body: `Día ${totalDays}: ¡Hoy nacen tus polluelos! Registra cuántos han nacido correctamente.`,
      data: { type: 'incubacion', day: totalDays, incubationId },
      sound: 'default',
    },
    trigger: {
      channelId: 'incubacion',
      date: hatchDate,
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });

  return { notif7Id, notif18Id, notif21Id };
}

export async function cancelIncubationNotifications(
  notif7Id?: string,
  notif18Id?: string,
  notif21Id?: string
): Promise<void> {
  const ids = [notif7Id, notif18Id, notif21Id].filter(Boolean) as string[];
  await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)));
}

export async function scheduleTaskReminder(
  title: string,
  scheduledDate: Date
): Promise<string> {
  const reminderDate = new Date(scheduledDate);
  reminderDate.setHours(8, 0, 0, 0);

  // Only schedule future notifications
  if (reminderDate <= new Date()) return '';

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: `✅ Tarea del Gallinero`,
      body: title,
      sound: 'default',
    },
    trigger: {
      channelId: 'tareas',
      date: reminderDate,
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });
}
