import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, Alert, Switch, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { addBird, updateBird } from '../services/database';
import { BREEDS, BirdStatus, Bird } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../theme/colors';
import { useApp } from '../context/AppContext';

const BREED_NAMES = Object.keys(BREEDS);
const STATUS_OPTIONS: { value: BirdStatus; label: string; emoji: string }[] = [
  { value: 'activo', label: 'Activo', emoji: '🟢' },
  { value: 'criando', label: 'Criando', emoji: '🥚' },
  { value: 'tratamiento', label: 'Tratamiento', emoji: '🏥' },
];

interface Props {
  navigation: any;
  route?: { params?: { bird?: Bird } };
}

export default function AddBirdScreen({ navigation, route }: Props) {
  const existingBird = route?.params?.bird;
  const isEditing = !!existingBird;
  const { isPremium } = useApp();

  const [identifier, setIdentifier] = useState(existingBird?.identifier ?? '');
  const [selectedBreed, setSelectedBreed] = useState(existingBird?.breed ?? BREED_NAMES[0]);
  const [selectedColor, setSelectedColor] = useState(
    existingBird?.colorVariety ?? BREEDS[existingBird?.breed || BREED_NAMES[0]]?.[0] ?? ''
  );
  const [status, setStatus] = useState<BirdStatus>(existingBird?.status ?? 'activo');
  const [gender, setGender] = useState<'macho' | 'hembra' | 'desconocido'>(existingBird?.gender ?? 'desconocido');
  const [birthDate, setBirthDate] = useState(existingBird?.birthDate ?? '');
  const [photoUri, setPhotoUri] = useState<string | undefined>(existingBird?.photoUri);
  const [eggProduction, setEggProduction] = useState(
    existingBird?.eggProductionPerWeek != null ? String(existingBird.eggProductionPerWeek) : ''
  );
  const [notes, setNotes] = useState(existingBird?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const pickImage = async (source: 'camera' | 'gallery') => {
    let result;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara.'); return; }
      result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.'); return; }
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    }
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!identifier.trim()) { Alert.alert('Campo requerido', 'Por favor ingresa el identificador del ave.'); return; }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (isEditing && existingBird) {
        await updateBird({
          ...existingBird,
          identifier: identifier.trim(),
          breed: selectedBreed,
          colorVariety: selectedColor,
          status,
          photoUri,
          gender,
          birthDate: birthDate || undefined,
          eggProductionPerWeek: gender === 'hembra' && eggProduction ? parseInt(eggProduction) : undefined,
          notes: notes || undefined,
          updatedAt: now,
        });
      } else {
        await addBird({
          identifier: identifier.trim(),
          breed: selectedBreed,
          colorVariety: selectedColor,
          status,
          photoUri,
          gender,
          birthDate: birthDate || undefined,
          eggProductionPerWeek: gender === 'hembra' && eggProduction ? parseInt(eggProduction) : undefined,
          notes: notes || undefined,
          createdAt: now,
          updatedAt: now,
        });
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el ave. Intenta de nuevo.');
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
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Ave' : 'Nueva Ave'}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {/* Photo picker */}
        <View style={styles.photoSection}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderEmoji}>🐓</Text>
              <Text style={styles.photoPlaceholderText}>Sin foto</Text>
            </View>
          )}
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage('camera')}>
              <Text style={styles.photoBtnIcon}>📷</Text>
              <Text style={styles.photoBtnText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage('gallery')}>
              <Text style={styles.photoBtnIcon}>🖼️</Text>
              <Text style={styles.photoBtnText}>Galería</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Identifier */}
        <View style={styles.field}>
          <Text style={styles.label}>🔖 Identificador / Nº de Anillo *</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="Ej: A-001, Brahma Rey..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="done"
          />
        </View>

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.label}>⚥ Sexo</Text>
          <View style={styles.segmentRow}>
            {(['macho', 'hembra', 'desconocido'] as const).map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.segment, gender === g && styles.segmentActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.segmentText, gender === g && styles.segmentTextActive]}>
                  {g === 'macho' ? '♂️ Macho' : g === 'hembra' ? '♀️ Hembra' : '❓ N/A'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Breed selector */}
        <View style={styles.field}>
          <Text style={styles.label}>🐓 Raza</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {BREED_NAMES.map(breed => (
              <TouchableOpacity
                key={breed}
                style={[styles.chip, selectedBreed === breed && styles.chipActive]}
                onPress={() => { setSelectedBreed(breed); setSelectedColor(BREEDS[breed][0]); }}
              >
                <Text style={[styles.chipText, selectedBreed === breed && styles.chipTextActive]}>{breed}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Color variety */}
        <View style={styles.field}>
          <Text style={styles.label}>🎨 Variedad de Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {(BREEDS[selectedBreed] || []).map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.chip, selectedColor === color && styles.chipColorActive]}
                onPress={() => setSelectedColor(color)}
              >
                <Text style={[styles.chipText, selectedColor === color && styles.chipTextActive]}>{color}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Status */}
        <View style={styles.field}>
          <Text style={styles.label}>📊 Estado</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.statusBtn, status === opt.value && styles.statusBtnActive]}
                onPress={() => setStatus(opt.value)}
              >
                <Text style={styles.statusBtnEmoji}>{opt.emoji}</Text>
                <Text style={[styles.statusBtnText, status === opt.value && styles.statusBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Birth date */}
        <View style={styles.field}>
          <Text style={styles.label}>📅 Fecha de Nacimiento (opcional)</Text>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD (ej: 2024-03-15)"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
          />
        </View>

        {/* Egg production (hens only) */}
        {gender === 'hembra' && (
          <View style={styles.field}>
            <Text style={styles.label}>🥚 Producción de Huevos (por semana)</Text>
            <TextInput
              style={styles.input}
              value={eggProduction}
              onChangeText={setEggProduction}
              placeholder="Ej: 5"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
        )}

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>📝 Notas (opcional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Observaciones, historial médico..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Save button */}
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn} activeOpacity={0.85}>
          <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.saveBtnGradient}>
            <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : isEditing ? '💾 Guardar Cambios' : '💾 Guardar Ave'}</Text>
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
  photoSection: { alignItems: 'center', marginBottom: Spacing.lg },
  photoPreview: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: Colors.primary },
  photoPlaceholder: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed',
  },
  photoPlaceholderEmoji: { fontSize: 40 },
  photoPlaceholderText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  photoButtons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  photoBtnIcon: { fontSize: 18 },
  photoBtnText: { color: Colors.textPrimary, fontWeight: FontWeight.medium, fontSize: FontSize.sm },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    color: Colors.textPrimary, paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md,
  },
  inputMultiline: { height: 90, paddingTop: 12 },
  segmentRow: { flexDirection: 'row', gap: Spacing.sm },
  segment: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  segmentText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  segmentTextActive: { color: Colors.primaryLight, fontWeight: FontWeight.bold },
  chipScroll: { flexGrow: 0 },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm,
  },
  chipActive: { backgroundColor: Colors.primary + '33', borderColor: Colors.primary },
  chipColorActive: { backgroundColor: Colors.secondary + '33', borderColor: Colors.secondaryLight },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  statusBtnActive: { backgroundColor: Colors.bgCardLight, borderColor: Colors.primaryLight },
  statusBtnEmoji: { fontSize: 20, marginBottom: 4 },
  statusBtnText: { fontSize: FontSize.xs, color: Colors.textMuted },
  statusBtnTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  saveBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.md, elevation: 6 },
  saveBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  saveBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
});
