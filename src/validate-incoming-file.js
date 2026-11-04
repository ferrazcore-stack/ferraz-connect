import { createHash } from "node:crypto";
import { extname } from "node:path";

export const DEFAULT_MAX_FILE_BYTES = 50 * 1024 * 1024;

const MIME_BY_FORMAT = {
  pdf: "application/pdf",
  dxf: "application/dxf",
  svg: "image/svg+xml",
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const EXTENSIONS = {
  ".pdf": "pdf",
  ".dxf": "dxf",
  ".svg": "svg",
  ".png": "png",
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".webp": "webp",
};

function detectFormat(bytes, fileName) {
  if (bytes.length >= 5 && bytes.subarray(0, 5).toString("ascii") === "%PDF-") return "pdf";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "webp";

  const text = bytes.toString("utf8");
  const extension = extname(fileName).toLowerCase();
  if (extension === ".svg" && /<svg(?:\s|>)/i.test(text.slice(0, 8192))) return "svg";
  if (extension === ".dxf" && /(^|\n)\s*SECTION\s*(\r?\n)/i.test(text) && /(^|\n)\s*EOF\s*(\r?\n|$)/i.test(text)) return "dxf";
  return null;
}

function inspectSvg(bytes) {
  const source = bytes.toString("utf8");
  const blocked = [
    { pattern: /<\s*script\b/i, reason: "SVG contém elemento script." },
    { pattern: /<\s*foreignObject\b/i, reason: "SVG contém foreignObject." },
    { pattern: /\son[a-z]+\s*=/i, reason: "SVG contém atributo de evento executável." },
    { pattern: /javascript\s*:/i, reason: "SVG contém URL javascript." },
    { pattern: /<!DOCTYPE|<!ENTITY/i, reason: "SVG contém declaração de entidade/DOCTYPE." },
    { pattern: /(?:href|src)\s*=\s*['"]\s*(?:https?:|\/\/|data:text\/html)/i, reason: "SVG referencia conteúdo externo ou ativo." },
  ];
  return blocked.filter(item => item.pattern.test(source)).map(item => item.reason);
}

export function validateIncomingFile({
  fileName,
  declaredMime = "application/octet-stream",
  bytes,
  source = "unspecified",
  maxBytes = DEFAULT_MAX_FILE_BYTES,
}) {
  const issues = [];
  if (!fileName || typeof fileName !== "string" || fileName.trim().length === 0) issues.push("Nome de arquivo obrigatório.");
  if (!bytes || !Buffer.isBuffer(bytes)) issues.push("Conteúdo deve ser fornecido como Buffer.");
  if (issues.length) return { ok: false, issues, manifest: null };

  if (bytes.length === 0) issues.push("Arquivo vazio.");
  if (bytes.length > maxBytes) issues.push("Arquivo excede o limite de " + maxBytes + " bytes.");

  const format = detectFormat(bytes, fileName);
  if (!format) issues.push("Formato não reconhecido ou ainda não suportado. A extensão não é prova do formato real.");
  const extensionFormat = EXTENSIONS[extname(fileName).toLowerCase()];
  if (format && extensionFormat !== format) issues.push("A extensão do arquivo não corresponde ao conteúdo detectado.");
  if (format && declaredMime !== "application/octet-stream" && declaredMime !== MIME_BY_FORMAT[format]) {
    issues.push("MIME declarado não corresponde ao conteúdo detectado.");
  }
  if (format === "svg") issues.push(...inspectSvg(bytes));
  if (format === "dxf" && bytes.includes(0)) issues.push("DXF binário não é aceito neste pipeline inicial; forneça DXF ASCII validado.");

  if (issues.length) return { ok: false, issues, manifest: null };

  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return {
    ok: true,
    issues: [],
    manifest: {
      fileName: fileName.trim(),
      extension: extname(fileName).toLowerCase(),
      detectedFormat: format,
      declaredMime,
      detectedMime: MIME_BY_FORMAT[format],
      sizeBytes: bytes.length,
      sha256,
      source,
      receivedAt: new Date().toISOString(),
      processingStatus: "validated_metadata_only",
      originalMustRemainImmutable: true,
      parserStatus: "not_implemented",
    },
  };
}
