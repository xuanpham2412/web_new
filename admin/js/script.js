const Edu = (() => {
  const API = "http://localhost:3000/api";
  const pages = {
    bangthongtin: { title: "Bang thong tin", label: "Bang thong tin", file: "bangthongtin.html" },
    sinhvien: { title: "Quan ly sinh vien", label: "Sinh vien", file: "sinhvien.html" },
    giangvien: { title: "Quan ly giang vien", label: "Giang vien", file: "giangvien.html" },
    khoa: { title: "Quan ly khoa", label: "Khoa", file: "khoa.html" },
    monhoc: { title: "Quan ly mon hoc", label: "Mon hoc", file: "monhoc.html" },
    lophoc: { title: "Quan ly lop hoc", label: "Lop hoc", file: "lophoc.html" },
    diemso: { title: "Quan ly diem so", label: "Diem so", file: "diemso.html" },
    lichhoc: { title: "Lich giang day", label: "Lich giang day", file: "lichhoc.html" },
  };

  const counts = { sinhvien: 0, giangvien: 0, khoa: 0, monhoc: 0, lophoc: 0 };
  let optionCache = null;

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const result = await response.json().catch(() => ({ success: false, message: "Phan hoi server khong hop le" }));
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Loi ket noi server");
    }
    return result.data;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  }

  function initials(name) {
    const words = String(name || "").trim().split(/\s+/);
    if (!words[0]) return "NA";
    return ((words[0][0] || "") + (words[words.length - 1][0] || "")).toUpperCase();
  }

  function badge(text) {
    const value = String(text || "");
    const good = /dang|hoat|dat|mo/i.test(value);
    return `<span class="badge ${good ? "badge-active" : "badge-warning"}">${esc(value)}</span>`;
  }

  function personCell(row, emailField = "email") {
    return `<div class="avatar-cell"><div class="avatar avatar-blue">${esc(initials(row.name || row.student))}</div><div><div class="strong">${esc(row.name || row.student)}</div><div class="muted">${esc(row[emailField] || row.id)}</div></div></div>`;
  }

  function renderShell(pageKey, options = {}) {
    const page = pages[pageKey];
    document.getElementById("sidebar").innerHTML = `
      <div class="sidebar-brand">
        <div class="brand-icon">EM</div>
        <div><div class="brand-name">EduManager</div><div class="brand-sub">QUAN LY TRUONG HOC</div></div>
      </div>
      <div class="sidebar-nav">
        <div class="nav-section-label">TONG QUAN</div>
        <a href="${pages.bangthongtin.file}" class="nav-item ${pageKey === "bangthongtin" ? "active" : ""}">Bang thong tin</a>
        <div class="nav-section-label">QUAN LY</div>
        ${["sinhvien", "giangvien", "khoa", "monhoc", "lophoc"].map((item) => `<a href="${pages[item].file}" class="nav-item ${pageKey === item ? "active" : ""}">${pages[item].label}<span class="nav-badge" data-count="${item}">${counts[item]}</span></a>`).join("")}
        <div class="nav-section-label">HOC VU</div>
        <a href="${pages.diemso.file}" class="nav-item ${pageKey === "diemso" ? "active" : ""}">Diem so</a>
        <a href="${pages.lichhoc.file}" class="nav-item ${pageKey === "lichhoc" ? "active" : ""}">Lich giang day</a>
      </div>
      <div class="sidebar-footer">
        <div class="user-card account-card">
          <div class="user-avatar">AD</div>
          <div class="user-meta"><div class="user-name">Admin</div><div class="user-role">Quan tri vien</div></div>
          <button class="logout-btn" id="logoutBtn" title="Dang xuat">Dang xuat</button>
        </div>
      </div>`;

    document.getElementById("pageTitle").textContent = page.title;
    document.getElementById("topbarActions").innerHTML = `
      <div class="search-box"><input type="text" id="searchInput" placeholder="Tim kiem..." /></div>
      ${options.addLabel ? `<button class="btn btn-primary" id="btnAdd">+ Them moi</button>` : ""}`;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("edu_current_user");
      window.location.href = "../../dangnhap/dangnhap.html";
    });

    refreshSidebarCounts();
  }

  async function refreshSidebarCounts() {
    try {
      const dashboard = await request("/dashboard");
      const t = dashboard.totals || {};
      updateSidebarCounts({
        sinhvien: t.students,
        giangvien: t.teachers,
        khoa: t.departments,
        monhoc: t.subjects,
        lophoc: t.classes,
      });
    } catch (err) {
      console.warn("Khong cap nhat duoc thong ke sidebar", err);
    }
  }

  function updateSidebarCounts(dataMap) {
    Object.entries(dataMap).forEach(([key, value]) => {
      counts[key] = Array.isArray(value) ? value.length : Number(value || 0);
      document.querySelectorAll(`[data-count="${key}"]`).forEach((el) => {
        el.textContent = counts[key];
      });
    });
  }

  function errorBlock(message) {
    return `<div class="table-card"><div class="empty-cell">${esc(message)}<br />Hay bat XAMPP MySQL va chay <strong>node server.js</strong>.</div></div>`;
  }

  async function getOptions() {
    if (!optionCache) optionCache = await request("/options");
    return optionCache;
  }

  function fieldOptions(field, options) {
    if (field.source && options[field.source]) return options[field.source];
    return (field.options || []).map((value) => ({ value, label: value }));
  }

  function validateFormItem(fields, item) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{9,11}$/;
    for (const field of fields) {
      const value = String(item[field.name] ?? "").trim();
      if (field.required && !value) return `${field.label} khong duoc de trong.`;
      if ((field.name === "id" || field.name === "msv" || field.name === "ma_mon") && value && value.length < 2) {
        return `${field.label} phai co it nhat 2 ky tu.`;
      }
      if (field.type === "email" && value && !emailRegex.test(value)) return "Email khong dung dinh dang.";
      if (field.type === "tel" && value && !phoneRegex.test(value)) return "So dien thoai chi gom 9-11 chu so.";
      if (field.type === "number" && value && Number.isNaN(Number(value))) return `${field.label} phai la so.`;
    }
    return "";
  }

  async function initCrud(config) {
    renderShell(config.page, { addLabel: true });
    let data = [];
    let editingId = null;
    let options = {};
    const content = document.getElementById("content");
    const modal = document.getElementById("crudModal");
    const form = document.getElementById("crudForm");

    content.innerHTML = `
      <div class="stats-grid ${config.stats.length === 3 ? "three" : ""}">
        ${config.stats.map((s) => `<div class="stat-card ${s.color}"><div class="stat-label">${s.label}</div><div class="stat-value" id="${s.id}">0</div></div>`).join("")}
      </div>
      <div class="table-card">
        <div class="table-header">
          <div class="table-title">${config.tableTitle}</div>
          <div class="table-filters">${(config.filters || []).map((f) => `<select class="filter-select" id="${f.id}"><option value="all">${f.label}</option>${f.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}</select>`).join("")}</div>
        </div>
        <div class="table-wrap">
          <table><thead><tr>${config.columns.map((c) => `<th>${c.label}</th>`).join("")}<th>THAO TAC</th></tr></thead><tbody id="tableBody"></tbody></table>
        </div>
        <div class="pagination"><div class="pagination-info" id="paginationInfo"></div><div class="pagination-btns"><button class="page-btn">&lt;</button><button class="page-btn active">1</button><button class="page-btn">&gt;</button></div></div>
      </div>`;

    try {
      options = await getOptions();
    } catch (err) {
      options = {};
    }

    document.getElementById("modalFields").innerHTML = config.fields.map((f) => {
      const choices = fieldOptions(f, options);
      const input = f.type === "select"
        ? `<select class="form-input" name="${f.name}" ${f.required ? "required" : ""}><option value="">-- Chon --</option>${choices.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("")}</select>`
        : `<input class="form-input" type="${f.type || "text"}" name="${f.name}" ${f.type === "number" ? 'step="any" inputmode="decimal"' : ""} ${f.type === "tel" ? 'inputmode="numeric" maxlength="11"' : ""} ${f.required ? "required" : ""} />`;
      return `<div class="form-group ${f.full ? "full" : ""}"><label class="form-label">${f.label}</label>${input}</div>`;
    }).join("");

    form.querySelectorAll('input[type="number"]').forEach((input) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9.]/g, "");
      });
    });
    form.querySelectorAll('input[type="tel"]').forEach((input) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 11);
      });
    });

    function filtered() {
      const text = document.getElementById("searchInput").value.trim().toLowerCase();
      return data.filter((row) => {
        const matchSearch = !text || config.searchFields.some((field) => String(row[field] || "").toLowerCase().includes(text));
        const matchFilters = (config.filters || []).every((f) => {
          const value = document.getElementById(f.id).value;
          return value === "all" || String(row[f.field]) === value;
        });
        return matchSearch && matchFilters;
      });
    }

    function updateStats() {
      config.stats.forEach((s) => {
        document.getElementById(s.id).textContent = s.value(data);
      });
    }

    function render() {
      const rows = filtered();
      const tbody = document.getElementById("tableBody");
      tbody.innerHTML = rows.length
        ? rows.map((row) => `<tr>${config.columns.map((c) => `<td>${c.render ? c.render(row) : esc(row[c.field])}</td>`).join("")}<td><div class="action-btns"><button class="btn btn-sm btn-outline" data-edit="${esc(row.id)}">Sua</button><button class="btn btn-sm btn-danger-outline" data-delete="${esc(row.id)}">Xoa</button></div></td></tr>`).join("")
        : `<tr><td colspan="${config.columns.length + 1}" class="empty-cell">Khong co du lieu phu hop.</td></tr>`;
      document.getElementById("paginationInfo").textContent = `Hien thi ${rows.length ? `1-${rows.length}` : "0"} / ${rows.length} ${config.singular}`;
      updateStats();
      if (counts[config.store] !== undefined) updateSidebarCounts({ [config.store]: data.length });
    }

    async function load() {
      data = await request(`/${config.store}`);
      render();
    }

    function openModal(row) {
      editingId = row ? row.id : null;
      document.getElementById("modalTitle").textContent = `${row ? "Sua" : "Them"} ${config.singular}`;
      form.reset();
      config.fields.forEach((f) => {
        const control = form.elements[f.name];
        control.value = row ? row[f.name] ?? "" : f.default ?? "";
        control.readOnly = Boolean(row && f.lockOnEdit);
      });
      modal.classList.add("open");
    }

    function closeModal() {
      modal.classList.remove("open");
    }

    document.getElementById("btnAdd").addEventListener("click", () => openModal());
    document.getElementById("searchInput").addEventListener("input", render);
    (config.filters || []).forEach((f) => document.getElementById(f.id).addEventListener("change", render));
    document.getElementById("btnCloseModal").addEventListener("click", closeModal);
    document.getElementById("btnCancelModal").addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const item = {};
      config.fields.forEach((f) => {
        const raw = form.elements[f.name].value.trim();
        item[f.name] = f.type === "number" ? Number(raw) : raw;
      });
      if (!item.id) item.id = `${config.idPrefix}${Date.now().toString().slice(-5)}`;
      const validationError = validateFormItem(config.fields, item);
      if (validationError) {
        alert(validationError);
        return;
      }

      try {
        await request(`/${config.store}${editingId ? `/${encodeURIComponent(editingId)}` : ""}`, {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(item),
        });
        closeModal();
        await load();
      } catch (err) {
        alert(err.message);
      }
    });

    document.getElementById("tableBody").addEventListener("click", async (event) => {
      const editId = event.target.dataset.edit;
      const deleteId = event.target.dataset.delete;
      if (editId) openModal(data.find((row) => String(row.id) === String(editId)));
      if (deleteId && confirm("Ban co chac chan muon xoa du lieu nay?")) {
        try {
          await request(`/${config.store}/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
          await load();
        } catch (err) {
          alert(err.message);
        }
      }
    });

    try {
      await load();
    } catch (err) {
      content.innerHTML = errorBlock(err.message);
    }
  }

  async function initDashboard() {
    renderShell("bangthongtin");
    const content = document.getElementById("content");
    let dashboardData = null;
    let editingNoticeId = null;

    function noticeFormHtml() {
      return `
        <div class="notice-modal" id="noticeModal" hidden>
          <div class="notice-dialog">
            <div class="modal-head">
              <div class="modal-title" id="noticeModalTitle">Them thong bao</div>
              <button class="modal-close" id="btnCloseNotice" type="button">&times;</button>
            </div>
            <form id="noticeForm">
              <div class="modal-body">
                <div class="form-grid single">
                  <div class="form-group full">
                    <label class="form-label">Tieu de *</label>
                    <input class="form-input" name="title" maxlength="255" required />
                  </div>
                  <div class="form-group full">
                    <label class="form-label">Noi dung *</label>
                    <textarea class="form-input textarea-input" name="content" required></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-outline" id="btnCancelNotice" type="button">Huy</button>
                <button class="btn btn-primary" type="submit">Luu</button>
              </div>
            </form>
          </div>
        </div>`;
    }

    function openNoticeModal(row = null) {
      editingNoticeId = row ? row.id : null;
      document.getElementById("noticeModalTitle").textContent = row ? "Sua thong bao" : "Them thong bao";
      const form = document.getElementById("noticeForm");
      form.reset();
      form.elements.title.value = row?.title || "";
      form.elements.content.value = row?.content || "";
      document.getElementById("noticeModal").hidden = false;
      form.elements.title.focus();
    }

    function closeNoticeModal() {
      document.getElementById("noticeModal").hidden = true;
      editingNoticeId = null;
    }

    function renderDashboard(dashboard) {
      const t = dashboard.totals;
      const q = dashboard.quick;
      const notices = dashboard.notifications || [];
      updateSidebarCounts({
        sinhvien: t.students,
        giangvien: t.teachers,
        khoa: t.departments,
        monhoc: t.subjects,
        lophoc: t.classes,
      });
      const max = Math.max(...dashboard.distribution.map((item) => Number(item.students || 0)), 1);
      content.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card blue"><div class="stat-label">TONG SINH VIEN</div><div class="stat-value">${esc(t.students)}</div><div class="stat-sub">Dang hoc: ${esc(t.activeStudents)}</div></div>
          <div class="stat-card green"><div class="stat-label">GIANG VIEN</div><div class="stat-value">${esc(t.teachers)}</div><div class="stat-sub">Dang giang day: ${esc(t.activeTeachers)}</div></div>
          <div class="stat-card amber"><div class="stat-label">KHOA / MON HOC</div><div class="stat-value">${esc(t.departments)} / ${esc(t.subjects)}</div><div class="stat-sub">Lay tu CSDL XAMPP</div></div>
          <div class="stat-card red"><div class="stat-label">GPA TRUNG BINH</div><div class="stat-value">${esc(t.avgGpa)}</div><div class="stat-sub">Tinh tu bang diem</div></div>
        </div>
        <div class="two-col">
          <div class="table-card dashboard-panel"><div class="table-header"><div class="table-title">Phan bo sinh vien theo khoa</div></div><div class="card-body">
            ${dashboard.distribution.length ? dashboard.distribution.map((k, index) => `<div class="chart-bar-item"><div class="chart-bar-label">${esc(k.name)}</div><div class="chart-bar-track"><div class="chart-bar-fill color-${index % 5}" style="width:${(Number(k.students || 0) / max) * 100}%"></div></div><div class="chart-bar-val">${esc(k.students)}</div></div>`).join("") : '<div class="empty-cell">Chua co sinh vien.</div>'}
          </div></div>
          <div>
            <div class="table-card mb-16"><div class="table-header"><div class="table-title">Thong ke nhanh</div></div><div class="card-body compact">
              <div class="quick-stat"><span>Tot nghiep loai Gioi</span><strong class="text-green">${esc(q.goodGraduates)} SV</strong></div>
              <div class="quick-stat"><span>Hoc bong ky nay</span><strong class="text-blue">${esc(q.scholarships)} SV</strong></div>
              <div class="quick-stat"><span>Canh bao hoc vu</span><strong class="text-red">${esc(q.warnings)} SV</strong></div>
              <div class="quick-stat"><span>Tien si / Thac si</span><strong>${esc(q.doctor)} / ${esc(q.master)}</strong></div>
            </div></div>
            <div class="table-card">
              <div class="table-header">
                <div class="table-title">Thong bao</div>
                <button class="btn btn-primary btn-sm" id="btnAddNotice" type="button">+ Them</button>
              </div>
              <div class="card-body notice-list">
                ${notices.length ? notices.map((notice) => `
                  <article class="notice-item">
                    <div class="notice-content">
                      <div class="notice-title">${esc(notice.title)}</div>
                      <div class="notice-date">${esc(notice.date)}</div>
                      <p>${esc(notice.content)}</p>
                    </div>
                    <div class="notice-actions">
                      <button class="btn btn-sm btn-outline" data-edit-notice="${esc(notice.id)}" type="button">Sua</button>
                      <button class="btn btn-sm btn-danger-outline" data-delete-notice="${esc(notice.id)}" type="button">Xoa</button>
                    </div>
                  </article>
                `).join("") : '<div class="empty-cell">Chua co thong bao.</div>'}
              </div>
            </div>
          </div>
        </div>
        ${noticeFormHtml()}`;
    }

    async function loadDashboard() {
      dashboardData = await request("/dashboard");
      renderDashboard(dashboardData);
    }

    try {
      await loadDashboard();
    } catch (err) {
      content.innerHTML = errorBlock(err.message);
    }

    content.addEventListener("click", async (event) => {
      const editId = event.target.dataset.editNotice;
      const deleteId = event.target.dataset.deleteNotice;
      if (event.target.id === "btnAddNotice") openNoticeModal();
      if (event.target.id === "btnCloseNotice" || event.target.id === "btnCancelNotice") closeNoticeModal();
      if (event.target.id === "noticeModal") closeNoticeModal();
      if (editId) {
        const notice = (dashboardData?.notifications || []).find((item) => String(item.id) === String(editId));
        openNoticeModal(notice);
      }
      if (deleteId && confirm("Ban co chac chan muon xoa thong bao nay?")) {
        try {
          await request(`/thongbao/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
          await loadDashboard();
        } catch (err) {
          alert(err.message);
        }
      }
    });

    content.addEventListener("submit", async (event) => {
      if (event.target.id !== "noticeForm") return;
      event.preventDefault();
      const form = event.target;
      const item = {
        title: form.elements.title.value.trim(),
        content: form.elements.content.value.trim(),
      };
      if (!item.title || !item.content) {
        alert("Vui long nhap tieu de va noi dung thong bao.");
        return;
      }
      try {
        await request(`/thongbao${editingNoticeId ? `/${encodeURIComponent(editingNoticeId)}` : ""}`, {
          method: editingNoticeId ? "PUT" : "POST",
          body: JSON.stringify(item),
        });
        closeNoticeModal();
        await loadDashboard();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  return { initCrud, initDashboard, renderShell, request, getOptions, updateSidebarCounts, badge, personCell, esc };
})();
