// SPDX-License-Identifier: AGPL-3.0-or-later

import { analyzeEmergency } from "./application/services/EmergencyAnalyzer.js";
import { createHealthAdvice } from "./application/services/ReportAdvisor.js";
import { createDashboardData } from "./application/services/DashboardDataMapper.js";
import { processDiscordNotifications } from "./application/services/DiscordNotificationOrchestrator.js";
import { getInAtmosphereSnapshot } from "./application/use-cases/GetInAtmosphereSnapshot.js";
import { validateEnv } from "./infrastructure/config/env.js";
import { resolveReportMode } from "./infrastructure/config/reportMode.js";
import {
  getAppState,
  saveAppState,
} from "./infrastructure/storage/AppStateRepository.js";
import { saveDashboardData } from "./infrastructure/storage/DashboardDataRepository.js";

async function main() {
  validateEnv();

  const reportMode = resolveReportMode();

  const state = await getAppState();
  const snapshot = await getInAtmosphereSnapshot();

  const emergencyAlert = analyzeEmergency({
    snapshot,
    previousAqi: state.lastAqi ?? undefined,
  });

  const advice = createHealthAdvice(snapshot);

  const dashboardData = createDashboardData(
    snapshot,
    emergencyAlert,
    advice,
    reportMode
  );

  await saveDashboardData(dashboardData);

  const updatedState = await processDiscordNotifications({
    state,
    snapshot,
    emergencyAlert,
    advice,
    reportMode,
  });

  await saveAppState(updatedState);

  console.log(
    `${reportMode} selesai: dashboard diperbarui, Discord lifecycle diproses, state disimpan.`
  );
}

main().catch((error) => {
  console.error("Terjadi error:", error.message);
  process.exit(1);
});
