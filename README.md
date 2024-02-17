# Tab shifter

This is a tab shifting plugin that behaves similarly to tab-shifters in 
code editors. It has the same behavior as, e.g., the tab-shifter plugin for WebStorm.

Tabs can be either moved to the previous or to the next "tab group".

## Caveats
### Unofficial API
This plugin does not use an official API. Instead, it reads properties from
the leaf (tab) and tabs (tab "groups") objects that seem always to be present.
It does work currently, but it will break if those properties go away. 

You can see what properties we assume are present in `typesUnofficial.ts`.

### Logic
To decide which tab group to move a tab to: 
We trust that the order of existing leaves (tabs) matches the
order of the tab groups. In my experience this is usually true, but
it might behave weirdly if you have a ton of splits. (The other way to do this 
would have been to recalculate the view tree, but that's more complex and has
thus far seemed unnecessary!)

### Support
- I set this to DesktopOnly because I do not know whether the logic will work 
on mobile. If you'd like it to be available on mobile, please test that it works
and then file a feature req.

- Currently this processes tab groups only if they contain open markdown files.
We could support other types.
