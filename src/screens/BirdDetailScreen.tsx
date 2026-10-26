import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bird, BirdStatus } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../theme/colors';
import { updateBird, deleteBird } from '../services/database';
import { useApp } from '../context/AppContext';

const STATUS_CONFIG: Record<BirdStatus, { label: string; emoji: string; color: string }> = {
  activo: { label: 'Activo', emoji: '🟢', color: Colors.statusActive },
  criando: { label: 'Criando', emoji: '🥚', color: Colors.statusBrood },
  tratamiento: { label: 'Tratamiento', emoji: '🏥', color: Colors.statusTreatment },
};

function getAge(birthDate?: string): string | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) return 'Menos de 1 mes';
  if (months < 12) return `${months} meses`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years}a ${remMonths}m` : `${years} años`;
}

interface Props {
  navigation?: any;
  route?: any;
}

export default function BirdDetailScreen({ navigation, route }: Props) {
  const { isPremium, birdCount, setBirdCount } = useApp();
  const [bird, setBird] = useState<Bird>(route?.params?.bird);
  const statusCfg = STATUS_CONFIG[bird.status];
  const age = getAge(bird.birthDate);

  const handleStatusChange = async (newStatus: BirdStatus) => {
    try {
      const updated: Bird = { ...bird, status: newStatus, updatedAt: new Date().toISOString() };
      await updateBird(updated);
      setBird(updated);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado del ejemplar.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Ave',
      `¿Estás seguro de que deseas eliminar el ave ${bird.identifier}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBird(bird.id);
              setBirdCount(Math.max(0, birdCount - 1));
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el ejemplar.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <LinearGradient colors={['#1A1040', '#0F1117']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {bird.identifier}
        </Text>
        <TouchableOpacity
          style={styles.editHeaderBtn}
          onPress={() => navigation.navigate('AddBird', { bird })}
        >
          <Text style={styles.editHeaderText}>✏️</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Photo Container */}
        <View style={styles.photoContainer}>
          {bird.photoUri ? (
            <Image source={{ uri: bird.photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoEmoji}>🐓</Text>
              <Text style={styles.photoPlaceholderSub}>Sin fotografía</Text>
            </View>
          )}

          {/* Floating status tag */}
          <View style={[styles.statusTag, { backgroundColor: statusCfg.color + '26', borderColor: statusCfg.color }]}>
            <Text style={styles.statusTagEmoji}>{statusCfg.emoji}</Text>
            <Text style={[styles.statusTagText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        {/* Status quick switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ESTADO ACTUAL</Text>
          <View style={styles.statusRow}>
            {(['activo', 'criando', 'tratamiento'] as BirdStatus[]).map((st) => {
              const cfg = STATUS_CONFIG[st];
              const isSelected = bird.status === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.statusPill,
                    isSelected && { backgroundColor: cfg.color + '33', borderColor: cfg.color, borderWidth: 1.5 },
                  ]}
                  onPress={() => handleStatusChange(st)}
                >
                  <Text style={styles.statusPillEmoji}>{cfg.emoji}</Text>
                  <Text style={[styles.statusPillText, isSelected && { color: cfg.color, fontWeight: FontWeight.bold }]}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Main Details Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DETALLES DEL EJEMPLAR</Text>
          <View style={styles.grid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Raza</Text>
              <Text style={styles.infoValue}>{bird.breed}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Variedad / Color</Text>
              <Text style={styles.infoValue}>{bird.colorVariety || 'No especificado'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Sexo</Text>
              <Text style={styles.infoValue}>
                {bird.gender === 'macho' ? '♂️ Macho' : bird.gender === 'hembra' ? '♀️ Hembra' : '❓ Desconocido'}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Edad / Nacimiento</Text>
              <Text style={styles.infoValue}>{age ? `${age} (${bird.birthDate})` : (bird.birthDate || 'No registrada')}</Text>
            </View>
          </View>
        </View>

        {/* Female egg production */}
        {bird.gender === 'hembra' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>POSTURA DE HUEVOS</Text>
            <View style={styles.eggCard}>
              <Text style={styles.eggEmoji}>🥚</Text>
              <View style={styles.eggInfo}>
                <Text style={styles.eggValue}>
                  {bird.eggProductionPerWeek != null ? `${bird.eggProductionPerWeek} huevos / semana` : 'No registrado'}
                </Text>
                <Text style={styles.eggSub}>Rendimiento semanal estimado</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {bird.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>OBSERVACIONES Y NOTAS</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{bird.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Pedigree & Export Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, !isPremium && styles.pedigreeLocked]}
            onPress={() => {
              if (!isPremium) {
                Alert.alert(
                  '⭐ Ficha de Pedigrí Premium',
                  'La generación y exportación del certificado de pedigrí es exclusiva para usuarios Premium.',
                  [
                    { text: 'Ver Premium', onPress: () => navigation.navigate('Premium') },
                    { text: 'Cancelar', style: 'cancel' },
                  ]
                );
                return;
              }
              navigation.navigate('PedigreeCard', { bird });
            }}
          >
            <LinearGradient
              colors={isPremium ? [Colors.primary, Colors.primaryDark] : ['#374151', '#1F2937']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.actionBtnEmoji}>🏆</Text>
              <Text style={styles.actionBtnText}>
                {isPremium ? 'Ver Ficha de Pedigrí' : 'Ficha de Pedigrí (⭐ Premium)'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => navigation.navigate('AddBird', { bird })}
          >
            <Text style={styles.secondaryActionText}>✏️ Editar Datos del Ave</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteActionBtn}
            onPress={handleDelete}
          >
            <Text style={styles.deleteActionText}>🗑️ Eliminar este ejemplar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  editHeaderBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
  },
  editHeaderText: {
    fontSize: 18,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  photoContainer: {
    width: '100%',
    height: 260,
    backgroundColor: '#161B26',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181E2E',
  },
  photoEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  photoPlaceholderSub: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  statusTag: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: Colors.bgCard,
  },
  statusTagEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  statusTagText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusPillEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoCard: {
    width: '48%',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  eggCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eggEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  eggInfo: {
    flex: 1,
  },
  eggValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  eggSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  notesCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  primaryActionBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  pedigreeLocked: {
    opacity: 0.85,
  },
  actionBtnEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  secondaryActionBtn: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryActionText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  deleteActionBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteActionText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
