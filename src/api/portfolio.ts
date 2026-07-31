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
): Promise<PortfolioListData> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  const qs = params.toString();

  const json = await apiRequest<unknown>(`/portfolio${qs ? `?${qs}` : ""}`);
  return portfolioListResponseSchema.parse(json).data;
}

export async function getPortfolioItem(id: number): Promise<PortfolioItem> {
  const json = await apiRequest<unknown>(`/portfolio/${id}`);
  return portfolioItemResponseSchema.parse(json).data;
}

export async function createPortfolioItem(
  input: CreatePortfolioItemInput,
): Promise<PortfolioItem> {
  const json = await apiRequest<unknown>("/portfolio", {
    method: "POST",
    body: input,
  });
  return portfolioItemResponseSchema.parse(json).data;
}

export async function updatePortfolioItem(
  id: number,
  input: UpdatePortfolioItemInput,
): Promise<PortfolioItem> {
  const json = await apiRequest<unknown>(`/portfolio/${id}`, {
    method: "PUT",
    body: input,
  });
  return portfolioItemResponseSchema.parse(json).data;
}

export async function deletePortfolioItem(id: number): Promise<PortfolioItem> {
  const json = await apiRequest<unknown>(`/portfolio/${id}`, {
    method: "DELETE",
  });
  return portfolioItemResponseSchema.parse(json).data;
}
