import { config } from 'dotenv';

// singleton!
let env: EnvVars | null = null;

export interface EnvVars {
	NODE_ENV: 'development' | 'production';
	// make it easy to check if dev
	dev: boolean;
}

const validateEnv = (e: EnvVars) => {
	if (!e.NODE_ENV || ! ['development', 'production'].includes(e.NODE_ENV)) {
		console.log(`NODE_ENV not set or bad value ${e.NODE_ENV}; will default to production`)
		e.NODE_ENV = 'production';
	}
	e.dev = e.NODE_ENV === 'development';
}

export const getEnvVars = (): EnvVars => {
	if (env === null) {
		config(); // Load variables from .env into process.env
		env = process.env as unknown as EnvVars; // Cast process.env to EnvVars type
		validateEnv(env);
	}
	return env;
}
