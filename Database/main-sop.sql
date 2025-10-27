-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 27, 2025 at 08:45 AM
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
-- Database: `main-sop`
--

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `dept_id` int(11) NOT NULL,
  `dept_img` varchar(10000) NOT NULL,
  `dept_name` varchar(2000) NOT NULL,
  `log` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`dept_id`, `dept_img`, `dept_name`, `log`) VALUES
(1, 'http://sop.swish.global/admin/img/brand_communications.svg', 'Brand & Communications', '2024-05-18 06:53:57'),
(2, 'http://sop.swish.global/admin/img/business_development.svg', 'Business Development', '2024-05-18 06:54:03'),
(3, 'http://sop.swish.global/admin/img/human_resource.svg', 'Human Resources', '2024-05-18 06:54:07'),
(4, 'http://sop.swish.global/admin/img/sales.svg', 'Sales', '2024-05-18 06:54:10'),
(5, 'http://sop.swish.global/admin/img/supply_chain.svg', 'Supply Chain Management', '2024-05-18 06:54:12'),
(6, 'http://sop.swish.global/admin/img/account_finance.svg', 'Accounts & Finance', '2024-05-18 06:54:14'),
(7, 'http://sop.swish.global/admin/img/training-svgrepo-com.svg', 'Operations And D&T', '2024-05-06 05:28:59'),
(8, 'http://sop.swish.global/admin/img/managers-svgrepo-com.svg', 'Top Management', '2024-05-08 10:40:00'),
(9, 'http://sop.swish.global/admin/img/2206248.png', 'Admin', '2024-09-21 10:51:23');

-- --------------------------------------------------------

--
-- Table structure for table `dept_assign`
--

CREATE TABLE `dept_assign` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `dept_assign`
--

INSERT INTO `dept_assign` (`id`, `user_id`, `dept_id`) VALUES
(33, 12, 5),
(74, 53, 6),
(80, 59, 7),
(81, 60, 4),
(82, 61, 5),
(85, 64, 1),
(97, 62, 9),
(109, 10, 1),
(130, 348, 5),
(134, 344, 4),
(138, 340, 4),
(139, 339, 4),
(174, 366, 7),
(176, 367, 9),
(177, 368, 1),
(178, 369, 1),
(184, 371, 1),
(185, 58, 3),
(209, 370, 2),
(215, 65, 1),
(253, 1, 1),
(254, 2, 1),
(255, 3, 1),
(256, 4, 8),
(257, 5, 8),
(258, 6, 3),
(259, 7, 6),
(260, 8, 5),
(261, 8, 7),
(262, 9, 4),
(263, 11, 1),
(264, 13, 1),
(265, 14, 5),
(266, 15, 1),
(267, 16, 1),
(268, 17, 9),
(269, 18, 1),
(270, 19, 1),
(271, 20, 1),
(272, 21, 1),
(273, 22, 9),
(274, 23, 4),
(275, 24, 9),
(276, 25, 3),
(277, 26, 5),
(278, 27, 1),
(279, 28, 6),
(280, 29, 9),
(282, 30, 9),
(283, 31, 1),
(284, 32, 5),
(285, 33, 1),
(286, 34, 9),
(287, 35, 5),
(288, 36, 5),
(289, 37, 4),
(290, 38, 1),
(291, 39, 5),
(292, 40, 5),
(293, 41, 9),
(295, 42, 9),
(296, 43, 6),
(297, 44, 7),
(298, 45, 5),
(299, 46, 7),
(300, 47, 6),
(301, 48, 9),
(303, 49, 1),
(304, 50, 1),
(305, 51, 1),
(306, 52, 1),
(308, 54, 9),
(309, 55, 1),
(310, 56, 9),
(311, 57, 9),
(312, 66, 6),
(313, 67, 9),
(314, 68, 1),
(315, 69, 2),
(316, 70, 2),
(317, 317, 2),
(318, 318, 2),
(319, 319, 2),
(320, 320, 2),
(322, 321, 2),
(323, 322, 2),
(324, 323, 2),
(325, 324, 2),
(326, 325, 2),
(327, 326, 2),
(328, 327, 2),
(329, 328, 2),
(330, 329, 2),
(331, 330, 2),
(332, 331, 2),
(333, 332, 2),
(334, 333, 2),
(335, 334, 2),
(336, 335, 4),
(337, 336, 4),
(338, 337, 4),
(339, 338, 4),
(340, 341, 4),
(341, 342, 4),
(342, 343, 4),
(343, 345, 6),
(344, 346, 5),
(345, 347, 5),
(346, 349, 5),
(347, 350, 5),
(348, 351, 5),
(349, 352, 5),
(350, 353, 5),
(351, 354, 4),
(352, 355, 4),
(353, 356, 4),
(354, 357, 4),
(355, 358, 4),
(356, 359, 4),
(357, 360, 4),
(358, 361, 5),
(359, 362, 5),
(360, 363, 5),
(361, 364, 5),
(362, 365, 6),
(366, 372, 4),
(368, 63, 1),
(369, 373, 9),
(370, 374, 3);

-- --------------------------------------------------------

--
-- Table structure for table `form_file`
--

CREATE TABLE `form_file` (
  `form_id` int(11) NOT NULL,
  `form_update_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `form_file`
--

INSERT INTO `form_file` (`form_id`, `form_update_date`) VALUES
(30, '2024-09-05 03:42:08'),
(32, '2024-09-05 07:30:01'),
(33, '2024-09-05 07:30:36'),
(34, '2024-09-05 07:31:01'),
(35, '2024-09-05 07:32:12'),
(36, '2024-09-10 11:04:08'),
(37, '2024-09-23 03:57:51'),
(38, '2024-09-23 04:32:30'),
(39, '2024-09-23 04:33:49'),
(40, '2024-09-28 11:29:37'),
(41, '2024-10-05 09:46:45'),
(42, '2024-10-06 06:17:58'),
(43, '2024-10-08 09:45:46'),
(45, '2024-10-28 07:08:54'),
(46, '2024-11-13 09:00:18'),
(47, '2025-08-14 05:06:12'),
(48, '2025-08-14 05:07:12');

-- --------------------------------------------------------

--
-- Table structure for table `form_version`
--

CREATE TABLE `form_version` (
  `version_id` int(11) NOT NULL,
  `form_id` int(11) NOT NULL,
  `form_title` varchar(1000) NOT NULL,
  `version` int(11) NOT NULL,
  `form_file_url` varchar(1000) NOT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `form_version`
--

INSERT INTO `form_version` (`version_id`, `form_id`, `form_title`, `version`, `form_file_url`, `last_updated`) VALUES
(46, 30, 'SWISH Leave Application 2024', 1, 'https://sop.swish.global/admin/form_file/Leave Application Fillable 2024.pdf', '2024-09-23 04:01:44'),
(49, 32, 'SWISH Budget Requisition', 1, 'https://sop.swish.global/admin/form_file/Budget-Requisition.docx', '2024-09-07 03:44:33'),
(50, 33, 'SWISH Conveyance Bill ', 1, 'https://sop.swish.global/admin/form_file/Conveyance Bill Format.docx', '2024-09-07 03:44:20'),
(51, 34, 'SWISH Overtime Request Form', 1, 'https://sop.swish.global/admin/form_file/Overtime Request Form SWISH.xlsx', '2024-12-09 10:51:11'),
(52, 35, 'SWISH Human Resources  Requisition Slip', 1, 'https://sop.swish.global/admin/form_file/Swish Human Resources  Requisition Slip .pdf', '2024-09-11 05:13:21'),
(53, 36, 'SWISH Changes Request for Website', 1, 'https://sop.swish.global/admin/form_file/SWISH-Changes-Request-For-Website.docx', '2024-09-11 07:06:26'),
(54, 35, 'SWISH Human Resources Requisition Slip', 2, 'https://sop.swish.global/admin/form_file/SWISH Human Resources Requisition Slip.docx', '2024-09-10 11:19:25'),
(57, 37, 'SWISH Personal Stuff Requisition (PSR)', 1, 'https://sop.swish.global/admin/form_file/Requisition-PSR.docx', '2024-09-23 03:57:51'),
(58, 38, 'SWISH Sample Requisition (Returnable)', 1, 'https://sop.swish.global/admin/form_file/SWISH Sample Requisition (Returnable).docx', '2024-09-23 04:32:30'),
(59, 39, 'SWISH Inventory Stuff Requisition (ISR)', 1, 'https://sop.swish.global/admin/form_file/SWISH Inventory Stuff Requisition (ISR).docx', '2024-09-23 04:33:49'),
(60, 40, 'SWISH Nominee Form (as per labor law)', 1, 'https://sop.swish.global/admin/form_file/SWISH Nominee Form (as per labor law).pdf', '2024-09-28 11:29:37'),
(61, 41, 'SWISH Request Form', 1, 'https://sop.swish.global/admin/form_file/SWISH Request Form.docx', '2024-10-05 09:46:45'),
(62, 42, 'SWISH Training Participation Form', 1, 'https://sop.swish.global/admin/form_file/SWISH Training Participation Form.pdf', '2024-10-06 06:17:58'),
(63, 43, 'SWISH Out Station Work Notification', 1, 'https://sop.swish.global/admin/form_file/Out Station Work Notification.pdf', '2024-10-08 09:45:46'),
(65, 45, 'SWISH Letter Head', 1, 'https://sop.swish.global/admin/form_file/Swish_group_Letter_head.docx', '2024-10-28 07:08:54'),
(66, 46, 'SWISH Training & Learning Report', 1, 'https://sop.swish.global/admin/form_file/Training and Learning Report.pdf', '2024-11-13 09:00:18'),
(67, 30, 'SWISH Leave Application 2025', 2, 'https://sop.swish.global/admin/form_file/Leave Application 2025.pdf', '2025-01-13 06:39:15'),
(68, 32, 'SWISH Budget Requisition (BR) 2025', 2, 'https://sop.swish.global/admin/form_file/SWISH_Budget_Requisition_2025.docx', '2025-08-06 06:39:50'),
(69, 36, 'SWISH Changes Request for Website (CRFW) 2025', 2, 'https://sop.swish.global/admin/form_file/SWISH-Changes-Request-For-Website.docx', '2025-08-06 10:42:26'),
(70, 47, 'Training Request Form', 1, 'https://sop.swish.global/admin/form_file/Training Request Form.docx', '2025-08-14 05:06:12'),
(71, 48, 'Travel Requisition Form', 1, 'https://sop.swish.global/admin/form_file/Travel Requisition.xlsx', '2025-08-14 05:07:12'),
(72, 35, 'Talent Hunt Requisition Form', 3, 'https://sop.swish.global/admin/form_file/Talent Hunt Requisition Form.xlsx', '2025-08-18 10:10:35'),
(73, 42, 'SWISH Training Participation Form 2025', 2, 'https://sop.swish.global/admin/form_file/Training Participation Form 07.09.25.pdf', '2025-09-14 09:26:33');

-- --------------------------------------------------------

--
-- Table structure for table `notice`
--

CREATE TABLE `notice` (
  `notice_id` int(11) NOT NULL,
  `notice_title` varchar(500) DEFAULT NULL,
  `notice_text` varchar(5000) DEFAULT NULL,
  `notice_file` varchar(500) DEFAULT NULL,
  `notice_period` datetime NOT NULL,
  `notice_type` varchar(300) DEFAULT NULL,
  `notice_publish_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notice`
--

INSERT INTO `notice` (`notice_id`, `notice_title`, `notice_text`, `notice_file`, `notice_period`, `notice_type`, `notice_publish_date`) VALUES
(13, 'First and Third Saturday Will Be Closed From 1st November 2024', NULL, 'https://sop.swish.global/admin/notice_files/Revised_Weekly_Holiday_For_SWISH_Group_Head_Office.pdf', '2024-11-30 18:39:00', 'file', '2024-10-24 12:40:03'),
(16, 'Attendance Policy [Flexible Working Hours]', NULL, 'https://sop.swish.global/admin/notice_files/Attendance Policy [Flexible Working Hours].pdf', '2027-12-31 12:59:00', 'file', '2025-09-10 10:01:57');

-- --------------------------------------------------------

--
-- Table structure for table `sop_file`
--

CREATE TABLE `sop_file` (
  `sop_id` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL,
  `subwing_id` int(11) NOT NULL,
  `sop_update_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sop_file`
--

INSERT INTO `sop_file` (`sop_id`, `dept_id`, `subwing_id`, `sop_update_date`) VALUES
(1, 1, 7, '2024-04-27 07:02:11'),
(2, 1, 7, '2024-04-24 10:06:30'),
(3, 1, 7, '2024-04-24 10:06:57'),
(4, 1, 8, '2024-04-24 10:08:24'),
(5, 1, 9, '2024-04-24 10:08:53'),
(6, 1, 10, '2024-04-24 10:09:28'),
(7, 1, 11, '2024-04-24 10:09:56'),
(8, 1, 11, '2024-04-24 10:10:36'),
(9, 1, 11, '2024-04-24 10:10:54'),
(10, 1, 11, '2024-04-24 10:11:40'),
(11, 1, 11, '2024-04-24 10:12:00'),
(12, 1, 11, '2024-04-24 10:12:23'),
(13, 1, 6, '2024-04-27 07:11:48'),
(14, 1, 6, '2024-04-27 07:11:51'),
(15, 3, 4, '2024-04-27 07:09:19'),
(16, 3, 4, '2024-04-27 07:09:22'),
(17, 3, 4, '2024-04-27 07:09:25'),
(19, 1, 6, '2024-10-17 10:30:24'),
(20, 1, 6, '2024-10-17 12:58:07'),
(21, 5, 16, '2024-11-23 06:24:59'),
(22, 2, 5, '2025-03-27 13:27:04'),
(23, 8, 17, '2025-05-06 11:01:44'),
(24, 1, 6, '2025-08-26 12:36:10'),
(25, 3, 4, '2025-09-10 04:29:02'),
(26, 3, 4, '2025-09-24 06:10:24'),
(27, 3, 4, '2025-09-28 06:49:56');

-- --------------------------------------------------------

--
-- Table structure for table `sop_version`
--

CREATE TABLE `sop_version` (
  `version_id` int(11) NOT NULL,
  `sop_id` int(11) NOT NULL,
  `sop_title` varchar(1000) NOT NULL,
  `version` int(11) NOT NULL,
  `sop_file_url` varchar(1000) NOT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sop_version`
--

INSERT INTO `sop_version` (`version_id`, `sop_id`, `sop_title`, `version`, `sop_file_url`, `last_updated`) VALUES
(1, 1, 'Art & Design Static', 1, 'http://sop.swish.global/admin/sop_file/Art_Design_(Static).pdf', '2024-04-30 06:06:42'),
(2, 2, 'Product Model Number Placing on Design', 1, 'http://sop.swish.global/admin/sop_file/Product_Model_Number_Placing_on_Design.pdf', '2024-04-30 06:06:48'),
(3, 3, 'ID Card SOP 2023', 1, 'http://sop.swish.global/admin/sop_file/ID_Card_SOP_2023.pdf', '2024-04-30 06:06:53'),
(4, 4, 'Social Media Creative Guideline (Motion+3D)', 1, 'http://sop.swish.global/admin/sop_file/Social_Media_Creative_Guideline_(Motion3D).pdf', '2024-05-13 03:43:37'),
(5, 5, 'Procurement Process for Copywriting', 1, 'http://sop.swish.global/admin/sop_file/Procurement_Process_for_Copywriting.pdf', '2024-04-30 06:07:10'),
(6, 6, 'Digital Marketing & Media Team', 1, 'http://sop.swish.global/admin/sop_file/Digital_Marketing_Media_Team.pdf', '2024-04-30 06:07:17'),
(7, 7, 'Domain Naming', 1, 'http://sop.swish.global/admin/sop_file/Domain_Naming.pdf', '2024-04-30 06:07:21'),
(8, 8, 'Email Accounts Naming', 1, 'http://sop.swish.global/admin/sop_file/Email_Accounts_Naming.pdf', '2024-04-30 06:07:27'),
(9, 9, 'Notice - Change in Email Address of HR Department', 1, 'http://sop.swish.global/admin/sop_file/Notice-Change_in_Email_Address_of_HR_Department.pdf', '2024-04-30 06:07:31'),
(10, 10, 'PC Configuration Preset', 1, 'http://sop.swish.global/admin/sop_file/PC_Configuration_Preset.pdf', '2024-04-30 06:07:38'),
(11, 11, 'Product Feature Finalizing', 1, 'http://sop.swish.global/admin/sop_file/Product_Feature_Finalizing.pdf', '2024-04-30 06:07:44'),
(12, 12, 'Website', 1, 'http://sop.swish.global/admin/sop_file/Website.pdf', '2024-04-30 06:07:50'),
(13, 13, 'Global Franchisee Event Participation', 1, 'http://sop.swish.global/admin/sop_file/SOP_GUIDE_Global_Franchisee_Event_Participation.pdf', '2024-04-30 06:07:55'),
(14, 14, 'BD Franchisee Event Participation', 1, 'http://sop.swish.global/admin/sop_file/SOP_GUIDE_BD_Franchisee_Event_Participation.pdf', '2024-04-30 06:08:00'),
(15, 15, '100% Salary Bank Transfer', 1, 'http://sop.swish.global/admin/sop_file/100_salary_bank_transfer.pdf', '2024-04-30 06:08:04'),
(16, 16, 'Foreign Travel Policy For China', 1, 'http://sop.swish.global/admin/sop_file/Foreign_Travel_Policy_For_China.pdf', '2024-04-30 06:08:31'),
(17, 17, 'SOP Management Approval (Signature) On Documents', 1, 'http://sop.swish.global/admin/sop_file/SOP_Management_Approval_(Signature)_on_Documents.pdf', '2024-04-30 06:08:35'),
(19, 19, 'SOP Guide For iPhone 15 Pro Camera', 1, 'http://sop.swish.global/admin/sop_file/SOP-GUIDE-For-Iphone-15-Pro-Camera.pdf', '2024-10-17 10:30:24'),
(20, 20, 'SOP Guide Vlog Shooting', 1, 'http://sop.swish.global/admin/sop_file/SOP-Guide-Vlog-Shooting.pdf', '2024-10-17 12:58:07'),
(21, 21, 'Service or Conveyance Charge SOP 2024', 1, 'http://sop.swish.global/admin/sop_file/Service_or_Conveyance_Charge_SOP_2024.pdf', '2024-11-23 06:24:59'),
(22, 22, 'SOP for CMB / AMB Multiple Beneficiaries', 1, 'http://sop.swish.global/admin/sop_file/SOP for CMB  AMB Multiple Beneficiaries.pdf', '2025-03-27 13:27:04'),
(23, 23, 'SOP for NDA & Multiple Beneficiaries ', 1, 'http://sop.swish.global/admin/sop_file/SOP for NDA Multiple Beneficiaries.pdf', '2025-05-07 05:22:23'),
(24, 24, 'SWISH Brand and Communications - Incentive Policy', 1, 'http://sop.swish.global/admin/sop_file/SWISH Brand and Communications - Incentive Policy.pdf', '2025-08-26 12:36:10'),
(25, 25, 'Attendance Policy [Flexible Working Hours]', 1, 'http://sop.swish.global/admin/sop_file/Attendance Policy [Flexible Working Hours].pdf', '2025-09-10 04:29:02'),
(26, 26, 'SWISH Hajj and Umrah Policy', 1, 'http://sop.swish.global/admin/sop_file/SWISH Hajj And Umrah Policy.pdf', '2025-09-24 06:10:24'),
(27, 27, 'External Training & Professional Development', 1, 'http://sop.swish.global/admin/sop_file/SOP - External Training Vs Service Length.pdf', '2025-09-28 06:49:56');

-- --------------------------------------------------------

--
-- Table structure for table `sub_wing`
--

CREATE TABLE `sub_wing` (
  `subwing_id` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL,
  `subwing_name` varchar(10000) NOT NULL,
  `log` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_wing`
--

INSERT INTO `sub_wing` (`subwing_id`, `dept_id`, `subwing_name`, `log`) VALUES
(1, 6, 'Others (AF)', '2024-04-27 07:54:15'),
(2, 5, 'Others (SCM)', '2024-04-27 07:10:56'),
(3, 4, 'Others (Sales)', '2024-04-27 07:10:32'),
(4, 3, 'Others (HR)', '2024-04-27 07:05:42'),
(5, 2, 'Others (BD)', '2024-04-27 07:10:19'),
(6, 1, 'Others (B&C)', '2024-04-27 07:10:08'),
(7, 1, 'Art & Design', '2024-04-24 09:35:04'),
(8, 1, 'Motion & 3D', '2024-04-24 09:35:19'),
(9, 1, 'Copy & Content', '2024-04-24 09:35:33'),
(10, 1, 'Media & PR', '2024-04-24 09:35:47'),
(11, 1, 'Web & Development', '2024-04-24 09:35:57'),
(12, 1, 'Freelancers & Bloggers', '2024-04-30 12:09:40'),
(13, 1, 'Query & PCM', '2024-04-30 12:10:17'),
(14, 7, 'Others (D&T)', '2024-05-06 05:29:34'),
(15, 3, 'China (HR)', '2024-05-23 04:40:10'),
(16, 5, 'Service & Maintenance ', '2024-11-23 06:24:16'),
(17, 8, 'SOP', '2025-05-06 11:01:22');

-- --------------------------------------------------------

--
-- Table structure for table `token`
--

CREATE TABLE `token` (
  `token_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(300) NOT NULL,
  `status` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `token`
--

INSERT INTO `token` (`token_id`, `user_id`, `token`, `status`) VALUES
(1, 1, '2o8yCSDYEq3D5N9h1J30wb1022s024WK', 'Password Recovery: Expired'),
(2, 10, '3X2bPxjSA580y29217Y4Iw253fc011CC', 'Password Recovery: Expired'),
(3, 2, 'R02UQr9Ixi0Q920ZzI21u214k5QJzY74', 'Password Recovery: Expired'),
(4, 327, '5136F0512s2XOtiWlnq4J41EbU0jA2n2', 'Password Recovery'),
(5, 327, '22bXv01FO29Ea21O6k64E1B05570vQ27', 'Password Recovery'),
(6, 327, '12yh4d1g3Sm0K22P90701pUS0352509X', 'Password Recovery'),
(7, 327, '2z4cxg502201b70e11so1e24yu10edLS', 'Password Recovery'),
(8, 327, '7m6x8X0r0s25T2zn14552S11Dc2X02qJ', 'Password Recovery'),
(9, 3, '2z0d0su570O012x1z0Uvbf6110C2xK4n', 'Password Recovery'),
(10, 3, '2d0i2432H401lcN77N100r07n6In825s', 'Password Recovery'),
(11, 3, '45S2a4j00pS0Jvl2k01Sfoposw3W0S71', 'Password Recovery'),
(12, 3, 'j4M5rk24M0SM016KI02z9vt903c17y20', 'Password Recovery'),
(13, 3, 'Gi1I15z7124k244Ky00i5Bj022W40ds0', 'Password Recovery'),
(14, 2, 'z74Pl07Jh5TQr13o82lT00o15H524j06', 'Password Recovery: Expired'),
(15, 68, '9100jSX0251U6tmd7J0hn1DN313y6WE2', 'Password Recovery'),
(16, 68, 'f20L86B58C6X02520Irz1V45e7Nzkc1Z', 'Password Recovery'),
(17, 68, 'RL31Z631CR17K225Q00kce37D0Yq01NH', 'Password Recovery'),
(18, 68, 'X256DxA71N06Pa709L0U0zt5F0012o32', 'Password Recovery: Expired'),
(19, 68, 'svN0Pa51601soOs27IuU5H84002P2P4J', 'Password Recovery: Expired'),
(20, 68, 'vv17sRTSm241hWz603kR52T920n5U4L0', 'Password Recovery: Expired'),
(21, 2, '07X0764l6U272pRCGO2c0R0F4t5101DK', 'Password Recovery'),
(22, 2, '1011xo2d6F7j0DIn28024crF25rdaRrD', 'Password Recovery: Expired'),
(23, 2, '0V52D9916H422hnnD0Sp30BS51F1x0QG', 'Password Recovery'),
(24, 2, '30Eg20412R15QcPp1XBefC2AO1Q13821', 'Password Recovery'),
(25, 2, '1r350b1l02t2r1W0U1X4b33tD3XuQzT2', 'Password Recovery'),
(26, 2, 'yjs1114ws3J02D14KtW25E2pk50sR4Q1', 'Password Recovery: Expired');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(1000) NOT NULL,
  `email` varchar(500) DEFAULT NULL,
  `employee_id` varchar(300) DEFAULT NULL,
  `phone` varchar(300) DEFAULT NULL,
  `designation` varchar(300) NOT NULL,
  `profile_img` varchar(300) NOT NULL,
  `role` int(11) NOT NULL,
  `password` varchar(1000) NOT NULL,
  `log` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `employee_id`, `phone`, `designation`, `profile_img`, `role`, `password`, `log`) VALUES
(1, 'Ruyhanur Rahaman', '', '10032', '01851932715', 'Senior Web Analyst', 'http://sop.swish.global/admin/img/Image_20230819144244.png', 2, '$2y$10$mQG/IpATC8RYWalFaDrxyO7zsz2/T19gQFhpTGNI2ZuZt4IyPv.SS', '2025-10-08 09:35:01'),
(2, 'Kazi Abu Bakr Siddik Fahad', 'fahad.swish@gmail.com', '10031', '01322908575', 'Web Strategist', 'http://sop.swish.global/admin/img/28030_op.jpg', 1, '$2y$10$F4ze2k1LZDokPT2lXY9qeOhSYjqfco6ThEXofAYd8jjGNEQy9o/qK', '2025-10-12 07:16:04'),
(3, 'Suman Haque', 'suman@swish.international', '10029', '', 'Creative Director', 'http://sop.swish.global/admin/img/Screenshot-2024-05-05-at-11.25.jpg', 1, '$2y$10$h2qJeGn2cqyDpXa5aNovh.fogF/YaggV/KOuU7AMiFA4vVLRa6rNG', '2025-10-07 04:47:06'),
(4, 'Ismail Hossain', 'ceo@swish.global', '10001', '', 'Managing Director', 'http://sop.swish.global/admin/img/IMG_8923.JPG', 1, '$2y$10$gtoQTw/IHU0oGWs4YViCLenzPcsT0xGrLtLP0natEXJ0XpWxK3HK.', '2025-10-12 05:34:03'),
(5, 'Md. Humayon Kabir Rasal', 'coo@swish.global', '10002', '', 'Chairman', '', 1, '$2y$10$gaiJSaej7awHCLdsbcHQsOFMXgjV1N/aPtgJ/akZwwYl3ez0SGBhC', '2025-10-12 05:34:13'),
(6, 'Ziauddin Ahmed', 'ziauddin@swish.international', '10052', '', 'Deputy General Manager', '', 0, '$2y$10$tUlirc2cw.axg9.IAHa3AOF/YA.tVnEr3CaHIAE5XrIgUyD37Ga0K', '2025-05-04 09:57:34'),
(7, 'Fakhrul - Razu', 'fakhrul@swish.international', '10009', '', 'Senior Manager', '', 0, '$2y$10$YC2Cko9MCfQOUcWFwGwXPe.8qCd8ru67TrLd2uqDQ9DmgxHKtuHwy', '2025-10-12 05:34:17'),
(8, 'Syed Md Abdullah Al Aman', 'aman@swish.international', '10016', '', 'Deputy Manager', '', 0, '$2y$10$LnvCk7YmNzccqXbMyq5zOOuuqs6QpfeWULDa0NtvCuHsYI.LoMCna', '2025-10-12 05:34:19'),
(9, 'Md Nazmul Hasan', 'nazmul@swish.international', '10028', '', 'Manager', '', 0, '$2y$10$OWaf/AVCQFt43WmsP7KbQOZfE66tPaBSexIL8/PXtJuiVJ5B.D0L6', '2024-10-30 09:22:31'),
(11, 'Test Account', 'test@swish.international', '99999', '', '', 'http://sop.swish.global/admin/img/User-Avatar-Profile-PNG-Photos.png', 2, '$2y$10$XeCNs9JQ/Hayc7TPTphzXuVrzDb8A2HwCyB22TgeeAxT5n3B.cTE2', '2025-10-07 11:09:42'),
(13, 'Md. Tarek Hossain', '', '10067', '', 'Web Strategist', '', 2, '$2y$10$5eaBDz8zzS/JniZiLMn.webbOu.4heoNOamQ2wBn9W/aUZ.1Si8Oi', '2025-10-12 05:34:40'),
(14, 'Md. Ibrahim', '', '10066', '', 'Senior Executive', '', 2, '$2y$10$SS608FxqGa7E9JtxAIiQIeErC89bb3xiD3nkakLXPjiX484gbka.C', '2025-10-12 05:34:42'),
(15, 'Sazari Jannat Tithi', '', '10065', '', 'Senior Copywriter', '', 2, '$2y$10$XNEEt5mM10eTqR2SYNS2WekZ0HsrbfwlLQvayN06EIb0FT8wr1Mhe', '2025-10-12 05:34:47'),
(16, 'Mamun Hassan Sumon', '', '10064', '', 'Deputy Copy Supervisor', '', 2, '$2y$10$4FCtWMWbtCSKaIWnVyX6C.KM0QgPOhLwHMZ8VZ61wSdIu74hOqgz6', '2025-10-12 05:34:50'),
(17, 'Md. Alamgir Hossain ', '', '10063', '', 'Personal Assistant', '', 2, '$2y$10$vktcbru0Yjf8mHUYQI9aY.w3Wsqp2G51YGa.Va/HZMv1.5VBXect2', '2025-10-12 05:34:53'),
(18, 'Khandaker Abu Sufian', '', '10062', '', 'Art Director', '', 2, '$2y$10$O0YonQnEgN7rLs.pSxlRQu0MzXN9JD4zlGaKhH/.jBXa0hHr4sTMq', '2025-10-12 05:35:08'),
(19, 'Md. Foysal Saruwar', '', '10061', '', 'Art Director', '', 2, '$2y$10$Qf/EGUBwaO1eyoZXRMmgU.Si.CO/a66PonxBnNGtkUxfiVbR/R/5y', '2025-10-12 05:35:11'),
(20, 'Asheef Ud Dowla Noor ', '', '10060', '', 'Associate Creative Director', '', 2, '$2y$10$OQ2WeIIXqtypNyy1gr8d1O5cohiKqMxU/goo.aHda1hqD.iotugM.', '2025-10-12 05:35:15'),
(21, 'Md. Minul Islam Talukdar', 'minul@swish.international', '10058', '01329731187', 'Senior Executive', '', 2, '$2y$10$rS1MlZi9wUGObP0gTakzWunBmP65vsV72pgBCC3f1RYrMUFyHzz8u', '2025-01-21 11:06:36'),
(22, 'Md. Keramot Ali ', '', '10055', '', 'Protocol Officer', '', 2, '$2y$10$RiY8UPg7LbF6qbMta1gkl.1NJLml9h/5e44X62s91TNbCh0Bbi2f2', '2025-10-12 05:35:35'),
(23, 'Shahina Akther Toma', '', '10057', '', 'Executive', '', 2, '$2y$10$VBAKlij/y3RAniUA1X9.9uz2tvqxtFFhzNhjcRcs8fRfy1wE3Dv7y', '2025-10-11 08:38:04'),
(24, 'Nur Ali', '', '10054', '', 'Office Assistant', '', 2, '$2y$10$1XnaaZUf8UL.PBbpDVOXe.joazMn/3mTSm8BEjZcyILdVFqpTacB.', '2025-10-12 05:36:20'),
(25, 'Fatema Akter', '', '10053', '', 'Executive', '', 2, '$2y$10$VzAHQ44Uln9VhthQSEGpOezqTm1t9nYM3lbqD6Ah7GtsKJy7zJhUe', '2025-10-12 05:37:11'),
(26, 'Mohannad Rafiqul Islam', '', '10051', '', 'Deputy Manager Commercial', '', 2, '$2y$10$eHvc84G1SYseyVixzkc5j.KTF5cdUbe810b9FON.PXM0.FU/6WB4O', '2025-10-12 05:37:15'),
(27, 'Md. Tarun Miah', '', '10050', '', '3D Generalist', '', 2, '$2y$10$.KbZvhNyYAY6l6KCgH5Bmu9ZiBi.otv8QSw77IAGfDMjyczfYyDfi', '2025-10-12 05:37:27'),
(28, 'Atiqur Rahaman', '', '10049', '', 'Executive', '', 2, '$2y$10$b7NVy.kMP99aSoh7I1449.zne11UFk0UaCGd1k.7eSbeooRQpdvzW', '2025-10-12 05:38:07'),
(29, 'Murad Chowdhury', '', '10048', '', 'Associate Driver', '', 2, '$2y$10$QhcYylt96PlredfylIY75.T7YW18vjqEAIc62CtnNF.iQTeAebk4y', '2025-10-12 05:38:10'),
(30, 'Sagor Babu', '', '10047', '', 'Associate Office Assistant', '', 2, '$2y$10$G04CrJbl4UUkdNj/au9ahO43jM2IERJasJNhnOf6DeDOud0UB.hBy', '2025-10-12 05:38:11'),
(31, 'Purnia Susa ', '', '10046', '', 'Visualizer', '', 2, '$2y$10$O5dBlaCDGrgxsp1W65u./OvImDBS8JWB8B2U0ulfm4wBEGOcbXRDK', '2025-10-12 05:38:14'),
(32, 'Md. Rashedul Islam', 'hridoyofficial5380@gmail.com', '10045', '01836888037', 'Senior Delivery Man', '', 2, '$2y$10$k13pTsftuMjxDjMtu1jye.2SMWl8ZX7xd.0iGRc27mXhPBH67Sh8a', '2025-09-26 10:39:44'),
(33, 'Md. Al Fahad', '', '10044', '', 'Media Strategist', '', 2, '$2y$10$UKDobqLxPpabi/vKk3OAVOaedNaJfdNfiByye/LZfySqq1hvbRSZ6', '2025-10-12 05:39:12'),
(34, 'Md Wasim Jafor', '', '10043', '', 'Associate Driver', '', 2, '$2y$10$WKRx9LRPpVxfL94STh32Meze1yXUOeGB9TQBlvld3PvDU43XJkuZS', '2025-10-12 05:39:15'),
(35, 'Md. Ibrahim', '', '10003', '', 'Senior Executive', '', 2, '$2y$10$6j1ySbeSMJ4jvxS.pM5ASujSfjdjCLJACTIOHyu2XlSJ6lI1pp59m', '2025-10-12 05:46:33'),
(36, 'Salman Farsi', '', '10004', '', 'Senior Officer', '', 2, '$2y$10$2gJcOxY661AgdIEH26Pq5.8J4ELpPLwCX0bSm6LzwHQYe2j1u4YGG', '2025-10-12 05:46:36'),
(37, 'Md. Monirul Islam', '', '10005', '', 'Assistant Manager', '', 2, '$2y$10$r7oeW7yHVlef/6.L9OzvnOKEKNPZ14pdVOXz5IKjco7W.27G1Rgs.', '2025-10-12 05:46:56'),
(38, 'Alok Kumar', '', '10006', '', 'Assistant Art Director', '', 2, '$2y$10$sss/16U1uUadMZpO6PaLUOiHNWXO/Iad0vDPipKJ3E.8Tb5HPzBa2', '2025-10-12 05:46:58'),
(39, 'Md. Nur Alam Rocky', '', '10007', '', 'Officer', '', 2, '$2y$10$HGYZnjTNKxjzrjzkQM.gc.WSyzxfVaPz4BERCvf5yqv/Gn.O83D2K', '2025-10-12 05:46:59'),
(40, 'Abdul Motaleb', '', '10008', '', 'Delivery Man', '', 2, '$2y$10$fNvBdXTHQeFKDwZ8i0d2sOmTI4Iu5c4JFekB5dPG1bmlTPxqMa6Pi', '2025-10-12 05:47:02'),
(41, 'Nur Mohammad', 'nur.m92131@gmail.com', '10010', '01712192131', 'Senior Office Assistant', 'http://sop.swish.global/admin/img/Print copy.png', 2, '$2y$10$53k3722/7tRhywJ3rD0yyemygb4l9RdcmV9Otp15N8WV0xnJPg.qm', '2024-10-30 08:33:44'),
(42, 'Md. Nurun Nobi Shekh', '', '10011', '', 'Driver', '', 2, '$2y$10$73STQKi9j8DBG1EdXgJVNOscNIzZxpjrHqw1CUT8LycE6tZCJ2iqG', '2025-10-12 05:47:08'),
(43, 'Md. Shipon Ali', '', '10012', '', 'Assistant Manager', '', 2, '$2y$10$0NV3jBJBGzzQVE95WlTSIehsyJLtZsAmC9clxPh59elzej0RSDgC6', '2025-10-12 05:47:57'),
(44, 'Md. Anisuzzaman', '', '10013', '', 'Assistant Manager', '', 2, '$2y$10$V2Lu5Jy3bYnrAY2yafebDOaryL.dcHC3kdmjhxnO16lkkDoYRsp2O', '2025-10-12 05:47:59'),
(45, 'Md. Akidul Islam', '', '10014', '', 'Associate Delivery Man', '', 2, '$2y$10$OCYhlcGcSoKPCFhZ7PfRdOo6WoDPFcWuNXc1mcyIUqD1XUixlHJxe', '2025-10-12 05:48:00'),
(46, 'Omio Joy Nag', 'omio@swish.international', '10015', '', 'Assistant Manager', '', 2, '$2y$10$zcHR4kMs4U6SaDLEHB9cYetY5wRUdpdGDFw.6kcQTjvHfLvU.fDKO', '2025-10-12 05:48:03'),
(47, 'Md. Abdul Wadud', '', '10017', '', 'Senior Executive', '', 2, '$2y$10$x98nATqu3H5t6OuIqCW8xequbvTPs0Q4spYq0PJBEDklYdIFaoeOC', '2025-10-12 05:48:05'),
(48, 'Md. Rupu', '', '10018', '', 'Associate Office Assistant', '', 2, '$2y$10$qhqc49srdPsjKM4BfhWqGuidxw74N075r9xa0FXXrto5XL1YTScES', '2025-10-12 05:48:07'),
(49, 'Arif Hasnat', '', '10019', '', 'Visualizer', '', 2, '$2y$10$RHRIaIhw8fmteI1QdPcZhOgdwaxL.D9HBEvmoKo/pQWG9dkuifi76', '2025-10-12 05:48:10'),
(50, 'Mashiqul Haque', '', '10020', '', 'Executive Copy Writer ', '', 2, '$2y$10$EhGvVzPdhuxZy1ymSRFiIuSHMhwzy/6tYiPF77TD9cxGzVvwbTrOK', '2025-04-29 11:56:34'),
(51, 'Sohag Talukder', '', '10021', '', 'Deputy Manager', '', 2, '$2y$10$M0LsCNmyNHAVbXxXh4zfn.KU73I15y/0aBSyiX4r0Dc4HUwxmAiWW', '2025-10-12 05:48:16'),
(52, 'Mohammad Tanvir Hossain', '', '10022', '', 'Senior Motion Visualizer', '', 2, '$2y$10$72kTnD7dCeAgEsfda2zzBOwalk.VUewm4x4Gw7FG7NeC1t6WsSg8G', '2025-10-12 05:48:19'),
(53, 'Md. Jubayer Sheikh', NULL, '10023', NULL, 'Assistant Manager', '', 2, '$2y$10$Wx9KiVF3wAuzSWpFixVzbOMvcJ.OElBeD.IhA0BWiAZZH1BeSl59C', '2024-10-30 08:38:21'),
(54, 'Md. Shamim Hossain', '', '10024', '', 'Personal Assistant', '', 2, '$2y$10$uvQhkwbNKOYmcIs5QFVJX.YDH9KyWw/08vXtRnuFRjw0dww5KJuM6', '2025-10-12 05:48:40'),
(55, 'Ashraful Islam', '', '10025', '', 'Assistant Art Director', '', 2, '$2y$10$qvsxdV1F9zVXIGJX.qdyQOztKI.tWKvZZWxJaJrkMT7jp.Zk3UOYq', '2025-10-12 05:48:59'),
(56, 'Md. Emon', '', '10026', '', 'Office Assistant', '', 2, '$2y$10$eLlPOAa9ow6k63qvSsLc5OIV2mHUKY8BKQpWw1t.bvedCgo/zvO8W', '2025-10-12 05:49:01'),
(57, 'Johirul Islam Bejoy', '', '10027', '', 'Office Assistant', '', 2, '$2y$10$8mBR5DxQQ37N0YMcXE/JcutTGB0L7Dr8keH9T3pU1nwBjo9.g6n9O', '2025-10-12 05:49:03'),
(58, 'Md. Sagar Sikder Akash', 'mdakash6559@gmail.com', '10030', '01322908542', 'Senior Executive', 'http://sop.swish.global/admin/img/274476004_3085899088326607_7556556490287454214_n.jpg', 2, '$2y$10$iqcx6szNc2P9k/wiQ9Dbjuv1kldhWrubWyC3dg4UAkAcNs2s1ueoy', '2025-09-10 03:40:11'),
(59, 'Avirupa Fairooz Kamal', NULL, '10033', NULL, 'Brand Strategist', '', 2, '$2y$10$iv/w.mCC5O1QZpNBQKzosOyrYbV.Tva8ZWx.rVRx5qiIPcW.Dih8W', '2024-10-30 08:42:03'),
(60, 'Papia Azad', NULL, '10034', NULL, 'Executive', '', 2, '$2y$10$WNAm3SmUrHO1dN3liDXYSOuScLXnQhmEzzm71jGNuxfRTtYSpv6Ge', '2024-10-30 08:42:11'),
(61, 'Rayhan', NULL, '10035', NULL, 'Associate Delivery Man', '', 2, '$2y$10$dsJb2tzt1TdSLSKqSklE8ONprOIl6Gg4QO0Pl1EpmyJiVYQDfLx86', '2024-10-30 08:42:19'),
(62, 'Omar Faruque', NULL, '10037', NULL, 'Executive Admin', '', 2, '$2y$10$xznZkoPIZScdRUfxztR3.uiNy.pvW9dDN3dff.K1ta1d4JmQnoi3y', '2024-10-30 08:42:28'),
(63, 'Md Abdullah Al Maruf', '', '10042', '01973806408', 'Motion Visualiser', '', 2, '$2y$10$5VzteoNBuEl95pa/DGJtROuSwkABN.e5pELRBmVKSW8SZvOldkvs2', '2025-10-15 05:05:58'),
(64, 'Shamim Hosen', NULL, '10041', NULL, 'Media Analyst', '', 2, '$2y$10$U0waylgpfNhIKwESqcEQ9eWelIYJ4C0sT3yZRRa.7OL4RVjHLGlFu', '2024-10-30 08:43:09'),
(65, 'Ahesan Ullah', '', '10040', '', 'Graphic Designer', '', 2, '$2y$10$lrdh0HR6GYuVcz2wZV9OteJoHRA7xKUmQcPF4hzYqFV3gYs.uRO/S', '2025-10-12 05:33:00'),
(66, 'Abu Naeem Mahmud', '', '10038', '', 'Executive', '', 2, '$2y$10$dBZbw82Qj..LMT2RD3xRveEIevOhrhAg4uzrMwbiVprTC5KazcpXu', '2025-10-12 05:49:42'),
(67, 'Md. Jakir Hossain', '', '10036', '', 'Driver', '', 2, '$2y$10$2LhObFxHViJp9lchZ1ury.JOncOFp089Zn6ZkVAYOHFCvR7RQsvVC', '2025-10-12 05:49:44'),
(68, 'Md. Mhutashin Billa', 'mhutashim@swish.international', '10114', '', 'Junior Web Executive', 'http://sop.swish.global/admin/img/Md Mhutashim Billa.jpeg', 1, '$2y$10$suLzD6VdUYiTT0aSk6IcGuUDWb3pmpS09aU3GU3byut37FpZIMS3m', '2025-10-21 10:12:25'),
(69, 'Md. Ali Hossain Jewel', '', '10068', '', 'General Manager', '', 2, '$2y$10$USFGHB3mGE.1yhzHyyX9.eBVyLeSNWbPdnEFYUZELnYfduBI4FmA.', '2025-10-12 05:50:01'),
(70, 'Md. Faruk Hosen', '', '10069', '', 'Deputy Manager', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2024-10-30 11:23:46'),
(317, 'Firoz Ahmed', '', '10070', '', 'Assistant Manager', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:50:12'),
(318, 'Md. Mahabub Alam Sarker', '', '10071', '', 'Assistant Manager', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:50:14'),
(319, 'Sheikh Tariqul Islam', '', '10072', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:50:16'),
(320, 'Md Azimul Islam', '', '10073', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:50:18'),
(321, 'Md. Habibur Rahaman', '', '10074', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:50:20'),
(322, 'K. M. Sayfuddin', '', '10075', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:50:46'),
(323, 'Aminul Islam Rubel', '', '10076', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:50:52'),
(324, 'Yeasin Arafat', '', '10077', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:50:54'),
(325, 'Md. Shafayet Hossain', '', '10078', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:51:03'),
(326, 'Abu Muhammad Afnan Zaman', '', '10079', '', 'Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:51:12'),
(327, 'Toushikur Rahaman', 'toushikurrahman@gmail.com', '10080', '01322908561', 'Executive', 'http://sop.swish.global/admin/img/Image_20241103175554.jpg', 2, '$2y$10$6A6DsajVMqldm.VdDT95a.2w51EV88ZhT5zd.6x4h4mLpDwp8xDJi', '2024-11-03 11:58:16'),
(328, 'Rafi Arfan', 'rafz.x0@gmail.com', '10081', '01322908560', 'Executive', 'http://sop.swish.global/admin/img/mmexport1730287919549.png', 2, '$2y$10$ta8YqkX.H.aoESbr4navgeaNXHDPFqLpGGa91gyKbRZ8zbbMXyVWG', '2024-10-30 11:32:44'),
(329, 'Abdullah Al Fisal', '', '10082', '', 'Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:51:18'),
(330, 'Md. Nazim Uddin Ripon', '', '10083', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:51:20'),
(331, 'Arafat Bin Aktar', '', '10084', '', 'Officer', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-11 08:39:53'),
(332, 'Bikash Roy', '', '10085', '', 'Officer', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:51:23'),
(333, 'Ariful Islam', 'arifswish2032@gmail.com', '10086', '01322908572', 'Officer', 'http://sop.swish.global/admin/img/Image pppp.jpg', 2, '$2y$10$TdaGWkxWmdf.L8.OI/5YJeRuT8GyBqs8bZSnztL0ltvBdeCGBj5Oe', '2024-11-03 11:51:14'),
(334, 'Md. Jobayar Mostafa', '', '10087', '', 'Officer', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:51:29'),
(335, 'Md. Mehedi Hasan Bappy', '', '10088', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:51:57'),
(336, 'Jasim Uddin Chowdhury', '', '10089', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:51:58'),
(337, 'Md. Motiur Rahman', '', '10090', '', 'Senior Executive', '', 2, '$2y$10$yjyST95BunroCOqCO0wj9uoHISHQeiFTEaTYAyCUvGbaEf7Kcpqbq', '2025-10-12 05:52:00'),
(338, 'Mahmudul Hasan', '', '10091', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:52:01'),
(339, 'Sharmin Akter Shanta', NULL, '10092', NULL, 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2024-10-30 11:28:44'),
(340, 'Sadia Zaman', NULL, '10093', NULL, 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2024-10-30 11:28:40'),
(341, 'Md. Khairul Anam', '', '10094', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:52:36'),
(342, 'Noman Hossain', '', '10095', '', 'Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:52:38'),
(343, 'Farzana Mohsin Labonno', '', '10096', '', 'Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:52:40'),
(344, 'Nusrat Jahan Keya', NULL, '10097', NULL, 'Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2024-10-30 11:28:20'),
(345, 'Md. Zahir Rayhan', '', '10098', '', 'Senior Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:52:56'),
(346, 'Gautom Mujamder', '', '10099', '', 'Associate Service Consultant ', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:03'),
(347, 'Sheikh MD Shamim', '', '10100', '', 'Associate Service Consultant ', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:07'),
(348, 'Md. Alim Khalifa', NULL, '10101', NULL, 'Associate Service Consultant ', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2024-10-30 11:27:58'),
(349, 'Injamamul Islam', '', '10102', '', 'Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:13'),
(350, 'Md. Eftekhar Khan', '', '10103', '', 'Executive', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:14'),
(351, 'Md. Shopon Hossain', '', '10104', '', 'Associate Service Consultant ', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:16'),
(352, 'Sanawul Islam', '', '10105', '', 'Associate Service Consultant ', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:17'),
(353, 'Shamim Hossain', '', '10106', '', 'Associate Service Consultant ', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:19'),
(354, 'Sakib Howlader', '', '10107', '', 'Support Staff', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:37'),
(355, 'Md Nihad', '', '10108', '', 'Support Staff', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:38'),
(356, 'Md Rashedul Islam', '', '10109', '', 'Support Staff', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:40'),
(357, 'Mehedi Hasan Parosh', '', '10110', '', 'Support Staff', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:41'),
(358, 'Moyen Howlader', '', '10111', '', 'Support Staff', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:43'),
(359, 'Rabbi Howlader', '', '10112', '', 'Support Staff', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:45'),
(360, 'Md. Maruf', '', '10113', '', 'Support Staff', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:53:47'),
(361, 'Md. Saidul Islam', '', '10115', '', 'Associate Service Consultant ', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:54:03'),
(362, 'Md. Sumon Talukder', '', '10116', '', 'Associate Delivery Man', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:54:04'),
(363, 'Md. Zannatul Nayem', '', '10117', '', 'Associate Delivery Man', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:54:06'),
(364, 'Olil Howlader', '', '10118', '', 'Associate Delivery Man', '', 2, '$2y$10$6Dp90NfawabLB/YXA89.POz18E6wBLbtt1Cvpu/3dM81HOVFa34r6', '2025-10-12 05:54:09'),
(365, 'MD. RAMIM RANA', 'hof@swish.international', '10124', '', '', '', 0, '$2y$10$g/qIb3BTYlVasGvAU4Lubu5Lxc62iCvJgLJH2VT7e2eaiRNpqwqjm', '2025-01-27 09:41:54'),
(366, 'Mukta Chowdhury', 'mukta@swish.international', '10127', '', '', '', 2, '$2y$10$Lfv76.RdTUgH7WIOAzZsyu3CuHoXISh356kF7MsuM/jLlgMCn1CfG', '2025-02-24 08:43:46'),
(368, 'Habib Ealahee', '', '10149', NULL, '', '', 2, '$2y$10$hxUz8un/WTA/TbcCR6FzDeJkIJIzkQgdy5Sro2SjSVt0csAGxzXpm', '2025-04-29 11:52:43'),
(369, 'Fariha Eusufzai', '', '10150', NULL, '', '', 2, '$2y$10$aWFN/Gj6dLYS5iSt.F1ude6CD2YMWno8NN8DWLg7B5GOn0TYKTalS', '2025-04-29 11:54:43'),
(370, 'Demo User', '', '10000', '', '', '', 2, '$2y$10$Ok3tISsolT02zrdgfWnp0.qbH6KfQaUtBX1jFP5qOy8fdXvQ9fyQm', '2025-10-11 06:57:44'),
(371, 'Md Faysal Sikder', 'sikder.swish@gmail.com', '10173', '', '', 'http://sop.swish.global/admin/img/Image_20250910173746_4_24.jpg', 1, '$2y$10$1bLjjN7vxp6okJ0KS9AI4.pj2ZSikWNtGTjB6OX67.U0rsNyH8uvy', '2025-09-10 11:39:52'),
(372, 'Foysal Islam', 'Sales@swish.international', '10160', '01332548209', 'Sr.Executive', 'http://sop.swish.global/admin/img/Image_20250910185202.jpg', 2, '$2y$10$/qraxJHN5Inlsd2F1fFnJuGaEIQb9Kqi0WD5xc17wLZVEUA36IyTG', '2025-09-10 12:52:11'),
(373, 'Md Morshedul Hoque', 'admin.bd@swish.international', '10171', '', '', '', 2, '$2y$10$w7sOnrRe2Gi7u/ZAuDDkO.i6RWQIXX88K.F7WuerXMR1G5G0SI9EC', '2025-10-23 03:19:59'),
(374, 'Tasneem Toha Athoy', '', '10143', NULL, '', '', 2, '$2y$10$WPKepDEKj1F24dZdlYuuiO1BOf474VT.BJNqZ48dx2FlZzYT4a7Oy', '2025-10-23 04:22:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`dept_id`);

--
-- Indexes for table `dept_assign`
--
ALTER TABLE `dept_assign`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `form_file`
--
ALTER TABLE `form_file`
  ADD PRIMARY KEY (`form_id`);

--
-- Indexes for table `form_version`
--
ALTER TABLE `form_version`
  ADD PRIMARY KEY (`version_id`);

--
-- Indexes for table `notice`
--
ALTER TABLE `notice`
  ADD PRIMARY KEY (`notice_id`);

--
-- Indexes for table `sop_file`
--
ALTER TABLE `sop_file`
  ADD PRIMARY KEY (`sop_id`);

--
-- Indexes for table `sop_version`
--
ALTER TABLE `sop_version`
  ADD PRIMARY KEY (`version_id`);

--
-- Indexes for table `sub_wing`
--
ALTER TABLE `sub_wing`
  ADD PRIMARY KEY (`subwing_id`);

--
-- Indexes for table `token`
--
ALTER TABLE `token`
  ADD PRIMARY KEY (`token_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`);
ALTER TABLE `users` ADD FULLTEXT KEY `email` (`email`);
ALTER TABLE `users` ADD FULLTEXT KEY `phone` (`phone`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `dept_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `dept_assign`
--
ALTER TABLE `dept_assign`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=371;

--
-- AUTO_INCREMENT for table `form_file`
--
ALTER TABLE `form_file`
  MODIFY `form_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `form_version`
--
ALTER TABLE `form_version`
  MODIFY `version_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `notice`
--
ALTER TABLE `notice`
  MODIFY `notice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `sop_file`
--
ALTER TABLE `sop_file`
  MODIFY `sop_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `sop_version`
--
ALTER TABLE `sop_version`
  MODIFY `version_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `sub_wing`
--
ALTER TABLE `sub_wing`
  MODIFY `subwing_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `token`
--
ALTER TABLE `token`
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=375;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
