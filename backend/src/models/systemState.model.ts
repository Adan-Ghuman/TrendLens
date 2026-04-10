import {Schema, model, type InferSchemaType} from "mongoose";
import {COLLECTIONS, SYSTEM_STATE_ID} from "../config/constants.js";

const systemStateSchema = new Schema(
  {
    _id: {type: String, required: true, default: SYSTEM_STATE_ID},
    runId: {type: String, required: true},
    updatedAt: {type: Date, required: true},
    scheduleMinutes: {type: Number, required: true},
  },
  {
    collection: COLLECTIONS.systemState,
    versionKey: false,
  },
);

export type SystemStateDocument = InferSchemaType<typeof systemStateSchema>;
export const SystemStateModel = model("SystemState", systemStateSchema);
