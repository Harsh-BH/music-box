package routes

import (
	"github.com/gorilla/mux"
	"github.com/music-box/server/api"
)

// RegisterChallengeRoutes registers all challenge-related routes
func RegisterChallengeRoutes(router *mux.Router, challengeHandler *api.ChallengeHandler) {
	// Challenge endpoints
	router.HandleFunc("/api/challenges", challengeHandler.CreateChallenge).Methods("POST")
	router.HandleFunc("/api/challenges", challengeHandler.ListChallenges).Methods("GET")
	router.HandleFunc("/api/challenges/{id}", challengeHandler.GetChallenge).Methods("GET")
	router.HandleFunc("/api/challenges/{id}/join", challengeHandler.JoinChallenge).Methods("POST")
	router.HandleFunc("/api/challenges/{id}/record", challengeHandler.SubmitRecording).Methods("POST")
}
