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
CREATE TABLE "apartment_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"apt_id" integer,
	"trade_type" varchar(10),
	"year" integer,
	"month" integer,
	"average_price" numeric,
	"monthly_rent_avg" numeric,
	"deal_count" integer,
	"area_avg" numeric,
	"area_min" numeric,
	"area_max" numeric,
	"floor_avg" numeric,
	"floor_min" integer,
	"floor_max" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "apt_prices_unique" UNIQUE("apt_id","trade_type","year","month"),
	CONSTRAINT "trade_type_check" CHECK ("apartment_prices"."trade_type" IN ('sale', 'jeonse', 'monthly'))
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
CREATE TABLE "apartments" (
	"id" serial PRIMARY KEY NOT NULL,
	"apt_code" varchar(60) NOT NULL,
	"apt_name" text NOT NULL,
	"address" text NOT NULL,
	"region_code" varchar(10),
	"building_type" varchar(20) DEFAULT 'apartment' NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"built_year" integer,
	"household_count" integer,
	"official_name" text,
	"area_min" real,
	"area_max" real,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "apartments_apt_code_unique" UNIQUE("apt_code"),
	CONSTRAINT "building_type_check" CHECK ("apartments"."building_type" IN ('apartment','officetel','other'))
);
--> statement-breakpoint
CREATE TABLE "childcare_centers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"external_id" varchar(30),
	"location" geometry(Point, 4326) NOT NULL,
	"capacity" integer,
	"current_enrollment" integer,
	"evaluation_grade" varchar(10),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "childcare_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "commute_destinations" (
	"destination_key" varchar(20) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commute_grid" (
	"id" serial PRIMARY KEY NOT NULL,
	"grid_id" varchar(20) NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "commute_grid_id_unique" UNIQUE("grid_id")
);
--> statement-breakpoint
CREATE TABLE "commute_times" (
	"id" serial PRIMARY KEY NOT NULL,
	"grid_id" varchar(20) NOT NULL,
	"destination_key" varchar(20) NOT NULL,
	"time_minutes" integer,
	"route_snapshot" jsonb,
	"calculated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "commute_times_grid_dest_unique" UNIQUE("grid_id","destination_key")
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
CREATE TABLE "safety_infra" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(20) NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"source" text,
	"camera_count" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "type_check" CHECK ("safety_infra"."type" IN ('cctv', 'safecam', 'lamp'))
);
--> statement-breakpoint
CREATE TABLE "safety_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"region_code" varchar(10) NOT NULL,
	"region_name" text,
	"crime_rate" numeric,
	"cctv_density" numeric,
	"police_station_distance" numeric,
	"streetlight_density" numeric,
	"shelter_count" integer,
	"calculated_score" numeric,
	"data_date" date,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "safety_stats_region_date_unique" UNIQUE("region_code","data_date")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"school_code" varchar(20),
	"school_level" varchar(10),
	"location" geometry(Point, 4326) NOT NULL,
	"achievement_score" numeric,
	"assignment_area" geometry(Polygon, 4326),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "schools_school_code_unique" UNIQUE("school_code"),
	CONSTRAINT "school_level_check" CHECK ("schools"."school_level" IN ('elem', 'middle', 'high'))
);
--> statement-breakpoint
ALTER TABLE "apartment_details" ADD CONSTRAINT "apartment_details_apt_id_apartments_id_fk" FOREIGN KEY ("apt_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartment_facility_stats" ADD CONSTRAINT "apartment_facility_stats_apt_id_apartments_id_fk" FOREIGN KEY ("apt_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartment_prices" ADD CONSTRAINT "apartment_prices_apt_id_apartments_id_fk" FOREIGN KEY ("apt_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartment_unit_types" ADD CONSTRAINT "apartment_unit_types_apt_id_apartments_id_fk" FOREIGN KEY ("apt_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commute_times" ADD CONSTRAINT "commute_times_grid_id_commute_grid_grid_id_fk" FOREIGN KEY ("grid_id") REFERENCES "public"."commute_grid"("grid_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commute_times" ADD CONSTRAINT "commute_times_destination_key_commute_destinations_destination_key_fk" FOREIGN KEY ("destination_key") REFERENCES "public"."commute_destinations"("destination_key") ON DELETE restrict ON UPDATE no action;