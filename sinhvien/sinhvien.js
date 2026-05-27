document.addEventListener("DOMContentLoaded", async () => {
  const API = "http://localhost:3000/api";
  const page = document.body.dataset.page || "info";
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const statusBox = document.getElementById("statusBox");
  const appContent = document.getElementById("appContent");

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  }

  function fmt(value) {
    return Number(value || 0).toFixed(2);
  }

  function renderShell(student = {}) {
    const nav = [
      { key: "info", label: "Thong tin", href: "thongtinsinhvien.html" },
      { key: "schedule", label: "Lich hoc", href: "xemlichhoc.html" },
      { key: "scores", label: "Bang diem", href: "bangdiem.html" },
    ];
    document.getElementById("studentSidebar").innerHTML = `
      <div class="brand"><span>EM</span><div><strong>EduManager</strong><small>Cong thong tin sinh vien</small></div></div>
      <nav>${nav.map((item) => `<a href="${item.href}" class="${page === item.key ? "active" : ""}">${item.label}</a>`).join("")}</nav>
      <div class="student-footer">
        <div class="student-user-card">
          <div class="student-avatar">${esc(initials(student.name || "SV"))}</div>
          <div class="student-user-meta"><div class="student-user-name">${esc(student.name || "Sinh vien")}</div><div class="student-user-role">Sinh vien</div></div>
          <button id="logoutBtn" class="student-logout" type="button">Dang xuat</button>
        </div>
      </div>`;
    document.getElementById("studentTopbar").innerHTML = `
      <div>
        <p>Xin chao</p>
        <h1>${esc(student.name || "Sinh vien")}</h1>
      </div>
      <div class="gpa-box"><span>GPA</span><strong>${fmt(student.gpa)}</strong></div>`;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("edu_current_user");
      window.location.href = "../dangnhap/dangnhap.html";
    });
  }

  function initials(name) {
    const words = String(name || "").trim().split(/\s+/);
    if (!words[0]) return "SV";
    return ((words[0][0] || "") + (words[words.length - 1][0] || "")).toUpperCase();
  }

  renderShell();

  if (!user || user.vai_tro !== "sinhvien") {
    statusBox.textContent = "Ban can dang nhap bang tai khoan sinh vien.";
    return;
  }

  try {
    const response = await fetch(`${API}/sinhvien-portal/${encodeURIComponent(user.id)}`);
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Khong tai duoc du lieu.");

    const { student, scores, schedule, notifications } = result.data;
    renderShell(student);

    if (page === "info") {
      renderInfo(student);
      renderNotifications(notifications || []);
    }
    if (page === "schedule") renderSchedule(schedule);
    if (page === "scores") renderScores(scores);

    statusBox.hidden = true;
    appContent.hidden = false;
  } catch (error) {
    statusBox.textContent = error.message;
  }

  function renderInfo(student) {
    document.getElementById("infoGrid").innerHTML = [
      ["MSSV", student.id],
      ["Email", student.email],
      ["Gioi tinh", student.gender],
      ["Ngay sinh", student.dob],
      ["Khoa", student.khoaName || student.khoa],
      ["Lop", student.lopName || student.lop],
      ["Trang thai", student.status],
      ["GPA", fmt(student.gpa)],
    ].map(([label, value]) => `<div class="info-item"><span>${esc(label)}</span><strong>${esc(value || "Chua co")}</strong></div>`).join("");
  }

  function renderNotifications(items) {
    const list = document.getElementById("noticeList");
    if (!list) return;
    list.innerHTML = items.length
      ? items.map((item) => `
        <article class="student-notice">
          <div class="student-notice-date">${esc(item.date)}</div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.content)}</p>
        </article>
      `).join("")
      : `<div class="empty-note">Chua co thong bao.</div>`;
  }

  function renderScores(scores) {
    document.getElementById("scoreBody").innerHTML = scores.length
      ? scores.map((row) => `<tr><td>${esc(row.subjectId)}</td><td>${esc(row.subject)}</td><td>${fmt(row.process)}</td><td>${fmt(row.exam)}</td><td class="${Number(row.final) < 5 ? "fail" : "pass"}">${fmt(row.final)}</td><td>${esc(row.rank || "")}</td></tr>`).join("")
      : `<tr><td colspan="6">Chua co diem.</td></tr>`;
  }

  function renderSchedule(items) {
    const days = ["Thu 2", "Thu 3", "Thu 4", "Thu 5", "Thu 6", "Thu 7"];
    const shifts = ["Sang", "Chieu", "Toi"];
    const aliases = {
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
    const grid = document.getElementById("scheduleGrid");
    let html = `<div class="schedule-cell head">Ca</div>${days.map((day) => `<div class="schedule-cell head">${day}</div>`).join("")}`;
    shifts.forEach((shift) => {
      html += `<div class="schedule-cell head">${shift}</div>`;
      days.forEach((day) => {
        const lessons = items.filter((item) => (aliases[item.weekday] || item.weekday) === day && (shiftAliases[item.shift] || item.shift) === shift);
        html += `<div class="schedule-cell">${lessons.length ? lessons.map((lesson) => `<div class="lesson"><strong>${esc(lesson.subject || "Mon hoc")}</strong><span>${esc(lesson.teacher || "")}</span><span>${esc(lesson.room || "")}</span></div>`).join("") : ""}</div>`;
      });
    });
    grid.innerHTML = html;
  }
});
