package config

import (
	"github.com/spf13/viper"
)

// Config holds all configuration for the server
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	AI       AIConfig
}

// ServerConfig holds HTTP server configuration
type ServerConfig struct {
	Port int
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// AIConfig holds AI service configuration
type AIConfig struct {
	BaseURL string
}

// LoadConfig loads configuration from environment or config file
func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AutomaticEnv()

	// Set defaults
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", 5432)
	viper.SetDefault("database.user", "postgres")
	viper.SetDefault("database.password", "postgres")
	viper.SetDefault("database.dbname", "musicbox")
	viper.SetDefault("database.sslmode", "disable")
	viper.SetDefault("ai.baseurl", "http://localhost:8000")

	if err := viper.ReadInConfig(); err != nil {
		// It's okay if config file doesn't exist
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}
