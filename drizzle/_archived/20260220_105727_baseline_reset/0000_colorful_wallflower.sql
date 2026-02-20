CREATE TABLE "apartment_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"apt_id" integer,
	"trade_type" varchar(10),
	"year" integer,
	"month" integer,
	"average_price" numeric,
	"deal_count" integer,
	"area_avg" numeric,
	"area_min" numeric,
	"area_max" numeric,
	"floor_avg" numeric,
	"floor_min" integer,
	"floor_max" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "apt_prices_unique" UNIQUE("apt_id","trade_type","year","month"),
	CONSTRAINT "trade_type_check" CHECK ("apartment_prices"."trade_type" IN ('sale', 'jeonse'))
);
--> statement-breakpoint
CREATE TABLE "apartments" (
	"id" serial PRIMARY KEY NOT NULL,
	"apt_code" varchar(20) NOT NULL,
	"apt_name" text NOT NULL,
	"address" text NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"built_year" integer,
	"household_count" integer,
	"area_min" real,
	"area_max" real,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "apartments_apt_code_unique" UNIQUE("apt_code")
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
CREATE TABLE "commute_grid" (
	"id" serial PRIMARY KEY NOT NULL,
	"grid_id" varchar(20) NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"to_gbd_time" integer,
	"to_ybd_time" integer,
	"to_cbd_time" integer,
	"to_pangyo_time" integer,
	"calculated_at" timestamp with time zone DEFAULT now()
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
ALTER TABLE "apartment_prices" ADD CONSTRAINT "apartment_prices_apt_id_apartments_id_fk" FOREIGN KEY ("apt_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;