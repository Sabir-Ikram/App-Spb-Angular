-- Add flights for all imported destinations (IDs 6-24)

INSERT INTO flights (departure, arrival, price, available_seats, destination_id, airline, flight_number, image_url) VALUES
-- Paris (ID 6)
('2026-01-25 08:00:00', '2026-01-25 20:00:00', 480.00, 150, 6, 'Air France', 'AF1001', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'),
('2026-01-26 14:00:00', '2026-01-26 02:00:00', 520.00, 130, 6, 'Delta Airlines', 'DL2001', 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800'),

-- New York (ID 7)
('2026-01-25 10:00:00', '2026-01-25 22:00:00', 650.00, 180, 7, 'American Airlines', 'AA3001', 'https://images.unsplash.com/photo-1583500557349-fb5238f8d946?w=800'),
('2026-01-27 16:00:00', '2026-01-28 04:00:00', 680.00, 160, 7, 'United Airlines', 'UA4001', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800'),

-- Barcelona (ID 8)
('2026-01-26 09:00:00', '2026-01-26 12:00:00', 180.00, 200, 8, 'Vueling', 'VY5001', 'https://images.unsplash.com/photo-1520483601560-4b62a51f2e80?w=800'),
('2026-01-28 15:00:00', '2026-01-28 18:00:00', 200.00, 170, 8, 'Iberia', 'IB6001', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'),

-- Dubai (ID 9)
('2026-01-27 19:00:00', '2026-01-28 07:00:00', 750.00, 140, 9, 'Emirates', 'EK7001', 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800'),
('2026-01-29 21:00:00', '2026-01-30 09:00:00', 780.00, 120, 9, 'Etihad Airways', 'EY8001', 'https://images.unsplash.com/photo-1583500557349-fb5238f8d946?w=800'),

-- Rome (ID 10)
('2026-01-28 11:00:00', '2026-01-28 14:00:00', 220.00, 190, 10, 'Alitalia', 'AZ9001', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800'),
('2026-01-30 13:00:00', '2026-01-30 16:00:00', 240.00, 175, 10, 'Lufthansa', 'LH1002', 'https://images.unsplash.com/photo-1520483601560-4b62a51f2e80?w=800'),

-- London (ID 11)
('2026-01-29 07:00:00', '2026-01-29 08:30:00', 120.00, 220, 11, 'British Airways', 'BA2002', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'),
('2026-02-01 17:00:00', '2026-02-01 18:30:00', 140.00, 200, 11, 'EasyJet', 'EJ3002', 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800'),

-- Bangkok (ID 12)
('2026-01-30 22:00:00', '2026-01-31 14:00:00', 880.00, 150, 12, 'Thai Airways', 'TG4002', 'https://images.unsplash.com/photo-1583500557349-fb5238f8d946?w=800'),
('2026-02-02 20:00:00', '2026-02-03 12:00:00', 920.00, 135, 12, 'Emirates', 'EK5002', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800'),

-- Singapore (ID 13)
('2026-02-01 23:00:00', '2026-02-02 16:00:00', 950.00, 160, 13, 'Singapore Airlines', 'SQ6002', 'https://images.unsplash.com/photo-1520483601560-4b62a51f2e80?w=800'),
('2026-02-03 01:00:00', '2026-02-03 18:00:00', 980.00, 145, 13, 'Qatar Airways', 'QR7002', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'),

-- Istanbul (ID 14)
('2026-02-02 12:00:00', '2026-02-02 16:00:00', 280.00, 180, 14, 'Turkish Airlines', 'TK8002', 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800'),
('2026-02-04 14:00:00', '2026-02-04 18:00:00', 300.00, 165, 14, 'Pegasus Airlines', 'PC9002', 'https://images.unsplash.com/photo-1583500557349-fb5238f8d946?w=800'),

-- Amsterdam (ID 15)
('2026-02-03 08:00:00', '2026-02-03 09:30:00', 110.00, 210, 15, 'KLM', 'KL1003', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800'),
('2026-02-05 16:00:00', '2026-02-05 17:30:00', 130.00, 195, 15, 'Transavia', 'HV2003', 'https://images.unsplash.com/photo-1520483601560-4b62a51f2e80?w=800'),

-- Prague (ID 16)
('2026-02-04 10:00:00', '2026-02-04 12:00:00', 150.00, 190, 16, 'Czech Airlines', 'OK3003', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'),
('2026-02-06 18:00:00', '2026-02-06 20:00:00', 170.00, 175, 16, 'Ryanair', 'FR4003', 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800'),

-- Sydney (ID 17)
('2026-02-05 20:00:00', '2026-02-06 18:00:00', 1200.00, 200, 17, 'Qantas', 'QF5003', 'https://images.unsplash.com/photo-1583500557349-fb5238f8d946?w=800'),
('2026-02-07 22:00:00', '2026-02-08 20:00:00', 1250.00, 185, 17, 'Emirates', 'EK6003', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800'),

-- Cairo (ID 18)
('2026-02-06 13:00:00', '2026-02-06 18:00:00', 380.00, 170, 18, 'EgyptAir', 'MS7003', 'https://images.unsplash.com/photo-1520483601560-4b62a51f2e80?w=800'),
('2026-02-08 15:00:00', '2026-02-08 20:00:00', 400.00, 155, 18, 'Turkish Airlines', 'TK8003', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'),

-- Rio de Janeiro (ID 19)
('2026-02-07 21:00:00', '2026-02-08 14:00:00', 980.00, 180, 19, 'LATAM', 'LA9003', 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800'),
('2026-02-09 23:00:00', '2026-02-10 16:00:00', 1020.00, 165, 19, 'Air France', 'AF1004', 'https://images.unsplash.com/photo-1583500557349-fb5238f8d946?w=800'),

-- Cancun (ID 20)
('2026-02-08 09:00:00', '2026-02-08 16:00:00', 550.00, 190, 20, 'Aeromexico', 'AM2004', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800'),
('2026-02-10 11:00:00', '2026-02-10 18:00:00', 580.00, 175, 20, 'American Airlines', 'AA3004', 'https://images.unsplash.com/photo-1520483601560-4b62a51f2e80?w=800'),

-- Bali (ID 21)
('2026-02-09 19:00:00', '2026-02-10 12:00:00', 850.00, 160, 21, 'Garuda Indonesia', 'GA4004', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'),
('2026-02-11 21:00:00', '2026-02-12 14:00:00', 890.00, 145, 21, 'Singapore Airlines', 'SQ5004', 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800'),

-- Marrakech (ID 22)
('2026-02-10 11:00:00', '2026-02-10 15:00:00', 320.00, 175, 22, 'Royal Air Maroc', 'AT6004', 'https://images.unsplash.com/photo-1583500557349-fb5238f8d946?w=800'),
('2026-02-12 13:00:00', '2026-02-12 17:00:00', 340.00, 160, 22, 'Ryanair', 'FR7004', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800'),

-- Athens (ID 23)
('2026-02-11 08:00:00', '2026-02-11 12:00:00', 250.00, 185, 23, 'Aegean Airlines', 'A38004', 'https://images.unsplash.com/photo-1520483601560-4b62a51f2e80?w=800'),
('2026-02-13 10:00:00', '2026-02-13 14:00:00', 270.00, 170, 23, 'Olympic Air', 'OA9004', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'),

-- Vienna (ID 24)
('2026-02-12 09:00:00', '2026-02-12 11:00:00', 160.00, 195, 24, 'Austrian Airlines', 'OS1005', 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800'),
('2026-02-14 15:00:00', '2026-02-14 17:00:00', 180.00, 180, 24, 'Lufthansa', 'LH2005', 'https://images.unsplash.com/photo-1583500557349-fb5238f8d946?w=800');
