# Supabase Database Setup

Execute these SQL files in the Supabase SQL Editor in the exact numerical order:

1. `01_extensions.sql`
2. `02_tables.sql`
3. `03_indexes.sql`
4. `04_functions.sql`
5. `05_triggers.sql`
6. `06_rls.sql`
7. `07_storage.sql`
8. `08_storage_policies.sql`
9. `12_admin.sql` (Update with your UUID first)

Make sure to assign your user UUID in `12_admin.sql` to grant yourself Super Admin access.
