const SDK = "https://www.gstatic.com/firebasejs/13.4.0/";
const config = window.SMARTFUN_FIREBASE_CONFIG;
const clone = value => structuredClone(value);
const initialProducts = (window.SMARTFUN_PRODUCTS || []).map((product, order) => ({ ...clone(product), _docId: product.id, order, active: product.active !== false }));
const initialActivities = Object.entries(window.SMARTFUN_PLAYS || {}).flatMap(([equipmentId, list]) => list.map((activity, order) => ({ ...clone(activity), _docId: `${equipmentId}-${String(order + 1).padStart(2, "0")}`, equipmentId, order, active: activity.active !== false })));
const state = { products: clone(initialProducts), activities: clone(initialActivities), deletedActivities: new Set(), current: 0, activityId: null, dirty: false, preview: false, user: null, firebase: null, databaseEmpty: false };
const $ = selector => document.querySelector(selector);
const setup = $("#setup"), login = $("#login"), workspace = $("#workspace");
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const lines = value => String(value || "").split(/\r?\n/).map(item => item.trim()).filter(Boolean);
const imageValue = value => value?.m || value?.s || value || "";
const imageSource = product => { const image = imageValue(product.image); if (!image) return `../assets/img/${product.id}.png`; return /^(?:https?:|data:|blob:)/i.test(image) ? image : `../assets/${image}`; };
const setMessage = (selector, message, error = false) => { const el = $(selector); el.textContent = message; el.style.color = error ? "#b33628" : ""; };
function setDirty(dirty = true) { state.dirty = dirty; const el = $("#save-state"); el.textContent = dirty ? "有尚未儲存的修改" : "尚未修改"; el.className = `save-state${dirty ? " dirty" : ""}`; }

function showWorkspace(preview = false) { state.preview = preview; login.hidden = true; workspace.hidden = false; $("#preview-note").hidden = !preview; $("#publish").disabled = preview; renderAll(); }
function currentProduct() { return state.products[state.current]; }
function productActivities() { const id = currentProduct()?.id; return state.activities.filter(item => item.equipmentId === id).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)); }
function currentActivity() { const list = productActivities(); let item = list.find(activity => activity._docId === state.activityId); if (!item && list.length) { item = list[0]; state.activityId = item._docId; } return item; }

function renderAll() {
  $("#product-count").textContent = `${state.products.length} 項`;
  $("#category-list").innerHTML = [...new Set(state.products.map(p => p.cat).filter(Boolean))].map(c => `<option value="${escapeHTML(c)}">`).join("");
  $("#product-list").innerHTML = state.products.map((product, index) => `<button type="button" class="product-row${index === state.current ? " on" : ""}" data-index="${index}"><img src="${escapeHTML(imageSource(product))}" alt=""><span><b>${escapeHTML(product.name)}</b><small>${escapeHTML(product.cat || "未分類")}${product.active === false ? " · 已隱藏" : ""}</small></span><i>⋮</i></button>`).join("");
  $("#seed-data").hidden = state.preview || !state.databaseEmpty;
  renderProduct(); renderActivities();
}
function renderProduct() {
  const product = currentProduct(); if (!product) return;
  $("#editor-title").textContent = product.name || "未命名器材"; $("#image-preview").src = imageSource(product);
  document.querySelectorAll("[data-product-field]").forEach(input => { const key = input.dataset.productField; input.type === "checkbox" ? input.checked = key === "active" ? product[key] !== false : Boolean(product[key]) : input.value = key === "image" ? imageValue(product[key]) : (product[key] || ""); });
  $("#move-up").disabled = state.current === 0; $("#move-down").disabled = state.current === state.products.length - 1;
}
function renderActivities() {
  const list = productActivities(), active = currentActivity();
  $("#activity-list").innerHTML = list.map((item, index) => `<button type="button" class="activity-tab${item._docId === active?._docId ? " on" : ""}" data-activity-id="${escapeHTML(item._docId)}">${index + 1}. ${escapeHTML(item.name || "未命名關卡")}</button>`).join("");
  $("#activity-empty").hidden = Boolean(list.length); $("#activity-editor").hidden = !active;
  if (!active) return;
  document.querySelectorAll("[data-activity-field]").forEach(input => { const key = input.dataset.activityField; let value = active[key]; if (key === "photos") value = (active.photos?.length ? active.photos : active.photo ? [active.photo] : []).join("\n"); if (key === "steps") value = (active.steps || []).join("\n"); input.type === "checkbox" ? input.checked = active[key] !== false : input.value = value || ""; });
  const index = list.findIndex(item => item._docId === active._docId); $("#activity-up").disabled = index <= 0; $("#activity-down").disabled = index < 0 || index === list.length - 1;
}

$("#product-list").addEventListener("click", event => { const row = event.target.closest("[data-index]"); if (!row) return; state.current = Number(row.dataset.index); state.activityId = null; renderAll(); });
$("#activity-list").addEventListener("click", event => { const tab = event.target.closest("[data-activity-id]"); if (!tab) return; state.activityId = tab.dataset.activityId; renderActivities(); });
$("#editor").addEventListener("input", event => {
  const productKey = event.target.dataset.productField, activityKey = event.target.dataset.activityField;
  if (productKey) { const product = currentProduct(); const value = event.target.type === "checkbox" ? event.target.checked : event.target.value; product[productKey] = value; if (productKey === "name") $("#editor-title").textContent = value || "未命名器材"; if (productKey === "image") $("#image-preview").src = imageSource(product); setDirty(); }
  if (activityKey) { const activity = currentActivity(); const value = event.target.type === "checkbox" ? event.target.checked : event.target.value; if (activityKey === "photos") { activity.photos = lines(value); activity.photo = activity.photos[0] || ""; } else if (activityKey === "steps") activity.steps = lines(value); else activity[activityKey] = value; setDirty(); }
});
function moveProduct(offset) { const next = state.current + offset; if (next < 0 || next >= state.products.length) return; [state.products[state.current], state.products[next]] = [state.products[next], state.products[state.current]]; state.current = next; state.products.forEach((item, order) => item.order = order); setDirty(); renderAll(); }
$("#move-up").addEventListener("click", () => moveProduct(-1)); $("#move-down").addEventListener("click", () => moveProduct(1));
function moveActivity(offset) { const list = productActivities(), active = currentActivity(), index = list.findIndex(item => item._docId === active?._docId), next = index + offset; if (index < 0 || next < 0 || next >= list.length) return; [list[index].order, list[next].order] = [list[next].order, list[index].order]; setDirty(); renderActivities(); }
$("#activity-up").addEventListener("click", () => moveActivity(-1)); $("#activity-down").addEventListener("click", () => moveActivity(1));
$("#new-product").addEventListener("click", () => { const id = `item-${Date.now()}`; state.products.push({ _docId: id, id, name: "新器材", cat: "未分類", age: "3–6 歲", desc: "", image: "", order: state.products.length, active: true, skills: [] }); state.current = state.products.length - 1; state.activityId = null; setDirty(); renderAll(); });
$("#new-activity").addEventListener("click", () => { const product = currentProduct(); if (!product) return; const list = productActivities(), id = `${product.id}-${crypto.randomUUID()}`; state.activities.push({ _docId: id, equipmentId: product.id, order: list.length, name: "新關卡", intro: "", photos: [], steps: [], safety: "", easier: "", harder: "", age: [], limit: [], skills: [], props: [], active: true }); state.activityId = id; setDirty(); renderActivities(); });
$("#remove-activity").addEventListener("click", () => { const activity = currentActivity(); if (!activity || !confirm(`確定要從測試資料庫刪除「${activity.name}」嗎？`)) return; state.deletedActivities.add(activity._docId); state.activities = state.activities.filter(item => item._docId !== activity._docId); state.activityId = null; productActivities().forEach((item, order) => item.order = order); setDirty(); renderActivities(); });

$("#seed-data").addEventListener("click", async () => { if (!confirm("要把正式網站目前的器材與關卡複製到測試資料庫嗎？")) return; state.products = clone(initialProducts); state.activities = clone(initialActivities); state.current = 0; state.activityId = null; state.databaseEmpty = false; setDirty(); renderAll(); await saveDatabase(); });
$("#publish").addEventListener("click", saveDatabase);
async function saveDatabase() {
  if (state.preview || !state.firebase) return; const button = $("#publish"); button.disabled = true; button.textContent = "儲存中…";
  try { const equipment = {}, activities = {};
    state.products.forEach((product, order) => { const { _docId, ...data } = product; data.order = order; equipment[_docId] = data; });
    state.activities.forEach(activity => { const { _docId, ...data } = activity; activities[_docId] = data; });
    await state.firebase.set(state.firebase.ref(state.firebase.db,"smartfunTest"), { equipment, activities, updatedAt: state.firebase.serverTimestamp(), updatedBy: state.user.uid });
    state.deletedActivities.clear(); state.databaseEmpty = false; setDirty(false); const save = $("#save-state"); save.textContent = "已存入測試資料庫"; save.className = "save-state ok";
  } catch (error) { console.error(error); alert(`儲存失敗：${friendlyError(error)}`); } finally { button.disabled = false; button.textContent = "儲存到測試資料庫"; }
}

$("#preview-mode").addEventListener("click", () => showWorkspace(true));
$("#google-login").addEventListener("click", async () => { if (!config?.databaseURL) return setMessage("#login-status", "請先完成 Firebase 設定。", true); try { setMessage("#login-status", "正在開啟 Google 登入…"); const provider = new state.firebase.GoogleAuthProvider(); provider.setCustomParameters({ prompt: "select_account" }); await state.firebase.signInWithPopup(state.firebase.auth,provider); } catch(error) { console.error(error); setMessage("#login-status",`登入失敗：${friendlyError(error)}`,true); } });
$("#sign-out").addEventListener("click", async () => { await state.firebase?.signOut(state.firebase.auth); location.reload(); });
async function startFirebase() {
  if (!config?.databaseURL) { setup.hidden = false; $("#google-login").disabled = true; return; }
  try { const [appSDK,authSDK,databaseSDK] = await Promise.all([import(`${SDK}firebase-app.js`),import(`${SDK}firebase-auth.js`),import(`${SDK}firebase-database.js`)]); const app=appSDK.initializeApp(config),auth=authSDK.getAuth(app),db=databaseSDK.getDatabase(app); state.firebase={...authSDK,...databaseSDK,auth,db};
    authSDK.onAuthStateChanged(auth,async user=>{ if(!user)return; setMessage("#login-status","正在確認管理員權限…"); try { const admin=await databaseSDK.get(databaseSDK.ref(db,`smartfunAdmins/${user.uid}`)); if(admin.val()!==true){await authSDK.signOut(auth);return setMessage("#login-status","這個帳號尚未加入 SmartFun 管理員白名單。",true);} state.user=user; $("#account-name").textContent=user.email||user.displayName; $("#sign-out").hidden=false; const snapshot=await databaseSDK.get(databaseSDK.ref(db,"smartfunTest")),data=snapshot.val()||{}; state.databaseEmpty=!data.equipment; if(data.equipment){state.products=Object.entries(data.equipment).map(([id,value])=>({_docId:id,id,...value})).sort((a,b)=>(a.order??9999)-(b.order??9999));state.activities=Object.entries(data.activities||{}).map(([id,value])=>({_docId:id,...value}));}else{state.products=clone(initialProducts);state.activities=clone(initialActivities);} showWorkspace(false); } catch(error){console.error(error);setMessage("#login-status",`權限或資料讀取失敗：${friendlyError(error)}`,true);} });
  } catch(error){console.error(error);setup.hidden=false;setMessage("#login-status","Firebase 載入失敗，仍可使用預覽模式。",true);}
}
function friendlyError(error){return /permission/i.test(error?.code||error?.message||"")?"沒有管理員權限，請檢查白名單與安全規則。":(error?.message||"未知錯誤");}
startFirebase();
