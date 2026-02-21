CREATE TABLE "apartment_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"apt_id" integer NOT NULL,
	"kapt_code" varchar(20),
	"dong_count" integer,
	"doro_juso" text,
	"use_date" varchar(8),
	"builder" text,
	"developer" text,
	"heat_type" varchar(20),
	"sale_type" varchar(20),
	"hall_type" varchar(20),
	"mgr_type" varchar(20),
	"total_area" numeric,
	"private_area" numeric,
	"parking_ground" integer,
	"parking_underground" integer,
	"elevator_count" integer,
	"cctv_count" integer,
	"ev_charger_ground" integer,
	"ev_charger_underground" integer,
	"subway_line" text,
	"subway_station" text,
	"subway_distance" text,
	"bus_distance" text,
	"building_structure" varchar(30),
	"welfare_facility" text,
	"education_facility" text,
	"convenient_facility" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "apartment_details_apt_id_unique" UNIQUE("apt_id")
);
--> statement-breakpoint
CREATE TABLE "apartment_facility_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"apt_id" integer NOT NULL,
	"type" varchar(30) NOT NULL,
	"within_radius_count" integer NOT NULL,
	"nearest_distance_m" numeric,
	"radius_m" integer NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "apartment_facility_stats_unique" UNIQUE("apt_id","type","radius_m"),
	CONSTRAINT "apartment_facility_stats_type_check" CHECK ("apartment_facility_stats"."type" IN ('subway_station','bus_stop','police','fire_station','shelter','hospital','pharmacy'))
);
--> statement-breakpoint
CREATE TABLE "apartment_unit_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"apt_id" integer NOT NULL,
	"area_sqm" numeric NOT NULL,
	"area_pyeong" real,
	"household_count" integer NOT NULL,
	"source" text,
	"data_date" date,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "apartment_unit_types_unique" UNIQUE("apt_id","area_sqm")
);
--> statement-breakpoint
CREATE TABLE "facility_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(30) NOT NULL,
	"name" text,
	"address" text,
	"region_code" varchar(10),
	"location" geometry(Point, 4326) NOT NULL,
	"external_id" varchar(60),
	"source" text,
	"data_date" date,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "facility_points_type_external_unique" UNIQUE("type","external_id"),
	CONSTRAINT "facility_points_type_check" CHECK ("facility_points"."type" IN ('subway_station','bus_stop','police','fire_station','shelter','hospital','pharmacy'))
);
--> statement-breakpoint
ALTER TABLE "apartment_prices" DROP CONSTRAINT "trade_type_check";--> statement-breakpoint
ALTER TABLE "apartments" ALTER COLUMN "apt_code" SET DATA TYPE varchar(60);--> statement-breakpoint
ALTER TABLE "apartment_prices" ADD COLUMN "monthly_rent_avg" numeric;--> statement-breakpoint
ALTER TABLE "apartments" ADD COLUMN "region_code" varchar(10);--> statement-breakpoint
ALTER TABLE "apartments" ADD COLUMN "building_type" varchar(20) DEFAULT 'apartment' NOT NULL;--> statement-breakpoint
ALTER TABLE "apartments" ADD COLUMN "official_name" text;--> statement-breakpoint
ALTER TABLE "apartment_details" ADD CONSTRAINT "apartment_details_apt_id_apartments_id_fk" FOREIGN KEY ("apt_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartment_facility_stats" ADD CONSTRAINT "apartment_facility_stats_apt_id_apartments_id_fk" FOREIGN KEY ("apt_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartment_unit_types" ADD CONSTRAINT "apartment_unit_types_apt_id_apartments_id_fk" FOREIGN KEY ("apt_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commute_grid" ADD CONSTRAINT "commute_grid_id_unique" UNIQUE("grid_id");--> statement-breakpoint
ALTER TABLE "apartment_prices" ADD CONSTRAINT "trade_type_check" CHECK ("apartment_prices"."trade_type" IN ('sale', 'jeonse', 'monthly'));--> statement-breakpoint
ALTER TABLE "apartments" ADD CONSTRAINT "building_type_check" CHECK ("apartments"."building_type" IN ('apartment','officetel','other'));