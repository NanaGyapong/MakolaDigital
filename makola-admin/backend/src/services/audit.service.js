// services/audit.service.js
import { db } from "../config/db.js";
import { v4 as uuid } from "uuid";

export async function addAuditLog(adminId, action, metadata = {}) {
  try {
    await db.query(
      "INSERT INTO admin_audit_log (id, admin_id, action, metadata, created_at) VALUES (,,,,NOW())",
      [uuid(), adminId, action, JSON.stringify(metadata)]
    );
  } catch (err) {
    // Never throw from audit log - log silently
    console.error("Audit log error:", err.message);
  }
}

// SQL for audit log table (add to schema):
// CREATE TABLE admin_audit_log (
//   id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//   admin_id    UUID NOT NULL REFERENCES users(id),
//   action      VARCHAR(80) NOT NULL,
//   metadata    JSONB DEFAULT '{}',
//   created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );
// CREATE INDEX idx_audit_admin ON admin_audit_log(admin_id, created_at DESC);
// CREATE INDEX idx_audit_action ON admin_audit_log(action, created_at DESC);
