import bcrypt from "bcryptjs";
import { query } from "../src/db/db.js";

async function main() {
  const hash = bcrypt.hashSync("ams", 10);

  // Update password for username 'ams'
  await query("UPDATE admins SET password_hash = $1 WHERE username = 'ams'", [hash]);

  // Update password for username 'admin' or id 1
  await query("UPDATE admins SET username = 'ams', password_hash = $1 WHERE id = 1 AND username <> 'ams'", [hash]).catch(() => {});

  const res = await query("SELECT id, username FROM admins");
  console.log("SUCCESS! Admins in Live DB:", res.rows);

  // Test bcrypt verification
  const check = (await query("SELECT * FROM admins WHERE username = 'ams'")).rows[0];
  if (check) {
    const valid = bcrypt.compareSync("ams", check.password_hash);
    console.log("Password verification for ams / ams:", valid ? "VERIFIED (TRUE)" : "FAILED");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
