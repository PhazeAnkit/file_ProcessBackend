import { prisma } from "../db/prisma";
import { User } from "../generated/prisma/client";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  education?: string;
}

export interface PaginatedUsers {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: User[];
}

export async function getUsers({
  page = 1,
  limit = 50,
  education,
}: GetUsersParams): Promise<PaginatedUsers> {
  const skip = (page - 1) * limit;

  const where = education ? { education } : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: users,
  };
}
