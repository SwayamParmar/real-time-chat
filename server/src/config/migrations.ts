import User from "../models/user.model";

/**
 * Schema defaults only apply to documents Mongoose creates, so a new field is
 * simply absent on every account that already existed. Each step below is
 * idempotent and scoped to the rows still missing the field, so running this
 * on every boot costs one indexed no-op query once it has been applied.
 */
export const runMigrations = async (): Promise<void> => {
    try {
        const result = await User.updateMany(
            { notifications_enabled: { $exists: false } },
            { $set: { notifications_enabled: true } },
        );

        if (result.modifiedCount > 0) {
            console.log(`Backfilled notifications_enabled on ${result.modifiedCount} user(s).`);
        }
    } catch (error) {
        console.error("Migration error:", error);
    }
};
