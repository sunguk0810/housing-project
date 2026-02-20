CREATE TABLE "commute_destinations" (
	"destination_key" varchar(20) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commute_times" (
	"id" serial PRIMARY KEY NOT NULL,
	"grid_id" varchar(20) NOT NULL,
	"destination_key" varchar(20) NOT NULL,
	"time_minutes" integer,
	"calculated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "commute_times_grid_dest_unique" UNIQUE("grid_id","destination_key")
);
--> statement-breakpoint
ALTER TABLE "commute_times" ADD CONSTRAINT "commute_times_grid_id_fk" FOREIGN KEY ("grid_id") REFERENCES "public"."commute_grid"("grid_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "commute_times" ADD CONSTRAINT "commute_times_destination_key_fk" FOREIGN KEY ("destination_key") REFERENCES "public"."commute_destinations"("destination_key") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_commute_times_destination_key" ON "commute_times" ("destination_key");
--> statement-breakpoint

INSERT INTO "commute_destinations" ("destination_key", "name", "location", "active") VALUES
	('GBD', '강남업무지구', ST_SetSRID(ST_MakePoint(127.0276, 37.4979), 4326), true),
	('YBD', '여의도업무지구', ST_SetSRID(ST_MakePoint(126.9245, 37.5219), 4326), true),
	('CBD', '광화문업무지구', ST_SetSRID(ST_MakePoint(126.977, 37.57), 4326), true),
	('PANGYO', '판교테크노밸리', ST_SetSRID(ST_MakePoint(127.1112, 37.3948), 4326), true),
	('MAGOK', '마곡업무지구', ST_SetSRID(ST_MakePoint(126.8336, 37.5602), 4326), true),
	('JAMSIL', '잠실업무권', ST_SetSRID(ST_MakePoint(127.1002, 37.5133), 4326), true),
	('GASAN', '가산업무권', ST_SetSRID(ST_MakePoint(126.8826, 37.4814), 4326), true),
	('GURO', '구로업무권', ST_SetSRID(ST_MakePoint(126.9016, 37.4854), 4326), true)
ON CONFLICT DO NOTHING;
--> statement-breakpoint

INSERT INTO "commute_times" ("grid_id", "destination_key", "time_minutes", "calculated_at")
SELECT "grid_id", 'GBD', "to_gbd_time", "calculated_at" FROM "commute_grid"
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "commute_times" ("grid_id", "destination_key", "time_minutes", "calculated_at")
SELECT "grid_id", 'YBD', "to_ybd_time", "calculated_at" FROM "commute_grid"
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "commute_times" ("grid_id", "destination_key", "time_minutes", "calculated_at")
SELECT "grid_id", 'CBD', "to_cbd_time", "calculated_at" FROM "commute_grid"
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "commute_times" ("grid_id", "destination_key", "time_minutes", "calculated_at")
SELECT "grid_id", 'PANGYO', "to_pangyo_time", "calculated_at" FROM "commute_grid"
ON CONFLICT DO NOTHING;
--> statement-breakpoint

ALTER TABLE "commute_grid" DROP COLUMN "to_gbd_time";
--> statement-breakpoint
ALTER TABLE "commute_grid" DROP COLUMN "to_ybd_time";
--> statement-breakpoint
ALTER TABLE "commute_grid" DROP COLUMN "to_cbd_time";
--> statement-breakpoint
ALTER TABLE "commute_grid" DROP COLUMN "to_pangyo_time";
