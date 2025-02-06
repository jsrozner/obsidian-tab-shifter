# Background
- This repo originally forked from [repo](https://github.com/obsidianmd/obsidian-sample-plugin)
## Releasing new releases
1. Update manifest.json and version.json: 
	```
 	# rebuild!
 	yarn prod_all
	# first update manifest.json with min app version
 	# yarn creates a version with a v, but obsidian doesn't want that? 
	yarn version --new-version [major | minor | patch] --no-git-tag-version
	# command will modify manifest.json and versions.json appropriately
	```
	Notes on what this does / what it should do:
	 - Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
	 - Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
	 - Note on version code:
		>  You can simplify the version bump process by running `npm version patch`, `npm version minor`
		>  or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
		>  The command will bump version in `manifest.json` and `package.json`,
		>  and add the entry for the new version to `versions.json`
2. Tag and create release 
	```
	# make sure to use the correct version number
 	# this is done by the version command
	git tag <version_num, no V!>
	# pushes tag
	git push origin <version_num>
 
	# include any other files if needed
	gh release create <version_num> ./build/manifest.json ./build/main.js --title "Version <version_num>" --notes "<Version Note>"
    ```
    Notes on what this does / what it should do:
	- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
	- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
	- Publish the release.

## Adding your plugin to the community plugin list

- Check https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md
  - make src folder and change entrypoint
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## Improve code quality with eslint (optional)
- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code.
- To use eslint with this project, make sure to install eslint from terminal:
	- `npm install -g eslint`
- To use eslint to analyze this project use this command:
	- `eslint main.ts`
	- eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
	- `eslint .\src\`

# Dev setup
- symlink build dir to obsidian vault `ln -s "$(pwd)/build "...obsidian/.obsidian/plugins/_dev_plugin"`
  - note that this will have the same name as the plugin installed via community
