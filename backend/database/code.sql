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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '58afab15-1d2f-11f1-a822-9a95e1033837:1-543,
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
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_booking`),
  KEY `id_property` (`id_property`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (8,92,99,'2026-05-03','2026-05-10',3500.00,'approved','2026-05-08 17:08:37','2026-05-08 17:22:39'),(9,92,99,'2026-05-03','2026-05-10',3500.00,'approved','2026-05-08 17:56:15','2026-05-08 18:58:43'),(10,88,99,'2026-05-01','2026-05-08',2800.00,'approved','2026-05-08 17:56:24','2026-05-08 17:57:27'),(11,85,99,'2026-04-30','2026-12-30',78080.00,'pending','2026-05-08 17:56:29','2026-05-08 17:56:29');
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
INSERT INTO `cities` VALUES (1,'Tangier','Tanger-Tetouan-Al Hoceima','Tangier, the gateway to Africa, is a mythical city where the Atlantic meets the Mediterranean. Known for its historical Kasbah, vibrant medina, and legendary cafes, it has long inspired artists and writers. Explore the Hercules Caves and enjoy the cosmopolitan spirit of a city that blends Moroccan tradition with international influences.'),(2,'Tetouan','Tanger-Tetouan-Al Hoceima','Tetouan, the White Dove, is a UNESCO World Heritage site known for its stunning Hispano-Moorish architecture. Nestled at the foot of the Rif Mountains, its medina is one of the most preserved in Morocco. It is a center of Andalusian culture, fine arts, and traditional craftsmanship, offering a peaceful and authentic experience.'),(3,'Chefchaouen','Tanger-Tetouan-Al Hoceima','Chefchaouen, the Blue City, is world-famous for its blue-washed buildings and narrow, winding alleys. Located high in the Rif Mountains, it offers a serene atmosphere, breathtaking mountain views, and a unique cultural heritage. From the Spanish Mosque to Ras El Ma, every corner of this city is a masterpiece of tranquility.'),(4,'Asilah','Tanger-Tetouan-Al Hoceima','Asilah, the Artistic Pearl, is a charming seaside town famous for its annual arts festival and colorful murals. Its white-washed medina, surrounded by 15th-century Portuguese walls, overlooks the turquoise waters of the Atlantic. It is the perfect destination for art lovers and those seeking a quiet, creative retreat by the sea.'),(5,'Al Hoceima','Tanger-Tetouan-Al Hoceima','Al Hoceima, the Mediterranean Jewel, is renowned for its crystal-clear bays and magnificent cliffs. Surrounded by the Rif Mountains and the Al Hoceima National Park, it offers some of the most beautiful beaches in Morocco, such as Quemado and Sfiha. It is a paradise for nature lovers, hikers, and beach seekers.'),(6,'Ajdir','Tanger-Tetouan-Al Hoceima',NULL),(7,'Belyounech','Tanger-Tetouan-Al Hoceima',NULL),(8,'Bni Bouayach','Tanger-Tetouan-Al Hoceima',NULL),(9,'Cabo Negro','Tanger-Tetouan-Al Hoceima',NULL),(10,'Fnideq','Tanger-Tetouan-Al Hoceima',NULL),(11,'Imzouren','Tanger-Tetouan-Al Hoceima',NULL),(12,'Ksar El Kebir','Tanger-Tetouan-Al Hoceima',NULL),(13,'Larache','Tanger-Tetouan-Al Hoceima',NULL),(14,'Martil','Tanger-Tetouan-Al Hoceima',NULL),(15,'M\'diq','Tanger-Tetouan-Al Hoceima',NULL),(16,'Oued Laou','Tanger-Tetouan-Al Hoceima',NULL),(17,'Ouazzane','Tanger-Tetouan-Al Hoceima',NULL),(18,'Targuist','Tanger-Tetouan-Al Hoceima',NULL);
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
  `id_user` int DEFAULT NULL,
  `id_property` int DEFAULT NULL,
  PRIMARY KEY (`id_favorite`),
  KEY `id_user` (`id_user`),
  KEY `id_property` (`id_property`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  PRIMARY KEY (`id_notification`),
  KEY `id_property` (`id_property`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
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
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
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
  PRIMARY KEY (`id_property`),
  KEY `id_city` (`id_city`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`id_city`) REFERENCES `cities` (`id_city`) ON DELETE SET NULL,
  CONSTRAINT `properties_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (23,'Sea View Apartment in Malabata','A bright apartment with sea views, modern furniture, and easy access to Tangier corniche.','Hosted by a local family who loves welcoming guests and sharing city tips.','Malabata is calm, elegant, and close to cafes, seaside walks, and transport.',1,NULL,820.00,4,'approved','2026-04-22 13:19:08','2026-04-22 13:19:08','Avenue Mohammed VI, Malabata, Tangier','Malabata','90000','Call 30 minutes before arrival. Building entrance is next to the pharmacy.',35.7712000,-5.7601000,'Apartment',2,1,3,'14:00:00','11:00:00','2026-05-01','2026-12-31'),(24,'Cozy Medina Stay in Tangier','A traditional stay inside the medina with warm decor and a peaceful reading corner.','Your host enjoys helping visitors discover old Tangier and authentic local food.','The medina is lively, historical, and perfect for travelers who want character.',1,NULL,540.00,3,'approved','2026-04-22 13:19:08','2026-04-22 13:19:08','Rue de la Kasbah, Old Medina, Tangier','Old Medina','90030','The street is narrow; arrive by taxi to the main square and walk 3 minutes.',35.7845000,-5.8123000,'Riad',1,1,2,'15:00:00','11:30:00','2026-05-10','2026-11-30'),(25,'Modern Family Flat in Tetouan Center','A spacious flat for families with clean design, natural light, and central location.','Hosted by attentive owners available for check-in support and local recommendations.','Tetouan center is practical, walkable, and close to shops and restaurants.',2,NULL,610.00,5,'approved','2026-04-22 13:19:08','2026-04-22 13:19:08','Avenue des FAR, Tetouan','City Center','93000','Use the main building elevator to the third floor. Apartment 3B.',35.5711000,-5.3684000,'Apartment',2,2,4,'13:30:00','11:00:00','2026-05-03','2026-12-20'),(26,'Quiet White House in Tetouan','A calm house with white walls, inner patio, and a cozy traditional salon.','A welcoming host offering a simple, comfortable stay for couples and families.','This neighborhood is residential, quiet, and ideal for relaxed evenings.',2,NULL,700.00,4,'approved','2026-04-22 13:19:08','2026-04-22 13:19:08','Rue Andalouse, Tetouan','Ensanche','93020','Please message before arrival. Keys are handed over by the caretaker.',35.5664000,-5.3629000,'House',2,1,3,'14:00:00','12:00:00','2026-05-15','2026-10-31'),(27,'Blue Alley Riad in Chefchaouen','A charming blue riad with rooftop seating and a beautiful mountain atmosphere.','The host is passionate about the city and can suggest walking routes and cafes.','The old blue streets are photogenic, calm in the morning, and full of charm.',3,NULL,760.00,4,'approved','2026-04-22 13:19:08','2026-04-22 13:19:08','Derb El Aasri, Chefchaouen','Medina','91000','The riad is inside the old town. Best access is from Outa El Hammam square.',35.1688000,-5.2636000,'Riad',2,1,3,'14:30:00','11:00:00','2026-05-01','2026-12-15'),(28,'Mountain View Studio in Chefchaouen','A small but elegant studio with blue accents and open views toward the hills.','Friendly host who respects privacy and provides quick communication.','A peaceful area just outside the busiest alleys, with easy walks to the center.',3,NULL,430.00,2,'approved','2026-04-22 13:19:08','2026-04-22 13:19:08','Avenue Hassan II, Chefchaouen','Upper Town','91010','Parking is nearby. The studio is on the second floor with stair access only.',35.1714000,-5.2681000,'Studio',1,1,1,'13:00:00','10:30:00','2026-05-07','2026-09-30'),(29,'Art House Near the Walls of Asilah','A stylish house inspired by Asilah murals, with bright rooms and an artistic mood.','The host is an art lover who created a relaxing and creative guest space.','Close to the old walls, galleries, and ocean breeze of Asilah.',4,NULL,680.00,4,'approved','2026-04-22 13:19:08','2026-04-22 13:19:08','Rue Bab Homar, Asilah','Old Town','90050','The house is reachable on foot from the main parking area in 4 minutes.',35.4653000,-6.0347000,'House',2,2,3,'14:00:00','11:00:00','2026-05-12','2026-11-15'),(30,'Ocean Breeze Apartment in Asilah','A peaceful apartment ideal for summer stays with soft colors and balcony light.','A responsive host available on phone and WhatsApp for support.','A seaside part of town with easy beach access and relaxed evenings.',4,NULL,590.00,3,'approved','2026-04-22 13:19:08','2026-04-22 13:19:08','Boulevard Hassan II, Asilah','Seafront','90060','Use the second entrance of the building. Security guard can guide you.',35.4679000,-6.0372000,'Apartment',1,1,2,'15:00:00','11:30:00','2026-06-01','2026-12-01'),(31,'Beachfront Escape in Al Hoceima','A refined beachfront apartment with wide windows and a direct Mediterranean feel.','Hosted by a professional and welcoming team familiar with local tourism.','A calm coastal area perfect for beach lovers and scenic sunset walks.',5,NULL,950.00,5,'approved','2026-04-22 13:19:08','2026-04-22 13:19:08','Plage Sfiha Road, Al Hoceima','Sfiha','32000','Check-in is managed at the residence gate. Please share arrival time in advance.',35.2501000,-3.9304000,'Apartment',2,2,4,'14:00:00','11:00:00','2026-05-20','2026-12-31'),(32,'Calm Retreat in Al Hoceima Hills','A quiet retreat above the city with fresh air, privacy, and modern comfort.','The host offers a smooth self-check-in process and local recommendations.','A residential hillside area with more privacy and beautiful open views.',5,NULL,720.00,4,'approved','2026-04-22 13:19:08','2026-04-22 13:19:08','Quartier Bades, Al Hoceima','Bades','32010','Self check-in available. Access code is shared on the day of arrival.',35.2476000,-3.9379000,'Villa',2,2,3,'13:30:00','11:30:00','2026-05-05','2026-10-31'),(33,'Marina Bay Apartment','Modern apartment near the marina with bright rooms and comfortable furniture.','Friendly host with quick replies.','Close to the marina, cafes, and seaside promenade.',1,NULL,780.00,4,'approved','2026-04-22 13:22:11','2026-04-22 13:22:11','Avenue Mohammed VI, Tangier','Marina','90000','Call before arrival.',35.7831000,-5.7932000,'Apartment',2,1,3,'14:00:00','11:00:00','2026-05-01','2026-12-31'),(34,'Kasbah Rooftop House','Traditional house with rooftop seating and medina atmosphere.','Local host who shares city tips.','Historic area with old streets and authentic charm.',1,NULL,690.00,5,'approved','2026-04-22 13:22:11','2026-04-22 13:22:11','Rue de la Kasbah, Tangier','Kasbah','90030','Meet host near main square.',35.7872000,-5.8142000,'House',2,2,4,'15:00:00','11:30:00','2026-05-10','2026-11-30'),(35,'Cap Spartel Escape','Elegant stay with calm design inspired by the coast.','Available by phone and WhatsApp.','Quiet coastal surroundings near Cap Spartel.',1,NULL,980.00,6,'approved','2026-04-22 13:22:11','2026-04-22 13:22:11','Route Cap Spartel, Tangier','Cap Spartel','90050','Private gate, code sent on arrival day.',35.7991000,-5.9341000,'Villa',3,2,5,'14:00:00','11:00:00','2026-05-05','2026-10-30'),(36,'Tangier Medina Studio','Compact and warm studio for couples or solo travelers.','Helpful host with flexible communication.','Inside the medina and near local shops.',1,NULL,420.00,2,'approved','2026-04-22 13:22:11','2026-04-22 13:22:11','Petit Socco, Tangier','Medina','90020','Walking access only from the square.',35.7840000,-5.8112000,'Studio',1,1,1,'13:00:00','10:30:00','2026-05-12','2026-09-30'),(37,'Iberia Family Residence','Spacious family apartment in a practical and calm district.','Professional host with smooth check-in.','Residential area with easy taxi access.',1,NULL,720.00,5,'approved','2026-04-22 13:22:11','2026-04-22 13:22:11','Quartier Iberia, Tangier','Iberia','90060','Caretaker gives keys at entrance.',35.7705000,-5.7999000,'Apartment',3,2,4,'14:00:00','11:00:00','2026-05-18','2026-12-15'),(38,'Corniche Sunset Loft','Loft-style apartment with soft sunset light and sea breeze.','Warm and welcoming host.','Near Tangier corniche and restaurants.',1,NULL,850.00,3,'approved','2026-04-22 13:22:11','2026-04-22 13:22:11','Corniche, Tangier','Corniche','90070','Use front desk for check-in.',35.7724000,-5.7610000,'Apartment',1,1,2,'15:00:00','11:00:00','2026-06-01','2026-12-31'),(39,'Malabata Premium Flat','Clean premium flat with balcony and modern kitchen.','Responsive host who can assist anytime.','Malabata is elegant and quiet.',1,NULL,910.00,4,'approved','2026-04-22 13:22:11','2026-04-22 13:22:11','Malabata Hills, Tangier','Malabata','90080','Parking available in basement.',35.7697000,-5.7588000,'Apartment',2,2,3,'14:30:00','11:00:00','2026-05-07','2026-11-20'),(40,'Old Port Charm Home','Warm home with traditional decor and medina soul.','Host loves welcoming first-time visitors.','Near the old port and medina entrances.',1,NULL,610.00,4,'approved','2026-04-22 13:22:11','2026-04-22 13:22:11','Bab Bhar, Tangier','Old Port','90010','Please arrive before 9 PM.',35.7860000,-5.8095000,'House',2,1,3,'14:00:00','11:30:00','2026-05-14','2026-10-31'),(41,'Tetouan White Loft','Bright loft with simple design and city-center convenience.','Host available for support during stay.','Central area close to markets and cafes.',2,NULL,640.00,3,'approved','2026-04-22 13:22:18','2026-04-22 13:22:18','Avenue Mohammed V, Tetouan','City Center','93000','Call on arrival.',35.5718000,-5.3701000,'Apartment',1,1,2,'14:00:00','11:00:00','2026-05-01','2026-12-31'),(42,'Andalusian Patio House','Traditional house with interior patio and peaceful family atmosphere.','Kind host with local knowledge.','Quiet old neighborhood with cultural character.',2,NULL,730.00,5,'approved','2026-04-22 13:22:18','2026-04-22 13:22:18','Rue Chakib Arsalan, Tetouan','Old Town','93010','Access by small street, walking final minute.',35.5725000,-5.3672000,'House',2,2,4,'15:00:00','11:00:00','2026-05-08','2026-11-15'),(43,'Tetouan Garden Apartment','Apartment overlooking a small garden with comfortable family layout.','Professional check-in process.','Residential area with calm evenings.',2,NULL,680.00,4,'approved','2026-04-22 13:22:18','2026-04-22 13:22:18','Quartier Wilaya, Tetouan','Wilaya','93020','Ring apartment 2A.',35.5657000,-5.3608000,'Apartment',2,1,3,'14:00:00','11:30:00','2026-05-05','2026-12-01'),(44,'Ensanche Comfort Studio','Compact studio ideal for students, couples, and short stays.','Friendly host with fast replies.','Practical district with shops nearby.',2,NULL,410.00,2,'approved','2026-04-22 13:22:18','2026-04-22 13:22:18','Avenue Chakib Arsalan, Tetouan','Ensanche','93030','Self check-in possible.',35.5689000,-5.3647000,'Studio',1,1,1,'13:00:00','10:30:00','2026-05-12','2026-09-30'),(45,'Tetouan Hills Villa','Private villa with open air, mountain views, and spacious rooms.','Available host with family-friendly approach.','Peaceful hillside area slightly away from traffic.',2,NULL,1040.00,7,'approved','2026-04-22 13:22:18','2026-04-22 13:22:18','Route Martil, Tetouan','Hillside','93040','Private entrance gate.',35.5555000,-5.3505000,'Villa',3,3,5,'14:00:00','11:00:00','2026-05-20','2026-12-31'),(46,'Medina Corner Stay Tetouan','Charming medina stay with handmade touches and local spirit.','Warm host who helps guests settle in.','Historic quarter with white walls and artisan life.',2,NULL,560.00,3,'approved','2026-04-22 13:22:18','2026-04-22 13:22:18','Bab Nouader, Tetouan','Medina','93050','Meet host at medina gate.',35.5739000,-5.3689000,'Riad',1,1,2,'14:30:00','11:00:00','2026-05-06','2026-11-10'),(47,'Family House Near Martil Road','Reliable family house with spacious salon and dining area.','Simple and helpful hosting style.','Good access for travelers with car.',2,NULL,790.00,6,'approved','2026-04-22 13:22:18','2026-04-22 13:22:18','Route Martil, Tetouan','Martil Road','93060','Parking in front of the house.',35.5620000,-5.3561000,'House',3,2,5,'14:00:00','11:00:00','2026-06-01','2026-12-20'),(48,'Tetouan Balcony Apartment','Sunny apartment with balcony and modern comfort.','Host checks in personally when possible.','Clean residential zone with good walkability.',2,NULL,620.00,4,'approved','2026-04-22 13:22:18','2026-04-22 13:22:18','Avenue Abdelkhalek Torres, Tetouan','Abdelkhalek Torres','93070','Second floor, no elevator.',35.5695000,-5.3624000,'Apartment',2,1,3,'15:00:00','11:30:00','2026-05-10','2026-10-31'),(49,'Chefchaouen Blue Pearl Riad','A classic blue-toned riad with rooftop seating and soft lighting.','Host offers local recommendations and quick support.','Medina atmosphere with iconic blue streets.',3,NULL,790.00,4,'approved','2026-04-22 13:22:25','2026-04-22 13:22:25','Outa El Hammam, Chefchaouen','Medina','91000','Meet host near main square.',35.1689000,-5.2632000,'Riad',2,1,3,'14:00:00','11:00:00','2026-05-01','2026-12-31'),(50,'Chaouen Mountain House','Peaceful mountain-facing house with authentic decor.','Calm and respectful host.','A slower area with open views and fresh air.',3,NULL,720.00,5,'approved','2026-04-22 13:22:25','2026-04-22 13:22:25','Ras El Ma, Chefchaouen','Ras El Ma','91010','House access is by stair lane.',35.1719000,-5.2604000,'House',2,2,4,'14:30:00','11:00:00','2026-05-08','2026-11-30'),(51,'Blue Door Studio','Minimal studio with classic blue accents and natural light.','Friendly host who responds quickly.','Near small shops and quiet lanes.',3,NULL,390.00,2,'approved','2026-04-22 13:22:25','2026-04-22 13:22:25','Rue Targui, Chefchaouen','Old Town','91020','Walking access only.',35.1702000,-5.2651000,'Studio',1,1,1,'13:00:00','10:30:00','2026-05-12','2026-09-15'),(52,'Chaouen Terrace Apartment','Apartment with a small terrace overlooking the blue city rooftops.','Host is available throughout the stay.','A charming section of town with calm mornings.',3,NULL,650.00,3,'approved','2026-04-22 13:22:25','2026-04-22 13:22:25','Avenue Hassan II, Chefchaouen','Upper Medina','91030','Keys delivered in person.',35.1698000,-5.2673000,'Apartment',1,1,2,'14:00:00','11:00:00','2026-05-05','2026-12-10'),(53,'Rif View Guest House','Warm guest house with mountain views and a traditional salon.','Welcoming host who enjoys meeting travelers.','Quiet edge of the medina with scenic walks.',3,NULL,840.00,6,'approved','2026-04-22 13:22:25','2026-04-22 13:22:25','Quartier Souika, Chefchaouen','Souika','91040','Please share arrival time in advance.',35.1677000,-5.2624000,'House',3,2,5,'15:00:00','11:30:00','2026-05-18','2026-10-31'),(54,'Blue Lane Hideaway','A cozy hideaway ideal for couples visiting the blue city.','Simple and kind host.','Inside the photogenic blue alleys of Chefchaouen.',3,NULL,470.00,2,'approved','2026-04-22 13:22:25','2026-04-22 13:22:25','Derb Habibi, Chefchaouen','Blue Lanes','91050','Walk from central square.',35.1683000,-5.2646000,'Apartment',1,1,1,'14:00:00','11:00:00','2026-05-09','2026-11-01'),(55,'Chefchaouen Family Riad','Family riad with multiple sleeping spaces and traditional details.','Helpful host with clear check-in communication.','Good balance between central location and calm nights.',3,NULL,910.00,7,'approved','2026-04-22 13:22:25','2026-04-22 13:22:25','Bab El Ain, Chefchaouen','Bab El Ain','91060','Host meets guests near taxi drop-off.',35.1709000,-5.2668000,'Riad',3,2,5,'14:30:00','11:00:00','2026-06-01','2026-12-31'),(56,'Chaouen Calm Apartment','Clean and comfortable apartment designed for restful stays.','Professional host with organized check-in.','Near the town center but outside the busiest lanes.',3,NULL,580.00,4,'approved','2026-04-22 13:22:25','2026-04-22 13:22:25','Avenue Moulay Ali Ben Rachid, Chefchaouen','Center','91070','Parking nearby.',35.1711000,-5.2691000,'Apartment',2,1,3,'14:00:00','11:30:00','2026-05-11','2026-12-20'),(57,'Asilah Medina Art House','Colorful artistic house inspired by the city walls and galleries.','Creative host with warm communication.','Old town charm and artistic atmosphere.',4,NULL,710.00,4,'approved','2026-04-22 13:22:43','2026-04-22 13:22:43','Rue de la Medina, Asilah','Medina','90050','Walking final 2 minutes from parking.',35.4660000,-6.0342000,'House',2,2,3,'14:00:00','11:00:00','2026-05-01','2026-12-31'),(58,'Asilah Seafront Flat','Flat with simple modern decor and quick access to the ocean.','Available host with flexible arrival.','Relaxed neighborhood close to beach walks.',4,NULL,620.00,3,'approved','2026-04-22 13:22:43','2026-04-22 13:22:43','Boulevard Hassan II, Asilah','Seafront','90060','Front desk can help after 2 PM.',35.4681000,-6.0361000,'Apartment',1,1,2,'14:30:00','11:00:00','2026-05-05','2026-11-30'),(59,'Sunset Walls Studio','Affordable studio ideal for short artistic stays.','Host responds quickly on WhatsApp.','Near historic walls and local cafes.',4,NULL,380.00,2,'approved','2026-04-22 13:22:43','2026-04-22 13:22:43','Rue Attijara, Asilah','Old Walls','90070','Use side entrance after sunset.',35.4657000,-6.0331000,'Studio',1,1,1,'13:00:00','10:30:00','2026-05-09','2026-10-31'),(60,'Asilah Garden Villa','Spacious villa with a garden and peaceful atmosphere for families.','Host ensures easy check-in and privacy.','Residential and calm with less noise.',4,NULL,1020.00,7,'approved','2026-04-22 13:22:43','2026-04-22 13:22:43','Route Briech, Asilah','Briech Road','90080','Private gate access.',35.4703000,-6.0282000,'Villa',3,3,5,'14:00:00','11:00:00','2026-05-15','2026-12-31'),(61,'Asilah White Patio Home','Elegant home with white walls, small patio, and relaxed coastal tone.','Kind host who enjoys welcoming families.','Quiet local neighborhood near the center.',4,NULL,760.00,5,'approved','2026-04-22 13:22:43','2026-04-22 13:22:43','Rue Moulay Hassan Ben Mahdi, Asilah','Center','90090','Please confirm arrival one hour before.',35.4668000,-6.0350000,'House',2,2,4,'15:00:00','11:30:00','2026-05-18','2026-11-15'),(62,'Gallery District Apartment','Comfortable apartment inspired by Asilah’s mural culture.','Professional host with clear instructions.','Artistic part of town with seasonal events.',4,NULL,590.00,4,'approved','2026-04-22 13:22:43','2026-04-22 13:22:43','Rue Ibn Battouta, Asilah','Gallery District','90100','Apartment 4C.',35.4673000,-6.0326000,'Apartment',2,1,3,'14:00:00','11:00:00','2026-06-01','2026-12-20'),(63,'Ocean Light House Asilah','A coastal home with bright rooms and warm evening light.','Welcoming host with smooth handover.','Close to the ocean and city walls.',4,NULL,830.00,6,'approved','2026-04-22 13:22:43','2026-04-22 13:22:43','Rue des Remparts, Asilah','Remparts','90110','Meet at the nearest gate.',35.4652000,-6.0358000,'House',3,2,4,'14:30:00','11:00:00','2026-05-21','2026-12-31'),(64,'Asilah Couple Retreat','A romantic compact stay for couples wanting sea and calm.','Discrete and attentive hosting.','Peaceful and walkable area.',4,NULL,450.00,2,'approved','2026-04-22 13:22:43','2026-04-22 13:22:43','Avenue Moulay Hassan, Asilah','Seaside Center','90120','Key lockbox available.',35.4671000,-6.0368000,'Apartment',1,1,1,'13:30:00','10:30:00','2026-05-07','2026-09-30'),(65,'Al Hoceima Bay Apartment','Modern apartment with sea views and a fresh Mediterranean feel.','Friendly host with organized arrivals.','Near the bay and evening restaurants.',5,NULL,860.00,4,'approved','2026-04-22 13:22:51','2026-04-22 13:22:51','Corniche Sabadia, Al Hoceima','Bay Area','32000','Call before arrival.',35.2487000,-3.9316000,'Apartment',2,1,3,'14:00:00','11:00:00','2026-05-01','2026-12-31'),(66,'Mediterranean Breeze House','Warm house with generous space and coastal air.','Calm host with local recommendations.','A residential area with sea influence and quiet nights.',5,NULL,780.00,5,'approved','2026-04-22 13:22:51','2026-04-22 13:22:51','Quartier Mirador, Al Hoceima','Mirador','32010','Please share ETA on the same day.',35.2468000,-3.9342000,'House',2,2,4,'15:00:00','11:00:00','2026-05-05','2026-11-20'),(67,'Sfiha Beach Studio','Compact studio for beach lovers and simple short stays.','Responsive host with flexible support.','Close to Sfiha beach and coastal roads.',5,NULL,420.00,2,'approved','2026-04-22 13:22:51','2026-04-22 13:22:51','Route Sfiha, Al Hoceima','Sfiha','32020','Code sent by message.',35.2512000,-3.9289000,'Studio',1,1,1,'13:00:00','10:30:00','2026-05-10','2026-09-30'),(68,'Al Hoceima Family Villa','Large villa for family stays with privacy and open space.','Helpful host with practical check-in.','Quiet residential zone ideal for groups.',5,NULL,1180.00,8,'approved','2026-04-22 13:22:51','2026-04-22 13:22:51','Route Ajdir, Al Hoceima','Ajdir Road','32030','Private gate access with caretaker.',35.2449000,-3.9403000,'Villa',4,3,6,'14:00:00','11:00:00','2026-05-15','2026-12-31'),(69,'Mirador Sea Light Apartment','Balanced and modern apartment with sea-light interiors.','Host is easy to reach and reliable.','Pleasant district with scenic viewpoints.',5,NULL,690.00,4,'approved','2026-04-22 13:22:51','2026-04-22 13:22:51','Quartier Mirador, Al Hoceima','Mirador','32040','Ring bell 5A.',35.2472000,-3.9357000,'Apartment',2,1,3,'14:30:00','11:00:00','2026-05-08','2026-12-10'),(70,'Bades Hills Retreat','Calm retreat on the hills with open views and modern comfort.','Self check-in possible.','Residential hillside with privacy and clean air.',5,NULL,740.00,4,'approved','2026-04-22 13:22:51','2026-04-22 13:22:51','Quartier Bades, Al Hoceima','Bades','32050','Access code sent on arrival day.',35.2479000,-3.9385000,'House',2,2,3,'14:00:00','11:30:00','2026-06-01','2026-12-20'),(71,'Mediterranean Pearl Flat','Bright flat designed for relaxing coastal holidays.','Warm host who knows the region well.','Walkable zone with services and views.',5,NULL,650.00,3,'approved','2026-04-22 13:22:51','2026-04-22 13:22:51','Avenue Mohammed V, Al Hoceima','Center','32060','Front desk can assist.',35.2495000,-3.9338000,'Apartment',1,1,2,'14:00:00','11:00:00','2026-05-12','2026-11-15'),(72,'Al Hoceima Coast House','Comfortable coastal house with family-friendly layout.','Simple and dependable hosting style.','Near sea roads and quiet evening surroundings.',5,NULL,830.00,6,'approved','2026-04-22 13:22:51','2026-04-22 13:22:51','Route Cala Iris, Al Hoceima','Coastal Road','32070','Parking available at property.',35.2458000,-3.9414000,'House',3,2,5,'15:00:00','11:00:00','2026-05-18','2026-12-31'),(73,'villa lelkra','villa mqawda lelkra','hayel hh','mfyka',3,NULL,900.00,6,'rejected','2026-04-22 20:38:54','2026-05-02 17:32:53','Rue Jamaa زنقة الجامع','Rif Al Andalous','91004',NULL,35.1694330,-5.2644040,'Maison',2,2,5,'15:00:00','11:00:00','2026-04-22','2026-04-29'),(74,'dar','dar eawd',NULL,NULL,1,NULL,1000.00,3,'rejected','2026-04-22 20:47:09','2026-05-02 17:32:55','Rue Mohamed Ben Hammou','Casabarata كاساباراطا','90000',NULL,35.7551010,-5.8365190,'Maison',1,1,2,'15:00:00','11:00:00','2026-04-22','2026-04-29'),(80,'White House Andalusian Style','Located in the heart of Ensanche.',NULL,NULL,2,NULL,210.00,6,'approved','2026-04-30 17:34:44','2026-05-01 14:18:44',NULL,NULL,NULL,NULL,35.5784500,-5.3683700,'House',3,2,4,NULL,NULL,'2026-05-01','2026-12-31'),(81,'Cheap Student Room','Affordable stay near university.',NULL,NULL,2,NULL,85.00,1,'approved','2026-04-30 17:34:44','2026-05-01 14:18:44',NULL,NULL,NULL,NULL,35.5784500,-5.3683700,'Apartment',1,1,1,NULL,NULL,'2026-05-01','2026-12-31'),(82,'Budget Studio near Tangier Port','Small and cozy studio for travelers.',NULL,NULL,1,NULL,150.00,2,'approved','2026-04-30 17:36:53','2026-05-01 14:18:52',NULL,NULL,NULL,NULL,35.7766000,-5.8039000,'Apartment',1,1,1,NULL,NULL,'2026-05-01','2026-12-31'),(83,'Luxury Villa with Private Pool','Stunning villa in Malabata hills.',NULL,NULL,1,NULL,450.00,8,'approved','2026-04-30 17:37:05','2026-05-01 14:18:59',NULL,NULL,NULL,NULL,35.7642000,-5.7915000,'Villa',4,3,5,NULL,NULL,'2026-05-01','2026-12-31'),(84,'Traditional Riad in Old Medina','Authentic Moroccan experience.',NULL,NULL,1,NULL,280.00,4,'approved','2026-04-30 17:37:17','2026-05-01 14:18:52',NULL,NULL,NULL,NULL,35.7766000,-5.8039000,'Riad',2,2,3,NULL,NULL,'2026-05-01','2026-12-31'),(85,'Modern Family Apartment','Spacious flat near City Center.',NULL,NULL,1,NULL,320.00,5,'approved','2026-04-30 17:37:25','2026-05-01 14:19:06',NULL,NULL,NULL,NULL,35.7595000,-5.8340000,'Apartment',2,1,4,NULL,NULL,'2026-05-01','2026-12-31'),(86,'White House Andalusian Style','Located in the heart of Ensanche.',NULL,NULL,2,NULL,210.00,6,'approved','2026-04-30 17:37:38','2026-05-01 14:18:44',NULL,NULL,NULL,NULL,35.5784500,-5.3683700,'House',3,2,4,NULL,NULL,'2026-05-01','2026-12-31'),(87,'Cheap Student Room','Affordable stay near university.',NULL,NULL,2,NULL,85.00,1,'approved','2026-04-30 17:37:43','2026-05-01 14:18:44',NULL,NULL,NULL,NULL,35.5784500,-5.3683700,'Apartment',1,1,1,NULL,NULL,'2026-05-01','2026-12-31'),(88,'ismail property','welcome brother','friendly with everyone (except Israelis)',NULL,1,98,400.00,2,'approved','2026-05-02 14:04:14','2026-05-02 17:32:58','Rue Ibn Alfarda','Casabarata كاساباراطا','90000',NULL,35.7643840,-5.8276930,'Appartement',2,2,2,'15:00:00','11:00:00','2026-05-02','2026-05-09'),(89,'dar f chaouen','dar fiha 2 tbqat...','student','wst mdina',3,NULL,800.00,6,'rejected','2026-05-02 17:11:41','2026-05-02 18:06:01','Avenue Mohamed V شارع محمد الخامس','Souk السوق','91004','dar hda lkhassa fwst lmdina',35.1680930,-5.2689180,'Maison',3,3,3,'14:00:00','00:00:00','2026-05-02','2026-05-09'),(90,'dar fchaouen','felhawma lqdima','hayel hhh',NULL,3,100,200.00,5,'approved','2026-05-03 01:23:07','2026-05-06 08:12:41','Rue Jamaa زنقة الجامع','Rif Al Andalous','91004',NULL,35.1696320,-5.2644490,'Studio',3,2,3,'16:00:00','00:00:00','2026-05-03','2026-05-14'),(91,'dar f chaouen','mfiyka gha aji bhalk dekri hh','hayel hh','fel hawma qdima',3,100,736.00,4,'rejected','2026-05-04 03:26:11','2026-05-04 19:29:05','Rue Jamaa زنقة الجامع','Rif Al Andalous','91004','hda jama3',35.1696320,-5.2644490,'Maison',2,2,3,'15:00:00','12:00:00','2026-05-04','2026-05-18'),(92,'Riad Tetouan, impressive view in north','It is a very beautiful place where you can see the nature when you take your head out of the window,\r\nwe are friendly with everyone including pets as well, there is also a praking near to the apartment (10min walking)','I am a student studying in the final year of master degree in computer science and  IT engineering. \r\nFriendly with the world.','sf baraka asahbi rah 3yit manktb',1,98,500.00,3,'approved','2026-05-04 15:14:36','2026-05-04 19:29:07','Avenue Idriss Premier','Tanger-Medina ⵟⴰⵏⵊⴰ ⵜⵉⵖⵕⵎⵜ طنجة المدينة','90030','You will drive until you reach Riad Tetouan, you will find a big building called \"Zouine Center\", that\'s it.',35.7705870,-5.8022890,'Appartement',3,2,1,'15:00:00','11:00:00','2026-05-04','2026-05-11'),(93,'Property ismail ourdan morocco','efefe fe','fe','fee fe',1,98,300.00,3,'rejected','2026-05-04 17:22:12','2026-05-04 19:29:08','Rue 5 زنقة','Bni Makada ⴱⵏⵉ ⵎⴽⴰⴷⴰ بني مكادة','90060','hello ehlloe hello hello hello',35.7564990,-5.8293090,'Appartement',2,3,2,'15:00:00','11:00:00','2026-05-12','2026-05-19'),(94,'ffefe','fdgf',NULL,NULL,1,98,300.00,1,'pending','2026-05-04 22:52:38','2026-05-04 22:52:38','Rue des Cedres','Casabarata كاساباراطا','90000','fef',35.7563320,-5.8341240,'Appartement',1,2,1,'15:00:00','11:00:00','2026-05-04','2026-05-11'),(95,'partma','mfiyka','fjbeufbae','calm',14,100,941.00,4,'pending','2026-05-06 16:11:29','2026-05-06 16:11:29','Hassan II Boulevard','Hay Miramar','93152',NULL,35.6183850,-5.2748940,'Appartement',2,1,3,'15:00:00','12:00:00','2026-05-06','2026-05-13');
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
INSERT INTO `property_amenities` VALUES (73,1),(74,1),(88,1),(89,1),(90,1),(91,1),(92,1),(93,1),(95,1),(93,2),(73,3),(74,3),(89,3),(90,3),(91,3),(92,3),(93,3),(74,4),(89,4),(91,4),(90,5),(93,5),(73,6),(74,6),(89,6),(90,6),(91,6),(92,6),(93,6),(95,6),(73,7),(89,7),(90,7),(91,7),(93,7),(73,8),(89,8),(90,8),(91,8),(92,8),(93,8),(95,8),(73,9),(91,9),(93,9),(73,10),(74,10),(88,10),(89,10),(90,10),(91,10),(92,10),(93,10),(95,10),(73,11),(74,11),(89,11),(92,11),(95,11),(74,13),(91,13),(73,14),(92,14),(93,14),(73,15),(74,15),(88,15),(91,15),(92,15),(95,15),(73,58),(88,58),(89,58),(90,58),(91,58),(92,58),(93,58),(73,59),(88,59),(89,59),(90,59),(92,59),(93,59),(94,59),(88,60),(92,60),(93,60),(89,61),(90,61),(91,61),(92,61),(93,61),(73,62),(74,62),(89,62),(93,62),(95,62),(93,63),(93,64),(73,65),(89,65),(91,65),(92,65),(93,65),(73,66),(89,66),(90,66),(91,66),(92,66),(93,66),(90,67),(93,67),(73,68),(88,68),(89,68),(92,68),(74,69),(90,69),(93,69),(73,70),(89,70),(93,70),(73,71),(89,71),(92,71),(93,71),(73,72),(74,72),(89,72),(91,72),(93,72),(73,73),(89,73),(90,73),(91,73),(93,73),(73,74),(74,74),(89,74),(91,74),(92,75),(90,76),(93,76),(93,77),(89,78),(92,78),(92,79),(90,80),(92,81),(91,82),(92,82),(73,83),(91,83),(92,83),(95,83),(73,84),(74,84),(89,84),(90,84),(92,84),(95,84),(90,85),(92,85);
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
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_images`
--

LOCK TABLES `property_images` WRITE;
/*!40000 ALTER TABLE `property_images` DISABLE KEYS */;
INSERT INTO `property_images` VALUES (19,73,'/uploads/1776890333290-808032481.jpg','2026-04-22 20:38:54',1),(20,73,'/uploads/1776890333310-131537047.jpg','2026-04-22 20:38:54',0),(21,73,'/uploads/1776890333314-443384483.png','2026-04-22 20:38:54',0),(22,73,'/uploads/1776890333333-470612306.jpg','2026-04-22 20:38:54',0),(23,74,'/uploads/1776890828438-582651807.jpg','2026-04-22 20:47:09',1),(24,74,'/uploads/1776890828455-350667203.jpg','2026-04-22 20:47:09',0),(25,74,'/uploads/1776890828457-973026062.png','2026-04-22 20:47:10',0),(26,74,'/uploads/1776890828475-903282914.jpg','2026-04-22 20:47:10',0),(27,88,'/uploads/1777730654571-284450903.jpeg','2026-05-02 14:04:14',1),(28,88,'/uploads/1777730654574-797980471.png','2026-05-02 14:04:14',0),(29,88,'/uploads/1777730654584-674622674.png','2026-05-02 14:04:14',0),(30,88,'/uploads/1777730654590-201107779.png','2026-05-02 14:04:14',0),(31,89,'/uploads/1777741901033-921125031.jpg','2026-05-02 17:11:41',1),(32,89,'/uploads/1777741901076-161699336.jpg','2026-05-02 17:11:41',0),(33,89,'/uploads/1777741901078-628554032.png','2026-05-02 17:11:41',0),(34,89,'/uploads/1777741901108-487516875.jpg','2026-05-02 17:11:41',0),(35,89,'/uploads/1777741901125-638382733.jpg','2026-05-02 17:11:41',0),(36,89,'/uploads/1777741901136-683049732.jpg','2026-05-02 17:11:41',0),(37,89,'/uploads/1777741901146-951047062.jpg','2026-05-02 17:11:42',0),(38,90,'/uploads/1777771387057-970176655.jpg','2026-05-03 01:23:07',1),(39,90,'/uploads/1777771387070-11704926.jpg','2026-05-03 01:23:07',0),(40,90,'/uploads/1777771387079-595444725.jpg','2026-05-03 01:23:07',0),(41,90,'/uploads/1777771387089-666796707.jpg','2026-05-03 01:23:07',0),(42,90,'/uploads/1777771387105-390229740.jpg','2026-05-03 01:23:07',0),(43,90,'/uploads/1777771387117-231647962.jpg','2026-05-03 01:23:07',0),(44,90,'/uploads/1777771387123-398631483.png','2026-05-03 01:23:07',0),(45,90,'/uploads/1777771387155-823830552.webp','2026-05-03 01:23:07',0),(46,91,'/uploads/1777865171403-859672510.jpg','2026-05-04 03:26:11',1),(47,91,'/uploads/1777865171421-595469910.jpg','2026-05-04 03:26:11',0),(48,91,'/uploads/1777865171425-992568699.png','2026-05-04 03:26:11',0),(49,91,'/uploads/1777865171452-812056501.jpg','2026-05-04 03:26:12',0),(50,91,'/uploads/1777865171461-24992611.jpg','2026-05-04 03:26:12',0),(51,91,'/uploads/1777865171475-134980550.jpg','2026-05-04 03:26:12',0),(52,91,'/uploads/1777865171487-264271546.jpg','2026-05-04 03:26:12',0),(53,91,'/uploads/1777865171498-406329278.jpeg','2026-05-04 03:26:12',0),(54,91,'/uploads/1777865171501-241892944.jpeg','2026-05-04 03:26:13',0),(55,92,'/uploads/1777907677178-761389426.jpg','2026-05-04 15:14:36',1),(56,92,'/uploads/1777907677197-59267788.jpg','2026-05-04 15:14:36',0),(57,92,'/uploads/1777907677204-758882053.jpg','2026-05-04 15:14:36',0),(58,92,'/uploads/1777907677211-857732187.jpg','2026-05-04 15:14:36',0),(59,92,'/uploads/1777907677220-875512120.jpg','2026-05-04 15:14:36',0),(60,93,'/uploads/1777915331985-674548339.jpg','2026-05-04 17:22:12',1),(61,93,'/uploads/1777915331989-86523694.jpg','2026-05-04 17:22:13',0),(62,93,'/uploads/1777915332013-726630688.jpg','2026-05-04 17:22:13',0),(63,93,'/uploads/1777915332043-480585437.jpg','2026-05-04 17:22:13',0),(64,93,'/uploads/1777915332047-958528066.jpg','2026-05-04 17:22:13',0),(65,94,'/uploads/1777935158180-747986862.png','2026-05-04 22:52:38',1),(66,94,'/uploads/1777935158194-86596459.jpg','2026-05-04 22:52:38',0),(67,94,'/uploads/1777935158204-328891038.jpg','2026-05-04 22:52:38',0),(68,94,'/uploads/1777935158209-386167899.jpg','2026-05-04 22:52:38',0),(69,95,'/uploads/1778083889949-607004401.jpg','2026-05-06 16:11:29',1),(70,95,'/uploads/1778083889968-19379927.jpg','2026-05-06 16:11:29',0),(71,95,'/uploads/1778083889972-817157186.png','2026-05-06 16:11:30',0),(72,95,'/uploads/1778083889999-227335446.jpg','2026-05-06 16:11:30',0);
/*!40000 ALTER TABLE `property_images` ENABLE KEYS */;
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
  KEY `id_property` (`id_property`),
  KEY `id_user` (`id_user`),
  KEY `id_booking` (`id_booking`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`id_property`) REFERENCES `properties` (`id_property`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`id_booking`) REFERENCES `bookings` (`id_booking`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,92,99,5,'Great property! The host was very helpful and the view was amazing.','2026-05-08 19:13:50',8),(2,92,98,5,'Great property! The host was very helpful and the view was amazing.','2026-05-08 19:14:40',8),(3,92,98,5,'Great property! The host was very helpful and the view was amazing.','2026-05-08 19:14:53',8),(4,92,98,5,'Great property! The host was very helpful and the view was amazing.','2026-05-08 19:14:54',8),(5,92,98,5,'Great property! The host was very helpful and the view was amazing.','2026-05-08 19:14:54',8),(6,92,98,5,'Great property! The host was very helpful and the view was amazing.','2026-05-08 19:14:54',8),(7,92,98,5,'Great property! The host was very helpful and the view was amazing.','2026-05-08 19:14:55',8);
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
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  CONSTRAINT `check_email_format` CHECK (regexp_like(`email`,_utf8mb4'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')),
  CONSTRAINT `check_name_length` CHECK ((char_length(trim(`name`)) >= 5)),
  CONSTRAINT `check_phoneNumber_format` CHECK (regexp_like(`phone_number`,_utf8mb4'^\\+?[0-9]{7,15}$')),
  CONSTRAINT `users_chk_1` CHECK ((`is_active` in (0,1))),
  CONSTRAINT `users_chk_2` CHECK ((`is_suspended` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (98,'ISMAIL OURDAN','ourdanismail666@gmail.com','$2b$10$kKEoo5dqpkuOZLJT1cyz/u9UMx2qE4HvfuEhKL/tQI/PhTlD49c2S','user','+212691756209',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'English','MAD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-02 13:53:40','2026-05-04 22:47:13',1,0,NULL,NULL),(99,'imran ourdan','binaryinsight999@gmail.com','$2b$10$Pjy57KnbapqCuqB5KUmqQ.vsb4a0cr8cEcejasx9Qmx.rIhvBKvIK','user','+212691756209',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'English','MAD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-03 18:16:03','2026-05-03 18:16:17',1,0,NULL,NULL),(100,'abdo Test','nillahohohaha@gmail.com','$2b$10$jbmTp9v.91OMJYlcCdqWcOXlqSSuMkOwAxvLzChAFjNXFpFL09nPe','host','0612345678','2006-01-08','/uploads/1778090337135-532237588.jpg','walo lhad sa3a','Moroccan','[\"Arabic\", \"English\", \"French\"]','SMS',NULL,'Arabic','EUR','Chefchaouen','Studio',NULL,NULL,NULL,NULL,NULL,'2026-05-03 23:26:44','2026-05-06 17:58:57',1,0,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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
  `admin_notes` text DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-09  9:23:28
