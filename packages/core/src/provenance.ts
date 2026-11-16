// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';
import { type Result, err, ok } from './result';

export const SourceTierSchema = z.enum([
  'official',
  'empirical-reproducible',
  'peer-reviewed',
  'community-traceable',
]);

export type SourceTier = z.infer<typeof SourceTierSchema>;

const Iso8601UtcTimestampSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/,
    'retrievedAt must be a strict UTC ISO-8601 timestamp ending in Z',
  );

export const DataProvenanceSchema = z
  .object({
    source: z.string().trim().min(1, 'source must not be empty'),
    sourceTier: SourceTierSchema,
    retrievedAt: Iso8601UtcTimestampSchema,
    verified: z.boolean(),
    verifiedBy: z.string().trim().min(1).optional(),
    cs2PatchOrVersion: z.string().trim().min(1).optional(),
    notes: z.string().trim().min(1, 'notes must not be empty'),
  })
  .strict();

export type DataProvenance = z.infer<typeof DataProvenanceSchema>;

export function validateProvenance(
  input: unknown,
): Result<DataProvenance, string> {
  const parsed = DataProvenanceSchema.safeParse(input);
  if (!parsed.success) {
    return err(
      parsed.error.issues
        .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
        .join('; '),
    );
  }
  return ok(parsed.data);
}
