"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Rent, CreateRentInput, UpdateRentInput } from "./types";
import {
  listRent,
  createRent as apiCreateRent,
  listUserRentListings,
  listUserRentals,
  updateRent as apiUpdateRent,
  deleteRent as apiDeleteRent,
  createPendingRental as apiCreatePendingRental,
  confirmRental as apiConfirmRental,
} from "./api";
import { getToken } from "@/lib/token";
import { rentKeys } from "./keys";

/** Public list */
export function useRentList() {
  return useQuery<Rent[]>({
    queryKey: rentKeys.list(),
    queryFn: () => listRent(),
    staleTime: 60_000,
  });
}

/** My listings (requires token in store) */
export function useMyRentListings(enabled = true) {
  return useQuery<Rent[]>({
    queryKey: rentKeys.myListings(),
    enabled: enabled && !!getToken(),
    queryFn: () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return listUserRentListings();
    },
    staleTime: 30_000,
    retry: 1,
  });
}

/** My rentals (requires token) */
export function useMyRentals(enabled = true) {
  return useQuery<Rent[]>({
    queryKey: rentKeys.myRentals(),
    enabled: enabled && !!getToken(),
    queryFn: () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return listUserRentals();
    },
    staleTime: 30_000,
    retry: 1,
  });
}

/** Create */
export function useCreateRent() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["createPropertyRent"],
    mutationFn: (input: CreateRentInput) => apiCreateRent(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rentKeys.list() });
      qc.invalidateQueries({ queryKey: rentKeys.myListings() });
    },
  });
}

/** Update */
export function useUpdateRent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: UpdateRentInput }) =>
      apiUpdateRent(slug, input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: rentKeys.list() });
      qc.invalidateQueries({ queryKey: rentKeys.myListings() });
      qc.invalidateQueries({ queryKey: rentKeys.detail(vars.slug) });
    },
  });
}

/** Delete */
export function useDeleteRent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => apiDeleteRent(slug),
    onSuccess: (_data, slug) => {
      qc.invalidateQueries({ queryKey: rentKeys.list() });
      qc.invalidateQueries({ queryKey: rentKeys.myListings() });
      qc.invalidateQueries({ queryKey: rentKeys.detail(slug) });
    },
  });
}

/** Pending + confirm flows */
export function useCreatePendingRental() {
  return useMutation({
    mutationFn: (params: { rent_id: string; lister_id: string; tenant_id: string }) =>
      apiCreatePendingRental(params),
  });
}

export function useConfirmRental() {
  return useMutation({
    mutationFn: (lister_tenant_id: string) => apiConfirmRental(lister_tenant_id),
  });
}
