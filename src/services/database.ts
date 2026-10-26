import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('avesornamentales.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS birds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT NOT NULL,
      breed TEXT NOT NULL,
      colorVariety TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'activo',
      photoUri TEXT,
      gender TEXT NOT NULL DEFAULT 'desconocido',
      birthDate TEXT,
      eggProductionPerWeek INTEGER,
      lastEggDate TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incubations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      birdType TEXT NOT NULL,
      eggCount INTEGER NOT NULL,
      startDate TEXT NOT NULL,
      expectedHatchDate TEXT NOT NULL,
      totalDays INTEGER NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'activa',
      hatchedCount INTEGER,
      notif7Id TEXT,
      notif18Id TEXT,
      notif21Id TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pendiente',
      dueDate TEXT,
      scheduledDate TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'otro',
      isRecurring INTEGER NOT NULL DEFAULT 0,
      recurringDays INTEGER,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('isPremium', 'false');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('firstLaunch', 'true');
  `);
}

// ─── BIRDS ────────────────────────────────────────────────────────────────────
export async function getAllBirds() {
  const database = await getDatabase();
  return await database.getAllAsync<any>('SELECT * FROM birds ORDER BY createdAt DESC');
}

export async function addBird(bird: Omit<any, 'id'>): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO birds (identifier, breed, colorVariety, status, photoUri, gender, birthDate, eggProductionPerWeek, lastEggDate, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bird.identifier, bird.breed, bird.colorVariety, bird.status,
      bird.photoUri ?? null, bird.gender, bird.birthDate ?? null,
      bird.eggProductionPerWeek ?? null, bird.lastEggDate ?? null,
      bird.notes ?? null, bird.createdAt, bird.updatedAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateBird(bird: any): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE birds SET identifier=?, breed=?, colorVariety=?, status=?, photoUri=?, gender=?,
     birthDate=?, eggProductionPerWeek=?, lastEggDate=?, notes=?, updatedAt=? WHERE id=?`,
    [
      bird.identifier, bird.breed, bird.colorVariety, bird.status,
      bird.photoUri ?? null, bird.gender, bird.birthDate ?? null,
      bird.eggProductionPerWeek ?? null, bird.lastEggDate ?? null,
      bird.notes ?? null, bird.updatedAt, bird.id,
    ]
  );
}

export async function deleteBird(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM birds WHERE id = ?', [id]);
}

// ─── INCUBATIONS ──────────────────────────────────────────────────────────────
export async function getAllIncubations() {
  const database = await getDatabase();
  return await database.getAllAsync<any>('SELECT * FROM incubations ORDER BY startDate DESC');
}

export async function addIncubation(incubation: Omit<any, 'id'>): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO incubations (birdType, eggCount, startDate, expectedHatchDate, totalDays, notes, status, hatchedCount, notif7Id, notif18Id, notif21Id, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      incubation.birdType, incubation.eggCount, incubation.startDate,
      incubation.expectedHatchDate, incubation.totalDays, incubation.notes ?? null,
      incubation.status, incubation.hatchedCount ?? null,
      incubation.notif7Id ?? null, incubation.notif18Id ?? null,
      incubation.notif21Id ?? null, incubation.createdAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateIncubation(incubation: any): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE incubations SET status=?, hatchedCount=?, notes=? WHERE id=?`,
    [incubation.status, incubation.hatchedCount ?? null, incubation.notes ?? null, incubation.id]
  );
}

export async function deleteIncubation(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM incubations WHERE id = ?', [id]);
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
export async function getAllTasks() {
  const database = await getDatabase();
  return await database.getAllAsync<any>('SELECT * FROM tasks ORDER BY scheduledDate ASC, createdAt DESC');
}

export async function addTask(task: Omit<any, 'id'>): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO tasks (title, description, status, dueDate, scheduledDate, category, isRecurring, recurringDays, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.title, task.description ?? null, task.status, task.dueDate ?? null,
      task.scheduledDate, task.category, task.isRecurring ? 1 : 0,
      task.recurringDays ?? null, task.createdAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateTaskStatus(id: number, status: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('UPDATE tasks SET status=? WHERE id=?', [status, id]);
}

export async function deleteTask(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export async function getSetting(key: string): Promise<string | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?', [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]
  );
}

export async function isPremiumUser(): Promise<boolean> {
  const val = await getSetting('isPremium');
  return val === 'true';
}
