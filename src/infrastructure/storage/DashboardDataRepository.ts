import type { DashboardData } from "../../domain/entities/DashboardData.js";
import { writeJsonFile } from "./JsonFileStorage.js";

const DASHBOARD_DATA_PATH = "public/data/latest.json";

export async function saveDashboardData(
  data: DashboardData
): Promise<void> {
  await writeJsonFile<DashboardData>(DASHBOARD_DATA_PATH, data);
}