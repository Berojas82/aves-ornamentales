import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { addTask } from '../services/database';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../theme/colors';
import { format } from 'date-fns';

type Category = 'sanitario' | 'alimentacion' | 'limpieza' | 'otro';

const CATEGORY_OPTIONS: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: 'sanitario', label: 'Sanitario', emoji: '💉', color: '#EF4444' },
  { value: 'alimentacion', label: 'Alimentación', emoji: '🌾', color: '#10B981' },
  { value: 'limpieza', label: 'Limpieza', emoji: '🧹', color: '#3B82F6' },
  { value: 'otro', label: 'Otro', emoji: '📋', color: '#6B7280' },
];

interface Props { navigation: any; }

export default function AddTaskScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('sanitario');
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Campo requerido', 'Ingresa el nombre de la tarea.'); return; }
    setSaving(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status: 'pendiente',
        scheduledDate,
        category,
        isRecurring: false,
        createdAt: new Date().toISOString(),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la tarea.');
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
        <Text style={styles.headerTitle}>Nueva Tarea</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>📝 Título *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ej: Revisar vacunación..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="done"
            autoFocus
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>📄 Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={description}
            onChangeText={setDescription}
            placeholder="Detalles de la tarea..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>🗂️ Categoría</Text>
          <View style={styles.catGrid}>
            {CATEGORY_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.catBtn, category === opt.value && { borderColor: opt.color, backgroundColor: opt.color + '22' }]}
                onPress={() => setCategory(opt.value)}
              >
                <Text style={styles.catEmoji}>{opt.emoji}</Text>
                <Text style={[styles.catLabel, category === opt.value && { color: opt.color }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>📅 Fecha Programada</Text>
          <TextInput
            style={styles.input}
            value={scheduledDate}
            onChangeText={setScheduledDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn} activeOpacity={0.85}>
          <LinearGradient colors={[Colors.secondaryLight, Colors.secondary]} style={styles.saveBtnGradient}>
            <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : '✅ Añadir Tarea'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md },
  backBtn: { padding: 8 },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  form: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 60 },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.textPrimary, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: FontSize.md },
  inputMulti: { height: 90, paddingTop: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catBtn: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md },
  catEmoji: { fontSize: 20 },
  catLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  saveBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.sm, elevation: 6 },
  saveBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  saveBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
});
