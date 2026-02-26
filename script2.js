const API_URL = "http://127.0.0.1:8000/api/login";


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


const form = document.getElementById("loginForm");
const msgBox = document.getElementById("formMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMsg(msgBox);

  const submitBtn = form.querySelector('button[type="submit"]');

  const email = form.email.value.trim();
  const password = form.password.value;



  if (!email || !password) {
    showMsg(msgBox, "err", "لطفاً همه فیلدهای ضروری را کامل کنید.");
    return;
  }

  if (password.length < 8) {
    showMsg(msgBox, "err", "رمز عبور باید حداقل ۸ کاراکتر باشد.");
    return;
  }


  const payload = {
    email,
    password,
  };

  try {
    setLoading(submitBtn, true);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });


    let data = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {

      const text = await res.text();
      data = { message: text };
    }

    if (!res.ok) {
      const serverMsg =
        data?.message ||
        data?.error ||
        "خطایی رخ داد. لطفاً دوباره تلاش کنید.";
      showMsg(msgBox, "err", serverMsg);
      return;
    }
    if (!res.ok) {

      if (data?.errors) {
        const firstError = Object.values(data.errors)[0][0];
        showMsg(msgBox, "err", firstError);
      } else {
        showMsg(msgBox, "err", data?.message || "خطایی رخ داد");
      }

      return;
    }

    const token = data.token;
    console.log(token);
    // موفقیت
    const okMsg = data?.message || "ورود با موفقیت انجام شد ✅";
    showMsg(msgBox, "ok", okMsg);
    console.log(res);
    form.reset();
  } catch (err) {
    showMsg(msgBox, "err", "مشکل در اتصال به سرور. اینترنت یا آدرس API را چک کنید.");
  } finally {
    setLoading(submitBtn, false);
  }
});
