const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const DB_PATH = path.join(__dirname, "prices.json");
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
app.post("/api/scan-image", async (req, res) => {
const { image, mimeType, mediaType, key } = req.body;
  if (key !== HOTEL_KEY) {
    return res.status(401).json({ error: "Invalid key" });
  }

  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType || mimeType || "image/jpeg",
                  data: image,
                },
              },
              {
                type: "text",
                text: `This is a kosher hotel kitchen order note. Extract every food item listed.

Return ONLY a JSON array:

[{"name":"item","qty":"number","unit":"kg|L|units|packs","category":"meat|fish|dairy|produce|dry|bakery|beverage"}]

If qty is missing use 1.
If category is unclear choose the closest match.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    const raw =
      data.content?.map((b) => b.text || "").join("") || "[]";

    const parsed = JSON.parse(
      raw.replace(/```json|```/g, "").trim()
    );

    return res.json({ items: parsed });
  } catch (err) {
    console.error("Scan Image Error:", err.message);
    return res.status(500).json({
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hotel price server running on port ${PORT}`));
