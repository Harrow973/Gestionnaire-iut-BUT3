-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 22 mai 2025 à 01:18
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `iut-management`
--
CREATE DATABASE IF NOT EXISTS `iut-management` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `iut-management`;

-- --------------------------------------------------------

--
-- Structure de la table `allocation_horaire`
--

DROP TABLE IF EXISTS `allocation_horaire`;
CREATE TABLE IF NOT EXISTS `allocation_horaire` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cours_id` int NOT NULL,
  `nb_heures` float NOT NULL,
  `nb_groupes` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cours_id` (`cours_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `allocation_horaire`
--

INSERT INTO `allocation_horaire` (`id`, `cours_id`, `nb_heures`, `nb_groupes`, `created_at`, `updated_at`) VALUES
(1, 1, 20, 1, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 2, 15, 2, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 3, 10, 1, '2025-05-21 22:48:17', '2025-05-21 22:48:17');

-- --------------------------------------------------------

--
-- Structure de la table `cours`
--

DROP TABLE IF EXISTS `cours`;
CREATE TABLE IF NOT EXISTS `cours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text,
  `maquette_pedagogique_id` int NOT NULL,
  `type_cours_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `maquette_pedagogique_id` (`maquette_pedagogique_id`),
  KEY `type_cours_id` (`type_cours_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `cours`
--

INSERT INTO `cours` (`id`, `code`, `nom`, `description`, `maquette_pedagogique_id`, `type_cours_id`, `created_at`, `updated_at`) VALUES
(1, 'R1.01', 'Introduction au développement', 'Fondamentaux de la programmation', 1, 1, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 'R1.02', 'Bases de données', 'Conception et utilisation des BDD relationnelles', 1, 1, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 'R2.01', 'Développement Web', 'Technologies front et back-end', 2, 1, '2025-05-21 22:48:17', '2025-05-21 22:48:17');

-- --------------------------------------------------------

--
-- Structure de la table `departement`
--

DROP TABLE IF EXISTS `departement`;
CREATE TABLE IF NOT EXISTS `departement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `code` varchar(10) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `departement`
--

INSERT INTO `departement` (`id`, `nom`, `code`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Informatique', 'INFO', 'Département Informatique', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 'Techniques de commercialisation', 'TC', 'Département Techniques de commercialisation', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 'Gestion des entreprises et des Administration', 'GEA', 'Département Gestion des entreprises et des Administration', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(4, 'Hygiène, sécurité, environnement', 'HSE', 'Département Hygiène, sécurité, environnement', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(5, 'Management de la logistique et des transports', 'MLT', 'Département Management de la logistique et des transports', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(6, 'test', 'test', 'test', '2025-05-22 00:23:44', '2025-05-22 00:23:44'),
(7, 'Nouveau departement', 'nouveau', 'Bang bang', '2025-05-22 00:24:32', '2025-05-22 00:24:32'),
(8, 'GUSTAVE', 'gtsv', 'Département des beau gosses', '2025-05-22 00:25:46', '2025-05-22 00:25:46');

-- --------------------------------------------------------

--
-- Structure de la table `enseignant`
--

DROP TABLE IF EXISTS `enseignant`;
CREATE TABLE IF NOT EXISTS `enseignant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `departement_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `departement_id` (`departement_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `enseignant`
--

INSERT INTO `enseignant` (`id`, `nom`, `prenom`, `email`, `departement_id`, `created_at`, `updated_at`) VALUES
(1, 'Dupont', 'Jean', 'jean.dupont@univ.fr', 1, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 'Martin', 'Sophie', 'sophie.martin@univ.fr', 1, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 'Dubois', 'Pierre', 'pierre.dubois@univ.fr', 2, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(4, 'Gustave', 'Andy', 'andy.gustavee@gmail.com', 1, '2025-05-22 00:57:24', '2025-05-22 00:57:24');

-- --------------------------------------------------------

--
-- Structure de la table `enseignant_statut`
--

DROP TABLE IF EXISTS `enseignant_statut`;
CREATE TABLE IF NOT EXISTS `enseignant_statut` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enseignant_id` int NOT NULL,
  `statut_id` int NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `enseignant_id` (`enseignant_id`),
  KEY `statut_id` (`statut_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `enseignant_statut`
--

INSERT INTO `enseignant_statut` (`id`, `enseignant_id`, `statut_id`, `date_debut`, `date_fin`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2022-09-01', NULL, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 2, 2, '2022-09-01', NULL, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 3, 3, '2022-09-01', NULL, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(4, 4, 2, '2025-05-22', NULL, '2025-05-22 00:57:24', '2025-05-22 00:57:24');

-- --------------------------------------------------------

--
-- Structure de la table `groupe`
--

DROP TABLE IF EXISTS `groupe`;
CREATE TABLE IF NOT EXISTS `groupe` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `effectif` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `groupe`
--

INSERT INTO `groupe` (`id`, `nom`, `code`, `effectif`, `created_at`, `updated_at`) VALUES
(1, 'TP Info 1', 'TP-INFO-1', 24, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 'TP Info 2', 'TP-INFO-2', 24, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 'TD Info 1', 'TD-INFO-1', 35, '2025-05-21 22:48:17', '2025-05-21 22:48:17');

-- --------------------------------------------------------

--
-- Structure de la table `historique_intervention`
--

DROP TABLE IF EXISTS `historique_intervention`;
CREATE TABLE IF NOT EXISTS `historique_intervention` (
  `id` int NOT NULL AUTO_INCREMENT,
  `intervention_id` int NOT NULL,
  `statut` varchar(50) NOT NULL,
  `commentaire` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `intervention_id` (`intervention_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `intervention`
--

DROP TABLE IF EXISTS `intervention`;
CREATE TABLE IF NOT EXISTS `intervention` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enseignant_id` int NOT NULL,
  `cours_id` int NOT NULL,
  `groupe_id` int DEFAULT NULL,
  `heures` float NOT NULL,
  `date` date DEFAULT NULL,
  `annee` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `enseignant_id` (`enseignant_id`),
  KEY `cours_id` (`cours_id`),
  KEY `groupe_id` (`groupe_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `intervention`
--

INSERT INTO `intervention` (`id`, `enseignant_id`, `cours_id`, `groupe_id`, `heures`, `date`, `annee`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 20, '2023-09-15', '2023-2024', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 2, 2, 3, 15, '2023-09-20', '2023-2024', '2025-05-21 22:48:17', '2025-05-21 22:48:17');

-- --------------------------------------------------------

--
-- Structure de la table `maquette_pedagogique`
--

DROP TABLE IF EXISTS `maquette_pedagogique`;
CREATE TABLE IF NOT EXISTS `maquette_pedagogique` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `annee` varchar(20) NOT NULL,
  `parcours_id` int NOT NULL,
  `departement_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parcours_id` (`parcours_id`),
  KEY `departement_id` (`departement_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `maquette_pedagogique`
--

INSERT INTO `maquette_pedagogique` (`id`, `nom`, `annee`, `parcours_id`, `departement_id`, `created_at`, `updated_at`) VALUES
(1, 'BUT Informatique 1ère année', '2023-2024', 1, 1, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 'BUT Informatique 2ème année', '2023-2024', 1, 1, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 'BUT TC 1ère année', '2023-2024', 2, 2, '2025-05-21 22:48:17', '2025-05-21 22:48:17');

-- --------------------------------------------------------

--
-- Structure de la table `parcours`
--

DROP TABLE IF EXISTS `parcours`;
CREATE TABLE IF NOT EXISTS `parcours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `code` varchar(10) NOT NULL,
  `departement_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `departement_id` (`departement_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `parcours`
--

INSERT INTO `parcours` (`id`, `nom`, `code`, `departement_id`, `created_at`, `updated_at`) VALUES
(1, 'BUT Informatique', 'BUT-INFO', 1, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 'BUT Techniques de commercialisation', 'BUT-TC', 2, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 'BUT Hygiène, sécurité, environnement', 'BUT-HSE', 4, '2025-05-21 22:48:17', '2025-05-21 22:48:17');

-- --------------------------------------------------------

--
-- Structure de la table `planning`
--

DROP TABLE IF EXISTS `planning`;
CREATE TABLE IF NOT EXISTS `planning` (
  `id` int NOT NULL AUTO_INCREMENT,
  `intervention_id` int NOT NULL,
  `salle_id` int NOT NULL,
  `date` date NOT NULL,
  `debut` time NOT NULL,
  `fin` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `intervention_id` (`intervention_id`),
  KEY `salle_id` (`salle_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `planning`
--

INSERT INTO `planning` (`id`, `intervention_id`, `salle_id`, `date`, `debut`, `fin`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2023-09-15', '08:00:00', '10:00:00', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 2, 2, '2023-09-20', '10:15:00', '12:15:00', '2025-05-21 22:48:17', '2025-05-21 22:48:17');

-- --------------------------------------------------------

--
-- Structure de la table `salle`
--

DROP TABLE IF EXISTS `salle`;
CREATE TABLE IF NOT EXISTS `salle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `capacite` int NOT NULL,
  `batiment` varchar(50) DEFAULT NULL,
  `etage` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `salle`
--

INSERT INTO `salle` (`id`, `nom`, `capacite`, `batiment`, `etage`, `created_at`, `updated_at`) VALUES
(1, 'A101', 40, 'Bâtiment A', '1', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 'B201', 30, 'Bâtiment B', '2', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 'C305', 20, 'Bâtiment C', '3', '2025-05-21 22:48:17', '2025-05-21 22:48:17');

-- --------------------------------------------------------

--
-- Structure de la table `statut_enseignant`
--

DROP TABLE IF EXISTS `statut_enseignant`;
CREATE TABLE IF NOT EXISTS `statut_enseignant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `heures_min` int NOT NULL,
  `heures_max` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `statut_enseignant`
--

INSERT INTO `statut_enseignant` (`id`, `nom`, `heures_min`, `heures_max`, `created_at`, `updated_at`) VALUES
(1, 'Professeur', 192, 384, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 'Maître de conférences', 192, 384, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 'ATER', 192, 384, '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(4, 'Vacataire', 0, 187, '2025-05-21 22:48:17', '2025-05-21 22:48:17');

-- --------------------------------------------------------

--
-- Structure de la table `type_cours`
--

DROP TABLE IF EXISTS `type_cours`;
CREATE TABLE IF NOT EXISTS `type_cours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `type_cours`
--

INSERT INTO `type_cours` (`id`, `nom`, `description`, `created_at`, `updated_at`) VALUES
(1, 'CM', 'Cours magistral', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(2, 'TD', 'Travaux dirigés', '2025-05-21 22:48:17', '2025-05-21 22:48:17'),
(3, 'TP', 'Travaux pratiques', '2025-05-21 22:48:17', '2025-05-21 22:48:17');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
