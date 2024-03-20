/*
Automatically copy files from build into a dev obsidian directory.
Pair this with the hot reload community plugin during development.
 */

// todo: consider typescript

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');


const targetDir = (() => {
	const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
	const extId = manifest.id;
	const obsPluginsDir = process.env.DEV_OBS_TGT_PLUGIN_DIR;
	if (!extId || ! obsPluginsDir) {
		return null;
	}
	return path.join(obsPluginsDir, extId);
})();

if (!targetDir || !fs.existsSync(targetDir)) {
	console.error(`No id in manifest or unable to read the tgt plugin directory from env or ${targetDir} does not exist. Check env file`);
	process.exit(1);
}

console.log(`Copying from ./build to ${targetDir}`);
execSync(`cp -r ./build/* ${targetDir}`, { stdio: 'inherit' });
// Makes hotreload extension know to run
execSync(`touch ${targetDir}/.hotreload`, { stdio: 'inherit' });
