const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  listHabits: () => ipcRenderer.invoke("habits:list"),
  addHabit: (name, color) => ipcRenderer.invoke("habits:add", { name, color }),
  deleteHabit: (id) => ipcRenderer.invoke("habits:delete", id),

  listTasks: () => ipcRenderer.invoke("tasks:list"),
  addTask: (title) => ipcRenderer.invoke("tasks:add", title),
  toggleTask: (id) => ipcRenderer.invoke("tasks:toggle", id),
  deleteTask: (id) => ipcRenderer.invoke("tasks:delete", id),

  addEntry: (habit_id, date) => ipcRenderer.invoke("entries:add", { habit_id, date }),
  entriesByDate: (date) => ipcRenderer.invoke("entries:byDate", date),

  addNote: (content) => ipcRenderer.invoke("notes:add", content),
  listNotes: () => ipcRenderer.invoke("notes:list"),
  deleteNote: (id) => ipcRenderer.invoke("notes:delete", id)
});
