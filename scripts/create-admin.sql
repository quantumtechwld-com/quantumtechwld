INSERT INTO "User" (id, email, name, role, status, "emailVerified")
VALUES (gen_random_uuid()::text, 'ricardo8leandro@gmail.com', 'Ricardo', 'ADMIN', 'ACTIVE', NOW())
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', status = 'ACTIVE';
