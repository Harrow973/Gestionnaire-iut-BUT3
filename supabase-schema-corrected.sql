-- Suppression des tables existantes si nécessaire (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS historique_intervention;
DROP TABLE IF EXISTS planning;
DROP TABLE IF EXISTS intervention;
DROP TABLE IF EXISTS groupe;
DROP TABLE IF EXISTS allocation_horaire;
DROP TABLE IF EXISTS cours;
DROP TABLE IF EXISTS maquette_pedagogique;
DROP TABLE IF EXISTS enseignant_statut;
DROP TABLE IF EXISTS enseignant;
DROP TABLE IF EXISTS statut_enseignant;
DROP TABLE IF EXISTS parcours;
DROP TABLE IF EXISTS departement;
DROP TABLE IF EXISTS salle;
DROP TABLE IF EXISTS type_cours;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Table departement
CREATE TABLE IF NOT EXISTS departement (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table parcours
CREATE TABLE IF NOT EXISTS parcours (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  departement_id INTEGER NOT NULL REFERENCES departement(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table statut_enseignant
CREATE TABLE IF NOT EXISTS statut_enseignant (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  heures_min INTEGER NOT NULL,
  heures_max INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table enseignant
CREATE TABLE IF NOT EXISTS enseignant (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  departement_id INTEGER NOT NULL REFERENCES departement(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table enseignant_statut
CREATE TABLE IF NOT EXISTS enseignant_statut (
  id SERIAL PRIMARY KEY,
  enseignant_id INTEGER NOT NULL REFERENCES enseignant(id),
  statut_id INTEGER NOT NULL REFERENCES statut_enseignant(id),
  date_debut DATE NOT NULL,
  date_fin DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table maquette_pedagogique
CREATE TABLE IF NOT EXISTS maquette_pedagogique (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  annee VARCHAR(20) NOT NULL,
  parcours_id INTEGER NOT NULL REFERENCES parcours(id),
  departement_id INTEGER NOT NULL REFERENCES departement(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table type_cours
CREATE TABLE IF NOT EXISTS type_cours (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table cours
CREATE TABLE IF NOT EXISTS cours (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  maquette_pedagogique_id INTEGER NOT NULL REFERENCES maquette_pedagogique(id),
  type_cours_id INTEGER NOT NULL REFERENCES type_cours(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table allocation_horaire
CREATE TABLE IF NOT EXISTS allocation_horaire (
  id SERIAL PRIMARY KEY,
  cours_id INTEGER NOT NULL REFERENCES cours(id),
  nb_heures FLOAT NOT NULL,
  nb_groupes INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table groupe
CREATE TABLE IF NOT EXISTS groupe (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  code VARCHAR(20),
  effectif INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table intervention
CREATE TABLE IF NOT EXISTS intervention (
  id SERIAL PRIMARY KEY,
  enseignant_id INTEGER NOT NULL REFERENCES enseignant(id),
  cours_id INTEGER NOT NULL REFERENCES cours(id),
  groupe_id INTEGER REFERENCES groupe(id),
  heures FLOAT NOT NULL,
  date DATE,
  annee VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table salle
CREATE TABLE IF NOT EXISTS salle (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  capacite INTEGER NOT NULL,
  batiment VARCHAR(50),
  etage VARCHAR(10),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table planning
CREATE TABLE IF NOT EXISTS planning (
  id SERIAL PRIMARY KEY,
  intervention_id INTEGER NOT NULL REFERENCES intervention(id),
  salle_id INTEGER NOT NULL REFERENCES salle(id),
  date DATE NOT NULL,
  debut TIME NOT NULL,
  fin TIME NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Table historique_intervention
CREATE TABLE IF NOT EXISTS historique_intervention (
  id SERIAL PRIMARY KEY,
  intervention_id INTEGER NOT NULL REFERENCES intervention(id),
  statut VARCHAR(50) NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Création de la fonction de mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application des triggers pour chaque table
CREATE TRIGGER update_departement_updated_at BEFORE UPDATE ON departement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parcours_updated_at BEFORE UPDATE ON parcours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_statut_enseignant_updated_at BEFORE UPDATE ON statut_enseignant FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enseignant_updated_at BEFORE UPDATE ON enseignant FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enseignant_statut_updated_at BEFORE UPDATE ON enseignant_statut FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maquette_pedagogique_updated_at BEFORE UPDATE ON maquette_pedagogique FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cours_updated_at BEFORE UPDATE ON cours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_allocation_horaire_updated_at BEFORE UPDATE ON allocation_horaire FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groupe_updated_at BEFORE UPDATE ON groupe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_intervention_updated_at BEFORE UPDATE ON intervention FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salle_updated_at BEFORE UPDATE ON salle FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planning_updated_at BEFORE UPDATE ON planning FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_historique_intervention_updated_at BEFORE UPDATE ON historique_intervention FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données pour la table statut_enseignant
INSERT INTO statut_enseignant (nom, heures_min, heures_max) VALUES
('Professeur', 192, 384),
('Maître de conférences', 192, 384),
('ATER', 192, 384),
('Vacataire', 0, 187);

-- Données pour la table type_cours
INSERT INTO type_cours (nom, description) VALUES
('CM', 'Cours magistral'),
('TD', 'Travaux dirigés'),
('TP', 'Travaux pratiques');

-- Données de test pour la table departement
INSERT INTO departement (nom, code, description) VALUES 
('Informatique', 'INFO', 'Département Informatique'),
('Techniques de commercialisation', 'TC', 'Département Techniques de commercialisation'),
('Gestion des entreprises et des Administration', 'GEA', 'Département Gestion des entreprises et des Administration'),
('Hygiène, sécurité, environnement', 'HSE', 'Département Hygiène, sécurité, environnement'),
('Management de la logistique et des transports', 'MLT', 'Département Management de la logistique et des transports');

-- Données de test pour la table parcours
INSERT INTO parcours (nom, code, departement_id) VALUES
('BUT Informatique', 'BUT-INFO', (SELECT id FROM departement WHERE code = 'INFO')),
('BUT Techniques de commercialisation', 'BUT-TC', (SELECT id FROM departement WHERE code = 'TC')),
('BUT Hygiène, sécurité, environnement', 'BUT-HSE', (SELECT id FROM departement WHERE code = 'HSE'));

-- Données de test pour la table enseignant
INSERT INTO enseignant (nom, prenom, email, departement_id) VALUES 
('Dupont', 'Jean', 'jean.dupont@univ.fr', (SELECT id FROM departement WHERE code = 'INFO')),
('Martin', 'Sophie', 'sophie.martin@univ.fr', (SELECT id FROM departement WHERE code = 'INFO')),
('Dubois', 'Pierre', 'pierre.dubois@univ.fr', (SELECT id FROM departement WHERE code = 'TC'));

-- Données de test pour la table enseignant_statut
INSERT INTO enseignant_statut (enseignant_id, statut_id, date_debut) VALUES 
((SELECT id FROM enseignant WHERE email = 'jean.dupont@univ.fr'), (SELECT id FROM statut_enseignant WHERE nom = 'Professeur'), '2022-09-01'),
((SELECT id FROM enseignant WHERE email = 'sophie.martin@univ.fr'), (SELECT id FROM statut_enseignant WHERE nom = 'Maître de conférences'), '2022-09-01'),
((SELECT id FROM enseignant WHERE email = 'pierre.dubois@univ.fr'), (SELECT id FROM statut_enseignant WHERE nom = 'ATER'), '2022-09-01');

-- Données de test pour la table maquette_pedagogique
INSERT INTO maquette_pedagogique (nom, annee, parcours_id, departement_id) VALUES 
('BUT Informatique 1ère année', '2023-2024', 
  (SELECT id FROM parcours WHERE code = 'BUT-INFO'),
  (SELECT id FROM departement WHERE code = 'INFO')),
('BUT Informatique 2ème année', '2023-2024', 
  (SELECT id FROM parcours WHERE code = 'BUT-INFO'),
  (SELECT id FROM departement WHERE code = 'INFO')),
('BUT TC 1ère année', '2023-2024', 
  (SELECT id FROM parcours WHERE code = 'BUT-TC'),
  (SELECT id FROM departement WHERE code = 'TC'));

-- Données de test pour la table cours
INSERT INTO cours (code, nom, description, maquette_pedagogique_id, type_cours_id) VALUES
('R1.01', 'Introduction au développement', 'Fondamentaux de la programmation', 
  (SELECT id FROM maquette_pedagogique WHERE nom LIKE '%Informatique 1ère année%'),
  (SELECT id FROM type_cours WHERE nom = 'CM')),
('R1.02', 'Bases de données', 'Conception et utilisation des BDD relationnelles', 
  (SELECT id FROM maquette_pedagogique WHERE nom LIKE '%Informatique 1ère année%'),
  (SELECT id FROM type_cours WHERE nom = 'CM')),
('R2.01', 'Développement Web', 'Technologies front et back-end', 
  (SELECT id FROM maquette_pedagogique WHERE nom LIKE '%Informatique 2ème année%'),
  (SELECT id FROM type_cours WHERE nom = 'CM'));

-- Données de test pour la table allocation_horaire
INSERT INTO allocation_horaire (cours_id, nb_heures, nb_groupes) VALUES
((SELECT id FROM cours WHERE code = 'R1.01'), 20, 1),
((SELECT id FROM cours WHERE code = 'R1.02'), 15, 2),
((SELECT id FROM cours WHERE code = 'R2.01'), 10, 1);

-- Données de test pour la table groupe
INSERT INTO groupe (nom, code, effectif) VALUES
('TP Info 1', 'TP-INFO-1', 24),
('TP Info 2', 'TP-INFO-2', 24),
('TD Info 1', 'TD-INFO-1', 35);

-- Données de test pour la table intervention
INSERT INTO intervention (enseignant_id, cours_id, groupe_id, heures, date, annee) VALUES
((SELECT id FROM enseignant WHERE email = 'jean.dupont@univ.fr'), 
 (SELECT id FROM cours WHERE code = 'R1.01'),
 (SELECT id FROM groupe WHERE nom = 'TP Info 1'),
 20, '2023-09-15', '2023-2024'),
((SELECT id FROM enseignant WHERE email = 'sophie.martin@univ.fr'), 
 (SELECT id FROM cours WHERE code = 'R1.02'),
 (SELECT id FROM groupe WHERE nom = 'TD Info 1'),
 15, '2023-09-20', '2023-2024');

-- Données de test pour la table salle
INSERT INTO salle (nom, capacite, batiment, etage) VALUES
('A101', 40, 'Bâtiment A', '1'),
('B201', 30, 'Bâtiment B', '2'),
('C305', 20, 'Bâtiment C', '3');

-- Données de test pour la table planning
INSERT INTO planning (intervention_id, salle_id, date, debut, fin) VALUES
((SELECT id FROM intervention WHERE enseignant_id = (SELECT id FROM enseignant WHERE email = 'jean.dupont@univ.fr') LIMIT 1),
 (SELECT id FROM salle WHERE nom = 'A101'),
 '2023-09-15', '08:00', '10:00'),
((SELECT id FROM intervention WHERE enseignant_id = (SELECT id FROM enseignant WHERE email = 'sophie.martin@univ.fr') LIMIT 1),
 (SELECT id FROM salle WHERE nom = 'B201'),
 '2023-09-20', '10:15', '12:15'); 