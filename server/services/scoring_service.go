package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

// ScoringService defines the interface for the AI scoring pipeline
type ScoringService interface {
	ScoreAudio(audioPath string, songID string) (float64, error)
}

// FastAPIScoringService is an implementation that calls an external FastAPI server
type FastAPIScoringService struct {
	baseURL    string
	httpClient *http.Client
}

// NewFastAPIScoringService creates a new FastAPI scoring service client
func NewFastAPIScoringService(baseURL string) *FastAPIScoringService {
	return &FastAPIScoringService{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ScoreRequest represents the request body for the scoring API
type ScoreRequest struct {
	AudioURL string `json:"audio_url"`
	SongID   string `json:"song_id"`
}

// ScoreResponse represents the response from the scoring API
type ScoreResponse struct {
	Score float64 `json:"score"`
	Error string  `json:"error,omitempty"`
}

// ScoreAudio sends the audio to the FastAPI server for scoring
func (s *FastAPIScoringService) ScoreAudio(audioURL string, songID string) (float64, error) {
	if audioURL == "" {
		return 0, errors.New("audio URL cannot be empty")
	}

	reqBody, err := json.Marshal(ScoreRequest{
		AudioURL: audioURL,
		SongID:   songID,
	})
	if err != nil {
		return 0, fmt.Errorf("error marshaling request: %w", err)
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/score", s.baseURL), bytes.NewBuffer(reqBody))
	if err != nil {
		return 0, fmt.Errorf("error creating request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("error sending request to AI service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("AI service returned non-OK status: %d", resp.StatusCode)
	}

	var scoreResp ScoreResponse
	if err := json.NewDecoder(resp.Body).Decode(&scoreResp); err != nil {
		return 0, fmt.Errorf("error decoding response: %w", err)
	}

	if scoreResp.Error != "" {
		return 0, errors.New(scoreResp.Error)
	}

	return scoreResp.Score, nil
}

// AIScoreRequest represents a request to the AI scoring pipeline
type AIScoreRequest struct {
	AudioPath string
	SongID    string
}

// AIScoreResponse represents a response from the AI scoring pipeline
type AIScoreResponse struct {
	Score float64
	Error error
}

// AsyncScoringService processes scoring requests asynchronously
type AsyncScoringService struct {
	scoringService ScoringService
	requestQueue   chan AIScoreRequest
	responseMap    map[string]chan AIScoreResponse
}

func NewAsyncScoringService(scoringService ScoringService) *AsyncScoringService {
	service := &AsyncScoringService{
		scoringService: scoringService,
		requestQueue:   make(chan AIScoreRequest, 100),
		responseMap:    make(map[string]chan AIScoreResponse),
	}

	go service.processQueue()
	return service
}

func (s *AsyncScoringService) processQueue() {
	for req := range s.requestQueue {
		score, err := s.scoringService.ScoreAudio(req.AudioPath, req.SongID)
		if respChan, exists := s.responseMap[req.AudioPath]; exists {
			respChan <- AIScoreResponse{Score: score, Error: err}
			close(respChan)
			delete(s.responseMap, req.AudioPath)
		}
	}
}

func (s *AsyncScoringService) SubmitScoring(audioPath, songID string) <-chan AIScoreResponse {
	respChan := make(chan AIScoreResponse, 1)
	s.responseMap[audioPath] = respChan
	s.requestQueue <- AIScoreRequest{AudioPath: audioPath, SongID: songID}
	return respChan
}
