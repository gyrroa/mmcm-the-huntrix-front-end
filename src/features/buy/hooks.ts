"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Buy, CreateBuyInput, UpdateBuyInput } from "./types";
import {
  listBuy,
  createBuy as apiCreateBuy,
  listUserBuyListings,
  listUserPurchases,
  updateBuy as apiUpdateBuy,
  deleteBuy as apiDeleteBuy,
  createPendingSale as apiCreatePendingSale,
  confirmSale as apiConfirmSale,
} from "./api";
import { getToken } from "@/lib/token";
import { buyKeys } from "./keys";

/** Public list */
export function useBuyList() {
  return useQuery<Buy[]>({
    queryKey: buyKeys.list(),
    queryFn: () => listBuy(),
    staleTime: 60_000,
  });
}

/** My listings (requires token) */
export function useMyBuyListings(enabled = true) {
  return useQuery<Buy[]>({
    queryKey: buyKeys.myListings(),
    enabled: enabled && !!getToken(),
    queryFn: () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return listUserBuyListings();
    },
    staleTime: 30_000,
    retry: 1,
  });
}

/** My purchases (requires token) */
export function useMyPurchases(enabled = true) {
  return useQuery<Buy[]>({
    queryKey: buyKeys.myPurchases(),
    enabled: enabled && !!getToken(),
    queryFn: () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return listUserPurchases();
    },
    staleTime: 30_000,
    retry: 1,
  });
}

/** Create */
export function useCreateBuy() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["createPropertyBuy"],
    mutationFn: (input: CreateBuyInput) => apiCreateBuy(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyKeys.list() });
      qc.invalidateQueries({ queryKey: buyKeys.myListings() });
    },
  });
}

/** Update */
export function useUpdateBuy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: UpdateBuyInput }) =>
      apiUpdateBuy(slug, input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: buyKeys.list() });
      qc.invalidateQueries({ queryKey: buyKeys.myListings() });
      qc.invalidateQueries({ queryKey: buyKeys.detail(vars.slug) });
    },
  });
}

/** Delete */
export function useDeleteBuy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => apiDeleteBuy(slug),
    onSuccess: (_data, slug) => {
      qc.invalidateQueries({ queryKey: buyKeys.list() });
      qc.invalidateQueries({ queryKey: buyKeys.myListings() });
      qc.invalidateQueries({ queryKey: buyKeys.detail(slug) });
    },
  });
}

/** Pending + confirm flows */
export function useCreatePendingSale() {
  return useMutation({
    mutationFn: (params: { buy_id: string; lister_id: string; buyer_id: string }) =>
      apiCreatePendingSale(params),
  });
}

export function useConfirmSale() {
  return useMutation({
    mutationFn: (lister_buyer_id: string) => apiConfirmSale(lister_buyer_id),
  });
}
