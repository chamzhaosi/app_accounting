import assert from "node:assert/strict";
import test from "node:test";
import { normalizeBookLabel, resolveStartupBook } from "./book.ts";

test("normalizes equivalent Book labels", () => {
  assert.equal(normalizeBookLabel(" Parents "), "parents");
  assert.equal(normalizeBookLabel("PARENTS"), "parents");
  assert.equal(normalizeBookLabel("Parents   House"), "parents house");
  assert.equal(normalizeBookLabel("Ｐａｒｅｎｔｓ"), "parents");
});

test("restores only an active persisted Book", () => {
  const fallback = { id: "default", is_active: true };
  const active = { id: "active", is_active: true };
  const inactive = { id: "inactive", is_active: false };

  assert.equal(resolveStartupBook(active, fallback), active);
  assert.equal(resolveStartupBook(inactive, fallback), fallback);
  assert.equal(resolveStartupBook(null, fallback), fallback);
});
