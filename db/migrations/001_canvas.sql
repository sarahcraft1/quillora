-- Apply with a migration role. The runtime role must not be SUPERUSER or BYPASSRLS.
BEGIN;
CREATE TABLE IF NOT EXISTS quillora_canvas_owners (
 owner_id text PRIMARY KEY CHECK (owner_id ~ '^quillora-work:user:[a-f0-9]{64}$'),
 epoch bigint NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS quillora_canvas_connections (
 owner_id text PRIMARY KEY REFERENCES quillora_canvas_owners(owner_id) ON DELETE CASCADE,
 origin text NOT NULL, client_id text NOT NULL, generation uuid NOT NULL,
 token_box text NOT NULL, snapshot_box text,
 last_sync_at timestamptz, last_error text,
 lease_id uuid, lease_expires_at timestamptz
);
CREATE TABLE IF NOT EXISTS quillora_canvas_oauth_states (
 owner_id text NOT NULL REFERENCES quillora_canvas_owners(owner_id) ON DELETE CASCADE,
 state_hash text PRIMARY KEY, nonce_hash text NOT NULL,
 origin text NOT NULL, epoch bigint NOT NULL, expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS quillora_canvas_states_owner ON quillora_canvas_oauth_states(owner_id);
CREATE INDEX IF NOT EXISTS quillora_canvas_states_expiry ON quillora_canvas_oauth_states(expires_at);
ALTER TABLE quillora_canvas_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE quillora_canvas_owners FORCE ROW LEVEL SECURITY;
ALTER TABLE quillora_canvas_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quillora_canvas_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE quillora_canvas_oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE quillora_canvas_oauth_states FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS canvas_owner ON quillora_canvas_owners;
CREATE POLICY canvas_owner ON quillora_canvas_owners USING(owner_id=current_setting('quillora.owner_id',true)) WITH CHECK(owner_id=current_setting('quillora.owner_id',true));
DROP POLICY IF EXISTS canvas_connection_owner ON quillora_canvas_connections;
CREATE POLICY canvas_connection_owner ON quillora_canvas_connections USING(owner_id=current_setting('quillora.owner_id',true)) WITH CHECK(owner_id=current_setting('quillora.owner_id',true));
DROP POLICY IF EXISTS canvas_state_owner ON quillora_canvas_oauth_states;
CREATE POLICY canvas_state_owner ON quillora_canvas_oauth_states USING(owner_id=current_setting('quillora.owner_id',true)) WITH CHECK(owner_id=current_setting('quillora.owner_id',true));
COMMIT;
