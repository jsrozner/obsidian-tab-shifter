import {NODE_ENV} from "./generated/envConstants";

// singleton!
let env: EnvVars | null = null;

export interface EnvVars {
	NODE_ENV: 'development' | 'production';
	// make it easy to check if dev
	prod: boolean;
}

export const getEnvVars = (): EnvVars => {
	if (env === null) {
		env = {
			NODE_ENV: NODE_ENV,
			//@ts-ignore
			prod: (NODE_ENV === 'production')
		}
	}
	return env;
}
