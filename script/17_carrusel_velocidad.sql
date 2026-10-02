ALTER TABLE home_carruseles ADD COLUMN IF NOT EXISTS velocidad INT NOT NULL DEFAULT 0 COMMENT '0=sin movimiento, 1-10=velocidad marquee';
