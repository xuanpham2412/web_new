document.addEventListener("DOMContentLoaded", async () => {
  const days = ["Thu 2", "Thu 3", "Thu 4", "Thu 5", "Thu 6", "Thu 7"];
  const shifts = ["Sang", "Chieu", "Toi"];
  const dayAliases = {
    "Thứ 2": "Thu 2",
    "Thứ 3": "Thu 3",
    "Thứ 4": "Thu 4",
    "Thứ 5": "Thu 5",
    "Thứ 6": "Thu 6",
    "Thứ 7": "Thu 7",
  };
  const shiftAliases = {
    "Ca 1": "Sang",
    "Ca 1 (7h-9h)": "Sang",
    "Ca 2": "Sang",
    "Ca 2 (9h-11h)": "Sang",
    "Ca 3": "Chieu",
    "Ca 3 (13h-15h)": "Chieu",
    "Ca 4": "Chieu",
    "Ca 4 (15h-17h)": "Chieu",
    "Ca 5": "Toi",
    "Sáng": "Sang",
    "Chiều": "Chieu",
    "Tối": "Toi",
  };

  let data = [];
  let options = {};
  let editingId = null;

  Edu.renderShell("lichhoc", { addLabel: true });
  const content = document.getElementById("content");
  const modal = document.getElementById("crudModal");
  const form = document.getElementById("crudForm");

  document.getElementById("modalFields").innerHTML = `
    <div class="form-group"><label class="form-label">Ma mon *</label><select class="form-input" name="ma_mon" required></select></div>
    <div class="form-group"><label class="form-label">Ma giang vien *</label><select class="form-input" name="teacher" required></select></div>
    <div class="form-group"><label class="form-label">Ma lop *</label><select class="form-input" name="className" required></select></div>
    <div class="form-group"><label class="form-label">Phong hoc</label><input class="form-input" name="room" /></div>
    <div class="form-group"><label class="form-label">Thu *</label><select class="form-input" name="weekday" required>${days.map((day) => `<option value="${day}">${day}</option>`).join("")}</select></div>
    <div class="form-group"><label class="form-label">Ca *</label><select class="form-input" name="shift" required>${shifts.map((shift) => `<option value="${shift}">${shift}</option>`).join("")}</select></div>
  `;

  function optionHtml(items = []) {
    return `<option value="">-- Chon --</option>${items.map((item) => `<option value="${Edu.esc(item.value)}">${Edu.esc(item.label)}</option>`).join("")}`;
  }

  function normalizeDay(value) {
    return dayAliases[value] || value || "";
  }

  function normalizeShift(value) {
    return shiftAliases[value] || value || "";
  }

  function openModal(row = null, defaults = {}) {
    editingId = row ? row.id : null;
    document.getElementById("modalTitle").textContent = row ? "Sua lich hoc" : "Them lich hoc";
    form.reset();
    form.elements.ma_mon.value = row?.ma_mon || "";
    form.elements.teacher.value = row?.teacher || "";
    form.elements.className.value = row?.className || "";
    form.elements.room.value = row?.room || "";
    form.elements.weekday.value = normalizeDay(row?.weekday || defaults.weekday || "Thu 2");
    form.elements.shift.value = normalizeShift(row?.shift || defaults.shift || "Sang");
    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.remove("open");
  }

  function render() {
    const text = document.getElementById("searchInput").value.trim().toLowerCase();
    const rows = data.filter((row) => {
      if (!text) return true;
      return [row.subject, row.ma_mon, row.teacherName, row.teacher, row.className, row.room, row.weekday, row.shift]
        .some((value) => String(value || "").toLowerCase().includes(text));
    });
    const byCell = new Map();
    rows.forEach((row) => {
      const key = `${normalizeDay(row.weekday)}__${normalizeShift(row.shift)}`;
      if (!byCell.has(key)) byCell.set(key, []);
      byCell.get(key).push(row);
    });

    const totalRooms = new Set(data.map((item) => item.room).filter(Boolean)).size;
    content.innerHTML = `
      <div class="stats-grid three">
        <div class="stat-card blue"><div class="stat-label">TONG LICH</div><div class="stat-value">${data.length}</div></div>
        <div class="stat-card green"><div class="stat-label">DANG DAY</div><div class="stat-value">${data.length}</div></div>
        <div class="stat-card amber"><div class="stat-label">PHONG HOC</div><div class="stat-value">${totalRooms}</div></div>
      </div>
      <div class="table-card timetable-card">
        <div class="table-header">
          <div class="table-title">Thoi khoa bieu</div>
          <div class="table-filters"><button class="btn btn-outline btn-sm" id="btnReload" type="button">Tai lai</button></div>
        </div>
        <div class="timetable-wrap">
          <div class="timetable-grid">
            <div class="timetable-cell timetable-head">Ca</div>
            ${days.map((day) => `<div class="timetable-cell timetable-head">${day}</div>`).join("")}
            ${shifts.map((shift) => `
              <div class="timetable-cell timetable-head shift-head">${shift}</div>
              ${days.map((day) => {
                const lessons = byCell.get(`${day}__${shift}`) || [];
                return `<div class="timetable-cell" data-day="${day}" data-shift="${shift}">
                  ${lessons.length ? lessons.map((lesson) => `
                    <div class="lesson-card">
                      <div class="lesson-title">${Edu.esc(lesson.subject || lesson.ma_mon || "Mon hoc")}</div>
                      <div class="lesson-meta">${Edu.esc(lesson.teacherName || lesson.teacher || "Chua co GV")}</div>
                      <div class="lesson-meta">${Edu.esc(lesson.className || "")} - ${Edu.esc(lesson.room || "Chua co phong")}</div>
                      <div class="lesson-actions">
                        <button class="btn btn-sm btn-outline" data-edit="${Edu.esc(lesson.id)}" type="button">Sua</button>
                        <button class="btn btn-sm btn-danger-outline" data-delete="${Edu.esc(lesson.id)}" type="button">Xoa</button>
                      </div>
                    </div>
                  `).join("") : '<div class="empty-slot">Chua co lich</div>'}
                  <button class="slot-add" data-add-day="${day}" data-add-shift="${shift}" type="button">+ Them</button>
                </div>`;
              }).join("")}
            `).join("")}
          </div>
        </div>
      </div>`;
    Edu.updateSidebarCounts({ lophoc: options.lop?.length || 0 });
  }

  async function load() {
    data = await Edu.request("/lichhoc");
    render();
  }

  try {
    options = await Edu.getOptions();
    form.elements.ma_mon.innerHTML = optionHtml(options.monhoc);
    form.elements.teacher.innerHTML = optionHtml(options.giangvien);
    form.elements.className.innerHTML = optionHtml(options.lop);
    await load();
  } catch (err) {
    content.innerHTML = `<div class="table-card"><div class="empty-cell">${Edu.esc(err.message)}<br />Hay bat XAMPP MySQL va chay <strong>node server.js</strong>.</div></div>`;
  }

  document.getElementById("btnAdd").addEventListener("click", () => openModal());
  document.getElementById("searchInput").addEventListener("input", render);
  document.getElementById("btnCloseModal").addEventListener("click", closeModal);
  document.getElementById("btnCancelModal").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  content.addEventListener("click", async (event) => {
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;
    const addDay = event.target.dataset.addDay;
    if (event.target.id === "btnReload") await load();
    if (addDay) openModal(null, { weekday: addDay, shift: event.target.dataset.addShift });
    if (editId) openModal(data.find((row) => String(row.id) === String(editId)));
    if (deleteId && confirm("Ban co chac chan muon xoa lich hoc nay?")) {
      try {
        await Edu.request(`/lichhoc/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
        await load();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const item = {
      ma_mon: form.elements.ma_mon.value,
      teacher: form.elements.teacher.value,
      className: form.elements.className.value,
      room: form.elements.room.value.trim(),
      weekday: form.elements.weekday.value,
      shift: form.elements.shift.value,
    };
    if (!item.ma_mon || !item.teacher || !item.className || !item.weekday || !item.shift) {
      alert("Vui long nhap day du mon hoc, giang vien, lop, thu va ca.");
      return;
    }
    try {
      await Edu.request(`/lichhoc${editingId ? `/${encodeURIComponent(editingId)}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(item),
      });
      closeModal();
      await load();
    } catch (err) {
      alert(err.message);
    }
  });
});
