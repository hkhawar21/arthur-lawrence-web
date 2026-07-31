import { z } from "zod";

import { apiSuccessResponseSchema } from "@/types/api";

export const portfolioStatusSchema = z.enum(["Draft", "Active", "Completed"]);

export const portfolioItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  technology: z.string(),
  projectUrl: z.url(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  githubUrl: z.url().optional(),
  imageUrl: z.url().optional(),
  status: portfolioStatusSchema.optional(),
});

export const portfolioPaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const portfolioListDataSchema = z.object({
  items: z.array(portfolioItemSchema),
  pagination: portfolioPaginationSchema,
});

export const portfolioListQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const createPortfolioItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  technology: z.string().min(1),
  projectUrl: z.url(),
  githubUrl: z.url().optional(),
  imageUrl: z.url().optional(),
  status: portfolioStatusSchema.optional(),
});

export const updatePortfolioItemSchema = createPortfolioItemSchema.partial();

export const portfolioListResponseSchema =
  apiSuccessResponseSchema(portfolioListDataSchema);

export const portfolioItemResponseSchema =
  apiSuccessResponseSchema(portfolioItemSchema);

export type PortfolioStatus = z.infer<typeof portfolioStatusSchema>;
export type PortfolioItem = z.infer<typeof portfolioItemSchema>;
export type PortfolioPagination = z.infer<typeof portfolioPaginationSchema>;
export type PortfolioListData = z.infer<typeof portfolioListDataSchema>;
export type PortfolioListQuery = z.infer<typeof portfolioListQuerySchema>;

export type CreatePortfolioItemInput = z.infer<
  typeof createPortfolioItemSchema
>;
export type UpdatePortfolioItemInput = z.infer<
  typeof updatePortfolioItemSchema
>;

export type PortfolioListResponse = z.infer<typeof portfolioListResponseSchema>;
export type PortfolioItemResponse = z.infer<typeof portfolioItemResponseSchema>;
