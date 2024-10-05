-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Insert sample users with plain-text passwords
INSERT INTO users (username, password) VALUES 
('user1', 'password1'),
('user2', 'password2'),
('user3', 'password3');
