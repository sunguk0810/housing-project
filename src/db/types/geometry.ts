import { customType } from "drizzle-orm/pg-core";

/**
 * PostGIS Geometry Point (SRID 4326) custom type for Drizzle ORM.
 *
 * - toDriver: accepts { longitude, latitude } and converts to
 *   SRID=4326;POINT(lng lat) EWKT string.
 * - fromDriver: parses WKT text or hex EWKB returned by PostgreSQL
 *   into { longitude, latitude }.
 *
 * Source of Truth: docs/PHASE1_design.md > S2
 */

export interface PointCoord {
  longitude: number;
  latitude: number;
}

export const geometryPoint = customType<{
  data: PointCoord;
  driverData: string;
}>({
  dataType() {
    return "geometry(Point, 4326)";
  },
  toDriver(value: PointCoord): string {
    return `SRID=4326;POINT(${value.longitude} ${value.latitude})`;
  },
  fromDriver(value: string): PointCoord {
    // postgres returns geometry as hex EWKB by default.
    // ST_AsText() or ::text cast returns WKT — handle both.
    const match = value.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      return {
        longitude: parseFloat(match[1]),
        latitude: parseFloat(match[2]),
      };
    }
    // Parse EWKB hex
    const buf = Buffer.from(value, "hex");
    const isLE = buf[0] === 0x01;
    const readDouble = isLE
      ? (offset: number) => buf.readDoubleLE(offset)
      : (offset: number) => buf.readDoubleBE(offset);
    // EWKB with SRID: [1 byte order][4 type][4 SRID][8 X][8 Y] = 25 bytes
    // WKB without SRID: [1 byte order][4 type][8 X][8 Y] = 21 bytes
    const offset = buf.length >= 25 ? 9 : 5;
    return {
      longitude: readDouble(offset),
      latitude: readDouble(offset + 8),
    };
  },
});

/**
 * PostGIS Geometry Polygon (SRID 4326) custom type for Drizzle ORM.
 *
 * - toDriver: accepts GeoJSON Polygon object or WKT string.
 * - fromDriver: returns raw hex string.
 *   Complex polygon reads should use ST_AsGeoJSON() in raw SQL.
 */

export interface PolygonGeoJSON {
  type: "Polygon";
  coordinates: number[][][];
}

export const geometryPolygon = customType<{
  data: PolygonGeoJSON | string;
  driverData: string;
}>({
  dataType() {
    return "geometry(Polygon, 4326)";
  },
  toDriver(value: PolygonGeoJSON | string): string {
    if (typeof value === "string") {
      return value;
    }
    // Convert GeoJSON Polygon to EWKT
    const ring = value.coordinates[0]
      .map((coord) => `${coord[0]} ${coord[1]}`)
      .join(", ");
    return `SRID=4326;POLYGON((${ring}))`;
  },
  fromDriver(value: string): PolygonGeoJSON | string {
    // Return raw hex — callers should use ST_AsGeoJSON() for structured reads
    return value;
  },
});
