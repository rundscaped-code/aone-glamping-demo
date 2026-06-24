/* AONE GLAMPING — 共通データ層（localStorage）
   フォーム / 管理画面 / 設定 が同じ予約・設定データを共有する。
   ※デモ: ブラウザ内(localStorage)に保存。実案件ではAPI/DBに差し替え。 */
const AONE = (function () {
  const LS_SET = "aone.settings.v1";
  const LS_RES = "aone.reservations.v1";

  const pad = n => String(n).padStart(2, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (b, n) => { const d = new Date(b); d.setDate(d.getDate() + n); return d; };
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const yen = n => "¥" + Number(n).toLocaleString("ja-JP");

  const DEFAULTS = {
    facility: "AONE GLAMPING VILLA",
    villas: [
      { key: "dome",  name: "フォレストドーム",        price: 24000, units: 2, desc: "ドームテント／焚き火台・ウッドデッキ付き／最大4名" },
      { key: "cabin", name: "リバーサイドキャビン",    price: 38000, units: 2, desc: "木造キャビン／屋根付きテラス・沢沿い／最大4名" },
      { key: "sauna", name: "プレミアムサウナヴィラ",  price: 52000, units: 1, desc: "専用バレルサウナ・水風呂付き／最大4名" },
    ],
    options: [
      { key: "bbq",       name: "夕食BBQセット",   price: 3500, per: "guest" },
      { key: "breakfast", name: "朝食ボックス",     price: 1500, per: "guest" },
      { key: "sauna60",   name: "貸切サウナ60分",   price: 6000, per: "room"  },
      { key: "pet",       name: "ペット同伴",       price: 4000, per: "room"  },
    ],
  };
  const clone = o => JSON.parse(JSON.stringify(o));

  function getSettings() {
    try { const s = JSON.parse(localStorage.getItem(LS_SET)); return s && s.villas ? s : clone(DEFAULTS); }
    catch (e) { return clone(DEFAULTS); }
  }
  function saveSettings(s) { localStorage.setItem(LS_SET, JSON.stringify(s)); }
  function resetSettings() { localStorage.removeItem(LS_SET); }
  function villa(key, s) { s = s || getSettings(); return s.villas.find(v => v.key === key); }
  function totalUnits(s) { s = s || getSettings(); return s.villas.reduce((a, v) => a + (+v.units || 0), 0); }

  function getReservations() { try { return JSON.parse(localStorage.getItem(LS_RES)) || []; } catch (e) { return []; } }
  function saveReservations(a) { localStorage.setItem(LS_RES, JSON.stringify(a)); }
  function addReservation(r) { const a = getReservations(); a.push(r); saveReservations(a); return r; }
  function setStatus(id, status) {
    const a = getReservations(); const r = a.find(x => x.id === id); if (r) { r.status = status; saveReservations(a); } return r;
  }

  function priceOf(villaKey, nights, adults, children, optKeys, s) {
    s = s || getSettings();
    const v = villa(villaKey, s); if (!v) return 0;
    let total = v.price * nights;
    const guests = adults + children;
    (optKeys || []).forEach(k => {
      const o = s.options.find(x => x.key === k); if (!o) return;
      total += o.per === "guest" ? o.price * guests * nights : o.price * nights;
    });
    return total;
  }

  // villaKey の棟が [ci, ci+nights) の全泊で空いている数（最小空き）
  function freeUnits(villaKey, ciDate, nights, excludeId) {
    const s = getSettings(); const v = villa(villaKey, s); if (!v) return 0;
    const res = getReservations().filter(r => r.status !== "cancel" && r.villaKey === villaKey && r.id !== excludeId);
    let minFree = v.units;
    for (let n = 0; n < nights; n++) {
      const night = addDays(ciDate, n);
      const booked = res.filter(r => { const rci = parse(r.ci); return rci <= night && night < addDays(rci, r.nights); }).length;
      minFree = Math.min(minFree, v.units - booked);
    }
    return Math.max(0, minFree);
  }

  function seedIfEmpty() {
    if (localStorage.getItem(LS_RES)) return;
    const s = clone(DEFAULTS);
    const t = today();
    const NAMES = ["田中 陽子","佐藤 健","鈴木 美咲","高橋 大輔","渡辺 さくら","伊藤 涼","山本 翔","中村 ひかり","小林 拓海","加藤 萌","吉田 隼人","松本 結衣"];
    const keys = ["dome","cabin","sauna"];
    const offs = [0,0,1,2,-1,3,5,1,7,-2,4,2];
    const nights = [1,2,1,1,2,1,3,2,1,1,2,1];
    const stat = ["todo","ok","todo","ok","ok","todo","ok","cancel","todo","ok","todo","ok"];
    const optsByI = [["bbq"],["breakfast","sauna60"],[],["pet"],["bbq","breakfast"],["sauna60"],[],["bbq"],["breakfast"],[],["sauna60","pet"],["bbq"]];
    const arr = NAMES.map((nm, i) => {
      const villaKey = keys[i % 3];
      const ci = addDays(t, offs[i]);
      const adults = 1 + (i % 3), children = i % 2;
      const opts = optsByI[i % optsByI.length];
      return {
        id: "AO-" + (1043 + i), name: nm, villaKey,
        ci: iso(ci), nights: nights[i], adults, children, opts,
        tel: "090" + (10000000 + i * 734291).toString().slice(0, 8),
        email: nm.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "") + i + "@example.com",
        total: priceOf(villaKey, nights[i], adults, children, opts, s),
        status: stat[i],
      };
    });
    saveReservations(arr);
  }

  function nextId() {
    const a = getReservations();
    const max = a.reduce((m, r) => { const n = parseInt((r.id || "").replace(/\D/g, ""), 10); return isNaN(n) ? m : Math.max(m, n); }, 1042);
    return "AO-" + (max + 1);
  }

  return { iso, parse, addDays, today, yen, DEFAULTS,
    getSettings, saveSettings, resetSettings, villa, totalUnits,
    getReservations, saveReservations, addReservation, setStatus,
    priceOf, freeUnits, seedIfEmpty, nextId };
})();
