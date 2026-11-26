const SDK = "https://www.gstatic.com/firebasejs/13.4.0/";
const config = window.SMARTFUN_FIREBASE_CONFIG;
const staticProducts = structuredClone(window.SMARTFUN_PRODUCTS || []);
const staticPlays = structuredClone(window.SMARTFUN_PLAYS || {});
const state = { products: staticProducts, plays: staticPlays, current: 0, dirty: false, preview: false, user: null, firebase: null };
const $ = selector => document.querySelector(selector);
const editor = $("#editor");
const setup = $("#setup");
const login = $("#login");
const workspace = $("#workspace");

const imageSource = product => {
  const image = product.image?.m || product.image?.s || product.image;
  if (!image) return `../assets/img/${product.id}.png`;
  return /^(?:https?:|data:|blob:)/i.test(image) ? image : `../assets/${image}`;
};
const setMessage = (selector, message, isError = false) => { const el = $(selector); el.textContent = message; el.style.color = isError ? "#b33628" : ""; };
const setDirty = (dirty = true) => { state.dirty = dirty; const el = $("#save-state"); el.textContent = dirty ? "有尚未發布的修改" : "尚未修改"; el.className = `save-state${dirty ? " dirty" : ""}`; };

function showWorkspace(preview = false) {
  state.preview = preview; login.hidden = true; workspace.hidden = false;
  $("#preview-note").hidden = !preview;
  $("#publish").disabled = preview;
  renderAll();
}

function renderAll() {
  $("#product-count").textContent = `${state.products.length} 項`;
  $("#category-list").innerHTML = [...new Set(state.products.map(p => p.cat).filter(Boolean))].map(c => `<option value="${escapeHTML(c)}">`).join("");
  $("#product-list").innerHTML = state.products.map((product, index) => `<button type="button" class="product-row${index === state.current ? " on" : ""}" data-index="${index}">
    <img src="${escapeHTML(imageSource(product))}" alt=""><span><b>${escapeHTML(product.name)}</b><small>${escapeHTML(product.cat || "未分類")}</small></span><i>⋮</i></button>`).join("");
  renderEditor();
}

function renderEditor() {
  const product = state.products[state.current]; if (!product) return;
  $("#editor-title").textContent = product.name;
  $("#image-preview").src = imageSource(product);
  for (const name of ["name", "cat", "age", "parts", "tagline", "desc"]) editor.elements[name].value = product[name] || "";
  $("#move-up").disabled = state.current === 0;
  $("#move-down").disabled = state.current === state.products.length - 1;
}

$("#product-list").addEventListener("click", event => {
  const row = event.target.closest("[data-index]"); if (!row) return;
  state.current = Number(row.dataset.index); renderAll();
});
editor.addEventListener("input", event => {
  if (!event.target.name) return; const product = state.products[state.current]; product[event.target.name] = event.target.value;
  if (event.target.name === "name") $("#editor-title").textContent = event.target.value || "未命名教具";
  setDirty();
});
function move(offset) { const next = state.current + offset; if (next < 0 || next >= state.products.length) return;
  [state.products[state.current], state.products[next]] = [state.products[next], state.products[state.current]]; state.current = next; setDirty(); renderAll(); }
$("#move-up").addEventListener("click", () => move(-1));
$("#move-down").addEventListener("click", () => move(1));

$("#image-file").addEventListener("change", async event => {
  const file = event.target.files[0]; if (!file) return;
  if (state.preview || !state.firebase) { $("#image-preview").src = URL.createObjectURL(file); setMessage("#upload-status", "預覽成功；連上 Firebase 後即可上傳。"); return; }
  if (file.size > 15 * 1024 * 1024) { setMessage("#upload-status", "圖片不可超過 15 MB。", true); return; }
  try {
    setMessage("#upload-status", "正在壓縮並上傳…");
    const product = state.products[state.current];
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const variants = {};
    for (const [key, width, quality] of [["s", 400, .78], ["m", 800, .82], ["l", 1600, .86]]) {
      const blob = await resizeImage(file, width, quality);
      const path = `public/products/${product.id}/${stamp}-${key}.webp`;
      const target = state.firebase.storageRef(state.firebase.storage, path);
      await state.firebase.uploadBytes(target, blob, { contentType: "image/webp", cacheControl: "public,max-age=31536000,immutable" });
      variants[key] = await state.firebase.getDownloadURL(target);
    }
    product.image = variants; $("#image-preview").src = variants.m; setDirty();
    setMessage("#upload-status", "圖片已上傳，按「發布到網站」才會正式套用。");
  } catch (error) { console.error(error); setMessage("#upload-status", `上傳失敗：${friendlyError(error)}`, true); }
  finally { event.target.value = ""; }
});

editor.addEventListener("submit", async event => {
  event.preventDefault(); if (state.preview || !state.firebase) return;
  const button = $("#publish"); button.disabled = true; button.textContent = "發布中…";
  try {
    const categories = [...new Set(state.products.map(p => p.cat).filter(Boolean))];
    await state.firebase.setDoc(state.firebase.doc(state.firebase.db, "siteContent", "main"), {
      products: state.products, plays: state.plays, categories, version: 1,
      updatedAt: state.firebase.serverTimestamp(), updatedBy: { uid: state.user.uid, email: state.user.email || "" },
    });
    setDirty(false); const save = $("#save-state"); save.textContent = "已發布"; save.className = "save-state ok";
  } catch (error) { console.error(error); alert(`發布失敗：${friendlyError(error)}`); }
  finally { button.disabled = false; button.textContent = "發布到網站"; }
});

$("#preview-mode").addEventListener("click", () => showWorkspace(true));
$("#google-login").addEventListener("click", async () => {
  if (!config?.projectId) { setMessage("#login-status", "請先完成 Firebase 設定。", true); return; }
  try { setMessage("#login-status", "正在開啟 Google 登入…"); await state.firebase.signInWithPopup(state.firebase.auth, new state.firebase.GoogleAuthProvider()); }
  catch (error) { console.error(error); setMessage("#login-status", `登入失敗：${friendlyError(error)}`, true); }
});
$("#sign-out").addEventListener("click", async () => { await state.firebase?.signOut(state.firebase.auth); location.reload(); });

async function startFirebase() {
  if (!config?.projectId) { setup.hidden = false; $("#google-login").disabled = true; return; }
  try {
    const [appSDK, authSDK, firestoreSDK, storageSDK] = await Promise.all([
      import(`${SDK}firebase-app.js`), import(`${SDK}firebase-auth.js`), import(`${SDK}firebase-firestore.js`), import(`${SDK}firebase-storage.js`),
    ]);
    const app = appSDK.initializeApp(config); const auth = authSDK.getAuth(app); const db = firestoreSDK.getFirestore(app); const storage = storageSDK.getStorage(app);
    state.firebase = { ...authSDK, ...firestoreSDK, ...storageSDK, storageRef: storageSDK.ref, auth, db, storage };
    authSDK.onAuthStateChanged(auth, async user => {
      if (!user) return;
      setMessage("#login-status", "正在確認管理員權限…");
      try {
        const admin = await firestoreSDK.getDoc(firestoreSDK.doc(db, "admins", user.uid));
        if (!admin.exists() || admin.data().enabled !== true) { await authSDK.signOut(auth); setMessage("#login-status", "這個帳號尚未加入管理員白名單。", true); return; }
        state.user = user; $("#account-name").textContent = user.email || user.displayName; $("#sign-out").hidden = false;
        const content = await firestoreSDK.getDoc(firestoreSDK.doc(db, "siteContent", "main"));
        if (content.exists()) { const data = content.data(); if (Array.isArray(data.products)) state.products = structuredClone(data.products); if (data.plays) state.plays = structuredClone(data.plays); }
        showWorkspace(false);
      } catch (error) { console.error(error); setMessage("#login-status", `權限檢查失敗：${friendlyError(error)}`, true); }
    });
  } catch (error) { console.error(error); setup.hidden = false; setMessage("#login-status", "Firebase 載入失敗，仍可使用預覽模式。", true); }
}

function resizeImage(file, maxWidth, quality) {
  return new Promise((resolve, reject) => { const image = new Image(); const url = URL.createObjectURL(file);
    image.onload = () => { const scale = Math.min(1, maxWidth / image.naturalWidth); const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext("2d", { alpha: true }).drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => { URL.revokeObjectURL(url); blob ? resolve(blob) : reject(new Error("圖片轉檔失敗")); }, "image/webp", quality); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("無法讀取圖片")); }; image.src = url; });
}
function friendlyError(error) { return error?.code === "permission-denied" || error?.code === "storage/unauthorized" ? "沒有管理員權限，請檢查白名單與 Security Rules。" : (error?.message || "未知錯誤"); }
function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }

startFirebase();

