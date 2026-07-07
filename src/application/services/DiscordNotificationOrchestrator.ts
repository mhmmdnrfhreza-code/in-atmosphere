import type { AppState } from "../../domain/entities/AppState.js";
import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import type { EmergencyAlert } from "../../domain/entities/EmergencyAlert.js";
import type { HealthAdvice } from "../../domain/entities/HealthAdvice.js";
import type { ReportMode } from "../../domain/entities/ReportMode.js";
import {
  DiscordWebhookMessageNotFoundError,
  discordWebhookMessageClient,
  type DiscordWebhookMessageClient,
} from "../../infrastructure/discord/DiscordWebhookClient.js";
import { env } from "../../infrastructure/config/env.js";
import {
  createUpdatedState,
  normalizeAppState,
} from "../../infrastructure/storage/AppStateRepository.js";
import { createCurrentStatusEmbed } from "../../presentation/discord/currentStatusEmbed.js";
import { createEmergencyAlertEmbed } from "../../presentation/discord/emergencyAlertEmbed.js";
import { createRecoveryAlertEmbed } from "../../presentation/discord/recoveryAlertEmbed.js";
import {
  createEmergencyFingerprint,
  createRecoveryFingerprint,
} from "./EmergencyFingerprint.js";

interface ProcessDiscordNotificationsInput {
  state: AppState;
  snapshot: AtmosSnapshot;
  emergencyAlert: EmergencyAlert;
  advice: HealthAdvice;
  reportMode: ReportMode;
  client?: DiscordWebhookMessageClient;
  dashboardUrl?: string;
}

async function deleteTrackedMessage(
  client: DiscordWebhookMessageClient,
  messageId: string | null,
  successLog: string
): Promise<void> {
  if (!messageId) return;

  const deleted = await client.deleteMessage(messageId);

  if (deleted) {
    console.log(successLog);
  }
}

async function upsertCurrentStatusMessage(
  state: AppState,
  input: ProcessDiscordNotificationsInput,
  client: DiscordWebhookMessageClient
): Promise<AppState> {
  const payload = createCurrentStatusEmbed(
    input.snapshot,
    input.emergencyAlert,
    input.advice,
    input.reportMode,
    input.dashboardUrl ?? env.dashboardUrl
  );

  if (state.currentStatusMessageId) {
    await deleteTrackedMessage(
      client,
      state.currentStatusMessageId,
      "Current Status lama dihapus."
    );
  }

  const message = await client.sendPayloadAndReturnMessage(payload);
  console.log("Current Status dikirim sebagai pesan baru.");

  return {
    ...state,
    currentStatusMessageId: message.id,
    currentStatusUpdatedAt: input.snapshot.generatedAt,
  };
}

async function sendNewEmergency(
  state: AppState,
  input: ProcessDiscordNotificationsInput,
  client: DiscordWebhookMessageClient,
  fingerprint: string
): Promise<AppState> {
  const hasActiveEmergency = Boolean(state.activeEmergencyMessageId);

  if (hasActiveEmergency) {
    await deleteTrackedMessage(
      client,
      state.previousEmergencyMessageId,
      "Old emergency deleted."
    );
  }

  await deleteTrackedMessage(
    client,
    state.recoveryMessageId,
    "Old recovery deleted."
  );

  if (state.activeEmergencyMessageId) {
    console.log("Previous emergency preserved for context.");
  }

  const message = await client.sendPayloadAndReturnMessage(
    createEmergencyAlertEmbed(input.snapshot, input.emergencyAlert, input.advice)
  );

  console.log("Emergency sent.");

  return createUpdatedState(
    {
      ...state,
      previousEmergencyMessageId: hasActiveEmergency
        ? state.activeEmergencyMessageId
        : state.previousEmergencyMessageId,
      previousEmergencyFingerprint: hasActiveEmergency
        ? state.activeEmergencyFingerprint
        : state.previousEmergencyFingerprint,
      previousEmergencySentAt: hasActiveEmergency
        ? state.activeEmergencySentAt
        : state.previousEmergencySentAt,
      activeEmergencyMessageId: message.id,
      activeEmergencyFingerprint: fingerprint,
      activeEmergencySentAt: input.snapshot.generatedAt,
      recoveryMessageId: null,
      recoveryFingerprint: null,
      recoverySentAt: null,
    },
    input.snapshot,
    input.emergencyAlert,
    true
  );
}

async function processActiveEmergency(
  state: AppState,
  input: ProcessDiscordNotificationsInput,
  client: DiscordWebhookMessageClient
): Promise<AppState> {
  const fingerprint = createEmergencyFingerprint(
    input.snapshot,
    input.emergencyAlert
  );

  if (fingerprint === state.activeEmergencyFingerprint) {
    console.log("Duplicate emergency skipped.");
    return state;
  }

  return sendNewEmergency(state, input, client, fingerprint);
}

async function processRecovery(
  state: AppState,
  input: ProcessDiscordNotificationsInput,
  client: DiscordWebhookMessageClient
): Promise<AppState> {
  if (!state.activeEmergencyFingerprint) {
    console.log("Recovery skipped because state is already normal.");
    return state;
  }

  const recoveryFingerprint = createRecoveryFingerprint(
    state.activeEmergencyFingerprint
  );
  let nextState = state;

  if (state.recoveryFingerprint !== recoveryFingerprint) {
    await deleteTrackedMessage(
      client,
      state.recoveryMessageId,
      "Old recovery deleted."
    );

    const message = await client.sendPayloadAndReturnMessage(
      createRecoveryAlertEmbed(input.snapshot, input.advice, {
        previousEmergencyFingerprint: state.activeEmergencyFingerprint,
        previousEmergencySentAt: state.activeEmergencySentAt,
      })
    );

    console.log("Recovery sent.");

    nextState = {
      ...nextState,
      recoveryMessageId: message.id,
      recoveryFingerprint,
      recoverySentAt: input.snapshot.generatedAt,
    };
  } else {
    console.log("Recovery skipped because state is already normal.");
  }

  if (state.previousEmergencyMessageId) {
    await deleteTrackedMessage(
      client,
      state.previousEmergencyMessageId,
      "Old emergency deleted."
    );
  }

  return {
    ...nextState,
    previousEmergencyMessageId: state.activeEmergencyMessageId,
    previousEmergencyFingerprint: state.activeEmergencyFingerprint,
    previousEmergencySentAt: state.activeEmergencySentAt,
    activeEmergencyMessageId: null,
    activeEmergencyFingerprint: null,
    activeEmergencySentAt: null,
  };
}

export async function processDiscordNotifications(
  input: ProcessDiscordNotificationsInput
): Promise<AppState> {
  const client = input.client ?? discordWebhookMessageClient;
  let nextState = createUpdatedState(
    normalizeAppState(input.state),
    input.snapshot,
    input.emergencyAlert,
    false
  );

  if (input.emergencyAlert.shouldSend) {
    nextState = await processActiveEmergency(nextState, input, client);
  } else {
    nextState = await processRecovery(nextState, input, client);
  }

  return upsertCurrentStatusMessage(nextState, input, client);
}
