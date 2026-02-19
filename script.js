const API_URL = "http://localhost:8000/api/register"; 

// ===== ابزارهای کوچک =====
function showMsg(el, type, text) {
  el.classList.remove("msg--ok", "msg--err");
  el.classList.add(type === "ok" ? "msg--ok" : "msg--err");
  el.textContent = text;
  el.style.display = "block";
}

function clearMsg(el) {
  el.classList.remove("msg--ok", "msg--err");
  el.textContent = "";
  el.style.display = "none";
}

function setLoading(btn, isLoading) {
  btn.disabled = isLoading;
  btn.dataset.originalText ??= btn.textContent;
  btn.textContent = isLoading ? "در حال ارسال..." : btn.dataset.originalText;
}

// ===== منطق فرم =====
const form = document.getElementById("registerForm");
const msgBox = document.getElementById("formMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMsg(msgBox);

  const submitBtn = form.querySelector('button[type="submit"]');

  // گرفتن مقادیر
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  const termsAccepted = form.terms.checked;

  // ولیدیشن سمت کلاینت
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    showMsg(msgBox, "err", "لطفاً همه فیلدهای ضروری را کامل کنید.");
    return;
  }

  if (password.length < 8) {
    showMsg(msgBox, "err", "رمز عبور باید حداقل ۸ کاراکتر باشد.");
    return;
  }

  if (password !== confirmPassword) {
    showMsg(msgBox, "err", "رمز عبور و تکرار آن یکسان نیستند.");
    return;
  }

  if (!termsAccepted) {
    showMsg(msgBox, "err", "برای ادامه باید قوانین و شرایط را تایید کنید.");
    return;
  }

  // بدنه‌ی درخواست به API
  // اگر بک‌اند شما نام فیلدها را متفاوت می‌خواهد، همینجا تغییر بده.
  const payload = {
    firstName,
    lastName,
    email,
    phone: phone || null,
    password,
  };

  try {
    setLoading(submitBtn, true);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // اگر توکن داری اینجا بفرست:
        // "Authorization": "Bearer <token>"
      },
      body: JSON.stringify(payload),
    });

    // تلاش برای خواندن پاسخ JSON (حتی در خطا)
    let data = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {

      const text = await res.text();
      data = { message: text };
    }

    if (!res.ok) {
      // پیام خطا از سرور (اگر موجود باشد)
      const serverMsg =
        data?.message ||
        data?.error ||
        "خطایی رخ داد. لطفاً دوباره تلاش کنید.";
      showMsg(msgBox, "err", serverMsg);
      return;
    }

    // موفقیت
    const okMsg = data?.message || "ثبت‌نام با موفقیت انجام شد ✅";
    showMsg(msgBox, "ok", okMsg);

    // اگر خواستی بعد از موفقیت ریدایرکت کنی:
    // window.location.href = "/login";

    // پاک کردن فرم
    form.reset();
  } catch (err) {
    showMsg(msgBox, "err", "مشکل در اتصال به سرور. اینترنت یا آدرس API را چک کنید.");
  } finally {
    setLoading(submitBtn, false);
  }
});
