document.addEventListener("DOMContentLoaded", () => {
  Edu.initCrud({
    page: "khoa",
    store: "khoa",
    singular: "khoa",
    tableTitle: "Danh sach khoa",
    idPrefix: "K",
    searchFields: ["id", "name", "dean"],
    stats: [
      { id: "statTotal", label: "TONG SO KHOA", color: "blue", value: (data) => data.length },
      { id: "statStudents", label: "SINH VIEN", color: "green", value: (data) => data.reduce((sum, k) => sum + Number(k.students || 0), 0) },
      { id: "statTeachers", label: "GIANG VIEN", color: "amber", value: (data) => data.reduce((sum, k) => sum + Number(k.teachers || 0), 0) },
    ],
    columns: [
      { label: "MA KHOA", field: "id" },
      { label: "TEN KHOA", render: (row) => `<div class="strong">${Edu.esc(row.name)}</div><div class="muted">Truong khoa: ${Edu.esc(row.deanName || row.dean || "Chua co")}</div>` },
      { label: "SINH VIEN", field: "students" },
      { label: "GIANG VIEN", field: "teachers" },
      { label: "TRANG THAI", render: (row) => Edu.badge(row.status) },
    ],
    fields: [
      { name: "id", label: "Ma khoa *", required: true, lockOnEdit: true },
      { name: "name", label: "Ten khoa *", required: true },
      { name: "dean", label: "Ma giang vien truong khoa", type: "select", source: "giangvien", full: true },
      { name: "students", label: "So sinh vien", type: "number", default: 0 },
      { name: "teachers", label: "So giang vien", type: "number", default: 0 },
      { name: "status", label: "Trang thai", type: "select", options: ["hoat dong", "tam ngung"], default: "hoat dong" },
    ],
  });
});
