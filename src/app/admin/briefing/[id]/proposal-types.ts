import type { ProposalStatus } from "@/lib/constants";

export type ProposalRow = {
  id: string;
  version: number;
  status: ProposalStatus;
  summary: string;
  content: string;
  hoursTotal: number;
  costCurrency: string;
  costMin: number;
  costMax: number;
  clientNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type EditFormData = {
  summary: string;
  content: string;
  hoursTotal: number;
  costMin: number;
  costMax: number;
};
