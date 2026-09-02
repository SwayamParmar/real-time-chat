import User from "../models/user.model";
import Migration from "../models/migration.model";

/**
 * Run a migration exactly once, ever.
 *
 * The marker is written first, so the unique index on `name` is what stops a
 * second instance (or the next restart) running it again. If the work then
 * fails the marker is removed, leaving it to be retried on the next boot.
 */
const runOnce = async (name: string, work: () => Promise<void>): Promise<void> => {
    try {
        await Migration.create({ name });
    } catch {
        return; // Already applied, or another instance is applying it.
    }

    try {
        await work();
        console.log(`Migration applied: ${name}`);
    } catch (error) {
        console.error(`Migration failed: ${name}`, error);
        await Migration.deleteOne({ name });
    }
};

export const runMigrations = async (): Promise<void> => {
    try {
        /*
         * notifications_enabled shipped defaulting to true and was backfilled
         * as true. The default is now false — notifications are opt-in — so
         * accounts carrying the old value need resetting. One-shot: rerunning
         * it would wipe every preference set since.
         */
        await runOnce("reset-notifications-enabled-default", async () => {
            const result = await User.updateMany({}, { $set: { notifications_enabled: false } });
            console.log(`Reset notifications_enabled on ${result.modifiedCount} user(s).`);
        });

        /*
         * Schema defaults only apply to documents Mongoose creates, so the
         * field is absent on anything older. Idempotent and scoped to the rows
         * still missing it, so this costs one no-op query once applied.
         */
        const backfill = await User.updateMany(
            { notifications_enabled: { $exists: false } },
            { $set: { notifications_enabled: false } },
        );

        if (backfill.modifiedCount > 0) {
            console.log(`Backfilled notifications_enabled on ${backfill.modifiedCount} user(s).`);
        }
    } catch (error) {
        console.error("Migration error:", error);
    }
};
