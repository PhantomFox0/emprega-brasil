CREATE DATABASE IF NOT EXISTS perfil_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE perfil_db;

CREATE TABLE IF NOT EXISTS perfis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefone VARCHAR(30) DEFAULT NULL,
  escolaridade VARCHAR(120) DEFAULT NULL,
  carreira VARCHAR(120) DEFAULT NULL,
  area_interesse VARCHAR(120) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  habilidades_texto TEXT DEFAULT NULL,
  competencias_tecnicas JSON DEFAULT NULL,
  competencias_comportamentais JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO perfis (nome, email, telefone, escolaridade, carreira, area_interesse, avatar_url, habilidades_texto, competencias_tecnicas, competencias_comportamentais)
VALUES ('Ana Clara Silva', 'ana.silva@exemplo.com', '(11) 99999-0000', 'Superior Completo', 'Analista de Dados', 'Inteligência de Negócios e Backend', 'https://exemplo.com/avatar.png', 'Experiência prática em análise exploratória, dashboards e resolução de problemas.', JSON_ARRAY('Excel', 'Java', 'Python', 'Análise de Dados'), JSON_ARRAY('Trabalho em Equipe', 'Proatividade', 'Pensamento Crítico'))
ON DUPLICATE KEY UPDATE email = email;
