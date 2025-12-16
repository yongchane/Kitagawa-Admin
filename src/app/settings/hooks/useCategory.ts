"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/api/axios";

export interface CategoryChild {
  name: string;
  slug: string;
  productCount: number;
  imageUrl?: string;
}

export interface Level2Category {
  _id: string;
  name: string;
  nameKo: string;
  slug: string;
  level: number;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  productCount: number;
  parentLevelCategory: string;
  parentLevelSlug: string;
  children: CategoryChild[];
}
export interface Level2CategoryApiResponse {
  success: boolean;
  code: number;
  message: string;
  data: Level2Category[];
}

export const categoryService = {
  // Level 2 카테고리 조회 (slug 기반)
  async getLevel2Categories(slug: string) {
    const response = await axiosInstance.get<Level2CategoryApiResponse>(
      `/api/categories/level2/${slug}`
    );
    return response.data;
  },
};

export const useLevel2Categories = (slug: string) => {
  const [categories, setCategories] = useState<Level2Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getLevel2Categories(slug);
        if (response.success) {
          setCategories(response.data);
        }
      } catch (err) {
        setErrors(
          err instanceof Error
            ? err
            : new Error("Failed to fetch level 2 categories")
        );
      } finally {
        setLoading(false);
      }
    };
  }, [slug]);

  return { categories, loading, errors };
};
