import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Share, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bird } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../theme/colors';

interface Props {
  navigation?: any;
  route?: any;
}

export default function PedigreeCardScreen({ navigation, route }: Props) {
  const bird: Bird = route?.params?.bird;

  const handleShare = async () => {
    try {
      const message = `🏆 FICHA DE PEDIGRÍ - AVES ORNAMENTALES 🏆\n\n` +
        `• Anilla / ID: ${bird.identifier}\n` +
        `• Raza: ${bird.breed}\n` +
        `• Variedad: ${bird.colorVariety}\n` +
        `• Sexo: ${bird.gender === 'macho' ? 'Macho ♂' : bird.gender === 'hembra' ? 'Hembra ♀' : 'Desconocido'}\n` +
        `• Nacimiento: ${bird.birthDate || 'No registrado'}\n` +
        (bird.notes ? `• Notas: ${bird.notes}\n` : '') +
        `\nRegistro generado con la app Aves Ornamentales.`;

      await Share.share({
        message,
        title: `Pedigrí ${bird.identifier} - ${bird.breed}`,
      });
    } catch {
      Alert.alert('Error', 'No se pudo compartir la ficha.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#2D1B00', '#0F1117']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha de Pedigrí</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Certificate Card */}
        <View style={styles.certificateOuter}>
          <LinearGradient
            colors={['#1E1910', '#151310', '#1C160B']}
            style={styles.certificateInner}
          >
            {/* Certificate Header */}
            <View style={styles.certHeader}>
              <Text style={styles.certCrown}>👑</Text>
              <Text style={styles.certTitle}>CERTIFICADO DE ORIGEN</Text>
              <Text style={styles.certSubtitle}>AVES ORNAMENTALES · REGISTRO SELECTO</Text>
              <View style={styles.certDivider} />
            </View>

            {/* Photo & Identifier */}
            <View style={styles.certPhotoSection}>
              {bird.photoUri ? (
                <Image source={{ uri: bird.photoUri }} style={styles.certPhoto} />
              ) : (
                <View style={styles.certPhotoPlaceholder}>
                  <Text style={styles.certEmoji}>🐓</Text>
                </View>
              )}
              <View style={styles.ringBadge}>
                <Text style={styles.ringLabel}>ANILLA / ID</Text>
                <Text style={styles.ringValue}>{bird.identifier}</Text>
              </View>
            </View>

            {/* Pedigree Data Fields */}
            <View style={styles.dataGrid}>
              <View style={styles.dataRow}>
                <Text style={styles.dataKey}>Raza:</Text>
                <Text style={styles.dataVal}>{bird.breed}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataKey}>Color / Variedad:</Text>
                <Text style={styles.dataVal}>{bird.colorVariety || 'Estándar'}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataKey}>Sexo:</Text>
                <Text style={styles.dataVal}>
                  {bird.gender === 'macho' ? 'Macho ♂' : bird.gender === 'hembra' ? 'Hembra ♀' : 'Desconocido'}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataKey}>Fecha Nacimiento:</Text>
                <Text style={styles.dataVal}>{bird.birthDate || 'No registrada'}</Text>
              </View>
              {bird.gender === 'hembra' && bird.eggProductionPerWeek != null && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataKey}>Postura estimada:</Text>
                  <Text style={styles.dataVal}>{bird.eggProductionPerWeek} huevos/sem</Text>
                </View>
              )}
            </View>

            {bird.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesKey}>Genealogía y Notas:</Text>
                <Text style={styles.notesContent}>{bird.notes}</Text>
              </View>
            ) : null}

            {/* Seal & Verification */}
            <View style={styles.sealRow}>
              <View style={styles.sealCircle}>
                <Text style={styles.sealEmoji}>⭐</Text>
                <Text style={styles.sealText}>CRIADERO</Text>
                <Text style={styles.sealSub}>VERIFICADO</Text>
              </View>
              <View style={styles.signatureBlock}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>Firma de Criador / Aval</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Share Action */}
        <TouchableOpacity style={styles.shareActionButton} onPress={handleShare}>
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.shareActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.shareActionText}>📤 Compartir Ficha de Pedigrí</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  shareBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
  },
  shareIcon: {
    fontSize: 18,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 48,
  },
  certificateOuter: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: '#D4AF37', // Gold metallic
    padding: 3,
    backgroundColor: '#3A2E05',
    elevation: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  certificateInner: {
    borderRadius: BorderRadius.lg - 2,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#7A6218',
  },
  certHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  certCrown: {
    fontSize: 32,
    marginBottom: 4,
  },
  certTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#F59E0B',
    letterSpacing: 2,
  },
  certSubtitle: {
    fontSize: FontSize.xs,
    color: '#D4AF37',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  certDivider: {
    width: 120,
    height: 2,
    backgroundColor: '#D4AF37',
    marginTop: 10,
    opacity: 0.6,
  },
  certPhotoSection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  certPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  certPhotoPlaceholder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#262010',
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certEmoji: {
    fontSize: 54,
  },
  ringBadge: {
    marginTop: 12,
    alignItems: 'center',
    backgroundColor: '#2D230E',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  ringLabel: {
    fontSize: 9,
    color: '#D4AF37',
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  ringValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFF',
  },
  dataGrid: {
    backgroundColor: '#1E180E',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#3D3110',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2B230E',
  },
  dataKey: {
    fontSize: FontSize.sm,
    color: '#9CA3AF',
  },
  dataVal: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#F3F4F6',
  },
  notesBox: {
    backgroundColor: '#1E180E',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3D3110',
  },
  notesKey: {
    fontSize: FontSize.xs,
    color: '#D4AF37',
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  notesContent: {
    fontSize: FontSize.xs,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  sealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#2B230E',
  },
  sealCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#261F0C',
  },
  sealEmoji: {
    fontSize: 16,
  },
  sealText: {
    fontSize: 8,
    fontWeight: FontWeight.bold,
    color: '#D4AF37',
    letterSpacing: 1,
  },
  sealSub: {
    fontSize: 7,
    color: '#D4AF37',
  },
  signatureBlock: {
    alignItems: 'center',
    width: 140,
  },
  sigLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#9CA3AF',
    marginBottom: 6,
  },
  sigLabel: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  shareActionButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  shareActionGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareActionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
});
