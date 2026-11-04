import test from "node:test";
import assert from "node:assert/strict";
import { validateIncomingFile } from "../src/validate-incoming-file.js";

const pdf = Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF");
const png = Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]);

test("detects PDF by signature and produces a SHA-256 manifest", () => {
  const result = validateIncomingFile({ fileName: "planta.pdf", declaredMime: "application/pdf", bytes: pdf, source: "test-fixture" });
  assert.equal(result.ok, true);
  assert.equal(result.manifest.detectedFormat, "pdf");
  assert.equal(result.manifest.sha256.length, 64);
  assert.equal(result.manifest.parserStatus, "not_implemented");
});

test("does not trust the extension when the content does not match", () => {
  const result = validateIncomingFile({ fileName: "planta.pdf", declaredMime: "application/pdf", bytes: png });
  assert.equal(result.ok, false);
  assert.match(result.issues.join(" "), /MIME declarado/);
});

test("rejects empty and oversized files", () => {
  assert.equal(validateIncomingFile({ fileName: "empty.pdf", bytes: Buffer.alloc(0) }).ok, false);
  assert.match(validateIncomingFile({ fileName: "large.pdf", bytes: pdf, maxBytes: 4 }).issues.join(" "), /excede o limite/);
});

test("rejects active SVG content", () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const result = validateIncomingFile({ fileName: "drawing.svg", declaredMime: "image/svg+xml", bytes: svg });
  assert.equal(result.ok, false);
  assert.match(result.issues.join(" "), /script/);
});

test("detects PNG by file signature", () => {
  const result = validateIncomingFile({ fileName: "photo.png", declaredMime: "image/png", bytes: png });
  assert.equal(result.ok, true);
  assert.equal(result.manifest.detectedFormat, "png");
});
