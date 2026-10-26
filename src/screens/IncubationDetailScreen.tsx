import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Platform, TextInput, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Incubation, IncubationBirdType, INCUBATION_CYCLES } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../theme/colors';
import { updateIncubation, deleteIncubation } from '../services/database';
import { useApp } from '../context/AppContext';

const BIRD_EMOJIS: Record<IncubationBirdType, string> = {
  gallina: '🐔',
  pavo: '🦃',
  codorniz: '🐦',
  pato: '🦆',
  faisán: '🦚',
  paloma: '🕊️',
};

interface Props {
  navigation?: any;
  route?: any;
}

export default function IncubationDetailScreen({ navigation, route }: Props) {
  const { incubationCount, setIncubationCount } = useApp();
  const [incubation, setIncubation] = useState<Incubation>(route?.params?.incubation);
  const [modalVisible, setModalVisible] = useState(false);
  const [hatchedInput, setHatchedInput] = useState(String(incubation.hatchedCount ?? incubation.eggCount));

  const totalDays = incubation.totalDays || INCUBATION_CYCLES[incubation.birdType] || 21;
  const start = new Date(incubation.startDate);
  const now = new Date();
  const elapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const remaining = Math.max(0, totalDays - elapsed);
  const progress = Math.min(1, elapsed / totalDays);
  const emoji = BIRD_EMOJIS[incubation.birdType] || '🥚';

  // Key milestone dates
  const addDays = (d: Date, days: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res.toISOString().split('T')[0];
  };

  const day7Date = addDays(start, 7);
  const lockdownDay = totalDays - 3;
  const lockdownDate = addDays(start, lockdownDay);

  const handleFinishHatched = async () => {
    const count = parseInt(hatchedInput, 10);
    if (isNaN(count) || count < 0) {
      Alert.alert('Valor inválido', 'Ingresa un número válido de nacimientos.');
      return;
    }
    try {
      const updated: Incubation = {
        ...incubation,
        status: 'eclosionada',
        hatchedCount: count,
      };
      await updateIncubation(updated);
      setIncubation(updated);
      setModalVisible(false);
      Alert.alert('¡Felicitaciones!', `Se registraron ${count} polluelos nacidos.`);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la incubación.');
    }
  };

  const handleMarkFailed = () => {
    Alert.alert(
      'Marcar como Fallida',
      '¿Deseas marcar este lote de incubación como fallido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar Fallida',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated: Incubation = {
                ...incubation,
                status: 'fallida',
                hatchedCount: 0,
              };
              await updateIncubation(updated);
              setIncubation(updated);
            } catch {
              Alert.alert('Error', 'No se pudo actualizar.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Lote',
      '¿Estás seguro de que deseas eliminar este registro de incubación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIncubation(incubation.id);
              setIncubationCount(Math.max(0, incubationCount - 1));
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el lote.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1A1040', '#0F1117']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Detalle de Incubación
        </Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Hero Card */}
        <LinearGradient
          colors={incubation.status === 'activa' ? ['#222838', '#1A1F2E'] : ['#1C1E24', '#15171C']}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <Text style={styles.heroEmoji}>{emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.heroBirdType}>
                {incubation.birdType.charAt(0).toUpperCase() + incubation.birdType.slice(1)}
              </Text>
              <Text style={styles.heroEggCount}>{incubation.eggCount} huevos cargados</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    incubation.status === 'activa'
                      ? Colors.statusActive + '22'
                      : incubation.status === 'eclosionada'
                      ? Colors.primary + '22'
                      : Colors.danger + '22',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      incubation.status === 'activa'
                        ? Colors.statusActive
                        : incubation.status === 'eclosionada'
                        ? Colors.primaryLight
                        : Colors.danger,
                  },
                ]}
              >
                {incubation.status === 'activa' ? '● Activa' : incubation.status === 'eclosionada' ? '✓ Eclosionada' : '✗ Fallida'}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}% transcurrido</Text>
          </View>

          {/* Days summary */}
          <View style={styles.daysRow}>
            <View style={styles.dayBox}>
              <Text style={styles.dayVal}>{Math.min(elapsed, totalDays)}</Text>
              <Text style={styles.dayLbl}>Día Actual</Text>
            </View>
            <View style={styles.dayBox}>
              <Text style={[styles.dayVal, { color: Colors.primaryLight }]}>{remaining}</Text>
              <Text style={styles.dayLbl}>Días Restantes</Text>
            </View>
            <View style={styles.dayBox}>
              <Text style={styles.dayVal}>{totalDays}</Text>
              <Text style={styles.dayLbl}>Ciclo Total</Text>
            </View>
          </View>

          {/* Success rate if hatched */}
          {incubation.status === 'eclosionada' && incubation.hatchedCount != null && (
            <View style={styles.hatchedResultBox}>
              <Text style={styles.hatchedResultEmoji}>🐣</Text>
              <View>
                <Text style={styles.hatchedResultTitle}>
                  {incubation.hatchedCount} de {incubation.eggCount} polluelos ({Math.round((incubation.hatchedCount / incubation.eggCount) * 100)}%)
                </Text>
                <Text style={styles.hatchedResultSub}>Efectividad de eclosión alcanzada</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Milestones Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ETAPAS CLAVE DEL CICLO</Text>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineHeading}>Día 1 · Inicio de Incubación</Text>
              <Text style={styles.timelineSub}>Fecha: {incubation.startDate}</Text>
              <Text style={styles.timelineDesc}>Puesta a temperatura (37.5°C - 37.8°C) y humedad 50-55%.</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: elapsed >= 7 ? Colors.statusActive : Colors.borderLight },
              ]}
            />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineHeading}>Día 7 · Ovoscopía (Miraje de fertilidad)</Text>
              <Text style={styles.timelineSub}>Fecha estimada: {day7Date}</Text>
              <Text style={styles.timelineDesc}>Revisar con luz para descartar huevos claros o sin embrión.</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: elapsed >= lockdownDay ? Colors.warning : Colors.borderLight },
              ]}
            />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineHeading}>Día {lockdownDay} · Detener Volteo (Lockdown)</Text>
              <Text style={styles.timelineSub}>Fecha estimada: {lockdownDate}</Text>
              <Text style={styles.timelineDesc}>Retirar volteadores automáticos, aumentar humedad al 65-70%.</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: elapsed >= totalDays ? Colors.primaryLight : Colors.borderLight },
              ]}
            />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineHeading}>Día {totalDays} · Eclosión esperada</Text>
              <Text style={styles.timelineSub}>Fecha estimada: {incubation.expectedHatchDate}</Text>
              <Text style={styles.timelineDesc}>Nacimiento de los polluelos. Mantener incubadora cerrada hasta secar.</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {incubation.status === 'activa' && (
            <>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setModalVisible(true)}
              >
                <LinearGradient
                  colors={[Colors.primaryLight, Colors.primary]}
                  style={styles.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryBtnText}>🐣 Finalizar como Eclosionada</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.failedBtn} onPress={handleMarkFailed}>
                <Text style={styles.failedBtnText}>❌ Marcar como Fallida</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>🗑️ Eliminar Lote de Incubación</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for recording hatched count */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎉 Registrar Eclosión</Text>
            <Text style={styles.modalSub}>
              De los {incubation.eggCount} huevos incubados, ¿cuántos polluelos nacieron con éxito?
            </Text>

            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={hatchedInput}
              onChangeText={setHatchedInput}
              placeholder="Número de polluelos"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleFinishHatched}
              >
                <Text style={styles.modalConfirmText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 42,
    paddingBottom: 16,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
  },
  backIcon: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: FontWeight.bold,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 48,
  },
  heroCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 40,
  },
  heroBirdType: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  heroEggCount: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.bgInput,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  progressText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dayBox: {
    alignItems: 'center',
    flex: 1,
  },
  dayVal: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  dayLbl: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  hatchedResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '18',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  hatchedResultEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  hatchedResultTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primaryLight,
  },
  hatchedResultSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 3,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeading: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  timelineSub: {
    fontSize: FontSize.xs,
    color: Colors.primaryLight,
    marginTop: 2,
  },
  timelineDesc: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  actionSection: {
    marginTop: Spacing.md,
    gap: 12,
  },
  primaryBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  failedBtn: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  failedBtnText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  deleteBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.bgModal,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  modalConfirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalConfirmText: {
    color: '#000',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
