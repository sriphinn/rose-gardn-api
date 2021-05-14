DROP TYPE IF EXISTS log_type;
CREATE TYPE log_type AS ENUM (
    'Water',
    'Prune',
    'Fertilize',
    'Growth',
    'Fragrance',
    'Health',
    'Pests',
    'Misc'
)

CREATE TABLE rose_gardn_logs (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    rose_id INTEGER
        REFERENCES rose_gardn_roses(id) ON DELETE CASCADE NOT NULL,
    log log_type,
    notes TEXT,
    photo TEXT,
    date TIMESTAMPTZ DEFAULT now() NOT NULL
);