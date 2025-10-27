-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 27, 2025 at 09:00 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `raci_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `raci_tasks`
--

CREATE TABLE `raci_tasks` (
  `id` varchar(50) NOT NULL,
  `month` varchar(7) NOT NULL,
  `wing` varchar(255) NOT NULL,
  `subwing` varchar(255) NOT NULL,
  `title` text NOT NULL,
  `deadline` varchar(50) DEFAULT NULL,
  `status` varchar(100) DEFAULT 'In Progress',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `raci_tasks`
--

INSERT INTO `raci_tasks` (`id`, `month`, `wing`, `subwing`, `title`, `deadline`, `status`, `created_at`, `updated_at`) VALUES
('0567c78759b0', '2025-10', 'Brand & Communications', 'Art & Design', 'Kitchen hood', '2025-10-23', 'In Progress', '2025-10-21 17:32:09', '2025-10-27 12:12:22'),
('345721b4bfe3', '2025-10', 'Brand & Communications', 'Web & Development', 'Kitchen hood', '2025-10-22', 'In Progress', '2025-10-21 16:59:17', '2025-10-27 12:19:05'),
('6b2a86db9ec2', '2025-10', 'Brand & Communications', 'Web & Development', 'test', '2025-10-23', 'Completed', '2025-10-21 14:16:22', '2025-10-27 11:43:23'),
('9521f3d03dbb', '2025-10', 'Brand & Communications', 'Web & Development', 'test', '2025-10-23', 'Blocked', '2025-10-22 12:51:36', '2025-10-27 11:22:53'),
('b8a85c79c04d', '2025-10', 'Brand & Communications', 'Web & Development', 'Meeting room', '2025-10-31', 'Completed', '2025-10-27 12:57:50', '2025-10-27 12:58:07');

-- --------------------------------------------------------

--
-- Table structure for table `raci_task_roles`
--

CREATE TABLE `raci_task_roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `task_id` varchar(50) NOT NULL,
  `role` enum('responsible','accountable','consulted','informed') NOT NULL,
  `user_id` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `raci_task_roles`
--

INSERT INTO `raci_task_roles` (`id`, `task_id`, `role`, `user_id`) VALUES
(205, '9521f3d03dbb', 'responsible', '371'),
(206, '9521f3d03dbb', 'accountable', '2'),
(207, '9521f3d03dbb', 'consulted', '68'),
(208, '9521f3d03dbb', 'informed', '3'),
(214, '6b2a86db9ec2', 'responsible', '371'),
(215, '6b2a86db9ec2', 'accountable', '2'),
(216, '6b2a86db9ec2', 'consulted', '68'),
(217, '6b2a86db9ec2', 'informed', '3'),
(222, '0567c78759b0', 'responsible', '371'),
(223, '0567c78759b0', 'accountable', '2'),
(224, '0567c78759b0', 'consulted', '371'),
(225, '0567c78759b0', 'consulted', '40'),
(226, '0567c78759b0', 'informed', '3'),
(231, '345721b4bfe3', 'responsible', '2'),
(232, '345721b4bfe3', 'accountable', '371'),
(233, '345721b4bfe3', 'consulted', '68'),
(234, '345721b4bfe3', 'informed', '3'),
(240, 'b8a85c79c04d', 'responsible', '371'),
(241, 'b8a85c79c04d', 'accountable', '2'),
(242, 'b8a85c79c04d', 'accountable', '371'),
(243, 'b8a85c79c04d', 'consulted', '68'),
(244, 'b8a85c79c04d', 'informed', '371');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `raci_tasks`
--
ALTER TABLE `raci_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_task_month` (`month`);

--
-- Indexes for table `raci_task_roles`
--
ALTER TABLE `raci_task_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `raci_task_roles`
--
ALTER TABLE `raci_task_roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=245;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `raci_task_roles`
--
ALTER TABLE `raci_task_roles`
  ADD CONSTRAINT `raci_task_roles_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `raci_tasks` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
