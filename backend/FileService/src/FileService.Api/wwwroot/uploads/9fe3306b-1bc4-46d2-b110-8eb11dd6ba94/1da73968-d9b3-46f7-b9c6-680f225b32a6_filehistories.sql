-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 19, 2025 at 10:01 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `file_service`
--

-- --------------------------------------------------------

--
-- Table structure for table `filehistories`
--

CREATE TABLE `filehistories` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `FileEntryId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Action` longtext NOT NULL,
  `Notes` longtext DEFAULT NULL,
  `Timestamp` datetime(6) NOT NULL,
  `PerformedBy` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `filehistories`
--

INSERT INTO `filehistories` (`Id`, `FileEntryId`, `Action`, `Notes`, `Timestamp`, `PerformedBy`) VALUES
('600bd15e-57dc-497f-bb53-c5a6a264b2ab', '54a64edb-53c9-4399-8894-19ea2c6b587e', 'Created', 'random', '2025-12-13 12:02:41.646143', 'achraf'),
('c784f11b-8dae-4b11-b765-3869c7050bcc', '55517447-1af3-4489-bea0-0583ac993e9a', 'Created', 'random', '2025-12-12 10:27:56.130560', 'achraf'),
('e4c59207-b37f-4724-8e77-c414409f73b6', '54a64edb-53c9-4399-8894-19ea2c6b587e', 'Deleted', NULL, '2025-12-19 08:56:01.191820', 'system');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `filehistories`
--
ALTER TABLE `filehistories`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_FileHistories_FileEntryId` (`FileEntryId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `filehistories`
--
ALTER TABLE `filehistories`
  ADD CONSTRAINT `FK_FileHistories_FileEntries_FileEntryId` FOREIGN KEY (`FileEntryId`) REFERENCES `fileentries` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
