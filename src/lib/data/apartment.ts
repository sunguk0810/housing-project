import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/db/connection';
import { apartments, apartmentPrices, apartmentDetails, apartmentUnitTypes, safetyStats } from '@/db/schema';
import {
  findNearbyChildcare,
  findNearbySchools,
  findNearestGrid,
  getFullCommuteForGrid,
} from '@/lib/engines/spatial';
import { safeNum, safeNumRequired } from '@/lib/utils/safe-num';
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

  // Step 2: Fetch prices (individual trade records)
  const priceRows = await db
    .select({
      id: apartmentPrices.id,
      tradeType: apartmentPrices.tradeType,
      year: apartmentPrices.year,
      month: apartmentPrices.month,
      price: apartmentPrices.price,
      monthlyRent: apartmentPrices.monthlyRent,
      exclusiveArea: apartmentPrices.exclusiveArea,
      floor: apartmentPrices.floor,
    })
    .from(apartmentPrices)
    .where(eq(apartmentPrices.aptId, aptId))
    .orderBy(desc(apartmentPrices.year), desc(apartmentPrices.month), desc(apartmentPrices.id));

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

  // Step 6: Commute — full destinations with routes
  const grid = await findNearestGrid(aptLon, aptLat);
  const fullCommute = grid ? await getFullCommuteForGrid(grid.gridId) : [];

  // Build destinations array for API response
  const destinations = fullCommute.map((r) => ({
    destinationKey: r.destinationKey,
    name: r.name,
    timeMinutes: r.timeMinutes,
    ...(r.route ? { route: r.route } : {}),
  }));

  // Legacy commute time map for backward-compatible toGbd/toYbd/toCbd/toPangyo
  const commuteMap = new Map(fullCommute.map((r) => [r.destinationKey, r.timeMinutes]));

  // [F1+R2] routes fallback chain: GBD → first valid destination → undefined
  const gbdRow = fullCommute.find((r) => r.destinationKey === 'GBD');
  const deprecatedRoute = gbdRow?.route
    ?? fullCommute.find((r) => r.route != null)?.route
    ?? undefined;

  // [R6] Runtime log: 1% sampling
  if (deprecatedRoute && Math.random() < 0.01) {
    console.info(JSON.stringify({
      event: 'deprecated_routes_populated',
      aptId,
      source: gbdRow?.route ? 'GBD' : 'first_valid',
    }));
  }

  // Step 7: Apartment details (K-apt)
  const detailRows = await db
    .select()
    .from(apartmentDetails)
    .where(eq(apartmentDetails.aptId, aptId))
    .limit(1);

  const d = detailRows[0];
  const details = d
    ? {
        kaptCode: d.kaptCode ?? null,
        dongCount: safeNum(d.dongCount),
        doroJuso: d.doroJuso ?? null,
        useDate: d.useDate ?? null,
        builder: d.builder ?? null,
        heatType: d.heatType ?? null,
        hallType: d.hallType ?? null,
        totalArea: safeNum(d.totalArea),
        parkingGround: safeNum(d.parkingGround),
        parkingUnderground: safeNum(d.parkingUnderground),
        elevatorCount: safeNum(d.elevatorCount),
        cctvCount: safeNum(d.cctvCount),
        evChargerGround: safeNum(d.evChargerGround),
        evChargerUnderground: safeNum(d.evChargerUnderground),
        subwayLine: d.subwayLine ?? null,
        subwayStation: d.subwayStation ?? null,
        subwayDistance: d.subwayDistance ?? null,
      }
    : null;

  // Step 8: Unit types
  const unitTypeRows = await db
    .select({
      areaSqm: apartmentUnitTypes.areaSqm,
      areaPyeong: apartmentUnitTypes.areaPyeong,
      householdCount: apartmentUnitTypes.householdCount,
    })
    .from(apartmentUnitTypes)
    .where(eq(apartmentUnitTypes.aptId, aptId));

  const unitTypes = unitTypeRows.map((r) => ({
    areaSqm: safeNumRequired(r.areaSqm, 'unitTypes.areaSqm'),
    areaPyeong: safeNum(r.areaPyeong),
    householdCount: safeNumRequired(r.householdCount, 'unitTypes.householdCount'),
  }));

  return {
    apartment: {
      id: apt.id,
      aptCode: apt.aptCode,
      aptName: apt.aptName,
      address: apt.address,
      builtYear: apt.builtYear,
      householdCount: safeNum(apt.householdCount),
      areaMin: safeNum(apt.areaMin),
      areaMax: safeNum(apt.areaMax),
      prices: priceRows.map((r) => ({
        id: r.id,
        tradeType: (r.tradeType ?? '') as 'sale' | 'jeonse' | 'monthly',
        year: r.year ?? 0,
        month: r.month ?? 0,
        price: safeNumRequired(r.price, 'prices.price'),
        monthlyRent: safeNum(r.monthlyRent),
        exclusiveArea: safeNum(r.exclusiveArea),
        floor: safeNum(r.floor),
      })),
      details,
      unitTypes,
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
      destinations,
      routes: deprecatedRoute,
    },
    sources: {
      priceDate: firstPrice
        ? `${firstPrice.year}-${String(firstPrice.month ?? 0).padStart(2, '0')}`
        : 'N/A',
      safetyDate: safety?.dataDate ?? null,
    },
  };
}
