import { Schema, model } from "mongoose";

export interface PageDocument {
  url: string;
  title: string;
  terms: string[];
  termCount: number;
  lastCrawledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<PageDocument>(
  {
    url: { type: String, required: true, unique: true },
    title: { type: String, default: "" },
    terms: { type: [String], required: true },
    termCount: { type: Number, required: true },
    lastCrawledAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// Multikey index: one entry per term, each pointing back at this page.
pageSchema.index({ terms: 1 });

export const Page = model<PageDocument>("Page", pageSchema);
