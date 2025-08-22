const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

let stmt; 

app.setAppUserModelId("com.obsidian.planner");

function createWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 700,
    backgroundColor: "#0a0a0a",
    autoHideMenuBar: true,
    
    icon: path.join(__dirname, "assets", "obsidian_planner_icon.ico"),
    webPreferences: { preload: path.join(__dirname, "preload.js") }
  });

  win.loadFile(path.join(__dirname, "src", "index.html"));
}

async function init() {
  await app.whenReady();

  try {
    const userDataDir = path.join(app.getPath("userData"), "obsidian-planner");
    ({ stmt } = require("./db").init(userDataDir));
  } catch (err) {
    console.error("Falha ao iniciar o banco:", err);
    dialog.showErrorBox("Erro ao iniciar", String(err));
    app.quit();
    return;
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

init();

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// aqui tu add os Hábitos
ipcMain.handle("habits:list", () => stmt.listHabits.all());
ipcMain.handle("habits:add", (_e, { name, color }) => stmt.addHabit.run(name, color));
ipcMain.handle("habits:delete", (_e, id) => stmt.deleteHabit.run(id));

// aqui tu gera as tarefas
ipcMain.handle("tasks:list", () => stmt.listTasks.all());
ipcMain.handle("tasks:add", (_e, title) => stmt.addTask.run(title));
ipcMain.handle("tasks:toggle", (_e, id) => stmt.toggleTask.run(id));
ipcMain.handle("tasks:delete", (_e, id) => stmt.deleteTask.run(id));

// aqui tu faz as marcações do dia
ipcMain.handle("entries:add", (_e, { habit_id, date }) => stmt.addEntry.run(habit_id, date));
ipcMain.handle("entries:byDate", (_e, date) => stmt.entriesByDate.all(date));

// aqui ficam as notas que tu add
ipcMain.handle("notes:add", (_e, content) => stmt.addNote.run(content));
ipcMain.handle("notes:list", () => stmt.listNotes.all());
ipcMain.handle("notes:delete", (_e, id) => stmt.deleteNote.run(id));
