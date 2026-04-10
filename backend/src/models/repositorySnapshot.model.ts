import {Schema, model, type InferSchemaType} from "mongoose";
import {COLLECTIONS} from "../config/constants.js";

const repositorySnapshotSchema = new Schema(
  {
    runId: {type: String, required: true},
    repoId: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, default: null},
    language: {type: String, default: null},
    stars: {type: Number, required: true},
    url: {type: String, required: true},
    scrapedAt: {type: Date, required: true},
  },
  {
    collection: COLLECTIONS.repositorySnapshots,
    versionKey: false,
  },
);

repositorySnapshotSchema.index({runId: 1, repoId: 1}, {unique: true});
repositorySnapshotSchema.index({runId: 1, stars: -1, repoId: 1});

export type RepositorySnapshotDocument = InferSchemaType<
  typeof repositorySnapshotSchema
>;
export const RepositorySnapshotModel = model(
  "RepositorySnapshot",
  repositorySnapshotSchema,
);
