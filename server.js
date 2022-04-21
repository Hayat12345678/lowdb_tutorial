import { join, dirname } from "path";
import express from "express";
const app = express();

import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);
// Use JSON file for storage
const file = join(__dirname, "/data/db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

const setUpDb = async (db) => {
  const defaultData = {
    cities: [
      {
        id: 1,
        name: "Hamburg",
        inhabitants: 1800000,
      },
      {
        id: 2,
        name: "Köln",
        inhabitants: 1086000,
      },
      {
        id: 3,
        name: "Berlin",
        inhabitants: 4000000,
      },
    ],
  };
  if (db.data === null) {
    db.data = defaultData;
    await db.write();
  }

  await db.read();
  if (db.data === null) {
    db.data = defaultData;
    await db.write();
  }
};

setUpDb(db);
app.use(express.json());
app.get("/", async (req, res) => {
  await db.read();
  res.send(db.data);
});

app.get("/cities", async (req, res) => {
  await db.read();
  res.send(db.data.cities);
});

app.get("/cities/:name", async (req, res) => {
  await db.read();
  console.log("Param name: ", req.params.name);
  const city = db.data.cities.find((city) => city.name === req.params.name);
  console.log(city);
  res.send(city);
});

app.patch("/cities/:id", async (req, res) => {
  await db.read();
  const updateData = req.body;
  const cityIndex = db.data.cities.findIndex(
    (city) => city.id === parseInt(req.params.id)
  );

  console.log(cityIndex);
  if (cityIndex > -1) {
    db.data.cities[cityIndex] = { ...db.data.cities[cityIndex], ...updateData };
    await db.write();
    res.send(db.data.cities[cityIndex]);
  } else {
    res.status(500).send("Error: no city to update");
  }
});

app.listen(3000, function () {
  console.log("http://localhost:3000, listening on port 3000");
});
