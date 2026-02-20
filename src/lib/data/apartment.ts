import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/db/connection';
import { apartments, apartmentPrices, safetyStats } from '@/db/schema';
import {
  findNearbyChildcare,
  findNearbySchools,
  findNearestGrid,
  getCommuteTimesForGrid,
} from '@/lib/engines/spatial';
import type { ApartmentDetailResponse } from '@/types/api';

/**
 * Fetch apartment detail with nearby facilities.
 * Shared between API route and server component page.
 * Source of Truth: M2 spec Section 6.2
 */
export async function getApartmentDetail(aptId: number): Promise<ApartmentDetailResponse | null> {
  // Step 1: Fetch apartment basic info
  const aptRows = await db
    .select({
      id: apartments.id,
      aptCode: apartments.aptCode,
      aptName: apartments.aptName,
      address: apartments.address,
      regionCode: apartments.regionCode,
      builtYear: apartments.builtYear,
      householdCount: apartments.householdCount,
      areaMin: apartments.areaMin,
      areaMax: apartments.areaMax,
      longitude: sql<number>`ST_X(${apartments.location}::geometry)`,
      latitude: sql<number>`ST_Y(${apartments.location}::geometry)`,
    })
    .from(apartments)
    .where(eq(apartments.id, aptId));

  const apt = aptRows[0];
  if (!apt) return null;

  const aptLon = apt.longitude;
  const aptLat = apt.latitude;

  // Step 2: Fetch prices
  const priceRows = await db
    .select({
      tradeType: apartmentPrices.tradeType,
      year: apartmentPrices.year,
      month: apartmentPrices.month,
      averagePrice: apartmentPrices.averagePrice,
      monthlyRentAvg: apartmentPrices.monthlyRentAvg,
      dealCount: apartmentPrices.dealCount,
      areaAvg: apartmentPrices.areaAvg,
      areaMin: apartmentPrices.areaMin,
      areaMax: apartmentPrices.areaMax,
      floorAvg: apartmentPrices.floorAvg,
      floorMin: apartmentPrices.floorMin,
      floorMax: apartmentPrices.floorMax,
    })
    .from(apartmentPrices)
    .where(eq(apartmentPrices.aptId, aptId))
    .orderBy(desc(apartmentPrices.year), desc(apartmentPrices.month));

  const firstPrice = priceRows[0];

  // Step 3: Nearby childcare (800m)
  const childcareItems = await findNearbyChildcare(aptLon, aptLat, 800);

  // Step 4: Nearby schools (1500m)
  const schoolItems = await findNearbySchools(aptLon, aptLat, 1500);

  // Step 5: Safety stats
  const safetyRows = apt.regionCode
    ? await db
        .select({
          regionCode: safetyStats.regionCode,
          regionName: safetyStats.regionName,
          calculatedScore: safetyStats.calculatedScore,
          crimeRate: safetyStats.crimeRate,
          cctvDensity: safetyStats.cctvDensity,
          shelterCount: safetyStats.shelterCount,
          dataDate: safetyStats.dataDate,
        })
        .from(safetyStats)
        .where(eq(safetyStats.regionCode, apt.regionCode))
        .orderBy(desc(safetyStats.dataDate))
        .limit(1)
    : [];

  const s = safetyRows[0];
  const safety = s
    ? {
        regionCode: s.regionCode,
        regionName: s.regionName,
        calculatedScore: s.calculatedScore ? Number(s.calculatedScore) : null,
        crimeRate: s.crimeRate ? Number(s.crimeRate) : null,
        cctvDensity: s.cctvDensity ? Number(s.cctvDensity) : null,
        shelterCount: s.shelterCount,
        dataDate: s.dataDate,
      }
    : null;

  // Step 6: Commute grid
  const grid = await findNearestGrid(aptLon, aptLat);
  const commuteRows = grid ? await getCommuteTimesForGrid(grid.gridId) : [];
  const commuteMap = new Map(commuteRows.map((r) => [r.destinationKey, r.timeMinutes]));

  return {
    apartment: {
      id: apt.id,
      aptCode: apt.aptCode,
      aptName: apt.aptName,
      address: apt.address,
      builtYear: apt.builtYear,
      householdCount: apt.householdCount,
      areaMin: apt.areaMin,
      areaMax: apt.areaMax,
      prices: priceRows.map((r) => ({
        tradeType: (r.tradeType ?? '') as 'sale' | 'jeonse' | 'monthly',
        year: r.year ?? 0,
        month: r.month ?? 0,
        averagePrice: Number(r.averagePrice ?? 0),
        monthlyRentAvg: r.monthlyRentAvg != null ? Number(r.monthlyRentAvg) : null,
        dealCount: r.dealCount ?? 0,
        areaAvg: r.areaAvg ? Number(r.areaAvg) : null,
        areaMin: r.areaMin ? Number(r.areaMin) : null,
        areaMax: r.areaMax ? Number(r.areaMax) : null,
        floorAvg: r.floorAvg ? Number(r.floorAvg) : null,
        floorMin: r.floorMin ?? null,
        floorMax: r.floorMax ?? null,
      })),
    },
    nearby: {
      childcare: {
        count: childcareItems.length,
        items: childcareItems,
      },
      schools: schoolItems,
      safety,
    },
    commute: {
      toGbd: commuteMap.get('GBD') ?? null,
      toYbd: commuteMap.get('YBD') ?? null,
      toCbd: commuteMap.get('CBD') ?? null,
      toPangyo: commuteMap.get('PANGYO') ?? null,
    },
    sources: {
      priceDate: firstPrice
        ? `${firstPrice.year}-${String(firstPrice.month ?? 0).padStart(2, '0')}`
        : 'N/A',
      safetyDate: safety?.dataDate ?? null,
    },
  };
}
