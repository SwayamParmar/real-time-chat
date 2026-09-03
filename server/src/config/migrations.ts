import User from "../models/user.model";
import Migration from "../models/migration.model";

/**
 * Run a migration only once.
 */
const runOnce = async (name: string, work: () => Promise<void>): Promise<void> => {
    try {
        await Migration.create({ name });
    } catch {
        return;
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
        // Notifications are opt-in, so reset accounts still carrying the old
        // default of true.
        await runOnce("reset-notifications-enabled-default", async () => {
            const result = await User.updateMany({}, { $set: { notifications_enabled: false } });
            console.log(`Reset notifications_enabled on ${result.modifiedCount} user(s).`);
        });

        // Backfill the field on documents created before it existed.
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
