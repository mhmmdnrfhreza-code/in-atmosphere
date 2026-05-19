import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function readJsonFile<T>(
  filePath: string,
  fallback: T
): Promise<T> {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(
  filePath: string,
  data: T
): Promise<void> {
  const folderPath = dirname(filePath);

  await mkdir(folderPath, { recursive: true });

  const content = JSON.stringify(data, null, 2);

  await writeFile(filePath, content, "utf-8");
}