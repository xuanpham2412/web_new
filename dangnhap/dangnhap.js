document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("errorMessage");
  const btnLogin = document.getElementById("btnLogin");
  const forgotForm = document.getElementById("forgotForm");
  const forgotUsername = document.getElementById("forgotUsername");
  const contactInput = document.getElementById("contact");
  const forgotMessage = document.getElementById("forgotMessage");
  const btnForgot = document.getElementById("btnForgot");
  const showForgot = document.getElementById("showForgot");
  const showLogin = document.getElementById("showLogin");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{9,11}$/;

  function showError(message) {
    errorMessage.textContent = message;
  }

  function validContact(value) {
    return emailRegex.test(value) || phoneRegex.test(value);
  }

  showForgot.addEventListener("click", () => {
    loginForm.classList.remove("active");
    forgotForm.classList.add("active");
    forgotUsername.value = usernameInput.value.trim();
    forgotMessage.textContent = "";
  });

  showLogin.addEventListener("click", () => {
    forgotForm.classList.remove("active");
    loginForm.classList.add("active");
    showError("");
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");

    const ten_dang_nhap = usernameInput.value.trim();
    const mat_khau = passwordInput.value.trim();

    if (!ten_dang_nhap || !mat_khau) {
      showError("Vui long nhap day du ten dang nhap va mat khau.");
      return;
    }
    if (ten_dang_nhap.length < 3 || mat_khau.length < 4) {
      showError("Ten dang nhap toi thieu 3 ky tu, mat khau toi thieu 4 ky tu.");
      return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = "Dang xu ly...";

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ten_dang_nhap, mat_khau }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Dang nhap that bai.");
      }

      localStorage.setItem("user", JSON.stringify(result.data));
      if (result.data.vai_tro === "sinhvien") {
        window.location.href = "../sinhvien/thongtinsinhvien.html";
      } else {
        window.location.href = "../admin/html/bangthongtin.html";
      }
    } catch (error) {
      showError(error.message || "Khong the ket noi server. Hay chay node server.js.");
      passwordInput.value = "";
      passwordInput.focus();
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = "Dang nhap";
    }
  });

  forgotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    forgotMessage.textContent = "";
    const ten_dang_nhap = forgotUsername.value.trim();
    const lien_he = contactInput.value.trim();

    if (ten_dang_nhap.length < 3) {
      forgotMessage.textContent = "Ten dang nhap toi thieu 3 ky tu.";
      return;
    }
    if (!validContact(lien_he)) {
      forgotMessage.textContent = "Nhap email hop le hoac so dien thoai 9-11 chu so.";
      return;
    }

    btnForgot.disabled = true;
    btnForgot.textContent = "Dang kiem tra...";
    try {
      const response = await fetch("http://localhost:3000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ten_dang_nhap, lien_he }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Khong lay lai duoc mat khau.");
      forgotMessage.style.color = "#16a34a";
      forgotMessage.textContent = `Mat khau cua ban: ${result.data.password}`;
    } catch (error) {
      forgotMessage.style.color = "#ef4444";
      forgotMessage.textContent = error.message;
    } finally {
      btnForgot.disabled = false;
      btnForgot.textContent = "Lay lai mat khau";
    }
  });
});
