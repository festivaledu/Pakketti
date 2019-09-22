module.exports = {
	"development": {
		"storage": "database.sqlite3",
		"dialect": "sqlite",
		"logging": false
	},
	"production": {
		"use_env_variable": true,
		"dialect": "mysql",
		"operatorAliases": false,
		"logging": false
	}
}