import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Alert, RefreshControl, Animated, Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllBirds, deleteBird } from '../services/database';
import { Bird, BirdStatus, FREE_BIRD_LIMIT } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../theme/colors';
import { useApp } from '../context/AppContext';

const STATUS_CONFIG: Record<BirdStatus, { label: string; color: string; emoji: string }> = {
  activo: { label: 'Activo', color: Colors.statusActive, emoji: '🟢' },
  criando: { label: 'Criando', color: Colors.statusBrood, emoji: '🥚' },
  tratamiento: { label: 'Tratamiento', color: Colors.statusTreatment, emoji: '🏥' },
};

interface Props {
  navigation: any;
}

export default function GallineroScreen({ navigation }: Props) {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isPremium, setBirdCount } = useApp();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const loadBirds = useCallback(async () => {
    try {
      const data = await getAllBirds();
      setBirds(data as Bird[]);
      setBirdCount(data.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setBirdCount]);

  useFocusEffect(
    useCallback(() => {
      loadBirds();
    }, [loadBirds])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleDelete = (bird: Bird) => {
    Alert.alert(
      'Eliminar Ave',
      `¿Seguro que deseas eliminar a "${bird.identifier}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            await deleteBird(bird.id);
            loadBirds();
          },
        },
      ]
    );
  };

  const handleAddBird = () => {
    if (!isPremium && birds.length >= FREE_BIRD_LIMIT) {
      Alert.alert(
        '🔒 Límite Gratuito',
        `La versión gratuita permite hasta ${FREE_BIRD_LIMIT} aves. ¡Actualiza a Premium para registros ilimitados!`,
        [
          { text: 'Ahora no', style: 'cancel' },
          { text: '⭐ Ver Premium', onPress: () => navigation.navigate('Premium') },
        ]
      );
      return;
    }
    navigation.navigate('AddBird');
  };

  const getAge = (birthDate?: string): string => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 1) return 'Recién nacida';
    if (months < 12) return `${months} mes${months !== 1 ? 'es' : ''}`;
    const years = Math.floor(months / 12);
    return `${years} año${years !== 1 ? 's' : ''}`;
  };

  const renderBird = ({ item, index }: { item: Bird; index: number }) => {
    const statusCfg = STATUS_CONFIG[item.status];
    const age = getAge(item.birthDate);

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        <Pressable
          onPress={() => navigation.navigate('BirdDetail', { bird: item })}
          onLongPress={() => handleDelete(item)}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          <LinearGradient
            colors={['#222838', '#1A1F2E']}
            style={styles.cardGradient}
          >
            {/* Photo */}
            <View style={styles.photoContainer}>
              {item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoEmoji}>🐓</Text>
                </View>
              )}
              {/* Status badge */}
              <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + '22', borderColor: statusCfg.color }]}>
                <Text style={styles.statusEmoji}>{statusCfg.emoji}</Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardIdentifier} numberOfLines={1}>{item.identifier}</Text>
              <Text style={styles.cardBreed}>{item.breed}</Text>
              <Text style={styles.cardColor}>{item.colorVariety}</Text>

              <View style={styles.cardMeta}>
                {age ? <View style={styles.metaChip}><Text style={styles.metaText}>📅 {age}</Text></View> : null}
                {item.gender !== 'desconocido' && (
                  <View style={styles.metaChip}>
                    <Text style={styles.metaText}>{item.gender === 'hembra' ? '♀️ Hembra' : '♂️ Macho'}</Text>
                  </View>
                )}
              </View>

              {/* Egg production for hens */}
              {item.gender === 'hembra' && item.eggProductionPerWeek != null && (
                <View style={styles.eggRow}>
                  <Text style={styles.eggText}>🥚 {item.eggProductionPerWeek} huevos/sem</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('BirdDetail', { bird: item })}
              >
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, isPremium && styles.actionBtnPremium]}
                onPress={() => {
                  if (!isPremium) {
                    Alert.alert('⭐ Premium', 'La ficha de pedigrí es exclusiva de la versión Premium.', [
                      { text: 'Ver Premium', onPress: () => navigation.navigate('Premium') },
                      { text: 'Cancelar', style: 'cancel' },
                    ]);
                    return;
                  }
                  navigation.navigate('PedigreeCard', { bird: item });
                }}
              >
                <Text style={styles.actionIcon}>🏆</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1A1040', '#0F1117']} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mi Gallinero</Text>
          <Text style={styles.headerSubtitle}>{birds.length} {birds.length === 1 ? 'ave registrada' : 'aves registradas'}</Text>
        </View>
        {!isPremium && (
          <View style={styles.limitBadge}>
            <Text style={styles.limitText}>{birds.length}/{FREE_BIRD_LIMIT}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Bird List */}
      <FlatList
        data={birds}
        keyExtractor={item => item.id.toString()}
        renderItem={renderBird}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBirds(); }} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐔</Text>
            <Text style={styles.emptyTitle}>Sin aves registradas</Text>
            <Text style={styles.emptySubtitle}>Toca el botón + para añadir tu primera ave</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddBird} activeOpacity={0.8}>
        <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.fabGradient}>
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Free banner ad placeholder */}
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
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.lg,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  limitBadge: {
    backgroundColor: Colors.primary + '22', borderColor: Colors.primary,
    borderWidth: 1, borderRadius: BorderRadius.full, paddingHorizontal: 12, paddingVertical: 4,
  },
  limitText: { color: Colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  list: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 160 },
  card: { marginBottom: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden', elevation: 8 },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  cardGradient: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg,
  },
  photoContainer: { position: 'relative', marginRight: Spacing.md },
  photo: { width: 72, height: 72, borderRadius: BorderRadius.md },
  photoPlaceholder: {
    width: 72, height: 72, borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center',
  },
  photoEmoji: { fontSize: 36 },
  statusBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 24, height: 24, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  statusEmoji: { fontSize: 12 },
  cardInfo: { flex: 1 },
  cardIdentifier: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cardBreed: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium, marginTop: 2 },
  cardColor: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  metaChip: {
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.sm,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  metaText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  eggRow: { marginTop: 4 },
  eggText: { fontSize: FontSize.xs, color: Colors.statusBrood, fontWeight: FontWeight.medium },
  cardActions: { gap: 8, marginLeft: Spacing.sm },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  actionBtnPremium: { borderColor: Colors.accent },
  actionIcon: { fontSize: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
  fab: {
    position: 'absolute', bottom: !false ? 80 : 24, right: Spacing.lg,
    borderRadius: BorderRadius.full, elevation: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  fabGradient: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 28, color: '#fff', fontWeight: FontWeight.bold },
  adBanner: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border,
    paddingVertical: 10, alignItems: 'center',
  },
  adText: { fontSize: FontSize.xs, color: Colors.textMuted },
});
