import type { ReportMode } from "../../domain/entities/ReportMode.js";

const MORNING_CRON = "37 23 * * *";
const RUSH_HOUR_CRON = "17 10 * * *";
const EMERGENCY_WATCH_CRON = "7,37 * * * *";

function isValidReportMode(value: string | undefined): value is ReportMode {
  return (
    value === "manual" ||
    value === "morning" ||
    value === "rush-hour" ||
    value === "emergency-watch"
  );
}

function getModeFromCron(schedule: string | undefined): ReportMode | null {
  if (schedule === MORNING_CRON) return "morning";
  if (schedule === RUSH_HOUR_CRON) return "rush-hour";
  if (schedule === EMERGENCY_WATCH_CRON) return "emergency-watch";

  return null;
}

export function resolveReportMode(): ReportMode {
  const modeFromEnv = process.env.REPORT_MODE;

  if (isValidReportMode(modeFromEnv)) {
    return modeFromEnv;
  }

  const modeFromGithubSchedule = getModeFromCron(process.env.GITHUB_EVENT_SCHEDULE);

  if (modeFromGithubSchedule) {
    return modeFromGithubSchedule;
  }

  return "manual";
}