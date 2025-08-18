package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gorilla/mux"
	"github.com/music-box/server/api"
	"github.com/music-box/server/config"
	"github.com/music-box/server/repository"
	"github.com/music-box/server/repository/db"
	"github.com/music-box/server/routes"
	"github.com/music-box/server/services"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to database
	dbCfg := &db.Config{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		DBName:   cfg.Database.DBName,
		SSLMode:  cfg.Database.SSLMode,
	}

	database, err := db.NewConnection(dbCfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run migrations
	if err := db.MigrateTables(database); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Create router
	router := mux.NewRouter()

	// Setup API
	setupChallengeAPI(router, database, cfg.AI.BaseURL)

	// Start server
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Server.Port),
		Handler: router,
	}

	// Handle graceful shutdown
	go func() {
		stop := make(chan os.Signal, 1)
		signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
		<-stop
		log.Println("Shutting down server...")
		if err := server.Close(); err != nil {
			log.Printf("Error shutting down server: %v", err)
		}
	}()

	log.Printf("Server started on port %d", cfg.Server.Port)
	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupChallengeAPI(router *mux.Router, database *sql.DB, aiBaseURL string) {
	// Initialize repositories
	challengeRepo := repository.NewPostgresChallengeRepository(database)

	// Initialize services
	fastAPIScoringService := services.NewFastAPIScoringService(aiBaseURL)
	asyncScoring := services.NewAsyncScoringService(fastAPIScoringService)
	challengeService := services.NewChallengeService(challengeRepo, asyncScoring)

	// Initialize handlers
	challengeHandler := api.NewChallengeHandler(challengeService)

	// Register routes
	routes.RegisterChallengeRoutes(router, challengeHandler)
}
