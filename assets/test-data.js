// 測試網站專用：所有器材與關卡資料都從既有 SmartFunYearEndParty Firebase 讀取，不影響正式網站。
window.SMARTFUN_TEST_READY = (async () => {
  const products = window.SMARTFUN_PRODUCTS;
  const categories = window.SMARTFUN_CATS;
  const plays = window.SMARTFUN_PLAYS;
  products.splice(0); categories.splice(0); Object.keys(plays).forEach(key => delete plays[key]);

  const config = window.SMARTFUN_FIREBASE_CONFIG;
  if (!config?.databaseURL) return { source: "none", reason: "not-configured" };
  try {
    const [{ initializeApp }, { getDatabase, ref, get }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js"),
    ]);
    const db = getDatabase(initializeApp(config));
    const snapshot = await Promise.race([
      get(ref(db, "smartfunTest")),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase content timeout")), 7000)),
    ]);
    const data = snapshot.val() || {};
    const loadedProducts = Object.entries(data.equipment || {})
      .map(([id, value]) => ({ id, ...value }))
      .filter(item => item.active !== false)
      .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    const loadedActivities = Object.entries(data.activities || {})
      .map(([id, value]) => ({ _id: id, ...value }))
      .filter(item => item.active !== false)
      .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    products.push(...loadedProducts);
    categories.push(...new Set(loadedProducts.map(item => item.cat).filter(Boolean)));
    loadedActivities.forEach(activity => (plays[activity.equipmentId] ||= []).push(activity));
    return { source: "firebase", count: loadedProducts.length, activityCount: loadedActivities.length };
  } catch (error) {
    console.error("SmartFun 測試資料讀取失敗。", error);
    return { source: "none", reason: "error", error };
  }
})();

