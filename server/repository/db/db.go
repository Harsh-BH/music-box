package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// Config holds database connection parameters
type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// NewConnection creates a new database connection
func NewConnection(config *Config) (*sql.DB, error) {
	connStr := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode,
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database connection: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to database: %w", err)
	}

	log.Println("Connected to database successfully")
	return db, nil
}

// MigrateTables creates necessary tables if they don't exist
func MigrateTables(db *sql.DB) error {
	// Create challenges table
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS challenges (
			id VARCHAR(36) PRIMARY KEY,
			song_id VARCHAR(255) NOT NULL,
			song_title VARCHAR(255) NOT NULL,
			status VARCHAR(20) NOT NULL,
			current_turn VARCHAR(36),
			winner_id VARCHAR(36),
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL,
			completed_at TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating challenges table: %w", err)
	}

	// Create players table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS players (
			id VARCHAR(36) NOT NULL,
			challenge_id VARCHAR(36) NOT NULL,
			username VARCHAR(255) NOT NULL,
			status VARCHAR(20) NOT NULL,
			score FLOAT,
			audio_url TEXT,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL,
			PRIMARY KEY (id, challenge_id),
			FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating players table: %w", err)
	}

	return nil
}
