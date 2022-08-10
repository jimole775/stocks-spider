CREATE DATABASE deals IF NOT EXISTS;
USE deals;
CREATE TABLE `deal_${stock}` IF NOT EXISTS (
  id INT NOT NULL UNSIGNED AUTO_INCREMENT,
  date DATE NOT NULL,
  market TINYINT NOT NULL,
  time TIME NOT NULL,
  price INT NOT NULL,
  volumn INT NOT NULL,
  deal_type TINYINT NOT NULL,
  business_type TINYINT NOT NULL,
  highest_price INT NOT NULL,
  lowest_price INT NOT NULL,
  end_price INT NOT NULL,
  PRIMARY KEY(id)
);