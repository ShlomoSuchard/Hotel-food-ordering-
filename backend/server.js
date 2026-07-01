const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ── PERSISTENT STORAGE (uses the Render disk mounted at /var/data) ────────────
// All data (prices AND vendors, which live inside the prices file as __vendors)
// is stored here so it survives restarts, redeploys, and sleeps.
const DATA_DIR = process.env.DATA_DIR || "/var/data";
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { /* dir may already exist */ }

const DB_PATH = path.join(DATA_DIR, "prices.json");
const HOTEL_KEY = process.env.HOTEL_KEY || "your_key_here";
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

const loadDB = () => {
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); }
  catch { return {}; }
};

const saveDB = (db) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

app.get("/", (req, res) => res.json({ status: "ok", prices: Object.keys(loadDB()).length }));

app.post("/api/email-ingest", async (req, res) => {
  const { text, subject, from, key } = req.body;

  if (key !== HOTEL_KEY) {
    return res.status(401).json({ error: "Invalid key" });
  }

  if (!text && !subject) {
    return res.status(400).json({ error: "No email content" });
  }

  const emailContent = `Subject: ${subject || ""}\nFrom: ${from || ""}\n\n${text || ""}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Extract all food items and prices from this vendor email.
Return ONLY a JSON array, no markdown:
[{"item":"name","price":"number","unit":"kg|L|unit|pack","vendorName":"vendor if visible","category":"meat|fish|dairy|produce|dry|bakery|beverage"}]
If no prices found, return [].

Email:
${emailContent.slice(0, 4000)}`
        }]
      })
    });

    const data = await response.json();
    const raw = data.content?.map(b => b.text || "").join("") || "[]";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return res.json({ extracted: 0, message: "No prices found in this email" });
    }

    const db = loadDB();
    const today = new Date().toLocaleDateString("en-GB");
    parsed.forEach(row => {
      if (!row.item || !row.price) return;
      db[row.item.toLowerCase().trim()] = {
        item: row.item,
        price: parseFloat(row.price),
        unit: row.unit || "kg",
        vendorName: row.vendorName || from || "",
        category: row.category || "dry",
        updatedAt: today,
        source: "email-auto",
      };
    });
    saveDB(db);

    console.log(`[${today}] Extracted ${parsed.length} prices from: ${subject}`);
    return res.json({ extracted: parsed.length, items: parsed });

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/prices", (req, res) => {
  const key = req.query.key || req.headers["x-hotel-key"];
  if (key !== HOTEL_KEY) return res.status(401).json({ error: "Invalid key" });
  res.json(loadDB());
});

// ── PHOTO SCAN ENDPOINT — reads handwritten/printed order lists ──────────────
app.post("/api/scan-image", async (req, res) => {
  const { image, mediaType, isPdf, key } = req.body;

  if (key !== HOTEL_KEY) {
    return res.status(401).json({ error: "Invalid key" });
  }
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }
  if (!CLAUDE_API_KEY) {
    console.error("SCAN ERROR: ANTHROPIC_API_KEY is missing from environment");
    return res.status(500).json({ error: "Server missing API key" });
  }

  const mediaBlock = isPdf
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: image } }
    : { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: image } };

  console.log(`[SCAN] Request received. isPdf=${isPdf}, mediaType=${mediaType}, image length=${image ? image.length : 0}`);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            mediaBlock,
            { type: "text", text: `This is a kosher hotel kitchen order note. Extract every food item listed.
Return ONLY a JSON array, no markdown:
[{"name":"item name","qty":"number","unit":"kg|L|units|packs|cases|lb","category":"meat|fish|dairy|produce|dry|bakery|beverage"}]
If qty missing use "1". If unit unclear use "units". Read carefully even if handwriting is messy.` }
          ]
        }]
      })
    });

    console.log(`[SCAN] Anthropic HTTP status: ${response.status}`);
    const data = await response.json();

    if (data.error) {
      console.error("[SCAN] ERROR from Anthropic:", JSON.stringify(data.error));
      return res.status(500).json({ error: data.error.message || "Anthropic API error" });
    }

    const raw = data.content?.map(b => b.text || "").join("") || "[]";
    console.log(`[SCAN] Raw model output: ${raw.slice(0, 300)}`);

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch (parseErr) {
      console.error("[SCAN] Could not parse model output as JSON:", parseErr.message);
      return res.status(500).json({ error: "Could not parse model output", raw: raw.slice(0, 300) });
    }

    console.log(`[SCAN] SUCCESS — extracted ${parsed.length} items`);
    return res.json({ items: parsed });

  } catch (err) {
    console.error("[SCAN] FATAL ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/bulk-text", async (req, res) => {
  const { texts, key } = req.body;
  if (key !== HOTEL_KEY) return res.status(401).json({ error: "Invalid key" });

  const results = [];
  const db = loadDB();
  const today = new Date().toLocaleDateString("en-GB");

  for (const text of texts.slice(0, 200)) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          messages: [{
            role: "user",
            content: `Extract food prices from this invoice. Return ONLY JSON array:
[{"item":"name","price":"number","unit":"kg|L|unit","category":"meat|fish|dairy|produce|dry|bakery|beverage"}]
If none found return [].
Invoice: ${text.slice(0, 2000)}`
          }]
        })
      });
      const data = await response.json();
      const raw = data.content?.map(b => b.text || "").join("") || "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (Array.isArray(parsed)) {
        parsed.forEach(row => {
          if (!row.item || !row.price) return;
          db[row.item.toLowerCase().trim()] = {
            item: row.item, price: parseFloat(row.price),
            unit: row.unit || "kg", category: row.category || "dry",
            updatedAt: today, source: "bulk-import",
          };
        });
        results.push(parsed.length);
      }
      await new Promise(r => setTimeout(r, 300));
    } catch { results.push(0); }
  }

  saveDB(db);
  res.json({ processed: results.length, totalPrices: results.reduce((a,b)=>a+b,0) });
});
app.post("/api/bulk-import", (req, res) => {
  const { key, data } = req.body;
  if (key !== HOTEL_KEY) return res.status(401).json({ error: "Invalid key" });
  if (!data || typeof data !== "object") return res.status(400).json({ error: "No data provided" });
  const db = loadDB();
  let count = 0;
  Object.entries(data).forEach(([k, v]) => { db[k] = v; count++; });
  saveDB(db);
  res.json({ imported: count, total: Object.keys(db).length });
});
app.get("/api/vendors", (req, res) => {
  const key = req.query.key || req.headers["x-hotel-key"];
  if (key !== HOTEL_KEY) return res.status(401).json({ error: "Invalid key" });
  const db = loadDB();
  res.json(db.__vendors || {});
});

app.post("/api/vendors", (req, res) => {
  const { key, vendors } = req.body;
  if (key !== HOTEL_KEY) return res.status(401).json({ error: "Invalid key" });
  const db = loadDB();
  db.__vendors = vendors;
  saveDB(db);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hotel price server running on port ${PORT}`));
