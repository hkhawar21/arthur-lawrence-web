import { apiRequest } from "@/api/client";
import {
  portfolioItemResponseSchema,
  portfolioListResponseSchema,
  type CreatePortfolioItemInput,
  type PortfolioItem,
  type PortfolioListData,
  type PortfolioListQuery,
  type UpdatePortfolioItemInput,
} from "@/types/portfolio";

export async function getPortfolioItems(
  query: PortfolioListQuery = {},
  token?: string | null,
): Promise<PortfolioListData> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  const qs = params.toString();

  const json = await apiRequest<unknown>(`/portfolio${qs ? `?${qs}` : ""}`, { token });
  return portfolioListResponseSchema.parse(json).data;
}

export async function getPortfolioItem(id: number, token?: string | null): Promise<PortfolioItem> {
  const json = await apiRequest<unknown>(`/portfolio/${id}`, { token });
  return portfolioItemResponseSchema.parse(json).data;
}

export async function createPortfolioItem(
  input: CreatePortfolioItemInput,
  token?: string | null,
): Promise<PortfolioItem> {
  const json = await apiRequest<unknown>("/portfolio", {
    method: "POST",
    body: input,
    token,
  });
  return portfolioItemResponseSchema.parse(json).data;
}

export async function updatePortfolioItem(
  id: number,
  input: UpdatePortfolioItemInput,
  token?: string | null,
): Promise<PortfolioItem> {
  const json = await apiRequest<unknown>(`/portfolio/${id}`, {
    method: "PUT",
    body: input,
    token,
  });
  return portfolioItemResponseSchema.parse(json).data;
}

export async function deletePortfolioItem(id: number, token?: string | null): Promise<PortfolioItem> {
  const json = await apiRequest<unknown>(`/portfolio/${id}`, {
    method: "DELETE",
    token,
  });
  return portfolioItemResponseSchema.parse(json).data;
}
