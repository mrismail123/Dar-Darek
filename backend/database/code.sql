-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: dardarek-dardarek.c.aivencloud.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '58afab15-1d2f-11f1-a822-9a95e1033837:1-1176,
73f68c8d-1088-11f1-96f4-e2219dfc097b:1-37,
9a2dd1eb-12f7-11f1-9714-c28c561f75db:1-17,
9d2fa3bc-123a-11f1-b55b-5aa47a9461b1:1-17';

--
-- Table structure for table `amenities`
--

DROP TABLE IF EXISTS `amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `amenities` (
  `id_amenity` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id_amenity`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `amenities`
--

LOCK TABLES `amenities` WRITE;
/*!40000 ALTER TABLE `amenities` DISABLE KEYS */;
INSERT INTO `amenities` VALUES (3,'Air Conditioning'),(80,'airportShuttle'),(11,'balcony'),(77,'bbq'),(76,'beachAccess'),(13,'breakfast'),(65,'coffeeMachine'),(69,'desk'),(66,'dishes'),(67,'dryer'),(12,'elevator'),(70,'fastWifi'),(83,'fireExtinguisher'),(78,'garden'),(9,'heating'),(10,'hotWater'),(79,'housekeeping'),(64,'kettle'),(6,'Kitchen'),(74,'medinaView'),(62,'microwave'),(73,'mountainView'),(75,'natureView'),(84,'outdoorCamera'),(63,'oven'),(4,'Parking'),(14,'petFriendly'),(2,'Pool'),(81,'reception'),(61,'refrigerator'),(85,'safeBox'),(5,'Sea View'),(58,'sheets'),(71,'smartTv'),(82,'smokeDetector'),(68,'sofa'),(72,'terrace'),(60,'toiletries'),(59,'towels'),(8,'tv'),(7,'washingMachine'),(1,'WiFi'),(15,'workspace');
/*!40000 ALTER TABLE `amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_locks`
--

DROP TABLE IF EXISTS `booking_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_locks` (
  `id_lock` int NOT NULL AUTO_INCREMENT,
  `id_property` int NOT NULL,
  `id_user` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_lock`),
  KEY `idx_locks_property` (`id_property`),
  KEY `idx_locks_expires` (`expires_at`),
  KEY `booking_locks_user_fk` (`id_user`),
  CONSTRAINT `booking_locks_property_fk` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE,
  CONSTRAINT `booking_locks_user_fk` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_locks`
--

LOCK TABLES `booking_locks` WRITE;
/*!40000 ALTER TABLE `booking_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id_booking` int NOT NULL AUTO_INCREMENT,
  `id_property` int DEFAULT NULL,
  `id_user` int DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `guest_full_name` varchar(150) DEFAULT NULL,
  `guest_id_number` varchar(50) DEFAULT NULL,
  `guest_phone` varchar(30) DEFAULT NULL,
  `agreed_to_terms` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_booking`),
  KEY `id_property` (`id_property`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (27,106,108,'2026-05-20','2026-05-24',2000.00,'rejected','2026-05-20 17:59:03','2026-05-20 18:15:51','ISMAIL OURDAN','Jello234','+212777849582',1),(28,106,112,'2026-05-24','2026-05-26',1000.00,'approved','2026-05-20 18:01:17','2026-05-20 18:02:48','ISMAIL OURDAN','OFEOFIE3123','+212777849582',1),(29,106,113,'2026-05-20','2026-05-22',1000.00,'rejected','2026-05-20 18:16:23','2026-05-20 18:17:12','ISMAIL OURDAN','Kb3432432','+212777849582',1),(30,105,114,'2026-05-21','2026-05-24',1200.00,'pending','2026-05-21 15:25:29','2026-05-21 15:25:29','ISMAIL OURDAN','KBfjkjkejfke','+212777849582',1);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id_city` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `region` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id_city`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Tangier','Tanger-Tetouan-Al Hoceima','Tangier, the gateway to Africa, is a mythical city where the Atlantic meets the Mediterranean. Known for its historical Kasbah, vibrant medina, and legendary cafes, it has long inspired artists and writers. Explore the Hercules Caves and enjoy the cosmopolitan spirit of a city that blends Moroccan tradition with international influences.'),(2,'Tetouan','Tanger-Tetouan-Al Hoceima','Tetouan, the White Dove, is a UNESCO World Heritage site known for its stunning Hispano-Moorish architecture. Nestled at the foot of the Rif Mountains, its medina is one of the most preserved in Morocco. It is a center of Andalusian culture, fine arts, and traditional craftsmanship, offering a peaceful and authentic experience.'),(3,'Chefchaouen','Tanger-Tetouan-Al Hoceima','Chefchaouen, the Blue City, is world-famous for its blue-washed buildings and narrow, winding alleys. Located high in the Rif Mountains, it offers a serene atmosphere, breathtaking mountain views, and a unique cultural heritage. From the Spanish Mosque to Ras El Ma, every corner of this city is a masterpiece of tranquility.'),(4,'Asilah','Tanger-Tetouan-Al Hoceima','Asilah, the Artistic Pearl, is a charming seaside town famous for its annual arts festival and colorful murals. Its white-washed medina, surrounded by 15th-century Portuguese walls, overlooks the turquoise waters of the Atlantic. It is the perfect destination for art lovers and those seeking a quiet, creative retreat by the sea.'),(5,'Al Hoceima','Tanger-Tetouan-Al Hoceima','Al Hoceima, the Mediterranean Jewel, is renowned for its crystal-clear bays and magnificent cliffs. Surrounded by the Rif Mountains and the Al Hoceima National Park, it offers some of the most beautiful beaches in Morocco, such as Quemado and Sfiha. It is a paradise for nature lovers, hikers, and beach seekers.'),(6,'Ajdir','Tanger-Tetouan-Al Hoceima','Ajdir, a coastal jewel near Al Hoceima, offers breathtaking views of the Mediterranean and the historic island of Quemado. Known for its calm atmosphere and pristine beaches, it is the perfect escape for those seeking serenity and natural beauty in the Rif region.'),(7,'Belyounech','Tanger-Tetouan-Al Hoceima','Belyounech is a hidden paradise nestled between the mountains and the sea, right at the foot of Jebel Musa. Famed for its crystal-clear waters and vibrant marine life, it is a sanctuary for divers and nature lovers looking for the northernmost tip of Moroccan beauty.'),(8,'Bni Bouayach','Tanger-Tetouan-Al Hoceima','Bni Bouayach stands as a vibrant hub in the heart of the Rif, surrounded by majestic mountains. It is a city of resilience and tradition, offering visitors an authentic glimpse into the local culture and the stunning landscapes of the Al Hoceima province.'),(9,'Cabo Negro','Tanger-Tetouan-Al Hoceima','Cabo Negro is the epitome of Mediterranean elegance, famous for its upscale resorts and white sandy beaches. With its lush greenery and prestigious golf courses, it remains a premier destination for those seeking a luxurious and relaxing summer retreat.'),(10,'Fnideq','Tanger-Tetouan-Al Hoceima','Fnideq, the charming border town, blends a bustling commercial spirit with beautiful coastal views. Its well-maintained corniche and proximity to luxury resorts make it a dynamic stop for travelers exploring the northern coast of the Kingdom.'),(11,'Imzouren','Tanger-Tetouan-Al Hoceima','Imzouren is a bustling center of trade and culture in the Al Hoceima region. Known for its lively markets and warm hospitality, it serves as a vital link between the mountainous Rif interior and the stunning Mediterranean coastline.'),(12,'Ksar El Kebir','Tanger-Tetouan-Al Hoceima','Ksar El Kebir is a city steeped in history, famously linked to the Battle of the Three Kings. Its ancient walls and traditional architecture tell stories of a glorious past, making it a must-visit for history enthusiasts exploring Moroccan heritage.'),(13,'Larache','Tanger-Tetouan-Al Hoceima','Larache is a serene Atlantic port city where Spanish architectural influence meets Moroccan soul. Home to the ancient ruins of Lixus and the beautiful Plaza de España, it offers a poetic atmosphere and some of the best seafood in the region.'),(14,'Martil','Tanger-Tetouan-Al Hoceima','Martil is the vibrant heart of the Tetouan coastline, beloved for its endless sandy beach and lively summer nights. It is the ultimate destination for students and families alike, offering a perfect blend of relaxation and seaside entertainment.'),(15,'M\'diq','Tanger-Tetouan-Al Hoceima',NULL),(16,'Oued Laou','Tanger-Tetouan-Al Hoceima','Oued Laou is a tranquil coastal escape where the river meets the sea. Famous for its unique Mediterranean tiles and vibrant weekly market, it attracts those looking for an authentic and peaceful beach experience away from the crowds.'),(17,'Ouazzane','Tanger-Tetouan-Al Hoceima','Ouazzane, the spiritual city perched on the edge of the Rif, is known for its green-tiled roofs and lack of fortified walls. It is a center of Sufism and traditional crafts, offering a peaceful atmosphere and exquisite handmade woolen garments.'),(18,'Targuist','Tanger-Tetouan-Al Hoceima','Targuist is a mountainous retreat located at a high altitude in the Rif. Surrounded by cedar forests and stunning peaks, it is an ideal spot for hikers and those looking to discover the rugged, authentic heart of northern Morocco');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id_favorite` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `id_property` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_favorite`),
  UNIQUE KEY `unique_user_property` (`id_user`,`id_property`),
  KEY `id_property` (`id_property`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id_notification` int NOT NULL AUTO_INCREMENT,
  `id_property` int DEFAULT NULL,
  `id_user` int DEFAULT NULL,
  `notify_text` varchar(100) NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `id_booking` int DEFAULT NULL,
  `type` varchar(50) DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notification`),
  KEY `id_property` (`id_property`),
  KEY `id_user` (`id_user`),
  KEY `fk_notify_booking` (`id_booking`),
  CONSTRAINT `fk_notify_booking` FOREIGN KEY (`id_booking`) REFERENCES `bookings` (`id_booking`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (31,106,109,'Your property \"feffffffffffffffffffffffffffffff\" has been approved and is now live! ?',1,NULL,'APPROVE','2026-05-20 17:44:17'),(32,105,109,'Your property \"Ourdan property\" has been approved and is now live! ?',1,NULL,'APPROVE','2026-05-20 17:44:18'),(33,106,109,'New booking request for your property! Check your rental requests.',1,27,'general','2026-05-20 17:59:03'),(34,106,109,'New booking request for your property! Check your rental requests.',1,28,'general','2026-05-20 18:01:17'),(35,106,112,'Your request for \"feffffffffffffffffffffffffffffff\" was approved! ?',0,28,'APPROVE','2026-05-20 18:02:49'),(36,106,108,'Your request for \"feffffffffffffffffffffffffffffff\" was rejected.',1,27,'REJECT','2026-05-20 18:15:51'),(37,106,109,'New booking request for your property! Check your rental requests.',1,29,'general','2026-05-20 18:16:24'),(38,106,113,'Your request for \"feffffffffffffffffffffffffffffff\" was rejected.',0,29,'REJECT','2026-05-20 18:17:12'),(39,105,109,'New booking request for your property! Check your rental requests.',0,30,'general','2026-05-21 15:25:29');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id_property` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `host_description` text,
  `neighborhood_description` text,
  `id_city` int DEFAULT NULL,
  `id_user` int DEFAULT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `guests_total` int NOT NULL,
  `status` enum('draft','pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `address` varchar(255) DEFAULT NULL,
  `neighborhood` varchar(150) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `access_instructions` text,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `property_type` varchar(100) DEFAULT NULL,
  `bedrooms` int DEFAULT '0',
  `bathrooms` int DEFAULT '0',
  `beds` int DEFAULT '0',
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `available_from` date DEFAULT NULL,
  `available_to` date DEFAULT NULL,
  `admin_notes` text,
  `reviewed_by` int DEFAULT NULL,
  PRIMARY KEY (`id_property`),
  KEY `id_city` (`id_city`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`id_city`) REFERENCES `cities` (`id_city`) ON DELETE SET NULL,
  CONSTRAINT `properties_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (105,'Ourdan property','feffffffffffffffffffffffffffffff','Hello, my name is Ismail Ourdan, I am from Morocco living in the north in Tangier.','feffffffffffffffffffffffffffffff',1,109,400.00,1,'approved','2026-05-20 17:41:56','2026-05-20 17:44:18','Casabarata كاساباراطا,  arrondissement de Charf-Souani الشرف السواني','Casabarata كاساباراطا','90000','Just go....',35.7597030,-5.8279330,'Appartement',1,1,1,'15:00:00','11:00:00','2026-05-20','2026-06-19',NULL,108),(106,'feffffffffffffffffffffffffffffff','feffffffffffffffffffffffffffffff','Hello, my name is Ismail Ourdan, I am from Morocco living in the north in Tangier.','feffffffffffffffffffffffffffffff',1,109,500.00,1,'approved','2026-05-20 17:43:55','2026-05-20 17:44:16','Rue 140','Casabarata كاساباراطا','90060','feffffffffffffffffffffffffffffff',35.7649410,-5.8293090,'Appartement',1,1,1,'15:00:00','11:00:00','2026-05-20','2026-08-18',NULL,108),(107,'new new new','new new new','new new new','new new new',1,108,300.00,1,'pending','2026-05-20 17:54:30','2026-05-20 17:54:30','Val Fleuri,  arrondissement de Tanger-Medina طنجة المدينة','Val Fleuri','90100','new new new',35.7682840,-5.8363600,'Appartement',1,1,1,'15:00:00','11:00:00','2026-05-20','2026-05-27',NULL,NULL);
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_amenities`
--

DROP TABLE IF EXISTS `property_amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_amenities` (
  `id_property` int NOT NULL,
  `id_amenity` int NOT NULL,
  PRIMARY KEY (`id_property`,`id_amenity`),
  KEY `id_amenity` (`id_amenity`),
  CONSTRAINT `property_amenities_ibfk_1` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE,
  CONSTRAINT `property_amenities_ibfk_2` FOREIGN KEY (`id_amenity`) REFERENCES `amenities` (`id_amenity`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_amenities`
--

LOCK TABLES `property_amenities` WRITE;
/*!40000 ALTER TABLE `property_amenities` DISABLE KEYS */;
/*!40000 ALTER TABLE `property_amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_images`
--

DROP TABLE IF EXISTS `property_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_images` (
  `id_image` int NOT NULL AUTO_INCREMENT,
  `id_property` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_main` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_image`),
  KEY `id_property` (`id_property`),
  CONSTRAINT `property_images_ibfk_1` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_images`
--

LOCK TABLES `property_images` WRITE;
/*!40000 ALTER TABLE `property_images` DISABLE KEYS */;
INSERT INTO `property_images` VALUES (120,105,'/uploads/1779306108191-148802533.jpg','2026-05-20 17:41:56',1),(121,105,'/uploads/1779306108200-884175729.jpg','2026-05-20 17:41:56',0),(122,105,'/uploads/1779306108209-833894857.jpg','2026-05-20 17:41:56',0),(123,105,'/uploads/1779306108222-445381435.jpg','2026-05-20 17:41:56',0),(124,105,'/uploads/1779306108226-586444282.jpg','2026-05-20 17:41:56',0),(125,106,'/uploads/1779306227856-731765315.jpg','2026-05-20 17:43:56',1),(126,106,'/uploads/1779306227859-39919752.jpg','2026-05-20 17:43:56',0),(127,106,'/uploads/1779306227863-820454882.jpg','2026-05-20 17:43:56',0),(128,106,'/uploads/1779306227873-58974843.jpg','2026-05-20 17:43:56',0),(129,106,'/uploads/1779306227876-23060900.jpg','2026-05-20 17:43:56',0),(130,107,'/uploads/1779299670659-727508531.jpg','2026-05-20 17:54:30',1),(131,107,'/uploads/1779299670670-293454623.jpg','2026-05-20 17:54:30',0),(132,107,'/uploads/1779299670679-829832094.jpg','2026-05-20 17:54:30',0),(133,107,'/uploads/1779299670695-569047100.jpg','2026-05-20 17:54:30',0),(134,107,'/uploads/1779299670700-5711349.jpg','2026-05-20 17:54:30',0);
/*!40000 ALTER TABLE `property_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_unavailable_dates`
--

DROP TABLE IF EXISTS `property_unavailable_dates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_unavailable_dates` (
  `id_unavailable` int NOT NULL AUTO_INCREMENT,
  `id_property` int NOT NULL,
  `unavailable_date` date NOT NULL,
  `reason` varchar(100) DEFAULT 'host_blocked',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_unavailable`),
  UNIQUE KEY `unique_property_date` (`id_property`,`unavailable_date`),
  CONSTRAINT `property_unavailable_dates_property_fk` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_unavailable_dates`
--

LOCK TABLES `property_unavailable_dates` WRITE;
/*!40000 ALTER TABLE `property_unavailable_dates` DISABLE KEYS */;
/*!40000 ALTER TABLE `property_unavailable_dates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id_report` int NOT NULL AUTO_INCREMENT,
  `reporter_id` int NOT NULL,
  `reported_user_id` int DEFAULT NULL,
  `id_property` int DEFAULT NULL,
  `id_booking` int DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'other',
  `reason` text NOT NULL,
  `status` enum('pending','reviewed','dismissed','action_taken') NOT NULL DEFAULT 'pending',
  `admin_notes` text,
  `reviewed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_report`),
  KEY `idx_reports_status` (`status`),
  KEY `idx_reports_property` (`id_property`),
  KEY `idx_reports_reporter` (`reporter_id`),
  KEY `idx_reports_reported_user` (`reported_user_id`),
  KEY `reports_booking_fk` (`id_booking`),
  KEY `reports_reviewer_fk` (`reviewed_by`),
  CONSTRAINT `reports_booking_fk` FOREIGN KEY (`id_booking`) REFERENCES `bookings` (`id_booking`) ON DELETE SET NULL,
  CONSTRAINT `reports_property_fk` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE SET NULL,
  CONSTRAINT `reports_reported_user_fk` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`id_user`) ON DELETE SET NULL,
  CONSTRAINT `reports_reporter_fk` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `reports_reviewer_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (2,109,110,NULL,NULL,'safety','Hadchi mahowach hhhhh','reviewed','a sir t9awd',108,'2026-05-18 17:18:06','2026-05-18 19:44:53');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id_review` int NOT NULL AUTO_INCREMENT,
  `id_property` int DEFAULT NULL,
  `id_user` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_booking` int DEFAULT NULL,
  PRIMARY KEY (`id_review`),
  UNIQUE KEY `uq_reviews_booking_user` (`id_booking`,`id_user`),
  KEY `id_property` (`id_property`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`id_booking`) REFERENCES `bookings` (`id_booking`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('user','host','admin') DEFAULT 'user',
  `phone_number` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `profile_picture` varchar(500) DEFAULT NULL,
  `bio` text,
  `nationality` varchar(100) DEFAULT NULL,
  `languages` json DEFAULT NULL,
  `preferred_contact` varchar(50) DEFAULT NULL,
  `emergency_contact` varchar(50) DEFAULT NULL,
  `preferred_language` varchar(50) DEFAULT 'English',
  `preferred_currency` varchar(10) DEFAULT 'MAD',
  `preferred_city` varchar(100) DEFAULT NULL,
  `preferred_stay_type` varchar(100) DEFAULT NULL,
  `billing_name` varchar(150) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `billing_city` varchar(100) DEFAULT NULL,
  `billing_postal_code` varchar(30) DEFAULT NULL,
  `billing_country` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '0',
  `is_suspended` tinyint(1) NOT NULL DEFAULT '0',
  `suspension_reason` varchar(255) DEFAULT NULL,
  `suspended_at` timestamp NULL DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `phone_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verification_code_hash` varchar(64) DEFAULT NULL,
  `email_verification_expires_at` datetime DEFAULT NULL,
  `email_verification_sent_at` datetime DEFAULT NULL,
  `phone_verification_code_hash` varchar(64) DEFAULT NULL,
  `phone_verification_expires_at` datetime DEFAULT NULL,
  `phone_verification_sent_at` datetime DEFAULT NULL,
  `pending_email` varchar(255) DEFAULT NULL,
  `pending_email_verification_code_hash` varchar(64) DEFAULT NULL,
  `pending_email_verification_expires_at` datetime DEFAULT NULL,
  `pending_email_verification_sent_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  CONSTRAINT `check_email_format` CHECK (regexp_like(`email`,_utf8mb4'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')),
  CONSTRAINT `check_name_length` CHECK ((char_length(trim(`name`)) >= 5)),
  CONSTRAINT `check_phoneNumber_format` CHECK (regexp_like(`phone_number`,_utf8mb4'^\\+?[0-9]{7,15}$')),
  CONSTRAINT `users_chk_1` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (108,'ISMAIL OURDAN','ourdanismail666@gmail.com','$2b$10$B1Y2/rcliew2sazvk5TP4OXTntj86M8QNEhvf1WLLIs9D9QdEWnLS','admin','+212691756209',NULL,NULL,'new new new',NULL,NULL,NULL,NULL,'English','MAD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-12 15:28:07','2026-05-20 18:34:59',1,0,NULL,NULL,1,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(109,'Binary Insight','ismail.ourdan@etu.uae.ac.ma',NULL,'host',NULL,'2005-01-31','/uploads/1779125108871-977494807.jpg','Hello, my name is Ismail Ourdan, I am from Morocco living in the north in Tangier.','Moroccan','[\"Arabic\", \"English\", \"French\"]','Email',NULL,'English','MAD',NULL,NULL,'Binary Insight',NULL,NULL,NULL,'Morocco','2026-05-12 15:52:47','2026-05-20 17:42:57',1,0,NULL,NULL,1,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(110,'abdnour mfarrej','nillahohohaha@gmail.com',NULL,'host','+212664760037',NULL,'/uploads/1778780199169-316061576.jpg','right','Moroccan','[\"Arabic\", \"English\", \"French\", \"Spanish\"]','Email',NULL,'English','MAD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-14 12:55:39','2026-05-21 15:12:24',1,0,NULL,NULL,1,0,NULL,NULL,NULL,NULL,NULL,NULL,'nounouyou64@gmail.com','0a90bfd825e8982bd161e240b56d0d192889477781070d39f60d140ffb48ddcd','2026-05-15 21:01:26','2026-05-15 19:51:29'),(111,'Test User','testuser123@gmail.com','$2b$10$Th45g1aaqXmHy431yARBW.3Ohil/jqDue0mOVFA2g0Pget770NG0C','user','+212600000000',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'English','MAD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-15 18:05:16','2026-05-15 18:05:16',0,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(112,'testing testing','testingalles123@gmail.com',NULL,'host',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'English','MAD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-18 17:32:18','2026-05-20 18:55:05',1,1,'Fuck you','2026-05-20 18:55:05',0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(113,'Binary Insight','binaryinsight999@gmail.com',NULL,'user',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'English','MAD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-18 19:45:46','2026-05-18 19:45:46',1,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(114,'pip pop','kamirami433@gmail.com',NULL,'user','+212777849582',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'English','MAD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-21 15:15:19','2026-05-21 15:25:29',1,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-21 16:51:51
