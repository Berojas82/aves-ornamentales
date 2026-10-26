import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, RefreshControl, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllTasks, addTask, updateTaskStatus, deleteTask } from '../services/database';
import { Task, QUICK_TASK_TEMPLATES } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../theme/colors';
import { format, isToday, isBefore, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';

const CATEGORY_COLORS: Record<string, string> = {
  sanitario: '#EF4444',
  alimentacion: '#10B981',
  limpieza: '#3B82F6',
  otro: '#6B7280',
};

const CATEGORY_ICONS: Record<string, string> = {
  sanitario: '💉',
  alimentacion: '🌾',
  limpieza: '🧹',
  otro: '📋',
};

interface Props { navigation: any; }

export default function TareasScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'hoy' | 'todas'>('hoy');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const loadTasks = useCallback(async () => {
    try {
      const data = await getAllTasks();
      setTasks(data as Task[]);
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadTasks(); }, [loadTasks]));

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const filteredTasks = activeTab === 'hoy'
    ? tasks.filter(t => t.scheduledDate.startsWith(todayStr) || (t.status === 'pendiente' && isBefore(parseISO(t.scheduledDate), new Date())))
    : tasks;

  const handleToggle = async (task: Task) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newStatus = task.status === 'hecho' ? 'pendiente' : 'hecho';
    await updateTaskStatus(task.id, newStatus);
    loadTasks();
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Eliminar tarea', `¿Eliminar "${task.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteTask(task.id); loadTasks(); } },
    ]);
  };

  const handleQuickAdd = async (template: typeof QUICK_TASK_TEMPLATES[0]) => {
    await addTask({
      title: template.title,
      description: template.description,
      status: 'pendiente',
      scheduledDate: todayStr,
      category: template.category,
      isRecurring: false,
      createdAt: new Date().toISOString(),
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    loadTasks();
  };

  const doneTasks = filteredTasks.filter(t => t.status === 'hecho');
  const pendingTasks = filteredTasks.filter(t => t.status === 'pendiente');

  const renderTask = ({ item }: { item: Task }) => {
    const categoryColor = CATEGORY_COLORS[item.category] || Colors.textMuted;
    const categoryIcon = CATEGORY_ICONS[item.category] || '📋';
    const isDone = item.status === 'hecho';

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={[styles.taskCard, isDone && styles.taskCardDone]}
          onPress={() => handleToggle(item)}
          onLongPress={() => handleDelete(item)}
          activeOpacity={0.8}
        >
          {/* Checkbox */}
          <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
            {isDone && <Text style={styles.checkmark}>✓</Text>}
          </View>

          {/* Content */}
          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text>
            ) : null}
            <View style={styles.taskMeta}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22' }]}>
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {categoryIcon} {item.category}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const completionPercent = filteredTasks.length > 0
    ? Math.round((doneTasks.length / filteredTasks.length) * 100) : 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A1040', '#0F1117']} style={styles.header}>
        <Text style={styles.headerTitle}>✅ Tareas Rápidas</Text>
        {filteredTasks.length > 0 && (
          <View style={styles.progressRow}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{completionPercent}% completado</Text>
          </View>
        )}
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['hoy', 'todas'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'hoy' ? '📅 Hoy' : '📋 Todas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={[...pendingTasks, ...doneTasks]}
        keyExtractor={t => t.id.toString()}
        renderItem={renderTask}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTasks(); }} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>⚡ Plantillas Rápidas</Text>
            <Text style={styles.quickSubtitle}>Toca para añadir a las tareas de hoy</Text>
            <View style={styles.quickGrid}>
              {QUICK_TASK_TEMPLATES.map((t, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickBtn}
                  onPress={() => handleQuickAdd(t)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickBtnIcon}>{CATEGORY_ICONS[t.category]}</Text>
                  <Text style={styles.quickBtnText}>{t.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredTasks.length > 0 && (
              <Text style={styles.listHeader}>
                {activeTab === 'hoy' ? 'Tareas de Hoy' : 'Todas las Tareas'} ({pendingTasks.length} pendientes)
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>Sin tareas pendientes</Text>
            <Text style={styles.emptySub}>Usa las plantillas de arriba para añadir tareas rápidamente</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Custom task FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTask')} activeOpacity={0.8}>
        <LinearGradient colors={[Colors.secondaryLight, Colors.secondary]} style={styles.fabGradient}>
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.lg },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressBg: { flex: 1, height: 6, backgroundColor: Colors.bgInput, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.statusActive, borderRadius: 3 },
  progressLabel: { fontSize: FontSize.xs, color: Colors.statusActive, fontWeight: FontWeight.semibold },
  tabs: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginVertical: Spacing.sm, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.bgCardLight },
  tabText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  tabTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 120 },
  quickSection: { marginBottom: Spacing.md },
  quickTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  quickSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.md },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickBtn: {
    width: '47%', backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  quickBtnIcon: { fontSize: 20 },
  quickBtnText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  listHeader: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  taskCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  taskCardDone: { opacity: 0.55 },
  checkbox: {
    width: 28, height: 28, borderRadius: 8,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkboxDone: { backgroundColor: Colors.statusActive, borderColor: Colors.statusActive },
  checkmark: { color: '#fff', fontWeight: FontWeight.bold, fontSize: 16 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  taskDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  taskMeta: { flexDirection: 'row', marginTop: Spacing.sm },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  categoryText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: Spacing.lg, borderRadius: BorderRadius.full, elevation: 12, shadowColor: Colors.secondaryLight, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 26, color: '#fff', fontWeight: FontWeight.bold },
});
