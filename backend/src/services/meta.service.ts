import {SCHEDULER, SYSTEM_STATE_ID} from "../config/constants.js";
import {SystemStateModel} from "../models/systemState.model.js";
import type {MetaResponse} from "../types/api.js";
import {ageSecondsFrom} from "../utils/time.js";

export const getMetaResponse = async (): Promise<MetaResponse> => {
  const activeState = await SystemStateModel.findById(SYSTEM_STATE_ID)
    .lean()
    .exec();

  if (!activeState) {
    return {
      scheduleMinutes: SCHEDULER.minutes,
      runId: null,
      lastSuccessfulRunAt: null,
      ageSeconds: null,
    };
  }

  const updatedAt = new Date(activeState.updatedAt);

  return {
    scheduleMinutes: SCHEDULER.minutes,
    runId: activeState.runId,
    lastSuccessfulRunAt: updatedAt.toISOString(),
    ageSeconds: ageSecondsFrom(updatedAt),
  };
};
