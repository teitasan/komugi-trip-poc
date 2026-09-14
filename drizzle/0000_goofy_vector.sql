CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`state` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_trips_owner_created` ON `trips` (`owner`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_trips_one_active_owner` ON `trips` (`owner`) WHERE "trips"."status" = 'active';