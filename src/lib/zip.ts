import "server-only";
// Minimaler ZIP-Reader ohne externe Abhängigkeit (nutzt nur das Node-Core-Modul zlib).
// Liest das Central Directory und entpackt jeden Eintrag (Methode 0 = stored, 8 = deflate).
import { inflateRawSync } from "zlib";

export interface ZipEntry { name: string; data: Buffer }

export function readZip(buf: Buffer): ZipEntry[] {
  // End-of-Central-Directory rückwärts suchen.
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("ZIP: kein EOCD gefunden");

  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  const out: ZipEntry[] = [];

  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) break; // ungültiger Central-Header
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.toString("utf8", off + 46, off + 46 + nameLen);

    // Datenbeginn aus dem lokalen Header (name/extra-Längen können abweichen).
    const lNameLen = buf.readUInt16LE(localOff + 26);
    const lExtraLen = buf.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + lNameLen + lExtraLen;
    const comp = buf.subarray(dataStart, dataStart + compSize);

    try {
      const data = method === 8 ? inflateRawSync(comp) : Buffer.from(comp);
      out.push({ name, data });
    } catch { /* einzelnen defekten Eintrag überspringen */ }

    off += 46 + nameLen + extraLen + commLen;
  }
  return out;
}
