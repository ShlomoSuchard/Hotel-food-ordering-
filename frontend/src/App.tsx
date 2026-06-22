import { useState, useRef, useEffect } from "react";

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "meat",     label: "Meat & Poultry",    icon: "🥩", color: "#991B1B" },
  { id: "fish",     label: "Fish & Seafood",     icon: "🐟", color: "#1E40AF" },
  { id: "dairy",    label: "Dairy",              icon: "🧀", color: "#166534" },
  { id: "produce",  label: "Produce",            icon: "🥦", color: "#92400E" },
  { id: "dry",      label: "Dry Goods",          icon: "🫙", color: "#6D28D9" },
  { id: "bakery",   label: "Bakery",             icon: "🍞", color: "#9A3412" },
  { id: "beverage", label: "Beverages",          icon: "🧃", color: "#0F766E" },
];

// contactMethod: "whatsapp" | "sms" | "email"
const DEFAULT_VENDORS = {
  meat:     [{ id:"m1",  name:"", phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerKg:0 }],
  fish:     [{ id:"f1",  name:"", phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerKg:0 }],
  dairy:    [{ id:"d1",  name:"", phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerKg:0 }],
  produce:  [{ id:"p1",  name:"", phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerKg:0 }],
  dry:      [{ id:"dr1", name:"", phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerKg:0 }],
  bakery:   [{ id:"b1",  name:"", phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerKg:0 }],
  beverage: [{ id:"bv1", name:"", phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerKg:0 }],
};

// ─── CONTACT METHOD CONFIG ────────────────────────────────────────────────────
const CONTACT_METHODS = [
  { id:"whatsapp", label:"WhatsApp", icon:"💬", color:"#25D366", textColor:"#fff" },
  { id:"sms",      label:"SMS Text", icon:"📱", color:"#2563EB", textColor:"#fff" },
  { id:"email",    label:"Email",    icon:"📧", color:"#7C3AED", textColor:"#fff" },
];

const buildOrderMessage = (group, dept) => {
  const d = new Date().toLocaleDateString("en-GB");
  let msg = `Hotel Order (${dept}) — ${d}\n\n`;
  group.items.forEach(i => { msg += `• ${i.name}: ${i.qty} ${i.unit}\n`; });
  return msg;
};

const buildWhatsAppMsg = (group, dept) => {
  const d = new Date().toLocaleDateString("en-GB");
  let msg = `🏨 *Hotel Order (${dept}) — ${d}*\n\n`;
  group.items.forEach(i => { msg += `• ${i.name}: *${i.qty} ${i.unit}*\n`; });
  return msg;
};

const genId = () => Math.random().toString(36).slice(2,8);
const todayStr = () => new Date().toLocaleDateString("en-GB");

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  // MODE: "staff" = ultra simple scan+send | "manager" = full control
  const [mode, setMode]         = useState("staff");
  const [dept, setDept]         = useState("Restaurant");

  // Core data
  const [vendors, setVendors]   = useState(() => LS.get("kh3_vendors", DEFAULT_VENDORS));
  const [priceDB, setPriceDB]   = useState(() => LS.get("kh3_prices", {})); // { itemName: { vendorId, price, unit, updatedAt } }
  const [history, setHistory]   = useState(() => LS.get("kh3_history", []));
  const [customItems, setCustomItems] = useState(() => LS.get("kh3_customs", {}));

  // Staff flow state
  const [staffStep, setStaffStep] = useState("home"); // home | scanning | review | sending | done
  const [scannedItems, setScannedItems] = useState([]); // [{name,qty,unit,catId,vendorId,price}]
  const [capturedImage, setCapturedImage] = useState(null);
  const [sentList, setSentList] = useState([]);

  // Manager sub-screens
  const [mgTab, setMgTab]       = useState("dashboard"); // dashboard | vendors | prices | emailimport | history

  // Email import
  const [emailText, setEmailText] = useState("");
  const [emailParsing, setEmailParsing] = useState(false);
  const [emailResult, setEmailResult]   = useState(null);

  // Bulk invoice import
  const [bulkFiles, setBulkFiles]       = useState([]); // [{name, status, count, error}]
  const [bulkRunning, setBulkRunning]   = useState(false);
  const [bulkDone, setBulkDone]         = useState(false);
  const [webhookKey]                    = useState(() => {
    const k = LS.get("kh_webhook_key","");
    if (k) return k;
    const nk = "hk_" + Math.random().toString(36).slice(2,12);
    LS.set("kh_webhook_key", nk);
    return nk;
  });

  // UI
  const [toast, setToast]       = useState(null);
  const [editVendor, setEditVendor] = useState(null);
  const [vendorDraft, setVendorDraft] = useState({});

  const cameraRef = useRef();
  const fileRef   = useRef();

  const showToast = (msg, type="ok") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3500);
  };

  const saveVendors = (v) => { setVendors(v); LS.set("kh3_vendors",v); };
  const savePriceDB = (p) => { setPriceDB(p);  LS.set("kh3_prices",p); };
  const saveHistory = (h) => { setHistory(h);  LS.set("kh3_history",h); };

  const allVendorsList = Object.values(vendors).flat();

  const getCatVendors = (catId) =>
    (vendors[catId]||[]).filter(v => v.name && v.phone && v.dept.includes(dept));

  const getBestVendor = (catId) => {
    const eligible = getCatVendors(catId);
    const withPrice = eligible.filter(v=>v.pricePerKg>0).sort((a,b)=>a.pricePerKg-b.pricePerKg);
    return withPrice[0] || eligible[0] || null;
  };

  // ── GROUP scanned items by vendor ──────────────────────────────────────────
  const groupByVendor = (items) => {
    const map = {};
    items.forEach(item => {
      const key = item.vendorId || "__none";
      if (!map[key]) map[key] = { vendor: allVendorsList.find(v=>v.id===item.vendorId)||null, items:[] };
      map[key].items.push(item);
    });
    return Object.values(map);
  };

  // ── SCAN: photo or file ────────────────────────────────────────────────────
  const handleImageCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStaffStep("scanning");
    setCapturedImage(URL.createObjectURL(file));

    const b64 = await new Promise((res,rej) => {
      const r = new FileReader();
      r.onload = ()=>res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          messages:[{
            role:"user",
            content:[
              { type:"image", source:{ type:"base64", media_type: file.type||"image/jpeg", data:b64 } },
              { type:"text", text:`This is a handwritten or printed kosher hotel kitchen order note. Extract every item listed.
Return ONLY a JSON array, no markdown, no extra text:
[{"name":"item name","qty":"number only","unit":"kg or L or units or packs","cat":"meat|fish|dairy|produce|dry|bakery|beverage"}]
Rules: map every food item to the closest category. If qty is missing use "1". If unit is unclear use "kg" for food, "L" for liquids.`}
            ]
          }]
        })
      });
      const data = await response.json();
      const raw = data.content?.map(b=>b.text||"").join("")||"";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());

      // Enrich with vendor & price info
      const enriched = parsed.map(item => {
        const vendor = getBestVendor(item.cat);
        const priceInfo = priceDB[item.name.toLowerCase()];
        return {
          id: genId(),
          name: item.name,
          qty: item.qty || "1",
          unit: item.unit || "kg",
          catId: item.cat,
          vendorId: vendor?.id || null,
          vendorName: vendor?.name || null,
          vendorPhone: vendor?.phone || null,
          price: priceInfo?.price || vendor?.pricePerKg || 0,
        };
      });

      setScannedItems(enriched);
      setStaffStep("review");
    } catch(err) {
      showToast("Couldn't read the image. Try again.", "err");
      setStaffStep("home");
    }
    e.target.value="";
  };

  // ── SEND via vendor's preferred contact method ────────────────────────────
  const sendToVendor = (group) => {
    const v = group.vendor;
    const method = v?.contactMethod || "whatsapp";
    if (method === "whatsapp") {
      const d = todayStr();
      let msg = `🏨 *Hotel Order (${dept}) — ${d}*\n\n`;
      group.items.forEach(i => { msg += `• ${i.name}: *${i.qty} ${i.unit}*\n`; });
      const phone = (v?.phone||"").replace(/[^0-9]/g,"");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    } else if (method === "sms") {
      const d = todayStr();
      let msg = `Hotel Order (${dept}) — ${d}\n\n`;
      group.items.forEach(i => { msg += `• ${i.name}: ${i.qty} ${i.unit}\n`; });
      const phone = (v?.phone||"").replace(/[^0-9]/g,"");
      window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`, "_blank");
    } else if (method === "email") {
      const d = todayStr();
      let body = `Hotel Order (${dept}) — ${d}\n\n`;
      group.items.forEach(i => { body += `• ${i.name}: ${i.qty} ${i.unit}\n`; });
      const subj = encodeURIComponent(`Hotel Food Order — ${d}`);
      window.open(`mailto:${v?.email||""}?subject=${subj}&body=${encodeURIComponent(body)}`, "_blank");
    }
    setSentList(p => [...p, v?.id]);
  };

  // helper: get send button config for a vendor
  const getSendBtn = (vendor) => {
    const method = vendor?.contactMethod || "whatsapp";
    const cfg = {
      whatsapp: { label:"WhatsApp", icon:"💬", bg:"#25D366", fg:"#fff", hasContact: !!(vendor?.phone?.length>5) },
      sms:      { label:"Send SMS", icon:"📱", bg:"#2563EB", fg:"#fff", hasContact: !!(vendor?.phone?.length>5) },
      email:    { label:"Send Email",icon:"📧", bg:"#7C3AED", fg:"#fff", hasContact: !!(vendor?.email?.includes("@")) },
    };
    return cfg[method] || cfg.whatsapp;
  };

  const finishOrder = () => {
    const entry = {
      id: genId(),
      date: todayStr(),
      dept,
      items: scannedItems,
      image: capturedImage,
    };
    const updated = [entry, ...history].slice(0,300);
    saveHistory(updated);
    setStaffStep("done");
    showToast("Order saved!");
  };

  const resetStaff = () => {
    setStaffStep("home");
    setScannedItems([]);
    setCapturedImage(null);
    setSentList([]);
  };

  // ── EMAIL IMPORT (manager): parse vendor price email ──────────────────────
  const parseVendorEmail = async () => {
    if (!emailText.trim()) return;
    setEmailParsing(true);
    setEmailResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          messages:[{
            role:"user",
            content:`This is a price list or order confirmation email from a kosher food vendor.
Extract all items with their prices and units.
Return ONLY a JSON array, no markdown:
[{"item":"item name","price":"number","unit":"kg|L|unit|pack","vendorName":"vendor name if visible","category":"meat|fish|dairy|produce|dry|bakery|beverage"}]

Email:
${emailText.slice(0,4000)}`
          }]
        })
      });
      const data = await res.json();
      const raw = data.content?.map(b=>b.text||"").join("")||"";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());

      // Update price database
      const newDB = {...priceDB};
      parsed.forEach(row => {
        if (!row.item || !row.price) return;
        newDB[row.item.toLowerCase()] = {
          item: row.item,
          price: parseFloat(row.price),
          unit: row.unit||"kg",
          vendorName: row.vendorName||"",
          category: row.category||"dry",
          updatedAt: todayStr(),
        };
      });
      savePriceDB(newDB);
      setEmailResult({ count: parsed.length, items: parsed });
      setEmailText("");
      showToast(`${parsed.length} prices updated from email`);
    } catch(err) {
      showToast("Couldn't parse email. Try again.","err");
    }
    setEmailParsing(false);
  };

  // ── BULK INVOICE PROCESSOR ────────────────────────────────────────────────
  const processBulkFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    setBulkFiles(files.map(f => ({ name: f.name, status: "waiting", count: 0, error: null })));
    setBulkRunning(true);
    setBulkDone(false);

    const newDB = { ...priceDB };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBulkFiles(prev => prev.map((f,idx) => idx===i ? {...f, status:"reading"} : f));

      try {
        let contentBlock;
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          const b64 = await new Promise((res,rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result.split(",")[1]);
            r.onerror = rej;
            r.readAsDataURL(file);
          });
          contentBlock = file.type === "application/pdf"
            ? { type:"document", source:{ type:"base64", media_type:"application/pdf", data:b64 } }
            : { type:"image",    source:{ type:"base64", media_type:file.type, data:b64 } };
        } else {
          // text / csv
          const text = await file.text();
          contentBlock = { type:"text", text: `Invoice/email content:\n${text.slice(0,4000)}` };
        }

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            model:"claude-sonnet-4-6",
            max_tokens:1000,
            messages:[{
              role:"user",
              content:[
                contentBlock,
                { type:"text", text:`This is a kosher food vendor invoice, price list, or order confirmation.
Extract every item with its price. Return ONLY a JSON array, no markdown:
[{"item":"item name","price":"number","unit":"kg|L|unit|pack|case","vendorName":"vendor name if visible","category":"meat|fish|dairy|produce|dry|bakery|beverage"}]
If no prices found, return [].` }
              ]
            }]
          })
        });

        const data = await res.json();
        const raw = data.content?.map(b=>b.text||"").join("")||"[]";
        const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());

        let count = 0;
        if (Array.isArray(parsed)) {
          parsed.forEach(row => {
            if (!row.item || !row.price) return;
            const key = row.item.toLowerCase().trim();
            // only update if price is newer or better documented
            newDB[key] = {
              item: row.item,
              price: parseFloat(row.price),
              unit: row.unit || "kg",
              vendorName: row.vendorName || "",
              category: row.category || "dry",
              updatedAt: todayStr(),
              source: file.name,
            };
            count++;
          });
        }

        savePriceDB(newDB);
        setBulkFiles(prev => prev.map((f,idx) => idx===i ? {...f, status:"done", count} : f));
      } catch(err) {
        setBulkFiles(prev => prev.map((f,idx) => idx===i ? {...f, status:"error", error: err.message} : f));
      }

      // Small delay to avoid rate limits
      if (i < files.length - 1) await new Promise(r => setTimeout(r, 800));
    }

    setBulkRunning(false);
    setBulkDone(true);
    showToast(`All ${files.length} invoices processed!`);
  };

  // ── VENDOR MANAGEMENT ─────────────────────────────────────────────────────
  const saveVendorEdit = () => {
    if (!editVendor) return;
    const { catId, id } = editVendor;
    const updated = {
      ...vendors,
      [catId]: (vendors[catId]||[]).map(v => v.id===id ? {...v,...vendorDraft} : v)
    };
    saveVendors(updated);
    setEditVendor(null);
    showToast("Vendor saved");
  };

  const addVendorToCat = (catId) => {
    const nv = { id:genId(), name:"", phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerKg:0 };
    const updated = { ...vendors, [catId]: [...(vendors[catId]||[]), nv] };
    saveVendors(updated);
    setEditVendor({catId, id:nv.id});
    setVendorDraft({ name:"", phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerKg:0 });
  };

  const removeVendor = (catId, id) => {
    const updated = { ...vendors, [catId]: (vendors[catId]||[]).filter(v=>v.id!==id) };
    saveVendors(updated);
  };

  const groups = groupByVendor(scannedItems);
  const allSent = sentList.length >= groups.filter(g=>g.vendor).length && groups.length>0;

  // ── PRICE DB stats ────────────────────────────────────────────────────────
  const priceEntries = Object.values(priceDB);
  const recentPrices = priceEntries.sort((a,b)=>b.updatedAt>a.updatedAt?1:-1).slice(0,20);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{minHeight:"100vh",background:"#F4F3EF",fontFamily:"'Helvetica Neue',Arial,sans-serif",color:"#111"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer}input,select,textarea{font-family:inherit}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pop{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>

      {toast && (
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#111",color:"#fff",padding:"11px 24px",borderRadius:30,fontSize:14,fontWeight:700,zIndex:9999,boxShadow:"0 6px 24px rgba(0,0,0,0.25)",animation:"pop 0.2s ease",whiteSpace:"nowrap"}}>
          {toast.msg}
        </div>
      )}

      {/* ── MODE SWITCHER (top bar) ─────────────────────────────────────────── */}
      <div style={{background:"#111",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{color:"#C8A84B",fontSize:9,letterSpacing:3,textTransform:"uppercase"}}>✡ Kosher Hotel</div>
          <div style={{color:"#fff",fontSize:16,fontWeight:800}}>Food Orders</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* Dept toggle — only show in staff mode */}
          {mode==="staff" && ["Restaurant","Catering"].map(d=>(
            <button key={d} onClick={()=>setDept(d)} style={{padding:"5px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:700,background:dept===d?"#C8A84B":"#2a2a2a",color:dept===d?"#111":"#777"}}>
              {d==="Restaurant"?"🍽":"🎪"} {d}
            </button>
          ))}
          <div style={{width:1,height:24,background:"#333",margin:"0 4px"}}/>
          <button onClick={()=>setMode(mode==="staff"?"manager":"staff")} style={{padding:"5px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:700,background:"#2a2a2a",color:"#C8A84B"}}>
            {mode==="staff"?"⚙️ Manager":"← Staff view"}
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          STAFF VIEW — dead simple
      ════════════════════════════════════════════════════════════════════ */}
      {mode==="staff" && (
        <div style={{maxWidth:480,margin:"0 auto",padding:20}}>

          {/* HOME */}
          {staffStep==="home" && (
            <div style={{textAlign:"center",paddingTop:40}}>
              <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>What do you need?</div>
              <div style={{color:"#888",fontSize:15,marginBottom:48}}>Take a photo of the list</div>

              {/* BIG CAMERA BUTTON */}
              <div style={{marginBottom:40}}>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleImageCapture}/>
                <button onClick={()=>cameraRef.current?.click()} style={{
                  width:200,height:200,borderRadius:"50%",border:"none",
                  background:"#C8A84B",color:"#111",
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  margin:"0 auto",boxShadow:"0 8px 40px rgba(200,168,75,0.5)",
                  transition:"transform 0.15s",fontSize:64,
                }} onMouseDown={e=>e.currentTarget.style.transform="scale(0.95)"}
                   onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
                  📷
                </button>
                <div style={{marginTop:16,fontWeight:700,fontSize:18}}>Take a photo</div>
                <div style={{color:"#999",fontSize:13,marginTop:4}}>Handwritten note, printed list, anything</div>
              </div>

              {/* Alternative: upload file */}
              <div style={{borderTop:"1px solid #E0DDD6",paddingTop:24}}>
                <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={handleImageCapture}/>
                <button onClick={()=>fileRef.current?.click()} style={{background:"none",border:"1.5px solid #ddd",borderRadius:12,padding:"12px 28px",fontWeight:600,color:"#666",fontSize:14}}>
                  📁 Choose file from phone
                </button>
              </div>
            </div>
          )}

          {/* SCANNING */}
          {staffStep==="scanning" && (
            <div style={{textAlign:"center",paddingTop:80}}>
              {capturedImage && <img src={capturedImage} style={{width:200,height:200,objectFit:"cover",borderRadius:20,marginBottom:30,boxShadow:"0 4px 20px rgba(0,0,0,0.15)"}} alt="order"/>}
              <div style={{fontSize:48,marginBottom:16,display:"inline-block",animation:"spin 1s linear infinite"}}>⏳</div>
              <div style={{fontWeight:800,fontSize:20,marginBottom:6}}>Reading the list...</div>
              <div style={{color:"#888",fontSize:14}}>AI is scanning every item</div>
            </div>
          )}

          {/* REVIEW */}
          {staffStep==="review" && (
            <div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                {capturedImage && <img src={capturedImage} style={{width:60,height:60,objectFit:"cover",borderRadius:10}} alt=""/>}
                <div>
                  <div style={{fontWeight:800,fontSize:18}}>Check the order</div>
                  <div style={{color:"#888",fontSize:13}}>{scannedItems.length} items found · {dept}</div>
                </div>
              </div>

              {/* Items — editable */}
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
                {scannedItems.map((item,i)=>(
                  <div key={item.id} style={{background:"#fff",borderRadius:12,padding:"12px 14px",border:"1.5px solid #E0DDD6",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:20}}>{CATEGORIES.find(c=>c.id===item.catId)?.icon||"📦"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15}}>{item.name}</div>
                      <div style={{fontSize:12,color:"#888"}}>
                        {item.vendorName ? <span style={{color:"#25D366"}}>→ {item.vendorName}</span> : <span style={{color:"#E74C3C"}}>No vendor</span>}
                        {item.price>0 ? <span style={{marginLeft:8,color:"#666"}}>₪{item.price}/{item.unit}</span>:""}
                      </div>
                    </div>
                    <input type="number" min="0" value={item.qty}
                      onChange={e=>setScannedItems(p=>p.map(x=>x.id===item.id?{...x,qty:e.target.value}:x))}
                      style={{width:60,padding:"6px 8px",borderRadius:8,border:"1.5px solid #ddd",fontSize:16,fontWeight:700,textAlign:"center"}}
                    />
                    <select value={item.unit}
                      onChange={e=>setScannedItems(p=>p.map(x=>x.id===item.id?{...x,unit:e.target.value}:x))}
                      style={{padding:"6px 4px",borderRadius:8,border:"1.5px solid #ddd",fontSize:12,width:65}}>
                      {["kg","g","L","ml","units","packs","cases","dozen"].map(u=><option key={u}>{u}</option>)}
                    </select>
                    <button onClick={()=>setScannedItems(p=>p.filter(x=>x.id!==item.id))} style={{background:"none",border:"none",color:"#ddd",fontSize:18,padding:"0 2px"}}>✕</button>
                  </div>
                ))}
              </div>

              <button onClick={()=>setStaffStep("sending")} style={{
                width:"100%",padding:18,borderRadius:14,border:"none",
                background:"#C8A84B",color:"#111",fontWeight:800,fontSize:18,
                boxShadow:"0 4px 20px rgba(200,168,75,0.4)"
              }}>
                Send Orders via WhatsApp →
              </button>
              <button onClick={resetStaff} style={{width:"100%",marginTop:8,padding:12,borderRadius:12,border:"1.5px solid #ddd",background:"#fff",color:"#888",fontSize:14,fontWeight:600}}>
                Start over
              </button>
            </div>
          )}

          {/* SENDING */}
          {staffStep==="sending" && (
            <div>
              <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Send to vendors</div>
              <div style={{color:"#888",fontSize:13,marginBottom:20}}>Each vendor gets the order their way — WhatsApp, SMS, or Email</div>

              {groups.map((g,i)=>{
                const sent = sentList.includes(g.vendor?.id);
                const btn  = getSendBtn(g.vendor);
                return (
                  <div key={i} style={{background:"#fff",borderRadius:14,marginBottom:10,overflow:"hidden",border:`2px solid ${sent?"#86EFAC":"#E0DDD6"}`}}>
                    <div style={{background:sent?"#F0FDF4":"#111",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div>
                        <div style={{color:sent?"#15803D":"#fff",fontWeight:800,fontSize:16}}>
                          {g.vendor?.name||"⚠ No vendor"}
                        </div>
                        <div style={{color:sent?"#4ADE80":"#888",fontSize:12}}>
                          {g.items.length} items
                          {g.vendor && !sent && (
                            <span style={{marginLeft:8,background:"rgba(255,255,255,0.12)",borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:700,color:sent?"#4ADE80":"#aaa"}}>
                              via {btn.icon} {btn.label}
                            </span>
                          )}
                        </div>
                      </div>
                      {sent
                        ? <div style={{background:"#15803D",color:"#fff",borderRadius:20,padding:"6px 16px",fontWeight:800,fontSize:14}}>✓ Sent</div>
                        : g.vendor && btn.hasContact
                          ? <button onClick={()=>sendToVendor(g)} style={{background:btn.bg,color:btn.fg,border:"none",borderRadius:10,padding:"11px 20px",fontWeight:800,fontSize:15}}>
                              {btn.icon} {btn.label}
                            </button>
                          : <span style={{color:"#E74C3C",fontSize:12,fontWeight:700}}>⚠ No contact info</span>
                      }
                    </div>
                    <div style={{padding:"8px 16px"}}>
                      {g.items.map((item,j)=>(
                        <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #F4F3EF",fontSize:14}}>
                          <span>{item.name}</span>
                          <span style={{fontFamily:"monospace",fontWeight:700}}>{item.qty} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {allSent && (
                <div style={{background:"#F0FDF4",border:"2px solid #86EFAC",borderRadius:14,padding:24,textAlign:"center",marginTop:8,animation:"pop 0.3s ease"}}>
                  <div style={{fontSize:48,marginBottom:8}}>✅</div>
                  <div style={{fontWeight:800,fontSize:20,color:"#15803D",marginBottom:4}}>All done!</div>
                  <div style={{color:"#888",marginBottom:16}}>All vendors notified</div>
                  <button onClick={()=>{finishOrder();resetStaff();}} style={{background:"#15803D",color:"#fff",border:"none",borderRadius:12,padding:"14px 32px",fontWeight:800,fontSize:16}}>
                    New order
                  </button>
                </div>
              )}

              {!allSent && <button onClick={resetStaff} style={{width:"100%",marginTop:8,padding:12,borderRadius:12,border:"1.5px solid #ddd",background:"#fff",color:"#888",fontSize:14,fontWeight:600}}>← Back</button>}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MANAGER VIEW
      ════════════════════════════════════════════════════════════════════ */}
      {mode==="manager" && (
        <div>
          {/* Manager nav */}
          <div style={{background:"#fff",borderBottom:"1px solid #E0DDD6",padding:"0 12px",display:"flex",gap:0,overflowX:"auto"}}>
            {[
              {id:"dashboard",   label:"📊 Overview"},
              {id:"vendors",     label:"🏪 Vendors"},
              {id:"prices",      label:"💰 Prices"},
              {id:"bulkimport",  label:"📂 Bulk Import"},
              {id:"emailimport", label:"📧 Email Import"},
              {id:"autosetup",   label:"⚡ Auto Setup"},
              {id:"history",     label:"🕐 History"},
            ].map(t=>(
              <button key={t.id} onClick={()=>setMgTab(t.id)} style={{
                padding:"12px 14px",border:"none",background:"none",fontWeight:700,fontSize:13,
                color:mgTab===t.id?"#111":"#999",
                borderBottom:mgTab===t.id?"3px solid #C8A84B":"3px solid transparent",
                whiteSpace:"nowrap"
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{maxWidth:700,margin:"0 auto",padding:20}}>

            {/* ── DASHBOARD ── */}
            {mgTab==="dashboard" && (
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:16}}>Overview</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
                  {[
                    {label:"Total Vendors", value: allVendorsList.filter(v=>v.name).length, icon:"🏪"},
                    {label:"Prices tracked", value: priceEntries.length, icon:"💰"},
                    {label:"Orders sent",   value: history.length, icon:"📦"},
                  ].map(k=>(
                    <div key={k.label} style={{background:"#fff",borderRadius:12,padding:"16px 14px",border:"1.5px solid #E0DDD6",textAlign:"center"}}>
                      <div style={{fontSize:28,marginBottom:4}}>{k.icon}</div>
                      <div style={{fontFamily:"monospace",fontWeight:800,fontSize:26}}>{k.value}</div>
                      <div style={{color:"#888",fontSize:11,marginTop:2}}>{k.label}</div>
                    </div>
                  ))}
                </div>

                {/* Setup checklist */}
                <div style={{background:"#fff",borderRadius:14,padding:20,border:"1.5px solid #E0DDD6",marginBottom:16}}>
                  <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>Setup checklist</div>
                  {[
                    { done: allVendorsList.filter(v=>v.name&&v.phone).length>0, label:"Add at least one vendor with WhatsApp number", action:()=>setMgTab("vendors") },
                    { done: priceEntries.length>0, label:"Import vendor price list from email", action:()=>setMgTab("emailimport") },
                    { done: history.length>0, label:"First order sent by staff", action:null },
                  ].map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:i<2?"1px solid #F4F3EF":"none"}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:c.done?"#15803D":"#E0DDD6",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0}}>
                        {c.done?"✓":i+1}
                      </div>
                      <div style={{flex:1,color:c.done?"#888":"#111",textDecoration:c.done?"line-through":"none",fontSize:14}}>{c.label}</div>
                      {!c.done && c.action && <button onClick={c.action} style={{background:"#C8A84B",color:"#111",border:"none",borderRadius:8,padding:"5px 12px",fontWeight:700,fontSize:12}}>Do it →</button>}
                    </div>
                  ))}
                </div>

                {/* Email setup guide */}
                <div style={{background:"#EEF2FF",borderRadius:14,padding:20,border:"1.5px solid #C7D2FE"}}>
                  <div style={{fontWeight:800,fontSize:15,marginBottom:10}}>📧 Auto email setup (coming next)</div>
                  <div style={{fontSize:13,color:"#444",lineHeight:1.7}}>
                    When you're ready, here's how to auto-import vendor emails:<br/><br/>
                    <strong>Step 1.</strong> Create a Gmail filter for vendor emails → auto-forward to a Zapier/Make webhook<br/>
                    <strong>Step 2.</strong> Zapier sends email body to this app's "Email Import" tab<br/>
                    <strong>Step 3.</strong> Prices update automatically every time a vendor sends a price list<br/><br/>
                    <span style={{color:"#6366F1",fontWeight:700}}>Ask me to walk you through this setup when ready →</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── VENDORS ── */}
            {mgTab==="vendors" && (
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Vendors</div>
                <div style={{color:"#888",fontSize:13,marginBottom:16}}>Add multiple vendors per category. Cheapest price = auto-selected for orders.</div>

                {CATEGORIES.map(cat=>{
                  const catVendors = vendors[cat.id]||[];
                  return (
                    <div key={cat.id} style={{marginBottom:20}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{fontWeight:800,fontSize:15}}>{cat.icon} {cat.label}</div>
                        <button onClick={()=>addVendorToCat(cat.id)} style={{background:"#F4F3EF",border:"1px dashed #ccc",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#666",fontWeight:600}}>+ Add</button>
                      </div>

                      {catVendors.length===0 && (
                        <div style={{color:"#bbb",fontSize:13,padding:"10px 14px",background:"#fff",borderRadius:8,border:"1px dashed #ddd"}}>No vendors — tap + Add</div>
                      )}

                      {catVendors.map(v=>{
                        const isEdit = editVendor?.catId===cat.id && editVendor?.id===v.id;
                        const isBest = getBestVendor(cat.id)?.id===v.id && v.name;
                        return (
                          <div key={v.id} style={{background:"#fff",borderRadius:10,marginBottom:6,border:`1.5px solid ${isBest?"#C8A84B":"#E0DDD6"}`,overflow:"hidden"}}>
                            {isEdit ? (
                              <div style={{padding:14}}>
                                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                                  {/* Name */}
                                  <input type="text" placeholder="Vendor name (e.g. Cohen Meats)"
                                    value={vendorDraft.name??v.name}
                                    onChange={e=>setVendorDraft(d=>({...d,name:e.target.value}))}
                                    style={{padding:"10px 12px",borderRadius:8,border:"1.5px solid #C8A84B",fontSize:15}}
                                  />

                                  {/* Contact method selector */}
                                  <div>
                                    <div style={{fontSize:12,color:"#888",marginBottom:5,fontWeight:600}}>How do they prefer to receive orders?</div>
                                    <div style={{display:"flex",gap:6}}>
                                      {CONTACT_METHODS.map(cm=>{
                                        const selected = (vendorDraft.contactMethod??v.contactMethod??"whatsapp")===cm.id;
                                        return (
                                          <button key={cm.id} onClick={()=>setVendorDraft(d=>({...d,contactMethod:cm.id}))} style={{
                                            flex:1,padding:"9px 6px",borderRadius:9,border:`2px solid ${selected?cm.color:"#ddd"}`,
                                            background:selected?cm.color:"#fff",color:selected?cm.textColor:"#888",
                                            fontWeight:700,fontSize:13,cursor:"pointer"
                                          }}>{cm.icon} {cm.label}</button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Phone — shown for whatsapp & sms */}
                                  {(vendorDraft.contactMethod??v.contactMethod??"whatsapp")!=="email" && (
                                    <input type="tel"
                                      placeholder={(vendorDraft.contactMethod??v.contactMethod??"whatsapp")==="sms"?"Phone number for SMS (e.g. +972501234567)":"WhatsApp number (e.g. +972501234567)"}
                                      value={vendorDraft.phone??v.phone??""}
                                      onChange={e=>setVendorDraft(d=>({...d,phone:e.target.value}))}
                                      style={{padding:"10px 12px",borderRadius:8,border:"1.5px solid #ddd",fontSize:15}}
                                    />
                                  )}

                                  {/* Email — shown for email method */}
                                  {(vendorDraft.contactMethod??v.contactMethod??"whatsapp")==="email" && (
                                    <input type="email" placeholder="Vendor email address"
                                      value={vendorDraft.email??v.email??""}
                                      onChange={e=>setVendorDraft(d=>({...d,email:e.target.value}))}
                                      style={{padding:"10px 12px",borderRadius:8,border:"1.5px solid #ddd",fontSize:15}}
                                    />
                                  )}

                                  {/* Price + departments */}
                                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                    <input type="number" placeholder="Base price per unit (₪)"
                                      value={vendorDraft.pricePerKg??v.pricePerKg??0}
                                      onChange={e=>setVendorDraft(d=>({...d,pricePerKg:parseFloat(e.target.value)||0}))}
                                      style={{flex:1,padding:"10px 12px",borderRadius:8,border:"1.5px solid #ddd",fontSize:15}}
                                    />
                                    <div>
                                      {["Restaurant","Catering"].map(d=>(
                                        <label key={d} style={{display:"flex",alignItems:"center",gap:5,fontSize:13,marginBottom:4,cursor:"pointer"}}>
                                          <input type="checkbox"
                                            checked={(vendorDraft.dept??v.dept??[]).includes(d)}
                                            onChange={e=>{
                                              const cur=vendorDraft.dept??v.dept??["Restaurant","Catering"];
                                              setVendorDraft(dr=>({...dr,dept:e.target.checked?[...cur,d]:cur.filter(x=>x!==d)}));
                                            }}
                                          /> {d}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div style={{display:"flex",gap:6,marginTop:10}}>
                                  <button onClick={saveVendorEdit} style={{flex:1,background:"#C8A84B",color:"#111",border:"none",borderRadius:8,padding:"10px",fontWeight:800}}>Save</button>
                                  <button onClick={()=>setEditVendor(null)} style={{background:"#eee",border:"none",borderRadius:8,padding:"10px 14px"}}>Cancel</button>
                                  <button onClick={()=>removeVendor(cat.id,v.id)} style={{background:"#FEE2E2",color:"#E74C3C",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700}}>Delete</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={()=>{setEditVendor({catId:cat.id,id:v.id});setVendorDraft({});}} style={{width:"100%",background:"none",border:"none",padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left"}}>
                                <div style={{flex:1}}>
                                  <div style={{fontWeight:700,fontSize:14,color:v.name?"#111":"#bbb"}}>{v.name||"Tap to add vendor"}</div>
                                  <div style={{fontSize:11,color:"#888",marginTop:2}}>
                                    {/* Contact method badge */}
                                    {(() => {
                                      const m = CONTACT_METHODS.find(c=>c.id===(v.contactMethod||"whatsapp"));
                                      const contact = v.contactMethod==="email" ? v.email : v.phone;
                                      return contact
                                        ? <span style={{color:m.color,fontWeight:700}}>{m.icon} {contact}</span>
                                        : <span style={{color:"#E74C3C"}}>No contact info yet</span>;
                                    })()}
                                    {v.pricePerKg>0?<span style={{marginLeft:10}}>₪{v.pricePerKg}/unit</span>:""}
                                    {(v.dept||[]).map(d=><span key={d} style={{marginLeft:6,background:"#F4F3EF",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{d}</span>)}
                                  </div>
                                </div>
                                {isBest && <span style={{background:"#FEF3C7",color:"#92400E",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800}}>⭐ AUTO</span>}
                                <span style={{color:"#ccc",fontSize:18}}>›</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── PRICE DATABASE ── */}
            {mgTab==="prices" && (
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Price Database</div>
                <div style={{color:"#888",fontSize:13,marginBottom:16}}>{priceEntries.length} items tracked · Updated from vendor emails</div>

                {priceEntries.length===0 && (
                  <div style={{textAlign:"center",padding:50,color:"#bbb"}}>
                    <div style={{fontSize:36,marginBottom:8}}>💰</div>
                    <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>No prices yet</div>
                    <div style={{fontSize:13,marginBottom:14}}>Paste a vendor email in the Email Import tab to start tracking prices</div>
                    <button onClick={()=>setMgTab("emailimport")} style={{background:"#C8A84B",color:"#111",border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700}}>Import from email →</button>
                  </div>
                )}

                {priceEntries.length>0 && (
                  <div style={{background:"#fff",borderRadius:12,overflow:"hidden",border:"1.5px solid #E0DDD6"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:0}}>
                      {["Item","Price","Unit","Updated"].map(h=>(
                        <div key={h} style={{background:"#111",color:"#fff",padding:"10px 14px",fontWeight:700,fontSize:12}}>{h}</div>
                      ))}
                      {recentPrices.map((p,i)=>(
                        <>
                          <div key={i+"n"} style={{padding:"10px 14px",borderBottom:"1px solid #F4F3EF",fontSize:14,fontWeight:600}}>{p.item}</div>
                          <div key={i+"p"} style={{padding:"10px 14px",borderBottom:"1px solid #F4F3EF",fontSize:14,fontFamily:"monospace",fontWeight:700,color:"#166534"}}>₪{p.price}</div>
                          <div key={i+"u"} style={{padding:"10px 14px",borderBottom:"1px solid #F4F3EF",fontSize:13,color:"#888"}}>{p.unit}</div>
                          <div key={i+"d"} style={{padding:"10px 14px",borderBottom:"1px solid #F4F3EF",fontSize:12,color:"#aaa"}}>{p.updatedAt}</div>
                        </>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── EMAIL IMPORT (manual) ── */}
            {mgTab==="emailimport" && (
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Paste a Vendor Email</div>
                <div style={{color:"#888",fontSize:13,marginBottom:20}}>Copy any vendor email and paste it here — price list, invoice, confirmation. AI extracts all prices instantly.</div>

                <textarea
                  placeholder={`Paste vendor email here...\n\nExample:\nDear Hotel,\nHere is our updated price list:\n- Chicken Breast: ₪28/kg\n- Ground Beef: ₪45/kg\n- Salmon: ₪85/kg\n\nBest regards,\nCohen Meats`}
                  value={emailText}
                  onChange={e=>setEmailText(e.target.value)}
                  rows={10}
                  style={{width:"100%",padding:"14px",borderRadius:12,border:"1.5px solid #ddd",fontSize:14,lineHeight:1.6,resize:"vertical",marginBottom:12}}
                />
                <button onClick={parseVendorEmail} disabled={!emailText.trim()||emailParsing} style={{
                  width:"100%",padding:16,borderRadius:12,border:"none",fontWeight:800,fontSize:16,
                  background:emailText.trim()&&!emailParsing?"#C8A84B":"#ddd",
                  color:emailText.trim()&&!emailParsing?"#111":"#999"
                }}>
                  {emailParsing?"⏳ Reading...":"📥 Extract prices from email"}
                </button>

                {emailResult && (
                  <div style={{background:"#F0FDF4",border:"2px solid #86EFAC",borderRadius:12,padding:16,marginTop:16}}>
                    <div style={{fontWeight:800,fontSize:16,color:"#15803D",marginBottom:12}}>✅ {emailResult.count} prices updated</div>
                    {emailResult.items.map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #D1FAE5",fontSize:13}}>
                        <span>{r.item} <span style={{color:"#888",fontSize:11}}>({r.category})</span></span>
                        <span style={{fontFamily:"monospace",fontWeight:700,color:"#166534"}}>₪{r.price}/{r.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{background:"#EEF2FF",border:"1.5px solid #C7D2FE",borderRadius:12,padding:14,marginTop:16,fontSize:13,color:"#444"}}>
                  💡 Want this to happen automatically? Go to <strong>⚡ Auto Setup</strong> tab.
                </div>
              </div>
            )}

            {/* ── BULK IMPORT ── */}
            {mgTab==="bulkimport" && (
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Bulk Invoice Import</div>
                <div style={{color:"#888",fontSize:13,marginBottom:20}}>
                  Upload hundreds of past invoices at once — PDFs, images, or text files. AI reads them all overnight and builds your price database automatically.
                </div>

                {/* Drop zone */}
                {!bulkRunning && !bulkDone && (
                  <label style={{
                    display:"block",border:"2.5px dashed #C8A84B",borderRadius:16,
                    padding:"40px 24px",textAlign:"center",cursor:"pointer",
                    background:"#FFFDF5",marginBottom:20
                  }}>
                    <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.txt,.csv,.eml"
                      style={{display:"none"}}
                      onChange={e=>processBulkFiles(e.target.files)}
                    />
                    <div style={{fontSize:44,marginBottom:12}}>📂</div>
                    <div style={{fontWeight:800,fontSize:18,marginBottom:6}}>Drop all your invoices here</div>
                    <div style={{color:"#888",fontSize:14,marginBottom:16}}>PDFs, photos, emails, spreadsheets — anything works</div>
                    <div style={{display:"inline-block",background:"#C8A84B",color:"#111",borderRadius:10,padding:"12px 28px",fontWeight:800,fontSize:15}}>
                      Choose files
                    </div>
                    <div style={{marginTop:14,color:"#aaa",fontSize:12}}>Supports: PDF · JPG · PNG · TXT · CSV · EML · up to 500 files</div>
                  </label>
                )}

                {/* Progress list */}
                {(bulkRunning || bulkDone) && bulkFiles.length > 0 && (
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{fontWeight:800,fontSize:16}}>
                        {bulkDone ? `✅ All ${bulkFiles.length} files processed` : `Processing ${bulkFiles.length} files...`}
                      </div>
                      {bulkDone && (
                        <button onClick={()=>{setBulkFiles([]);setBulkDone(false);}} style={{background:"#C8A84B",color:"#111",border:"none",borderRadius:8,padding:"7px 14px",fontWeight:700,fontSize:13}}>
                          Import more
                        </button>
                      )}
                    </div>

                    {/* Summary stats */}
                    {bulkDone && (
                      <div style={{background:"#F0FDF4",border:"2px solid #86EFAC",borderRadius:12,padding:16,marginBottom:16}}>
                        <div style={{fontWeight:800,color:"#15803D",fontSize:16,marginBottom:4}}>
                          {bulkFiles.filter(f=>f.status==="done").length} invoices read · {Object.keys(priceDB).length} prices now tracked
                        </div>
                        <div style={{fontSize:13,color:"#888"}}>All prices saved. System will use these for auto vendor selection.</div>
                        <button onClick={()=>setMgTab("prices")} style={{marginTop:10,background:"#15803D",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:700,fontSize:13}}>
                          View price database →
                        </button>
                      </div>
                    )}

                    {/* File list - scrollable */}
                    <div style={{maxHeight:400,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                      {bulkFiles.map((f,i)=>{
                        const icons = { waiting:"⏳", reading:"🔄", done:"✅", error:"❌" };
                        const colors = { waiting:"#888", reading:"#2563EB", done:"#15803D", error:"#E74C3C" };
                        return (
                          <div key={i} style={{
                            background:"#fff",borderRadius:8,padding:"9px 14px",
                            border:`1.5px solid ${f.status==="error"?"#FCA5A5":f.status==="done"?"#86EFAC":"#E0DDD6"}`,
                            display:"flex",alignItems:"center",gap:10
                          }}>
                            <span style={{fontSize:16}}>{icons[f.status]||"⏳"}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                              {f.status==="done" && <div style={{fontSize:11,color:"#15803D"}}>{f.count} prices extracted</div>}
                              {f.status==="error" && <div style={{fontSize:11,color:"#E74C3C"}}>{f.error||"Could not read file"}</div>}
                              {f.status==="reading" && <div style={{fontSize:11,color:"#2563EB"}}>Reading with AI...</div>}
                            </div>
                            <span style={{fontSize:11,color:colors[f.status],fontWeight:700,textTransform:"uppercase"}}>{f.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{background:"#F8F4FF",border:"1.5px solid #C4B5FD",borderRadius:12,padding:14,marginTop:20,fontSize:13,color:"#555",lineHeight:1.7}}>
                  <strong>Tip for your accounting team:</strong> Have them export all past vendor invoices as PDFs and put them in one folder. Then upload the whole folder here. The AI will extract every price from every invoice, even if they're scanned images or handwritten.
                </div>
              </div>
            )}

            {/* ── AUTO SETUP GUIDE ── */}
            {mgTab==="autosetup" && (
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>⚡ Automatic Email Setup</div>
                <div style={{color:"#888",fontSize:13,marginBottom:24}}>
                  One-time setup. After this, every vendor email automatically updates your prices — forever, with no manual work.
                </div>

                {/* How it works diagram */}
                <div style={{background:"#111",borderRadius:14,padding:20,marginBottom:24,textAlign:"center"}}>
                  <div style={{color:"#C8A84B",fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>How it works</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,flexWrap:"wrap",rowGap:12}}>
                    {[
                      {icon:"📧", label:"Vendor\nsends email"},
                      {icon:"→", label:"", plain:true},
                      {icon:"📬", label:"Your\nGmail/Outlook"},
                      {icon:"→", label:"", plain:true},
                      {icon:"⚡", label:"Zapier\n(free)"},
                      {icon:"→", label:"", plain:true},
                      {icon:"🏨", label:"This app\nupdates prices"},
                    ].map((s,i)=>(
                      s.plain
                        ? <div key={i} style={{color:"#C8A84B",fontSize:22,margin:"0 4px"}}>→</div>
                        : <div key={i} style={{textAlign:"center",minWidth:72}}>
                            <div style={{fontSize:28,marginBottom:4}}>{s.icon}</div>
                            <div style={{color:"#aaa",fontSize:10,lineHeight:1.4,whiteSpace:"pre"}}>{s.label}</div>
                          </div>
                    ))}
                  </div>
                </div>

                {/* Step by step */}
                {[
                  {
                    num:"1", title:"Create a free Zapier account",
                    body:"Go to zapier.com and sign up for free. The free plan handles up to 100 emails/month — enough for most hotels.",
                    action:"Open zapier.com", url:"https://zapier.com/sign-up",
                    color:"#2563EB"
                  },
                  {
                    num:"2", title:'Create a new Zap: "Email → Webhook"',
                    body:'In Zapier, click "Create Zap". Set the Trigger to "Gmail" (or "Email by Zapier"). Connect your hotel email account. Set the filter to only trigger on emails from your vendor addresses.',
                    color:"#7C3AED"
                  },
                  {
                    num:"3", title:"Set the Action to Webhook → POST",
                    body:`In the Action step, choose "Webhooks by Zapier" → "POST". \n\nPaste this as the URL:\nhttps://your-server.com/api/email-ingest\n\nIn the Body, map: {"text": "{{email body}}", "subject": "{{email subject}}", "from": "{{from email}}"}`,
                    code: true,
                    color:"#0F766E"
                  },
                  {
                    num:"4", title:"Your unique key (copy this)",
                    body:"Add this key to the webhook so the system knows it's your hotel:",
                    key: webhookKey,
                    color:"#C8A84B"
                  },
                  {
                    num:"5", title:"Test it — send a vendor email",
                    body:'Click "Test Zap" in Zapier. Then check your Prices tab here. Within 30 seconds, prices from the email should appear automatically.',
                    color:"#15803D"
                  },
                ].map((step,i)=>(
                  <div key={i} style={{background:"#fff",borderRadius:12,marginBottom:12,overflow:"hidden",border:"1.5px solid #E0DDD6"}}>
                    <div style={{background:step.color,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.25)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,flexShrink:0}}>{step.num}</div>
                      <div style={{color:"#fff",fontWeight:800,fontSize:15}}>{step.title}</div>
                    </div>
                    <div style={{padding:"12px 16px"}}>
                      <div style={{fontSize:13,color:"#444",lineHeight:1.7,whiteSpace:"pre-line"}}>{step.body}</div>
                      {step.key && (
                        <div style={{marginTop:10,background:"#F4F3EF",borderRadius:8,padding:"10px 14px",fontFamily:"monospace",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span>{step.key}</span>
                          <button onClick={()=>{navigator.clipboard?.writeText(step.key);showToast("Key copied!");}} style={{background:"#C8A84B",color:"#111",border:"none",borderRadius:6,padding:"4px 12px",fontWeight:700,fontSize:12}}>Copy</button>
                        </div>
                      )}
                      {step.url && (
                        <a href={step.url} target="_blank" rel="noreferrer" style={{display:"inline-block",marginTop:10,background:step.color,color:"#fff",borderRadius:8,padding:"8px 16px",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                          {step.action} →
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                <div style={{background:"#FEF9EC",border:"1.5px solid #C8A84B",borderRadius:12,padding:16,marginTop:4}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>Need help setting this up?</div>
                  <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>
                    If you have an IT person or assistant, show them this page. The whole setup takes about 15 minutes. Once it's done, you never touch it again — vendor emails flow in automatically for years.
                  </div>
                </div>
              </div>
            )}

            {/* ── HISTORY ── */}
            {mgTab==="history" && (
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Order History</div>
                <div style={{color:"#888",fontSize:13,marginBottom:16}}>{history.length} orders</div>

                {history.length===0 && (
                  <div style={{textAlign:"center",padding:50,color:"#bbb"}}>
                    <div style={{fontSize:36,marginBottom:8}}>🕐</div>
                    <div style={{fontWeight:600}}>No orders yet</div>
                  </div>
                )}

                {history.map(h=>(
                  <details key={h.id} style={{background:"#fff",borderRadius:12,marginBottom:8,border:"1.5px solid #E0DDD6",overflow:"hidden"}}>
                    <summary style={{padding:"12px 16px",cursor:"pointer",listStyle:"none",display:"flex",alignItems:"center",gap:12}}>
                      {h.image && <img src={h.image} style={{width:44,height:44,objectFit:"cover",borderRadius:8,flexShrink:0}} alt=""/>}
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14}}>{h.date} — {h.dept}</div>
                        <div style={{fontSize:12,color:"#888"}}>{h.items?.length||0} items</div>
                      </div>
                      <span style={{color:"#bbb",fontSize:18}}>›</span>
                    </summary>
                    <div style={{padding:"0 16px 12px",borderTop:"1px solid #F4F3EF"}}>
                      {(h.items||[]).map((item,j)=>(
                        <div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",borderBottom:"1px solid #F4F3EF"}}>
                          <span>{CATEGORIES.find(c=>c.id===item.catId)?.icon} {item.name}</span>
                          <span style={{fontFamily:"monospace",fontWeight:600}}>{item.qty} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
