CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    fullName VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medication_schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    med_id INT NOT NULL,
    user_id INT NOT NULL,
    time TIME NOT NULL, -- Example: "08:00 AM"
    taken BOOLEAN DEFAULT FALSE, -- True if user marks as taken
    FOREIGN KEY (med_id) REFERENCES medications(med_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE medications (
    med_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL, -- Example: "500mg", "2 tablets"
    frequency VARCHAR(50) NOT NULL, -- Example: "Twice a day"
    start_date DATE NOT NULL,
    end_date DATE, -- NULL if indefinite
    notes TEXT, -- Additional instructions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE medication_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    med_id INT NOT NULL,
    user_id INT NOT NULL,
    taken_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT, -- Example: "Taken after breakfast"
    FOREIGN KEY (med_id) REFERENCES medications(med_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE medication_schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    med_id INT NOT NULL,
    user_id INT NOT NULL,
    time TIME NOT NULL, -- Example: "08:00 AM"
    taken BOOLEAN DEFAULT FALSE, -- True if user marks as taken
    FOREIGN KEY (med_id) REFERENCES medications(med_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
