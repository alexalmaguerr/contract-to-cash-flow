import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SigeHydraQuery {
  cnttnum?: string;
  cnttrefant?: string;
  contratoId?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class SigeHydraService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: SigeHydraQuery) {
    const { cnttnum, cnttrefant, contratoId, limit = 100, offset = 0 } = query;

    const where: {
      cnttnum?: string;
      cnttrefant?: string;
      contratoId?: string;
    } = {};
    if (cnttnum) where.cnttnum = cnttnum;
    if (cnttrefant) where.cnttrefant = cnttrefant;
    if (contratoId) where.contratoId = contratoId;

    const [data, total] = await Promise.all([
      this.prisma.sigeHydra.findMany({
        where,
        include: {
          contrato: {
            select: {
              id: true,
              nombre: true,
              ceaNumContrato: true,
              estado: true,
              direccion: true,
            },
          },
        },
        orderBy: { cnttnum: 'asc' },
        take: Math.min(limit, 500),
        skip: offset,
      }),
      this.prisma.sigeHydra.count({ where }),
    ]);

    return { data, total };
  }
}
