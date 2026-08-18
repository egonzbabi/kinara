/** Descarga una imagen y la devuelve solo si su content-type está en `supportedTypes` (formato aceptado). */
export async function fetchImage<Ext extends string>(
  url: string,
  supportedTypes: Record<string, Ext>,
): Promise<{ buffer: Buffer; extension: Ext } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
    const extension = supportedTypes[contentType];
    if (!extension) return null;
    const buffer = Buffer.from(await res.arrayBuffer()) as Buffer;
    return { buffer, extension };
  } catch {
    return null;
  }
}
