package services

import (
	"errors"
	"time"

	"github.com/music-box/server/models"
	"github.com/music-box/server/repository"
)

var (
	ErrChallengeNotFound       = errors.New("challenge not found")
	ErrChallengeAlreadyJoined  = errors.New("challenge already has two players")
	ErrNotYourTurn             = errors.New("not your turn to record")
	ErrPlayerAlreadyRecorded   = errors.New("player has already recorded")
	ErrChallengeCompleted      = errors.New("challenge already completed")
	ErrPlayerInActiveChallenge = errors.New("player already in active challenge")
)

// ChallengeService handles challenge business logic
type ChallengeService struct {
	challengeRepo  repository.ChallengeRepository
	scoringService *AsyncScoringService
}

func NewChallengeService(repo repository.ChallengeRepository, scoring *AsyncScoringService) *ChallengeService {
	return &ChallengeService{
		challengeRepo:  repo,
		scoringService: scoring,
	}
}

// CreateChallenge creates a new karaoke challenge
func (s *ChallengeService) CreateChallenge(creatorID, username, songID, songTitle string) (*models.Challenge, error) {
	// Check if player is already in an active challenge
	existingChallenge, _ := s.challengeRepo.GetActiveByPlayerID(creatorID)
	if existingChallenge != nil {
		return nil, ErrPlayerInActiveChallenge
	}

	challenge := models.NewChallenge(creatorID, username, songID, songTitle)
	err := s.challengeRepo.Create(challenge)
	if err != nil {
		return nil, err
	}
	return challenge, nil
}

// JoinChallenge allows a second player to join a challenge
func (s *ChallengeService) JoinChallenge(challengeID, playerID, username string) (*models.Challenge, error) {
	// Check if player is already in an active challenge
	existingChallenge, _ := s.challengeRepo.GetActiveByPlayerID(playerID)
	if existingChallenge != nil {
		return nil, ErrPlayerInActiveChallenge
	}

	challenge, err := s.challengeRepo.GetByID(challengeID)
	if err != nil {
		return nil, err
	}

	if challenge.Status != models.StatusPending {
		return nil, ErrChallengeAlreadyJoined
	}

	if challenge.Player1.ID == playerID {
		return nil, errors.New("cannot join your own challenge")
	}

	now := time.Now()
	player2 := models.Player{
		ID:        playerID,
		Username:  username,
		Status:    models.PlayerWaiting,
		CreatedAt: now,
		UpdatedAt: now,
	}

	challenge.Player2 = &player2
	challenge.Status = models.StatusActive
	challenge.CurrentTurn = challenge.Player1.ID
	challenge.Player1.Status = models.PlayerRecording
	challenge.UpdatedAt = now

	err = s.challengeRepo.Update(challenge)
	if err != nil {
		return nil, err
	}

	return challenge, nil
}

// SubmitRecording submits a player's recording for scoring
func (s *ChallengeService) SubmitRecording(challengeID, playerID, audioURL string) (*models.Challenge, error) {
	challenge, err := s.challengeRepo.GetByID(challengeID)
	if err != nil {
		return nil, err
	}

	if challenge.Status == models.StatusCompleted {
		return nil, ErrChallengeCompleted
	}

	if challenge.CurrentTurn != playerID {
		return nil, ErrNotYourTurn
	}

	// Update player status and audio URL
	var currentPlayer *models.Player
	if challenge.Player1.ID == playerID {
		currentPlayer = &challenge.Player1
	} else if challenge.Player2 != nil && challenge.Player2.ID == playerID {
		currentPlayer = challenge.Player2
	} else {
		return nil, ErrPlayerNotFound
	}

	if currentPlayer.Status == models.PlayerDone {
		return nil, ErrPlayerAlreadyRecorded
	}

	currentPlayer.Status = models.PlayerDone
	currentPlayer.AudioURL = audioURL
	currentPlayer.UpdatedAt = time.Now()

	// Submit to scoring service
	go func() {
		respChan := s.scoringService.SubmitScoring(audioURL, challenge.SongID)
		response := <-respChan

		if response.Error == nil {
			s.handleScoringComplete(challengeID, playerID, response.Score)
		}
	}()

	// Update challenge to reflect recording submission
	challenge.UpdatedAt = time.Now()

	// If this is player 1's turn, set next turn to player 2
	if challenge.Player1.ID == playerID && challenge.Player2 != nil {
		challenge.CurrentTurn = challenge.Player2.ID
		challenge.Player2.Status = models.PlayerRecording
	} else if challenge.Player2 != nil && challenge.Player2.ID == playerID {
		// This was player 2's turn, so we're waiting for scores to finalize
		challenge.CurrentTurn = ""
	}

	err = s.challengeRepo.Update(challenge)
	if err != nil {
		return nil, err
	}

	return challenge, nil
}

// handleScoringComplete updates the challenge with the player's score
func (s *ChallengeService) handleScoringComplete(challengeID, playerID string, score float64) {
	challenge, err := s.challengeRepo.GetByID(challengeID)
	if err != nil {
		return
	}

	// Update player score
	var currentPlayer *models.Player
	if challenge.Player1.ID == playerID {
		currentPlayer = &challenge.Player1
	} else if challenge.Player2 != nil && challenge.Player2.ID == playerID {
		currentPlayer = challenge.Player2
	} else {
		return
	}

	scoreValue := score
	currentPlayer.Score = &scoreValue
	challenge.UpdatedAt = time.Now()

	// Check if challenge is complete (both players have scores)
	if challenge.Player1.Score != nil && challenge.Player2 != nil && challenge.Player2.Score != nil {
		challenge.Status = models.StatusCompleted
		completedAt := time.Now()
		challenge.CompletedAt = &completedAt

		// Determine winner
		if *challenge.Player1.Score > *challenge.Player2.Score {
			challenge.WinnerID = challenge.Player1.ID
		} else if *challenge.Player2.Score > *challenge.Player1.Score {
			challenge.WinnerID = challenge.Player2.ID
		}
		// If scores are equal, it's a tie (WinnerID remains empty)
	}

	s.challengeRepo.Update(challenge)
}

// GetChallenge retrieves a challenge by ID
func (s *ChallengeService) GetChallenge(challengeID string) (*models.Challenge, error) {
	return s.challengeRepo.GetByID(challengeID)
}

// ListChallenges lists all challenges
func (s *ChallengeService) ListChallenges() ([]*models.Challenge, error) {
	return s.challengeRepo.List()
}
