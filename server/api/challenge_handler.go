package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/music-box/server/services"
)

// ChallengeHandler handles HTTP requests for challenges
type ChallengeHandler struct {
	challengeService *services.ChallengeService
}

func NewChallengeHandler(challengeService *services.ChallengeService) *ChallengeHandler {
	return &ChallengeHandler{
		challengeService: challengeService,
	}
}

// CreateChallengeRequest represents the data needed to create a challenge
type CreateChallengeRequest struct {
	PlayerID  string `json:"playerId"`
	Username  string `json:"username"`
	SongID    string `json:"songId"`
	SongTitle string `json:"songTitle"`
}

// JoinChallengeRequest represents the data needed to join a challenge
type JoinChallengeRequest struct {
	PlayerID string `json:"playerId"`
	Username string `json:"username"`
}

// SubmitRecordingRequest represents the data needed to submit a recording
type SubmitRecordingRequest struct {
	PlayerID string `json:"playerId"`
	AudioURL string `json:"audioUrl"`
}

// CreateChallenge handles creating a new challenge
func (h *ChallengeHandler) CreateChallenge(w http.ResponseWriter, r *http.Request) {
	var req CreateChallengeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	challenge, err := h.challengeService.CreateChallenge(req.PlayerID, req.Username, req.SongID, req.SongTitle)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondWithJSON(w, http.StatusCreated, challenge)
}

// JoinChallenge handles a player joining a challenge
func (h *ChallengeHandler) JoinChallenge(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	challengeID := vars["id"]

	var req JoinChallengeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	challenge, err := h.challengeService.JoinChallenge(challengeID, req.PlayerID, req.Username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondWithJSON(w, http.StatusOK, challenge)
}

// SubmitRecording handles a player submitting their recording
func (h *ChallengeHandler) SubmitRecording(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	challengeID := vars["id"]

	var req SubmitRecordingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	challenge, err := h.challengeService.SubmitRecording(challengeID, req.PlayerID, req.AudioURL)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondWithJSON(w, http.StatusOK, challenge)
}

// GetChallenge retrieves a challenge by ID
func (h *ChallengeHandler) GetChallenge(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	challengeID := vars["id"]

	challenge, err := h.challengeService.GetChallenge(challengeID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	respondWithJSON(w, http.StatusOK, challenge)
}

// ListChallenges lists all available challenges
func (h *ChallengeHandler) ListChallenges(w http.ResponseWriter, r *http.Request) {
	challenges, err := h.challengeService.ListChallenges()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondWithJSON(w, http.StatusOK, challenges)
}

// Helper function to respond with JSON
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}
