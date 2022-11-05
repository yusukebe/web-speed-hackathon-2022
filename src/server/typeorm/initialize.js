import fs from "fs/promises";

import sqlite3 from "sqlite3";

import { DATABASE_PATH, INITIAL_DATABASE_PATH } from "../paths.js";

export async function initialize() {
  await fs.copyFile(INITIAL_DATABASE_PATH, DATABASE_PATH);

  const db = new sqlite3.Database(DATABASE_PATH);
  db.run("create index index_race_id on odds_item(raceId)", [], (err) => {
    console.log(err);
  });
  db.run("create index index_id on race(id)", [], (err) => {
    console.log(err);
  });
}
