-- PostgreSQL version of your schema

-- Create `users` table
CREATE TABLE users (
  userid SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  mail VARCHAR(100) NOT NULL UNIQUE,
  mobile VARCHAR(15),
  year VARCHAR(10)
);

-- Create `questions` table
CREATE TABLE questions (
  qno SERIAL PRIMARY KEY,
  question TEXT NOT NULL
);

-- Insert sample questions
INSERT INTO questions (question) VALUES
('What is your favorite book?'),
('What is your pet’s name?'),
('What was your first school?');

-- Create `organizers` table
CREATE TABLE organizers (
  orgid SERIAL PRIMARY KEY,
  orgname VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  qno INT REFERENCES questions(qno)
);

-- Insert sample organizers
INSERT INTO organizers (orgname, password, qno) VALUES
('Tech Club', 'pass123', 1),
('Cultural Club', 'pass456', 2);

-- Create `events` table
CREATE TABLE events (
  eventid INT PRIMARY KEY,
  orgid INT REFERENCES organizers(orgid),
  programme VARCHAR(100),
  catogery VARCHAR(50),
  events VARCHAR(255),
  contact VARCHAR(15),
  loc VARCHAR(100),
  rno INT,
  date DATE,
  time TIME,
  rewards TEXT,
  des TEXT,
  poster VARCHAR(255)
);

-- Insert sample events
INSERT INTO events VALUES
(201, 1, 'Annual Tech Fest', 'Technical', 'Hackathon', '9876543210', 'Main Hall', 101, '2025-07-10', '10:00:00', 'Cash prizes', 'Hackathon event for coders.', 'hackathon.png'),
(301, 2, 'Cultural Night', 'Cultural', 'Dance & Music', '9876543211', 'Auditorium', 102, '2025-07-12', '18:00:00', 'Certificates', 'Cultural showcase evening.', 'culture.png'),
(401, 3, 'Sports Day', 'Sports', 'Award Distribution', '9876543441', 'DhanChand outdoors', 000, '2025-10-12', '13:30:00', 'Certificates', 'Lets Celebrate our winners', 'sports.png');

-- Create `enrollments` table
CREATE TABLE enrollments (
  userid INT REFERENCES users(userid),
  eventid INT REFERENCES events(eventid),
  PRIMARY KEY (userid, eventid)
);

-- Insert sample user
INSERT INTO users (username, password, mail, mobile, year) VALUES
('Vinay Kumar', 'pass123', 'vinay@example.com', '9876543212', '3rd');

-- Enroll the user to an event
INSERT INTO enrollments (userid, eventid) VALUES
(1, 201);

-- Indexes
CREATE INDEX idx_users_mail ON users(mail);
CREATE INDEX idx_events_catogery ON events(catogery);
CREATE INDEX idx_events_orgid ON events(orgid);