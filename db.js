const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

function init(baseDir) {
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  const dbPath = path.join(baseDir, "app.db");
  const db = new Database(dbPath);

  db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#a855f7',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    value INTEGER DEFAULT 1,
    FOREIGN KEY (habit_id) REFERENCES habits(id)
  );
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  `);

  const stmt = {
    listHabits: db.prepare("SELECT * FROM habits ORDER BY id DESC"),
    addHabit: db.prepare("INSERT INTO habits (name, color) VALUES (?, ?)"),
    deleteHabit: db.prepare("DELETE FROM habits WHERE id = ?"),

    listTasks: db.prepare("SELECT * FROM tasks ORDER BY id DESC"),
    addTask: db.prepare("INSERT INTO tasks (title) VALUES (?)"),
    toggleTask: db.prepare("UPDATE tasks SET done = CASE done WHEN 1 THEN 0 ELSE 1 END WHERE id = ?"),
    deleteTask: db.prepare("DELETE FROM tasks WHERE id = ?"),

    addEntry: db.prepare("INSERT INTO entries (habit_id, date, value) VALUES (?, ?, 1)"),
    entriesByDate: db.prepare(`
      SELECT e.*, h.name, h.color
      FROM entries e JOIN habits h ON h.id = e.habit_id
      WHERE date = ?
      ORDER BY e.id DESC
    `),

    addNote: db.prepare("INSERT INTO notes (content) VALUES (?)"),
    listNotes: db.prepare("SELECT * FROM notes ORDER BY id DESC"),
    deleteNote: db.prepare("DELETE FROM notes WHERE id = ?")
  };

  return { db, stmt, dbPath };
}

module.exports = { init };
