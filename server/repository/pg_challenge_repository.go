package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/music-box/server/models"
)

// PostgresChallengeRepository implements ChallengeRepository with PostgreSQL
type PostgresChallengeRepository struct {
	db *sql.DB
}

// NewPostgresChallengeRepository creates a new PostgreSQL challenge repository
func NewPostgresChallengeRepository(db *sql.DB) *PostgresChallengeRepository {
	return &PostgresChallengeRepository{
		db: db,
	}
}

// Create adds a new challenge to the database
func (r *PostgresChallengeRepository) Create(challenge *models.Challenge) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Insert challenge
	_, err = tx.Exec(`
		INSERT INTO challenges (id, song_id, song_title, status, current_turn, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, challenge.ID, challenge.SongID, challenge.SongTitle, challenge.Status,
		challenge.CurrentTurn, challenge.CreatedAt, challenge.UpdatedAt)
	if err != nil {
		return fmt.Errorf("error inserting challenge: %w", err)
	}

	// Insert player 1
	_, err = tx.Exec(`
		INSERT INTO players (id, challenge_id, username, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, challenge.Player1.ID, challenge.ID, challenge.Player1.Username,
		challenge.Player1.Status, challenge.Player1.CreatedAt, challenge.Player1.UpdatedAt)
	if err != nil {
		return fmt.Errorf("error inserting player: %w", err)
	}

	return tx.Commit()
}

// GetByID retrieves a challenge by its ID
func (r *PostgresChallengeRepository) GetByID(id string) (*models.Challenge, error) {
	// Get challenge data
	var challenge models.Challenge
	var currentTurn sql.NullString
	var winnerID sql.NullString
	var completedAt sql.NullTime

	err := r.db.QueryRow(`
		SELECT id, song_id, song_title, status, current_turn, winner_id, created_at, updated_at, completed_at
		FROM challenges
		WHERE id = $1
	`, id).Scan(
		&challenge.ID, &challenge.SongID, &challenge.SongTitle, &challenge.Status,
		&currentTurn, &winnerID, &challenge.CreatedAt, &challenge.UpdatedAt, &completedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrChallengeNotFound
		}
		return nil, fmt.Errorf("error querying challenge: %w", err)
	}

	if currentTurn.Valid {
		challenge.CurrentTurn = currentTurn.String
	}
	if winnerID.Valid {
		challenge.WinnerID = winnerID.String
	}
	if completedAt.Valid {
		challenge.CompletedAt = &completedAt.Time
	}

	// Get players
	rows, err := r.db.Query(`
		SELECT id, username, status, score, audio_url, created_at, updated_at
		FROM players
		WHERE challenge_id = $1
	`, id)
	if err != nil {
		return nil, fmt.Errorf("error querying players: %w", err)
	}
	defer rows.Close()

	var players []models.Player
	for rows.Next() {
		var player models.Player
		var score sql.NullFloat64
		var audioURL sql.NullString

		err := rows.Scan(
			&player.ID, &player.Username, &player.Status,
			&score, &audioURL, &player.CreatedAt, &player.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning player: %w", err)
		}

		if score.Valid {
			scoreVal := score.Float64
			player.Score = &scoreVal
		}
		if audioURL.Valid {
			player.AudioURL = audioURL.String
		}

		players = append(players, player)
	}

	if len(players) == 0 {
		return nil, fmt.Errorf("challenge has no players")
	}

	// Assign players to challenge
	for _, player := range players {
		if player.ID == challenge.Player1.ID {
			challenge.Player1 = player
		} else {
			playerCopy := player
			challenge.Player2 = &playerCopy
		}
	}

	return &challenge, nil
}

// Update updates an existing challenge
func (r *PostgresChallengeRepository) Update(challenge *models.Challenge) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Update challenge
	_, err = tx.Exec(`
		UPDATE challenges
		SET song_id = $1, song_title = $2, status = $3, current_turn = $4, 
		    winner_id = $5, updated_at = $6, completed_at = $7
		WHERE id = $8
	`, challenge.SongID, challenge.SongTitle, challenge.Status,
		challenge.CurrentTurn, challenge.WinnerID, challenge.UpdatedAt,
		challenge.CompletedAt, challenge.ID)
	if err != nil {
		return fmt.Errorf("error updating challenge: %w", err)
	}

	// Update player 1
	_, err = tx.Exec(`
		UPDATE players
		SET username = $1, status = $2, score = $3, audio_url = $4, updated_at = $5
		WHERE id = $6 AND challenge_id = $7
	`, challenge.Player1.Username, challenge.Player1.Status, challenge.Player1.Score,
		challenge.Player1.AudioURL, challenge.Player1.UpdatedAt,
		challenge.Player1.ID, challenge.ID)
	if err != nil {
		return fmt.Errorf("error updating player 1: %w", err)
	}

	// Update or insert player 2 if exists
	if challenge.Player2 != nil {
		var count int
		err = tx.QueryRow(`
			SELECT COUNT(*) FROM players
			WHERE id = $1 AND challenge_id = $2
		`, challenge.Player2.ID, challenge.ID).Scan(&count)
		if err != nil {
			return fmt.Errorf("error checking player 2: %w", err)
		}

		if count > 0 {
			// Update existing player 2
			_, err = tx.Exec(`
				UPDATE players
				SET username = $1, status = $2, score = $3, audio_url = $4, updated_at = $5
				WHERE id = $6 AND challenge_id = $7
			`, challenge.Player2.Username, challenge.Player2.Status, challenge.Player2.Score,
				challenge.Player2.AudioURL, challenge.Player2.UpdatedAt,
				challenge.Player2.ID, challenge.ID)
			if err != nil {
				return fmt.Errorf("error updating player 2: %w", err)
			}
		} else {
			// Insert new player 2
			_, err = tx.Exec(`
				INSERT INTO players (id, challenge_id, username, status, score, audio_url, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			`, challenge.Player2.ID, challenge.ID, challenge.Player2.Username,
				challenge.Player2.Status, challenge.Player2.Score, challenge.Player2.AudioURL,
				challenge.Player2.CreatedAt, challenge.Player2.UpdatedAt)
			if err != nil {
				return fmt.Errorf("error inserting player 2: %w", err)
			}
		}
	}

	return tx.Commit()
}

// List retrieves all challenges
func (r *PostgresChallengeRepository) List() ([]*models.Challenge, error) {
	// Get all challenge IDs
	rows, err := r.db.Query(`
		SELECT id FROM challenges ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("error querying challenges: %w", err)
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("error scanning challenge ID: %w", err)
		}
		ids = append(ids, id)
	}

	// Get full details for each challenge
	challenges := make([]*models.Challenge, 0, len(ids))
	for _, id := range ids {
		challenge, err := r.GetByID(id)
		if err != nil {
			return nil, fmt.Errorf("error getting challenge %s: %w", id, err)
		}
		challenges = append(challenges, challenge)
	}

	return challenges, nil
}

// GetActiveByPlayerID finds active challenges for a player
func (r *PostgresChallengeRepository) GetActiveByPlayerID(playerID string) (*models.Challenge, error) {
	var challengeID string
	err := r.db.QueryRow(`
		SELECT c.id 
		FROM challenges c
		JOIN players p ON c.id = p.challenge_id
		WHERE p.id = $1 AND c.status != $2
		LIMIT 1
	`, playerID, models.StatusCompleted).Scan(&challengeID)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrChallengeNotFound
		}
		return nil, fmt.Errorf("error finding active challenge: %w", err)
	}

	return r.GetByID(challengeID)
}
