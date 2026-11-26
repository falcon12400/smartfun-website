// 從 Firestore 讀取後台發布的內容。未設定、離線或讀取失敗時，保留 catalog.js / plays.js 的靜態資料。
window.SMARTFUN_CONTENT_READY = (async () => {
  const config = window.SMARTFUN_FIREBASE_CONFIG;
  if (!config?.projectId) return { source: "static", reason: "not-configured" };

  try {
    const [{ initializeApp }, { getFirestore, doc, getDoc }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js"),
    ]);
    const db = getFirestore(initializeApp(config));
    const snapshot = await Promise.race([
      getDoc(doc(db, "siteContent", "main")),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase content timeout")), 6000)),
    ]);
    if (!snapshot.exists()) return { source: "static", reason: "empty" };

    const data = snapshot.data();
    if (Array.isArray(data.products) && window.SMARTFUN_PRODUCTS) {
      window.SMARTFUN_PRODUCTS.splice(0, window.SMARTFUN_PRODUCTS.length, ...data.products);
    }
    if (Array.isArray(data.categories) && window.SMARTFUN_CATS) {
      window.SMARTFUN_CATS.splice(0, window.SMARTFUN_CATS.length, ...data.categories);
    }
    if (data.plays && window.SMARTFUN_PLAYS) {
      Object.keys(window.SMARTFUN_PLAYS).forEach(key => delete window.SMARTFUN_PLAYS[key]);
      Object.assign(window.SMARTFUN_PLAYS, data.plays);
    }
    return { source: "firebase" };
  } catch (error) {
    console.warn("SmartFun 雲端內容讀取失敗，已改用靜態資料。", error);
    return { source: "static", reason: "error", error };
  }
})();

