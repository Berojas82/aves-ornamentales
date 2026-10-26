import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { setSetting } from '../services/database';

interface Props { navigation: any; }

export default function PremiumScreen({ navigation }: Props) {
  const { isPremium, setPremium } = useApp();

  // Simulate IAP purchase (replace with expo-in-app-purchases in production)
  const handlePurchase = async (type: 'once' | 'sub') => {
    Alert.alert(
      '⭐ Activar Premium',
      `En producción, esto abrirá la tienda de ${type === 'once' ? 'pago único' : 'suscripción'} de Google Play / App Store.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: '✅ Simular Compra (Dev)',
          onPress: async () => {
            await setPremium(true);
            Alert.alert('🎉 ¡Premium Activado!', 'Ahora tienes acceso ilimitado a todas las funciones.', [
              { text: 'Genial', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  const handleRestore = async () => {
    Alert.alert('Restaurar Compra', 'Buscando compras anteriores en la tienda...', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restaurar', onPress: async () => {
        // In production: call IAP restore
        Alert.alert('Sin compras encontradas', 'No se encontraron compras previas en esta cuenta.');
      }},
    ]);
  };

  const FEATURES = [
    { icon: '🐓', text: 'Aves ilimitadas (gratis: 5)', premium: true },
    { icon: '🥚', text: 'Incubaciones simultáneas ilimitadas (gratis: 1)', premium: true },
    { icon: '🏆', text: 'Ficha de Pedigrí exportable para WhatsApp', premium: true },
    { icon: '🔕', text: 'Sin publicidad', premium: true },
    { icon: '📊', text: 'Estadísticas avanzadas', premium: true },
    { icon: '☁️', text: 'Backup futuro en la nube', premium: true },
    { icon: '📅', text: 'Alertas locales de incubación', premium: false },
    { icon: '✅', text: 'Gestión de tareas y checklist', premium: false },
    { icon: '📱', text: 'Funciona sin internet (offline)', premium: false },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A1040', '#2D1B69', '#0F1117']} style={styles.bg}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Crown */}
          <View style={styles.crownContainer}>
            <Text style={styles.crown}>👑</Text>
            <LinearGradient colors={[Colors.accent, Colors.primary]} style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </LinearGradient>
          </View>

          <Text style={styles.title}>Aves Ornamentales{'\n'}Premium</Text>
          <Text style={styles.subtitle}>
            Herramienta profesional para criadores{'\n'}serios de aves ornamentales
          </Text>

          {isPremium && (
            <View style={styles.activeBanner}>
              <Text style={styles.activeBannerText}>✅ Premium Activo — Gracias por tu apoyo</Text>
            </View>
          )}

          {/* Feature list */}
          <View style={styles.featureCard}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureRowBorder]}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={[styles.featureText, !f.premium && styles.featureTextFree]}>{f.text}</Text>
                <Text style={[styles.featureCheck, { color: f.premium ? Colors.accent : Colors.statusActive }]}>
                  {f.premium ? '⭐' : '✓'}
                </Text>
              </View>
            ))}
          </View>

          {!isPremium && (
            <>
              {/* Pricing options */}
              <View style={styles.pricingRow}>
                <TouchableOpacity style={[styles.pricingCard, styles.pricingCardHighlight]} onPress={() => handlePurchase('once')} activeOpacity={0.85}>
                  <LinearGradient colors={[Colors.accent, '#9333EA']} style={styles.pricingGradient}>
                    <Text style={styles.pricingBadge}>MÁS POPULAR</Text>
                    <Text style={styles.pricingEmoji}>💎</Text>
                    <Text style={styles.pricingTitle}>Pago Único</Text>
                    <Text style={styles.pricingPrice}>$4.99</Text>
                    <Text style={styles.pricingPeriod}>Para siempre</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pricingCard} onPress={() => handlePurchase('sub')} activeOpacity={0.85}>
                  <View style={styles.pricingInner}>
                    <Text style={styles.pricingEmoji}>🔄</Text>
                    <Text style={[styles.pricingTitle, { color: Colors.textPrimary }]}>Anual</Text>
                    <Text style={[styles.pricingPrice, { color: Colors.primaryLight }]}>$1.99</Text>
                    <Text style={[styles.pricingPeriod, { color: Colors.textMuted }]}>por año</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
                <Text style={styles.restoreBtnText}>Restaurar compra anterior</Text>
              </TouchableOpacity>

              <Text style={styles.legal}>
                Las compras se gestionan a través de Google Play / Apple App Store.
                El pago único no caduca. La suscripción se renueva automáticamente.
              </Text>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1 },
  header: { paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.sm },
  backBtn: { padding: 8, alignSelf: 'flex-start' },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  crownContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  crown: { fontSize: 64 },
  premiumBadge: { paddingHorizontal: Spacing.lg, paddingVertical: 6, borderRadius: BorderRadius.full, marginTop: Spacing.sm },
  premiumBadgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.extrabold, color: '#fff', letterSpacing: 2 },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  activeBanner: { backgroundColor: Colors.statusActive + '22', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.statusActive },
  activeBannerText: { color: Colors.statusActive, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  featureCard: { backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  featureRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  featureIcon: { fontSize: 20, width: 28 },
  featureText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  featureTextFree: { color: Colors.textSecondary },
  featureCheck: { fontSize: 16, fontWeight: FontWeight.bold },
  pricingRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  pricingCard: { flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden', elevation: 8 },
  pricingCardHighlight: { elevation: 16, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  pricingGradient: { padding: Spacing.lg, alignItems: 'center' },
  pricingInner: { padding: Spacing.lg, alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.border, flex: 1 },
  pricingBadge: { fontSize: 9, fontWeight: FontWeight.extrabold, color: '#fff', backgroundColor: '#ffffff33', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, marginBottom: Spacing.sm, letterSpacing: 1 },
  pricingEmoji: { fontSize: 32, marginBottom: 4 },
  pricingTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  pricingPrice: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: '#fff', marginTop: 4 },
  pricingPeriod: { fontSize: FontSize.xs, color: '#ffffff88' },
  restoreBtn: { paddingVertical: Spacing.md, alignItems: 'center' },
  restoreBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, textDecorationLine: 'underline' },
  legal: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 18, marginTop: Spacing.sm },
});
