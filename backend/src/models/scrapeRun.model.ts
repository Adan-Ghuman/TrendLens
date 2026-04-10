import {Schema, model, type InferSchemaType} from "mongoose";
import {COLLECTIONS} from "../config/constants.js";

const scrapeRunSchema = new Schema(
  {
    runId: {type: String, required: true, unique: true},
    source: {type: String, required: true},
    startedAt: {type: Date, required: true},
    completedAt: {type: Date, default: null},
    status: {
      type: String,
      required: true,
      enum: ["running", "success", "failed", "partial"],
    },
    itemsFetched: {type: Number, required: true, default: 0},
    errorMessage: {type: String, default: null},
    httpStatus: {type: Number, default: null},
    durationMs: {type: Number, default: null},
  },
  {
    collection: COLLECTIONS.scrapeRuns,
    versionKey: false,
  },
);

scrapeRunSchema.index({startedAt: -1});
scrapeRunSchema.index({status: 1, startedAt: -1});

export type ScrapeRunDocument = InferSchemaType<typeof scrapeRunSchema>;
export const ScrapeRunModel = model("ScrapeRun", scrapeRunSchema);
