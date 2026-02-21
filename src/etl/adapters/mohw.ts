import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import * as XLSX from "xlsx";
import type { DataSourceAdapter } from "../types";
import { DataSourceError } from "../types";
import { db } from "@/db/connection";
import { childcareCenters } from "@/db/schema/childcare";
import { sql } from "drizzle-orm";

/**
 * MOHW (보건복지부) childcare adapter — XLS file loader.
 * Reads pre-downloaded XLS file from data/childcare/ directory.
 * No API key required.
 *
 * XLS structure: 24 columns, ~9,454 rows
 *   col 0: 시도, col 1: 시군구, col 2: 어린이집명
 *   col 3: 어린이집유형구분, col 4: 운영현황 (정상/폐지/휴지)
 *   col 6: 주소, col 14: 정원수, col 15: 현원수
 *   col 16: 위도, col 17: 경도
 *
 * Source of Truth: M2 spec Section 4.1.3
 */

export interface ChildcareRecord {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentEnrollment: number;
  evaluationGrade: string | null;
  facilityType: string;
  externalId: string;
}

const XLS_DIR = path.resolve(process.cwd(), "data/childcare");

export class MohwAdapter implements DataSourceAdapter<ChildcareRecord> {
  readonly name = "MOHW";

  async fetch(
    params: Record<string, unknown>,
  ): Promise<ChildcareRecord[]> {
    const dryRun = Boolean(params.dryRun);

    // Find XLS file in data/childcare/
    const xlsFile = this.findXlsFile();
    if (!xlsFile) {
      throw new DataSourceError(
        this.name,
        "FETCH_FAILED",
        `No XLS file found in ${XLS_DIR}. Download from info.childcare.go.kr`,
      );
    }

    console.log(
      JSON.stringify({
        event: "mohw_xls_load",
        file: path.basename(xlsFile),
      }),
    );

    // Read and parse XLS
    const workbook = XLSX.readFile(xlsFile);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    // Parse records, filter active only
    const records: ChildcareRecord[] = [];

    for (const row of rows) {
      const values = Object.values(row);

      // col 4: 운영현황 — only keep "정상"
      const status = String(values[4] ?? "").trim();
      if (status !== "정상") continue;

      const name = String(values[2] ?? "").trim();
      const address = String(values[6] ?? "").trim();
      const lat = Number(values[16]) || 0;
      const lng = Number(values[17]) || 0;
      const capacity = Number(values[14]) || 0;
      const currentEnrollment = Number(values[15]) || 0;
      const facilityType = String(values[3] ?? "").trim();

      // Skip if no valid coordinates
      if (lat === 0 || lng === 0) continue;
      // Skip if coordinates are out of Korea range
      if (lat < 33 || lat > 39 || lng < 124 || lng > 132) continue;

      // Generate external_id from name + address hash (no unique code in XLS)
      const externalId = this.generateExternalId(name, address);

      records.push({
        name,
        address,
        latitude: lat,
        longitude: lng,
        capacity,
        currentEnrollment,
        evaluationGrade: null, // Not in XLS
        facilityType,
        externalId,
      });
    }

    console.log(
      JSON.stringify({
        event: "mohw_parsed",
        total: rows.length,
        active: records.length,
      }),
    );

    // Upsert to DB
    if (!dryRun && records.length > 0) {
      await this.upsertRecords(records);
    }

    return records;
  }

  private findXlsFile(): string | null {
    if (!fs.existsSync(XLS_DIR)) return null;

    const files = fs.readdirSync(XLS_DIR);
    const xlsFile = files.find(
      (f) => f.endsWith(".xls") || f.endsWith(".xlsx"),
    );

    return xlsFile ? path.join(XLS_DIR, xlsFile) : null;
  }

  private generateExternalId(name: string, address: string): string {
    const hash = crypto
      .createHash("md5")
      .update(`${name}|${address}`)
      .digest("hex")
      .substring(0, 12);
    return `CC${hash}`;
  }

  private async upsertRecords(records: ChildcareRecord[]): Promise<void> {
    const BATCH_SIZE = 100;
    let inserted = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);

      const values = batch.map((r) => ({
        name: r.name,
        address: r.address,
        externalId: r.externalId,
        location: { latitude: r.latitude, longitude: r.longitude },
        capacity: r.capacity,
        currentEnrollment: r.currentEnrollment,
        evaluationGrade: r.evaluationGrade,
      }));

      await db
        .insert(childcareCenters)
        .values(values)
        .onConflictDoUpdate({
          target: childcareCenters.externalId,
          set: {
            name: sql`EXCLUDED."name"`,
            address: sql`EXCLUDED."address"`,
            capacity: sql`EXCLUDED."capacity"`,
            currentEnrollment: sql`EXCLUDED."current_enrollment"`,
          },
        });

      inserted += batch.length;

      if (inserted % 1000 === 0) {
        console.log(
          JSON.stringify({
            event: "mohw_upsert_progress",
            inserted,
            total: records.length,
          }),
        );
      }
    }

    console.log(
      JSON.stringify({
        event: "mohw_upsert_complete",
        inserted,
      }),
    );
  }
}
