const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../src/data/wardrobe.csv");
const outputPath = path.join(__dirname, "../src/data/wardrobeData.js");

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseCsv(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const headers = parseCsvLine(lines[0]).map((header) =>
    header.replace(/:$/, "").trim()
  );

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    return row;
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function inferCategory(rawCategory, itemName) {
  const text = `${rawCategory} ${itemName}`.toLowerCase();

  const categoryRules = [
    {
      category: "outerwear",
      keywords: [
        "jacket",
        "coat",
        "blazer",
        "cardigan",
        "overshirt",
        "shacket",
        "parka",
        "windbreaker",
      ],
    },
    {
      category: "bottom",
      keywords: [
        "pants",
        "trousers",
        "jeans",
        "shorts",
        "chinos",
        "slacks",
        "sweatpants",
      ],
    },
    {
      category: "shoes",
      keywords: [
        "shoes",
        "sneakers",
        "loafers",
        "boots",
        "sandals",
        "slides",
        "derbies",
        "oxfords",
      ],
    },
    {
      category: "accessory",
      keywords: [
        "belt",
        "hat",
        "cap",
        "watch",
        "bracelet",
        "necklace",
        "ring",
        "bag",
        "sunglasses",
      ],
    },
    {
      category: "top",
      keywords: [
        "shirt",
        "tee",
        "t-shirt",
        "polo",
        "sweater",
        "hoodie",
        "tank",
        "button up",
        "button-up",
        "henley",
        "crewneck",
      ],
    },
  ];

  for (const rule of categoryRules) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.category;
    }
  }

  return "uncategorized";
}

function normalizeWardrobeItem(row) {
  const name = row["Item name"] || row["Item Name"] || "";
  const rawCategory = row["Category"] || "";
  const fit = row["Fit & Cut"] || "";
  const material = row["Material / Fabric"] || "";
  const colorPattern = row["Color & Pattern"] || "";
  const brand = row["Brand"] || "";

  return {
    id: slugify(`${brand}-${name}`),
    name,
    category: inferCategory(rawCategory, name),
    itemType: rawCategory,
    fit,
    material,
    colorPattern,
    brand,
  };
}

function main() {
  if (!fs.existsSync(csvPath)) {
    console.error(`Could not find CSV file at: ${csvPath}`);
    console.error("Export your spreadsheet as wardrobe.csv and place it in backend/src/data/");
    process.exit(1);
  }

  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);
  const wardrobe = rows.map(normalizeWardrobeItem);

  const output = `const wardrobe = ${JSON.stringify(wardrobe, null, 2)};

module.exports = wardrobe;
`;

  fs.writeFileSync(outputPath, output);

  console.log(`Converted ${wardrobe.length} wardrobe items.`);
  console.log(`Saved to ${outputPath}`);
}

main();