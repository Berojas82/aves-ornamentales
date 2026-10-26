import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { addIncubation } from '../services/database';
import { scheduleIncubationNotifications, requestNotificationPermissions } from '../services/notifications';
import { INCUBATION_CYCLES, IncubationBirdType } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../theme/colors';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

const BIRD_OPTIONS: { type: IncubationBirdType; label: string; emoji: string; days: number }[] = [
  { type: 'gallina', label: 'Gallina', emoji: '🐔', days: INCUBATION_CYCLES.gallina },
  { type: 'pavo', label: 'Pavo', emoji: '🦃', days: INCUBATION_CYCLES.pavo },
  { type: 'codorniz', label: 'Codorniz', emoji: '🐦', days: INCUBATION_CYCLES.codorniz },
  { type: 'pato', label: 'Pato', emoji: '🦆', days: INCUBATION_CYCLES.pato },
  { type: 'faisán', label: 'Faisán', emoji: '🦚', days: INCUBATION_CYCLES['faisán'] },
  { type: 'paloma', label: 'Paloma', emoji: '🕊️', days: INCUBATION_CYCLES.paloma },
];

interface Props { navigation: any; }

export default function AddIncubationScreen({ navigation }: Props) {
  const [selectedBird, setSelectedBird] = useState<typeof BIRD_OPTIONS[0]>(BIRD_OPTIONS[0]);
  const [eggCount, setEggCount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const startDate = new Date();
  const expectedHatch = addDays(startDate, selectedBird.days);
  const formattedHatch = format(expectedHatch, "d 'de' MMMM 'de' yyyy", { locale: es });

  const day7Date = format(addDays(startDate, 7), "d 'de' MMMM", { locale: es });
  const lockdownDay = Math.max(selectedBird.days - 3, 7);
  const lockdownDate = format(addDays(startDate, lockdownDay), "d 'de' MMMM", { locale: es });

  const handleSave = async () => {
    const count = parseInt(eggCount);
    if (!eggCount || isNaN(count) || count <= 0) {
      Alert.alert('Campo requerido', 'Ingresa el número de huevos (mayor a 0).');
      return;
    }
    if (count > 500) {
      Alert.alert('Número muy alto', 'El máximo permitido es 500 huevos por incubación.');
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const hasPermission = await requestNotificationPermissions();

      let notifIds = { notif7Id: '', notif18Id: '', notif21Id: '' };
      if (hasPermission) {
        notifIds = await scheduleIncubationNotifications(now, selectedBird.type, count);
      }

      await addIncubation({
        birdType: selectedBird.type,
        eggCount: count,
        startDate: now.toISOString(),
        expectedHatchDate: expectedHatch.toISOString(),
        totalDays: selectedBird.days,
        notes: notes || undefined,
        status: 'activa',
        notif7Id: notifIds.notif7Id || undefined,
        notif18Id: notifIds.notif18Id || undefined,
        notif21Id: notifIds.notif21Id || undefined,
        createdAt: now.toISOString(),
      });

      if (!hasPermission) {
        Alert.alert(
          '✅ Incubación guardada',
          'No se pudieron programar las alertas porque no se otorgaron permisos de notificación. Puedes activarlos en Configuración.',
          [{ text: 'Entendido', onPress: () => navigation.goBack() }]
        );
      } else {
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A1040', '#0F1117']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Incubación</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {/* Bird type selector */}
        <Text style={styles.sectionTitle}>🐣 Tipo de Ave</Text>
        <View style={styles.birdGrid}>
          {BIRD_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.type}
              style={[styles.birdCard, selectedBird.type === opt.type && styles.birdCardActive]}
              onPress={() => setSelectedBird(opt)}
              activeOpacity={0.75}
            >
              <Text style={styles.birdEmoji}>{opt.emoji}</Text>
              <Text style={[styles.birdLabel, selectedBird.type === opt.type && styles.birdLabelActive]}>
                {opt.label}
              </Text>
              <Text style={styles.birdDays}>{opt.days} días</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Egg count */}
        <View style={styles.field}>
          <Text style={styles.label}>🥚 Número de Huevos</Text>
          <TextInput
            style={styles.input}
            value={eggCount}
            onChangeText={setEggCount}
            placeholder="Ej: 12"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            returnKeyType="done"
          />
        </View>

        {/* Predicted schedule */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>📅 Calendario Automático</Text>
          <Text style={styles.scheduleSubtitle}>Las alertas se programan ahora en tu dispositivo</Text>

          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleIcon, { backgroundColor: Colors.info + '22' }]}>
              <Text style={styles.scheduleEmoji}>🔦</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>Día 7 — Ovoscopia</Text>
              <Text style={styles.scheduleDate}>{day7Date}</Text>
            </View>
          </View>

          <View style={styles.scheduleLine} />

          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleIcon, { backgroundColor: Colors.warning + '22' }]}>
              <Text style={styles.scheduleEmoji}>🏠</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>Día {lockdownDay} — Bandeja de Nacimiento</Text>
              <Text style={styles.scheduleDate}>{lockdownDate}</Text>
            </View>
          </View>

          <View style={styles.scheduleLine} />

          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleIcon, { backgroundColor: Colors.success + '22' }]}>
              <Text style={styles.scheduleEmoji}>🐣</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>Día {selectedBird.days} — ¡Eclosión!</Text>
              <Text style={styles.scheduleDate}>{formattedHatch}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>📝 Notas (opcional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Lote, procedencia de huevos..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Save button */}
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn} activeOpacity={0.85}>
          <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.saveBtnGradient}>
            <Text style={styles.saveBtnText}>
              {saving ? '⏳ Guardando...' : '🥚 Iniciar Incubación'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
  },
  backBtn: { padding: 8 },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  form: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  birdGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  birdCard: {
    width: '30%', aspectRatio: 0.9,
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', padding: Spacing.sm,
  },
  birdCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  birdEmoji: { fontSize: 32, marginBottom: 4 },
  birdLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  birdLabelActive: { color: Colors.primaryLight },
  birdDays: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    color: Colors.textPrimary, paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md,
  },
  inputMultiline: { height: 90, paddingTop: 12 },
  scheduleCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  scheduleTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  scheduleSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.md },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  scheduleIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  scheduleEmoji: { fontSize: 20 },
  scheduleInfo: { flex: 1 },
  scheduleLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  scheduleDate: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  scheduleLine: { width: 1, height: 16, backgroundColor: Colors.border, marginLeft: 22, marginVertical: 4 },
  saveBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.sm, elevation: 6 },
  saveBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  saveBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
});
