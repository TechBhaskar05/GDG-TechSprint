import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Ward from "../src/models/ward.model.js";
import { DB_NAME } from "../src/constants.js";

dotenv.config();



// if (!MONGO_URI) {
//   console.error("❌ MONGODB_URI not found");
//   process.exit(1);
// }

await mongoose.connect(`${process.env.MONGODB_URI}?dbName=${DB_NAME}`);

console.log("Connected to DB:", mongoose.connection.name);


const geojson = JSON.parse(
  fs.readFileSync("./data/prayagraj.geojson", "utf-8")
);

async function importWards() {
  let inserted = 0;
  let skipped = 0;

  for (const feature of geojson.features) {
    const wardName = `Ward ${feature.properties.ward_no} – ${feature.properties.ward_name}`;

    const exists = await Ward.findOne({
      city: "Prayagraj",
      name: wardName
    });

    if (exists) {
      skipped++;
      continue;
    }

    await Ward.create({
      name: wardName,
      city: "Prayagraj",
      boundary: feature.geometry,
      admins: []
    });

    inserted++;
  }

  console.log(`✅ Inserted: ${inserted}`);
  console.log(`⏭️ Skipped (already exists): ${skipped}`);

  process.exit(0);
}

importWards().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
