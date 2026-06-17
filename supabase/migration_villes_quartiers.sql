-- Migration : toutes les villes et quartiers de Côte d'Ivoire
-- Les 3 premières villes (Abidjan=1, Bouaké=2, Yamoussoukro=3) existent déjà

-- Nouvelles villes
INSERT INTO villes (nom) VALUES
('San-Pédro'), ('Daloa'), ('Korhogo'), ('Man'), ('Abengourou'),
('Divo'), ('Gagnoa'), ('Soubré'), ('Bondoukou'), ('Odienné'),
('Séguéla'), ('Agboville'), ('Dimbokro'), ('Toumodi'), ('Tiassalé'),
('Grand-Bassam'), ('Jacqueville'), ('Sassandra'), ('Tabou'), ('Guiglo'),
('Danané'), ('Touba'), ('Boundiali'), ('Ferkessédougou'), ('Katiola'),
('Mankono'), ('Bongouanou'), ('Adzopé'), ('Akoupé'), ('Grand-Lahou'),
('Lakota'), ('Issia'), ('Bangolo'), ('Duekoué'), ('Vavoua'),
('Sinfra'), ('Oumé'), ('Tiébissou'), ('Bouaflé'), ('Dabou'),
('Grand-Drewin'), ('Aboisso'), ('Tanda'), ('Bouna'), ('Nassian'),
('Prikro'), ('M''Batto'), ('Niakara'), ('Dabakala'), ('Tortiya'),
('Tengrela'), ('Madinani'), ('Minignan'), ('Kouibly'), ('Zouan-Hounien'),
('Biankouma'), ('Sipilou'), ('Divo'), ('Lakota'), ('Guitry')
ON CONFLICT (nom) DO NOTHING;

-- ============================================================
-- ABIDJAN (id=1) — Communes et quartiers populaires
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  -- Cocody
  ('Cocody Danga'), ('Cocody Riviera 1'), ('Cocody Riviera 2'), ('Cocody Riviera 3'),
  ('Cocody Riviera 4'), ('Cocody Riviera Maya'), ('Cocody II Plateaux'),
  ('Cocody Angré'), ('Cocody Blockhaus'), ('Cocody Bonoumin'),
  ('Cocody Golf'), ('Cocody Palmeraie'), ('Cocody Ambassades'),
  -- Plateau
  ('Plateau Centre'), ('Plateau Immeuble Caistab'), ('Plateau Zone 4'),
  -- Adjamé
  ('Adjamé 220 Logements'), ('Adjamé Clouetcha'), ('Adjamé Williamsville'),
  ('Adjamé Quartier France'), ('Adjamé Biabou'),
  -- Abobo
  ('Abobo Baoulé'), ('Abobo N''Dotre'), ('Abobo PK 18'), ('Abobo Sagbé'),
  ('Abobo Anyama Adjamé'), ('Abobo Derrière Rails'), ('Abobo Sogefia'),
  ('Abobo Extension'), ('Abobo Avocatier'), ('Abobo Pk 26'),
  -- Yopougon
  ('Yopougon Banco'), ('Yopougon Gesco'), ('Yopougon Niangon'),
  ('Yopougon Selmer'), ('Yopougon Toits Rouges'), ('Yopougon Wassakara'),
  ('Yopougon Zone Industrielle'), ('Yopougon Kouté'), ('Yopougon Sideci'),
  ('Yopougon Port Bouet 2'), ('Yopougon Attié'), ('Yopougon M''Pouto'),
  -- Treichville
  ('Treichville Centre'), ('Treichville Quartier Arras'), ('Treichville Zone 3'),
  -- Marcory
  ('Marcory Zone 4'), ('Marcory Anoumabo'), ('Marcory Sans Fil'), ('Marcory Sicogi'),
  -- Koumassi
  ('Koumassi Campement'), ('Koumassi Grand Campement'), ('Koumassi Remblai'),
  ('Koumassi Zone Industrielle'), ('Koumassi Belleville'), ('Koumassi Pk 16'),
  -- Attécoubé
  ('Attécoubé Vridi'), ('Attécoubé Agban'), ('Attécoubé Bracodi'),
  -- Port-Bouet
  ('Port-Bouet Aéroport'), ('Port-Bouet Gonzagueville'), ('Port-Bouet Vridi Canal'),
  ('Port-Bouet Kilomètre 17'), ('Port-Bouet Bassam Route'),
  -- Bingerville
  ('Bingerville Centre'), ('Bingerville Quartier Résidentiel'), ('Bingerville Lac'),
  -- Anyama
  ('Anyama Centre'), ('Anyama Liby'), ('Anyama Ahouabo')
) AS q(nom)
WHERE v.nom = 'Abidjan'
ON CONFLICT DO NOTHING;

-- ============================================================
-- BOUAKÉ (id=2)
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Air France'), ('Belleville'), ('Commerce'), ('Dar Es Salam'),
  ('Kennedy'), ('Nimbo'), ('N''Gattakro'), ('Sokoura'),
  ('Tolakouadiokro'), ('Zone Industrielle'), ('Résidentiel'),
  ('Broukro'), ('Dioulabougou'), ('Koko'), ('N''Zuessi'),
  ('Djelékro'), ('Ahougnanfoutou'), ('Gnangonkro')
) AS q(nom)
WHERE v.nom = 'Bouaké'
ON CONFLICT DO NOTHING;

-- ============================================================
-- YAMOUSSOUKRO (id=3)
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Centre-ville'), ('Habitat'), ('Millionnaire'), ('Dioulakro'),
  ('N''Gokro'), ('Zoo'), ('Quartier Résidentiel'), ('Assabou'),
  ('Morofé'), ('Fétécro')
) AS q(nom)
WHERE v.nom = 'Yamoussoukro'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SAN-PÉDRO
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Cité des Cadres'), ('Grand-Béréby Route'), ('Sakré'), ('Secteur 1'),
  ('Secteur 2'), ('Secteur 3'), ('Secteur 4'), ('Zone Industrielle San-Pédro'),
  ('Bardo'), ('Bard 2'), ('Cité Plage'), ('Centre commercial')
) AS q(nom)
WHERE v.nom = 'San-Pédro'
ON CONFLICT DO NOTHING;

-- ============================================================
-- DALOA
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Lobia'), ('Tazibouo'), ('Issia Route'), ('Commerce Daloa'),
  ('Résidentiel Daloa'), ('Orly'), ('Gbokora'), ('Soleil'), ('Abatta')
) AS q(nom)
WHERE v.nom = 'Daloa'
ON CONFLICT DO NOTHING;

-- ============================================================
-- KORHOGO
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Koko Korhogo'), ('Soba'), ('Natimé'), ('Sinistré'),
  ('Résidentiel Korhogo'), ('Commerce Korhogo'), ('Quartier Mofis'),
  ('Zone Industrielle Korhogo'), ('Sienso'), ('Kafiné')
) AS q(nom)
WHERE v.nom = 'Korhogo'
ON CONFLICT DO NOTHING;

-- ============================================================
-- MAN
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Centre Man'), ('Libreville Man'), ('Résidentiel Man'),
  ('Commerce Man'), ('Bagnon'), ('Dompleu Route'), ('Gbonné'),
  ('Sérihio')
) AS q(nom)
WHERE v.nom = 'Man'
ON CONFLICT DO NOTHING;

-- ============================================================
-- GAGNOA
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Centre Gagnoa'), ('Dioulabougou Gagnoa'), ('Gnagbodougnoa'),
  ('Résidentiel Gagnoa'), ('Commerce Gagnoa'), ('Tibéita')
) AS q(nom)
WHERE v.nom = 'Gagnoa'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ABENGOUROU
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Centre Abengourou'), ('Résidentiel Abengourou'), ('Quartier Commerce'),
  ('Moafé'), ('Apprompronou'), ('Niablé Route')
) AS q(nom)
WHERE v.nom = 'Abengourou'
ON CONFLICT DO NOTHING;

-- ============================================================
-- GRAND-BASSAM
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Quartier France'), ('Impérial'), ('Moossou'), ('Résidentiel Bassam'),
  ('Nouvelles Cités'), ('Azuretti'), ('N''Zikro')
) AS q(nom)
WHERE v.nom = 'Grand-Bassam'
ON CONFLICT DO NOTHING;

-- ============================================================
-- DIVO
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Centre Divo'), ('Résidentiel Divo'), ('Dioulabougou Divo'), ('Gbada')
) AS q(nom)
WHERE v.nom = 'Divo'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SOUBRÉ
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES
  ('Centre Soubré'), ('Résidentiel Soubré'), ('Commerce Soubré'),
  ('Zone Cacao'), ('Buyo Route')
) AS q(nom)
WHERE v.nom = 'Soubré'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Villes avec quartiers génériques (Centre / Résidentiel / Commerce)
-- ============================================================
INSERT INTO quartiers (ville_id, nom)
SELECT v.id, q.nom FROM villes v,
(VALUES ('Centre'), ('Résidentiel'), ('Commerce'), ('Quartier Populaire')) AS q(nom)
WHERE v.nom IN (
  'Bondoukou', 'Odienné', 'Séguéla', 'Agboville', 'Dimbokro', 'Toumodi',
  'Tiassalé', 'Jacqueville', 'Sassandra', 'Tabou', 'Guiglo', 'Danané',
  'Touba', 'Boundiali', 'Ferkessédougou', 'Katiola', 'Mankono',
  'Bongouanou', 'Adzopé', 'Akoupé', 'Grand-Lahou', 'Lakota', 'Issia',
  'Bangolo', 'Duekoué', 'Vavoua', 'Sinfra', 'Oumé', 'Tiébissou',
  'Bouaflé', 'Dabou', 'Aboisso', 'Tanda', 'Bouna'
)
ON CONFLICT DO NOTHING;
