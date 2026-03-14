import { useEffect, useState } from "react";
import type { OperationalProgram } from "@shared/subsidy";
import { fetchPrograms } from "@/lib/api";
import { subsidyData } from "@/lib/subsidyData";

let cachedPrograms: OperationalProgram[] | null = null;
let programsRequest: Promise<OperationalProgram[]> | null = null;
type UseProgramsOptions = {
  deferRemote?: boolean;
  deferMs?: number;
  skipRemote?: boolean;
};

function buildFallbackPrograms(): OperationalProgram[] {
  return subsidyData.map((item) => ({
    program: {
      id: `fallback-${item.id}`,
      legacyId: item.id,
      name: item.name,
      subName: item.subName,
      category: item.category,
      summary: item.description,
      amountLabel: item.amountLabel,
      duration: item.duration,
      applicationCycle: item.applicationCycle,
      tags: item.tags,
      highlight: item.highlight,
      baseAmount: item.amount,
      sourceDocumentIds: ["fallback-doc"],
      latestSourceDocumentId: "fallback-doc",
      published: true,
    },
    rule: {
      id: `fallback-rule-${item.id}`,
      programId: item.id,
      requirements: item.requirements,
      exclusions: item.exclusions,
      notes: item.notes,
      followUpQuestionIds: [],
    },
    exclusions: item.exclusions.map((text, index) => ({
      id: `fallback-exclusion-${item.id}-${index + 1}`,
      programId: item.id,
      text,
    })),
    latestSource: {
      id: "fallback-doc",
      title: "로컬 시드 데이터",
      issuer: "노무법인 위너스",
      기준일: "2026-01-01",
      publishedAt: "2026-01-01",
      fileName: "client/src/lib/subsidyData.ts",
      priority: 0,
    },
  }));
}

export function usePrograms(options?: UseProgramsOptions) {
  const [programs, setPrograms] = useState<OperationalProgram[]>(cachedPrograms ?? buildFallbackPrograms());
  const [loading, setLoading] = useState(cachedPrograms === null);
  const [error, setError] = useState<string | null>(null);
  const deferRemote = options?.deferRemote ?? false;
  const deferMs = options?.deferMs ?? 1200;
  const skipRemote = options?.skipRemote ?? false;

  useEffect(() => {
    if (skipRemote) {
      setLoading(false);
      return;
    }
    if (cachedPrograms) return;

    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const startRequest = () => {
      const request =
        programsRequest ??
        fetchPrograms()
          .then((payload) => {
            cachedPrograms = payload.programs;
            return payload.programs;
          })
          .catch((error) => {
            programsRequest = null;
            throw error;
          });
      programsRequest = request;

      request
        .then((resolvedPrograms) => {
          if (!active) return;
          setPrograms(resolvedPrograms);
        })
        .catch((err: unknown) => {
          if (!active) return;
          setError(err instanceof Error ? err.message : "Failed to load programs");
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
        });
    };

    if (deferRemote) {
      timeoutId = setTimeout(startRequest, deferMs);
    } else {
      startRequest();
    }

    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [deferMs, deferRemote, skipRemote]);

  return { programs, loading, error };
}
