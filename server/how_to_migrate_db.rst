The migrations folder should already exist, as created by `flask db init`.

To update the migration state, run

flask db migrate

Review the new file created in migrations/versions, and ensure the upgrade steps that were auto-generated are accurate.

Then run

flask db upgrade
