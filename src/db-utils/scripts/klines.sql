CREATE DATABASE klines IF NOT EXISTS;
USE klines;
CREATE TABLE `kline_${stock}` IF NOT EXISTS (
  id INT NOT NULL UNSIGNED AUTO_INCREMENT,
  date DATE NOT NULL,
  market TINYINT NOT NULL,
  start_price FLOAT NOT NULL,
  end_price FLOAT NOT NULL,
  highest_price FLOAT NOT NULL,
  lowest_price FLOAT NOT NULL,
  volumn INT NOT NULL,
  amount DOUBLE NOT NULL,
  divid_rate FLOAT NOT NULL,
  PRIMARY KEY(id)
);
INSERT INTO `kline_${stock}` (date, market, start_price, end_price, highest_price, lowest_price, volumn, amount, divid_rate) values ()