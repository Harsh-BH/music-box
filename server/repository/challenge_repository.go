package repository

import (
	"errors"
	"sync"
	"time"

	"github.com/music-box/server/models"
)

var (
	ErrChallengeNotFound = errors.New("challenge not found")
	ErrChallengeExists   = errors.New("challenge already exists")
	ErrPlayerNotFound    = errors.New("player not found in challenge")
)

// ChallengeRepository defines the interface for challenge data operations
type ChallengeRepository interface {
	Create(challenge *models.Challenge) error
	GetByID(id string) (*models.Challenge, error)
	Update(challenge *models.Challenge) error
	List() ([]*models.Challenge, error)
	GetActiveByPlayerID(playerID string) (*models.Challenge, error)
}

// InMemoryChallengeRepository implements ChallengeRepository with in-memory storage
type InMemoryChallengeRepository struct {
	challenges map[string]*models.Challenge
	mutex      sync.RWMutex
}

func NewInMemoryChallengeRepository() *InMemoryChallengeRepository {
	return &InMemoryChallengeRepository{
		challenges: make(map[string]*models.Challenge),
	}
}

func (r *InMemoryChallengeRepository) Create(challenge *models.Challenge) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.challenges[challenge.ID]; exists {
		return ErrChallengeExists
	}

	r.challenges[challenge.ID] = challenge
	return nil
}

func (r *InMemoryChallengeRepository) GetByID(id string) (*models.Challenge, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	challenge, exists := r.challenges[id]
	if !exists {
		return nil, ErrChallengeNotFound
	}

	return challenge, nil
}

func (r *InMemoryChallengeRepository) Update(challenge *models.Challenge) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.challenges[challenge.ID]; !exists {
		return ErrChallengeNotFound
	}

	challenge.UpdatedAt = time.Now()
	r.challenges[challenge.ID] = challenge
	return nil
}

func (r *InMemoryChallengeRepository) List() ([]*models.Challenge, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	challenges := make([]*models.Challenge, 0, len(r.challenges))
	for _, challenge := range r.challenges {
		challenges = append(challenges, challenge)
	}

	return challenges, nil
}

func (r *InMemoryChallengeRepository) GetActiveByPlayerID(playerID string) (*models.Challenge, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	for _, challenge := range r.challenges {
		if challenge.Status != models.StatusCompleted {
			if challenge.Player1.ID == playerID {
				return challenge, nil
			}
			if challenge.Player2 != nil && challenge.Player2.ID == playerID {
				return challenge, nil
			}
		}
	}

	return nil, ErrChallengeNotFound
}
