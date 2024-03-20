// todo: make this typescript; but need diff config for tsconfig to handle modules...

import * as fs from "fs";

// we will accumulate static values
// const allExports: string[] = [];
const allExports = [];

// const exportVarAs = (varName: string, varVal: string) => {
const exportVarAs = (varName, varVal) => {
	const content = `export const ${varName} = '${varVal}';`;
	allExports.push(content);
}

const envVariable = (() => {
	let node_env = process.env.NODE_ENV;
	if (!node_env || ! ['development', 'production'].includes(node_env)) {
		console.log(`NODE_ENV not set or bad value ${node_env}; will default to production`)
		node_env = 'production';
	}
	console.log(`env value is ${node_env}`);
	return node_env;
})();


exportVarAs("NODE_ENV", envVariable);

fs.writeFileSync('src/generated/envConstants.ts', allExports.join("\n"));
