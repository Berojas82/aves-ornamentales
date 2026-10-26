// ============================================================
// TYPES - Aves Ornamentales MVP
// ============================================================

export type BirdStatus = 'activo' | 'criando' | 'tratamiento';

export interface Bird {
  id: number;
  identifier: string;          // Número de anillo o nombre
  breed: string;               // Raza
  colorVariety: string;        // Variedad de color
  status: BirdStatus;
  photoUri?: string;           // URI local de la foto
  gender: 'macho' | 'hembra' | 'desconocido';
  birthDate?: string;          // ISO date string
  // Para hembras:
  eggProductionPerWeek?: number;
  lastEggDate?: string;
  notes?: string;
  createdAt: string;           // ISO timestamp
  updatedAt: string;
}

export type IncubationBirdType = 'gallina' | 'pavo' | 'codorniz' | 'pato' | 'faisán' | 'paloma';

export interface Incubation {
  id: number;
  birdType: IncubationBirdType;
  eggCount: number;
  startDate: string;           // ISO date string
  expectedHatchDate: string;   // ISO date string (calculado)
  totalDays: number;
  notes?: string;
  status: 'activa' | 'eclosionada' | 'fallida';
  hatchedCount?: number;
  notif7Id?: string;
  notif18Id?: string;
  notif21Id?: string;
  createdAt: string;
}

export type TaskStatus = 'pendiente' | 'hecho';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;            // ISO date string
  scheduledDate: string;       // ISO date string (día en que aparece)
  category: 'sanitario' | 'alimentacion' | 'limpieza' | 'otro';
  isRecurring: boolean;
  recurringDays?: number;      // Cada cuántos días se repite
  createdAt: string;
}

// Freemium limits
export const FREE_BIRD_LIMIT = 5;
export const FREE_INCUBATION_LIMIT = 1;

// Incubation cycles in days
export const INCUBATION_CYCLES: Record<IncubationBirdType, number> = {
  gallina: 21,
  pavo: 28,
  codorniz: 17,
  pato: 28,
  faisán: 24,
  paloma: 18,
};

// Breeds catalog
export const BREEDS: Record<string, string[]> = {
  Brahma: ['Claro', 'Oscuro', 'Buff', 'Negro', 'Blanco'],
  Cochin: ['Negro', 'Blanco', 'Buff', 'Plateado', 'Dorado'],
  Silkie: ['Blanco', 'Negro', 'Buff', 'Azul', 'Partridge'],
  Polish: ['Blanco con cresta negra', 'Dorado', 'Plateado', 'Buff Laced'],
  Faverolle: ['Salmón', 'Blanco', 'Negro'],
  Serama: ['Blanco', 'Negro', 'Rojo', 'Mixto'],
  Leghorn: ['Blanco', 'Marrón', 'Plateado', 'Cuco'],
  Sussex: ['Rojo', 'Blanco', 'Plateado', 'Buff', 'Moteado'],
  'Plymouth Rock': ['Barrado', 'Blanco', 'Buff', 'Plateado'],
  Wyandotte: ['Plateado', 'Dorado', 'Azul', 'Negro'],
  Orpington: ['Buff', 'Negro', 'Blanco', 'Azul'],
  Marans: ['Cuco Negro Cobrizo', 'Negro', 'Wheaten', 'Blanco'],
  'Rhode Island Red': ['Simple cresta', 'Cresta en rosa'],
  Andaluza: ['Azul'],
  Hamburgo: ['Plateado Spangled', 'Dorado Spangled', 'Cuco'],
};

export const QUICK_TASK_TEMPLATES = [
  {
    title: 'Desparasitar Patas',
    description: 'Aplicar tratamiento antiparasitario en patas. Revisar escamas y signos de ácaros.',
    category: 'sanitario' as const,
  },
  {
    title: 'Vitaminas para Plumaje',
    description: 'Administrar suplemento vitamínico A, D3 y biotina para mejorar el plumaje.',
    category: 'sanitario' as const,
  },
  {
    title: 'Vacunación Newcastle',
    description: 'Aplicar vacuna Newcastle vía ocular o nasal. Registrar lote y caducidad.',
    category: 'sanitario' as const,
  },
  {
    title: 'Limpieza de Nidos',
    description: 'Retirar cama sucia, desinfectar nidos y renovar viruta o paja.',
    category: 'limpieza' as const,
  },
  {
    title: 'Cambio de Agua',
    description: 'Limpiar bebederos y reponer agua fresca. Añadir vitaminas si corresponde.',
    category: 'alimentacion' as const,
  },
  {
    title: 'Revisión General',
    description: 'Inspección visual de todas las aves. Detectar signos de enfermedad o lesiones.',
    category: 'sanitario' as const,
  },
];
