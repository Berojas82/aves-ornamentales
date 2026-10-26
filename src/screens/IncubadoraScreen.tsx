import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, RefreshControl, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllIncubations, deleteIncubation } from '../services/database';
import { cancelIncubationNotifications } from '../services/notifications';
import { Incubation, INCUBATION_CYCLES, IncubationBirdType, FREE_INCUBATION_LIMIT } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { differenceInDays, parseISO } from 'date-fns';

const BIRD_EMOJIS: Record<IncubationBirdType, string> = {
  gallina: '🐔', pavo: '🦃', codorniz: '🐦', pato: '🦆', faisán: '🦚', paloma: '🕊️',
};

interface Props { navigation: any; }

export default function IncubadoraScreen({ navigation }: Props) {
  const [incubations, setIncubations] = useState<Incubation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { isPremium, setIncubationCount } = useApp();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const loadIncubations = useCallback(async () => {
    try {
      const data = await getAllIncubations();
      setIncubations(data as Incubation[]);
      setIncubationCount(data.filter((i: any) => i.status === 'activa').length);
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  }, [setIncubationCount]);

  useFocusEffect(useCallback(() => { loadIncubations(); }, [loadIncubations]));

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleDelete = (item: Incubation) => {
    Alert.alert('Eliminar Incubación', '¿Eliminar este registro de incubación y cancelar sus alertas?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await cancelIncubationNotifications(item.notif7Id, item.notif18Id, item.notif21Id);
          await deleteIncubation(item.id);
          loadIncubations();
        },
      },
    ]);
  };

  const handleAdd = () => {
    const activeCount = incubations.filter(i => i.status === 'activa').length;
    if (!isPremium && activeCount >= FREE_INCUBATION_LIMIT) {
      Alert.alert('🔒 Límite Gratuito', `La versión gratuita permite ${FREE_INCUBATION_LIMIT} incubación activa. ¡Actualiza a Premium!`, [
        { text: 'Ahora no', style: 'cancel' },
        { text: '⭐ Ver Premium', onPress: () => navigation.navigate('Premium') },
      ]);
      return;
    }
    navigation.navigate('AddIncubation');
  };

  const renderItem = ({ item }: { item: Incubation }) => {
    const startDate = parseISO(item.startDate);
    const hatchDate = parseISO(item.expectedHatchDate);
    const today = new Date();
    const totalDays = item.totalDays;
    const elapsed = differenceInDays(today, startDate);
    const remaining = differenceInDays(hatchDate, today);
    const progress = Math.min(Math.max(elapsed / totalDays, 0), 1);
    const isActive = item.status === 'activa';
    const emoji = BIRD_EMOJIS[item.birdType as IncubationBirdType] || '🥚';

    // Current phase label
    let phase = '';
    if (elapsed < 7) phase = '🔬 Fase de fertilización';
    else if (elapsed < totalDays - 3) phase = '🌡️ Fase de incubación';
    else if (elapsed < totalDays) phase = '🏠 Bandeja de nacimiento';
    else phase = '🐣 ¡Día de eclosión!';

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={[styles.card, !isActive && styles.cardInactive]}
          onPress={() => navigation.navigate('IncubationDetail', { incubation: item })}
          onLongPress={() => handleDelete(item)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={isActive ? ['#222838', '#1A1F2E'] : ['#1a1a1a', '#141414']} style={styles.cardInner}>
            {/* Header row */}
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.birdEmoji}>{emoji}</Text>
                <View>
                  <Text style={styles.birdType}>{item.birdType.charAt(0).toUpperCase() + item.birdType.slice(1)}</Text>
                  <Text style={styles.eggCount}>{item.eggCount} huevos · {totalDays} días</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: isActive ? Colors.statusActive + '22' : Colors.bgInput }]}>
                <Text style={[styles.statusText, { color: isActive ? Colors.statusActive : Colors.textMuted }]}>
                  {item.status === 'activa' ? '● Activa' : item.status === 'eclosionada' ? '✓ Eclosionada' : '✗ Fallida'}
                </Text>
              </View>
            </View>

            {isActive && (
              <>
                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBg}>
                    <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]}>
                      <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                    </Animated.View>
                  </View>
                  <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                </View>

                {/* Day counter */}
                <View style={styles.daysRow}>
                  <View style={styles.dayChip}>
                    <Text style={styles.dayNumber}>{Math.min(elapsed, totalDays)}</Text>
                    <Text style={styles.dayLabel}>Día actual</Text>
                  </View>
                  <Text style={styles.daySep}>→</Text>
                  <View style={[styles.dayChip, { backgroundColor: Colors.primary + '22' }]}>
                    <Text style={[styles.dayNumber, { color: Colors.primaryLight }]}>{Math.max(remaining, 0)}</Text>
                    <Text style={styles.dayLabel}>Días restantes</Text>
                  </View>
                </View>

                {/* Phase */}
                <Text style={styles.phaseText}>{phase}</Text>

                {/* Day markers */}
                <View style={styles.markers}>
                  {[
                    { day: 7, label: 'Ovoscopia', done: elapsed >= 7 },
                    { day: totalDays - 3, label: 'Nacimiento', done: elapsed >= totalDays - 3 },
                    { day: totalDays, label: '¡Eclosión!', done: elapsed >= totalDays },
                  ].map(m => (
                    <View key={m.day} style={styles.marker}>
                      <View style={[styles.markerDot, { backgroundColor: m.done ? Colors.statusActive : Colors.border }]} />
                      <Text style={[styles.markerDay, { color: m.done ? Colors.statusActive : Colors.textMuted }]}>Día {m.day}</Text>
                      <Text style={styles.markerLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {item.status === 'eclosionada' && item.hatchedCount != null && (
              <Text style={styles.hatchResult}>🐣 Nacidos: {item.hatchedCount} de {item.eggCount}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A1040', '#0F1117']} style={styles.header}>
        <Text style={styles.headerTitle}>🥚 Incubadora</Text>
        <Text style={styles.headerSub}>{incubations.filter(i => i.status === 'activa').length} activas</Text>
      </LinearGradient>

      <FlatList
        data={incubations}
        keyExtractor={i => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadIncubations(); }} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🥚</Text>
            <Text style={styles.emptyTitle}>Sin incubaciones activas</Text>
            <Text style={styles.emptySub}>Toca + para iniciar una nueva incubación</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.8}>
        <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.fabGradient}>
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {!isPremium && (
        <View style={styles.adBanner}>
          <Text style={styles.adText}>📢 Publicidad · Actualiza a Premium para eliminarla</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.lg },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 160 },
  card: { marginBottom: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden', elevation: 6 },
  cardInactive: { opacity: 0.6 },
  cardInner: { padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  birdEmoji: { fontSize: 36 },
  birdType: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  eggCount: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  progressBg: { flex: 1, height: 10, backgroundColor: Colors.bgInput, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  progressText: { fontSize: FontSize.xs, color: Colors.textSecondary, width: 32, textAlign: 'right' },
  daysRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  dayChip: { flex: 1, backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md, padding: 10, alignItems: 'center' },
  dayNumber: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  dayLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  daySep: { fontSize: FontSize.xl, color: Colors.textMuted },
  phaseText: { fontSize: FontSize.sm, color: Colors.primaryLight, fontWeight: FontWeight.medium, marginBottom: Spacing.md, textAlign: 'center' },
  markers: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  marker: { alignItems: 'center', flex: 1 },
  markerDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  markerDay: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  markerLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  hatchResult: { fontSize: FontSize.md, color: Colors.statusActive, fontWeight: FontWeight.semibold, textAlign: 'center', marginTop: Spacing.sm },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 80, right: Spacing.lg, borderRadius: BorderRadius.full, elevation: 12, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  fabGradient: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 28, color: '#fff', fontWeight: FontWeight.bold },
  adBanner: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border, paddingVertical: 10, alignItems: 'center' },
  adText: { fontSize: FontSize.xs, color: Colors.textMuted },
});
