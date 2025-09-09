-- =====================================================
-- SQL Updates for New Features - SerialNumba System
-- =====================================================
-- Created: 2025-01-XX
-- Description: คำสั่ง SQL ที่ต้องเพิ่มสำหรับฟีเจอร์ใหม่ทั้งหมด
-- =====================================================

-- =====================================================
-- 1. เพิ่มฟิลด์ academic_year ในตาราง activities
-- =====================================================
-- สำหรับ Task 2: เพิ่มปีการศึกษาในระบบสร้างกิจกรรม
-- สำหรับ Task 4: เพิ่มฟีเจอร์แก้ไข ลบ ยกเลิก และเลื่อนวันกิจกรรม

ALTER TABLE `activities` 
ADD COLUMN `academic_year` VARCHAR(10) DEFAULT NULL COMMENT 'ปีการศึกษา (เช่น 2568)',
ADD COLUMN `rescheduled_date` DATETIME DEFAULT NULL COMMENT 'วันที่เลื่อนกิจกรรม (สำหรับเลื่อนวัน)',
ADD COLUMN `location` VARCHAR(255) DEFAULT NULL COMMENT 'สถานที่จัดกิจกรรม',
ADD COLUMN `max_participants` INT(11) DEFAULT NULL COMMENT 'จำนวนผู้เข้าร่วมสูงสุด';

-- เพิ่ม Index สำหรับ academic_year เพื่อการค้นหาที่เร็วขึ้น
ALTER TABLE `activities` 
ADD INDEX `idx_academic_year` (`academic_year`);

-- =====================================================
-- 2. สร้างตาราง academic_years สำหรับจัดการปีการศึกษา
-- =====================================================
-- สำหรับ Task 7: เพิ่มระบบจัดการปีการศึกษาในระบบ

CREATE TABLE `academic_years` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `year` VARCHAR(10) NOT NULL COMMENT 'ปีการศึกษา (เช่น 2568)',
  `year_thai` VARCHAR(50) NOT NULL COMMENT 'ปีการศึกษา (ภาษาไทย)',
  `start_date` DATE NOT NULL COMMENT 'วันที่เริ่มต้นปีการศึกษา',
  `end_date` DATE NOT NULL COMMENT 'วันที่สิ้นสุดปีการศึกษา',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'สถานะใช้งาน (1=ใช้งาน, 0=ไม่ใช้งาน)',
  `created_by` INT(11) NOT NULL COMMENT 'ผู้สร้าง',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `year` (`year`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`),
  CONSTRAINT `academic_years_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางจัดการปีการศึกษา';

-- เพิ่มข้อมูลปีการศึกษาเริ่มต้น
INSERT INTO `academic_years` (`year`, `year_thai`, `start_date`, `end_date`, `is_active`, `created_by`) VALUES
('2568', 'ปีการศึกษา 2568', '2025-06-01', '2026-05-31', 1, 1),
('2567', 'ปีการศึกษา 2567', '2024-06-01', '2025-05-31', 1, 1),
('2566', 'ปีการศึกษา 2566', '2023-06-01', '2024-05-31', 0, 1);

-- =====================================================
-- 3. เพิ่มฟิลด์ academic_year_id ในตาราง activities
-- =====================================================
-- สำหรับ Task 7: เชื่อมโยงกิจกรรมกับปีการศึกษา

ALTER TABLE `activities` 
ADD COLUMN `academic_year_id` INT(11) DEFAULT NULL COMMENT 'ID ของปีการศึกษา',
ADD CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- เพิ่ม Index สำหรับ academic_year_id
ALTER TABLE `activities` 
ADD INDEX `idx_academic_year_id` (`academic_year_id`);

-- =====================================================
-- 4. อัปเดตข้อมูลกิจกรรมที่มีอยู่ให้มีปีการศึกษา
-- =====================================================
-- ตั้งค่าให้กิจกรรมที่มีอยู่เป็นปีการศึกษา 2568

UPDATE `activities` 
SET `academic_year` = '2568', 
    `academic_year_id` = (SELECT id FROM `academic_years` WHERE `year` = '2568' LIMIT 1)
WHERE `academic_year` IS NULL;

-- =====================================================
-- 5. เพิ่มฟิลด์ comment ในตาราง activity_reviews
-- =====================================================
-- สำหรับการแสดงความคิดเห็นในรีวิว (ถ้าจำเป็น)

ALTER TABLE `activity_reviews` 
ADD COLUMN `comment` TEXT DEFAULT NULL COMMENT 'ความคิดเห็นเพิ่มเติม' AFTER `suggestion`;

-- =====================================================
-- 6. เพิ่มตาราง activity_status_history สำหรับติดตามการเปลี่ยนแปลงสถานะ
-- =====================================================
-- สำหรับ Task 4: ติดตามการเปลี่ยนแปลงสถานะกิจกรรม

CREATE TABLE `activity_status_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `activity_id` INT(11) NOT NULL,
  `old_status` ENUM('DRAFT','OPEN','CLOSED','CANCELLED') DEFAULT NULL,
  `new_status` ENUM('DRAFT','OPEN','CLOSED','CANCELLED') NOT NULL,
  `changed_by` INT(11) NOT NULL,
  `reason` TEXT DEFAULT NULL COMMENT 'เหตุผลในการเปลี่ยนสถานะ',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_id` (`activity_id`),
  KEY `idx_changed_by` (`changed_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `activity_status_history_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `activity_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ประวัติการเปลี่ยนแปลงสถานะกิจกรรม';

-- =====================================================
-- 7. เพิ่มตาราง activity_reschedule_history สำหรับติดตามการเลื่อนวัน
-- =====================================================
-- สำหรับ Task 4: ติดตามการเลื่อนวันกิจกรรม

CREATE TABLE `activity_reschedule_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `activity_id` INT(11) NOT NULL,
  `old_start_date` DATETIME NOT NULL,
  `old_end_date` DATETIME NOT NULL,
  `new_start_date` DATETIME NOT NULL,
  `new_end_date` DATETIME NOT NULL,
  `rescheduled_by` INT(11) NOT NULL,
  `reason` TEXT DEFAULT NULL COMMENT 'เหตุผลในการเลื่อนวัน',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_id` (`activity_id`),
  KEY `idx_rescheduled_by` (`rescheduled_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `activity_reschedule_history_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `activity_reschedule_history_ibfk_2` FOREIGN KEY (`rescheduled_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ประวัติการเลื่อนวันกิจกรรม';

-- =====================================================
-- 8. อัปเดต ENUM ในตาราง activities เพื่อเพิ่มสถานะ CANCELLED
-- =====================================================
-- สำหรับ Task 4: เพิ่มสถานะยกเลิก

ALTER TABLE `activities` 
MODIFY COLUMN `status` ENUM('DRAFT','OPEN','CLOSED','CANCELLED') DEFAULT 'DRAFT';

-- =====================================================
-- 9. เพิ่มตาราง system_logs สำหรับติดตามการทำงานของระบบ
-- =====================================================
-- สำหรับการติดตามและ Debug

CREATE TABLE `system_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL COMMENT 'การกระทำ (เช่น CREATE_ACTIVITY, UPDATE_ACTIVITY)',
  `table_name` VARCHAR(50) DEFAULT NULL COMMENT 'ชื่อตารางที่เกี่ยวข้อง',
  `record_id` INT(11) DEFAULT NULL COMMENT 'ID ของเรคคอร์ดที่เกี่ยวข้อง',
  `old_values` JSON DEFAULT NULL COMMENT 'ค่าก่อนการเปลี่ยนแปลง',
  `new_values` JSON DEFAULT NULL COMMENT 'ค่าหลังการเปลี่ยนแปลง',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_table_name` (`table_name`),
  KEY `idx_record_id` (`record_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log ระบบสำหรับติดตามการทำงาน';

-- =====================================================
-- 10. เพิ่มตาราง user_activity_hours สำหรับติดตามชั่วโมงตามปีการศึกษา
-- =====================================================
-- สำหรับ Task 5: แสดงชั่วโมงตามปีการศึกษา

CREATE TABLE `user_activity_hours` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `academic_year_id` INT(11) NOT NULL,
  `total_hours` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'ชั่วโมงรวมในปีการศึกษา',
  `activity_count` INT(11) NOT NULL DEFAULT 0 COMMENT 'จำนวนกิจกรรมที่เข้าร่วม',
  `last_updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_academic_year` (`user_id`, `academic_year_id`),
  KEY `idx_academic_year_id` (`academic_year_id`),
  KEY `idx_total_hours` (`total_hours`),
  CONSTRAINT `user_activity_hours_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_activity_hours_ibfk_2` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ชั่วโมงกิจกรรมของนักศึกษาตามปีการศึกษา';

-- =====================================================
-- 11. เพิ่มฟิลด์ในตาราง users สำหรับข้อมูลเพิ่มเติม
-- =====================================================
-- สำหรับการแสดงข้อมูลที่ครบถ้วน

ALTER TABLE `users` 
ADD COLUMN `profile_image` VARCHAR(255) DEFAULT NULL COMMENT 'รูปโปรไฟล์' AFTER `program`,
ADD COLUMN `bio` TEXT DEFAULT NULL COMMENT 'ข้อมูลส่วนตัว' AFTER `profile_image`,
ADD COLUMN `last_login` DATETIME DEFAULT NULL COMMENT 'เข้าสู่ระบบล่าสุด' AFTER `bio`;

-- =====================================================
-- 12. เพิ่มตาราง notifications สำหรับการแจ้งเตือน
-- =====================================================
-- สำหรับการแจ้งเตือนผู้ใช้ (ถ้าต้องการ)

-- ตาราง notifications มีอยู่แล้วใน app_db.sql แต่เพิ่มฟิลด์เพิ่มเติม
ALTER TABLE `notifications` 
ADD COLUMN `action_url` VARCHAR(255) DEFAULT NULL COMMENT 'URL สำหรับการดำเนินการ' AFTER `type`,
ADD COLUMN `is_clicked` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'คลิกแล้วหรือยัง' AFTER `action_url`;

-- =====================================================
-- 13. เพิ่มตาราง backup_activities สำหรับการสำรองข้อมูล
-- =====================================================
-- สำหรับการสำรองข้อมูลกิจกรรมที่ถูกลบ

CREATE TABLE `backup_activities` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `original_id` INT(11) NOT NULL COMMENT 'ID เดิมของกิจกรรม',
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `hours_awarded` INT(11) NOT NULL DEFAULT 1,
  `public_slug` VARCHAR(255) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `status` ENUM('DRAFT','OPEN','CLOSED','CANCELLED') DEFAULT 'DRAFT',
  `academic_year` VARCHAR(10) DEFAULT NULL,
  `academic_year_id` INT(11) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `max_participants` INT(11) DEFAULT NULL,
  `deleted_by` INT(11) NOT NULL COMMENT 'ผู้ลบ',
  `deleted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่ลบ',
  `deletion_reason` TEXT DEFAULT NULL COMMENT 'เหตุผลในการลบ',
  PRIMARY KEY (`id`),
  KEY `idx_original_id` (`original_id`),
  KEY `idx_deleted_by` (`deleted_by`),
  KEY `idx_deleted_at` (`deleted_at`),
  CONSTRAINT `backup_activities_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `backup_activities_ibfk_2` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='สำรองข้อมูลกิจกรรมที่ถูกลบ';

-- =====================================================
-- 14. เพิ่มตาราง activity_categories สำหรับหมวดหมู่กิจกรรม
-- =====================================================
-- สำหรับการจัดหมวดหมู่กิจกรรม (ถ้าต้องการ)

CREATE TABLE `activity_categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'ชื่อหมวดหมู่',
  `name_thai` VARCHAR(100) NOT NULL COMMENT 'ชื่อหมวดหมู่ (ภาษาไทย)',
  `description` TEXT DEFAULT NULL COMMENT 'คำอธิบายหมวดหมู่',
  `color` VARCHAR(7) DEFAULT '#007bff' COMMENT 'สีของหมวดหมู่ (HEX)',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT 'ไอคอนของหมวดหมู่',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'สถานะใช้งาน',
  `created_by` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `activity_categories_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='หมวดหมู่กิจกรรม';

-- เพิ่มข้อมูลหมวดหมู่เริ่มต้น
INSERT INTO `activity_categories` (`name`, `name_thai`, `description`, `color`, `icon`, `created_by`) VALUES
('workshop', 'เวิร์กช็อป', 'กิจกรรมอบรมเชิงปฏิบัติการ', '#28a745', 'fas fa-tools', 1),
('seminar', 'สัมมนา', 'กิจกรรมสัมมนาและบรรยาย', '#007bff', 'fas fa-chalkboard-teacher', 1),
('conference', 'ประชุมวิชาการ', 'การประชุมวิชาการและนำเสนอผลงาน', '#6f42c1', 'fas fa-users', 1),
('training', 'การฝึกอบรม', 'การฝึกอบรมและพัฒนาทักษะ', '#fd7e14', 'fas fa-graduation-cap', 1),
('volunteer', 'อาสาสมัคร', 'กิจกรรมอาสาสมัครและจิตอาสา', '#20c997', 'fas fa-hands-helping', 1);

-- เพิ่มฟิลด์ category_id ในตาราง activities
ALTER TABLE `activities` 
ADD COLUMN `category_id` INT(11) DEFAULT NULL COMMENT 'ID ของหมวดหมู่กิจกรรม',
ADD CONSTRAINT `activities_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `activity_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- เพิ่ม Index สำหรับ category_id
ALTER TABLE `activities` 
ADD INDEX `idx_category_id` (`category_id`);

-- =====================================================
-- 15. เพิ่มตาราง activity_tags สำหรับแท็กกิจกรรม
-- =====================================================
-- สำหรับการติดแท็กกิจกรรม (ถ้าต้องการ)

CREATE TABLE `activity_tags` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT 'ชื่อแท็ก',
  `color` VARCHAR(7) DEFAULT '#6c757d' COMMENT 'สีของแท็ก (HEX)',
  `created_by` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  CONSTRAINT `activity_tags_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='แท็กกิจกรรม';

-- ตารางเชื่อมโยงกิจกรรมกับแท็ก
CREATE TABLE `activity_tag_relations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `activity_id` INT(11) NOT NULL,
  `tag_id` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_activity_tag` (`activity_id`, `tag_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `activity_tag_relations_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `activity_tag_relations_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `activity_tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ความสัมพันธ์ระหว่างกิจกรรมกับแท็ก';

-- =====================================================
-- สรุปการเปลี่ยนแปลง
-- =====================================================
-- 1. เพิ่มฟิลด์ academic_year, rescheduled_date, location, max_participants ในตาราง activities
-- 2. สร้างตาราง academic_years สำหรับจัดการปีการศึกษา
-- 3. เพิ่มฟิลด์ academic_year_id ในตาราง activities
-- 4. อัปเดตข้อมูลกิจกรรมที่มีอยู่ให้มีปีการศึกษา
-- 5. เพิ่มฟิลด์ comment ในตาราง activity_reviews
-- 6. สร้างตาราง activity_status_history สำหรับติดตามการเปลี่ยนแปลงสถานะ
-- 7. สร้างตาราง activity_reschedule_history สำหรับติดตามการเลื่อนวัน
-- 8. อัปเดต ENUM ในตาราง activities เพื่อเพิ่มสถานะ CANCELLED
-- 9. สร้างตาราง system_logs สำหรับติดตามการทำงานของระบบ
-- 10. สร้างตาราง user_activity_hours สำหรับติดตามชั่วโมงตามปีการศึกษา
-- 11. เพิ่มฟิลด์ในตาราง users สำหรับข้อมูลเพิ่มเติม
-- 12. เพิ่มฟิลด์ในตาราง notifications
-- 13. สร้างตาราง backup_activities สำหรับการสำรองข้อมูล
-- 14. สร้างตาราง activity_categories สำหรับหมวดหมู่กิจกรรม
-- 15. สร้างตาราง activity_tags และ activity_tag_relations สำหรับแท็กกิจกรรม

-- =====================================================
-- หมายเหตุ
-- =====================================================
-- - ไฟล์นี้ควรรันหลังจาก app_db.sql
-- - ควรทำการ backup ข้อมูลก่อนรันคำสั่งเหล่านี้
-- - ตรวจสอบ foreign key constraints ให้แน่ใจว่าไม่มีปัญหา
-- - อาจต้องปรับแต่งข้อมูลเริ่มต้นตามความต้องการ
