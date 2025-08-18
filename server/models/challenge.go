package models

import (
	"time"

	"github.com/google/uuid"
)

type ChallengeStatus string

const (
	StatusPending   ChallengeStatus = "pending"   // waiting for second player
	StatusActive    ChallengeStatus = "active"    // in progress
	StatusCompleted ChallengeStatus = "completed" // challenge completed
)

type PlayerStatus string

const (
	PlayerWaiting   PlayerStatus = "waiting"   // waiting for turn
	PlayerRecording PlayerStatus = "recording" // currently recording
	PlayerDone      PlayerStatus = "done"      // finished recording
)

type Player struct {
	ID        string       `json:"id"`
	Username  string       `json:"username"`
	Status    PlayerStatus `json:"status"`
	Score     *float64     `json:"score,omitempty"` // nil until scored
	AudioURL  string       `json:"audioUrl,omitempty"`
	CreatedAt time.Time    `json:"createdAt"`
	UpdatedAt time.Time    `json:"updatedAt"`
}

type Challenge struct {
	ID          string          `json:"id"`
	SongID      string          `json:"songId"`
	SongTitle   string          `json:"songTitle"`
	Status      ChallengeStatus `json:"status"`
	Player1     Player          `json:"player1"`
	Player2     *Player         `json:"player2,omitempty"`     // nil until joined
	CurrentTurn string          `json:"currentTurn,omitempty"` // player ID
	WinnerID    string          `json:"winnerId,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
	CompletedAt *time.Time      `json:"completedAt,omitempty"`
}

func NewChallenge(creatorID, username, songID, songTitle string) *Challenge {
	now := time.Now()
	return &Challenge{
		ID:        uuid.New().String(),
		SongID:    songID,
		SongTitle: songTitle,
		Status:    StatusPending,
		Player1: Player{
			ID:        creatorID,
			Username:  username,
			Status:    PlayerWaiting,
			CreatedAt: now,
			UpdatedAt: now,
		},
		CreatedAt: now,
		UpdatedAt: now,
	}
}
