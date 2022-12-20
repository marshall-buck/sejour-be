/** Database setup for sejour. */

import { Client } from "pg";
import { getDatabaseUri } from "./config";

const db = new Client({
  connectionString: getDatabaseUri(),
});

db.connect();

export { db };
