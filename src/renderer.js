const $ = (sel) => document.querySelector(sel);
function todayISO() { return new Date().toISOString().slice(0,10); }

async function loadHabits() {
  const habits = await window.api.listHabits();
  const list = $("#habitList");
  const select = $("#habitSelect");
  list.innerHTML = ""; select.innerHTML = "";
  habits.forEach(h => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><span class="badge" style="border-color:${h.color};">${h.name}</span></span>
      <button class="action" data-del="${h.id}">Excluir</button>
    `;
    list.appendChild(li);
    const opt = document.createElement("option"); opt.value = h.id; opt.textContent = h.name; select.appendChild(opt);
  });
  list.onclick = async (e) => {
    const id = e.target.dataset.del;
    if (id) { await window.api.deleteHabit(Number(id)); loadHabits(); }
  };
}

async function loadTodayEntries() {
  const entries = await window.api.entriesByDate(todayISO());
  const ul = $("#todayEntries"); ul.innerHTML = "";
  entries.forEach(en => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${en.name}</span><span class="badge" style="border-color:${en.color}">${en.date}</span>`;
    ul.appendChild(li);
  });
}

async function loadTasks() {
  const tasks = await window.api.listTasks();
  const list = $("#taskList"); list.innerHTML = "";
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="${t.done ? "done" : ""}">${t.title}</span>
      <div>
        <button class="action" data-tgl="${t.id}">${t.done ? "Desfazer" : "Concluir"}</button>
        <button class="action" data-del="${t.id}">Excluir</button>
      </div>
    `;
    list.appendChild(li);
  });
  list.onclick = async (e) => {
    if (e.target.dataset.tgl) { await window.api.toggleTask(Number(e.target.dataset.tgl)); loadTasks(); }
    if (e.target.dataset.del) { await window.api.deleteTask(Number(e.target.dataset.del)); loadTasks(); }
  };
}

async function loadNotes() {
  const notes = await window.api.listNotes();
  const list = $("#noteList"); list.innerHTML = "";
  notes.forEach(n => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${n.content}</span><button class="action" data-del="${n.id}">Excluir</button>`;
    list.appendChild(li);
  });
  list.onclick = async (e) => {
    const id = e.target.dataset.del;
    if (id) { await window.api.deleteNote(Number(id)); loadNotes(); }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  $("#habitForm").onsubmit = async (e) => {
    e.preventDefault();
    const name = $("#habitName").value.trim(); const color = $("#habitColor").value;
    if (!name) return; await window.api.addHabit(name, color); e.target.reset(); loadHabits();
  };

  $("#taskForm").onsubmit = async (e) => {
    e.preventDefault();
    const title = $("#taskTitle").value.trim();
    if (!title) return; await window.api.addTask(title); e.target.reset(); loadTasks();
  };

  $("#noteForm").onsubmit = async (e) => {
    e.preventDefault();
    const content = $("#noteText").value.trim();
    if (!content) return; await window.api.addNote(content); e.target.reset(); loadNotes();
  };

  $("#markToday").onclick = async () => {
    const habit_id = Number($("#habitSelect").value);
    if (!habit_id) return; await window.api.addEntry(habit_id, todayISO()); loadTodayEntries();
  };

  (async () => { await loadHabits(); await loadTasks(); await loadNotes(); await loadTodayEntries(); })();
});
