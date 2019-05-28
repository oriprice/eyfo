# Eyfo
Browser extension (Chrome) to find github packages within predefined organizations, and globally.

* Find npm package within multiple organizations.
* Find best matching github global repository. 
* Caching searches for fast future searches

## Install on Chrome
* Install Eyfo from [Chrome Web Store](https://chrome.google.com/webstore/detail/eyfo/kfndjpohnlhfifjmdmbddfnedicmlaif)
* All organizations you belong to will be configured automatically (see [Configurations](#configurations) for more details).

## Search for a package
* Open the extension (see shortcuts below) and start typing the package you would like to search.
* Scoped packages are supported both `@[scope]/[package_name]` and `[package_name]` will work.
* Hit `TAB` to search global repository (outside of the organization).
* Cached result will appear in a list below.

## Configurations
All organizations you belong to will be configured automatically.
You can modify organizations list through extension settings.
  * <b>Import</b> - click on import button to reload all you organizaions.
  * <b>Drag & Drop</b> - use Drag & Drop to re-order organization list to 
    get better results (search is looking on each organizazation 1 by 1 top to bottom)
  * <b>Add / Remove</b> - you can manually Add (one by one OR csv string format) or Remove oraganizations from the list 

## Hotkeys
<b>windows</b>: `Ctrl`+`Shift`+`A`<br/>
<b>mac</b>: `Command`+`Shift`+`A`<br/>
<b>chromeos</b>: `Ctrl`+`Shift`+`A`<br/>
<b>linux</b>: `Ctrl`+`Shift`+`A`<br/>

## Firefox Support
This extension can be run on Firefox, but it is not yet published in [addons.mozilla.org](https://addons.mozilla.org).

Until it is published, you can build your own version and install it locally. It is actually quite simple - just follow these steps:
 
 To begin, you need to have [node.js](https://nodejs.org) installed,
 and you need to have an account in [addons.mozilla.org](https://addons.mozilla.org).
 
 First, create credentials in [addons.mozilla.org credentials](https://addons.mozilla.org/en-US/developers/addon/api/key/).
 
 Now, clone this repo, open a command shell in its directory and run these commands:
 ```bash
npm install -g web-ext 
npm install
npm run build
cd dist
web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET 
```

> Note: You need to replace `$AMO_JWT_ISSUER` and `$AMO_JWT_SECRET` with the credentials you created.

After these commands are executed, an **eyfo xpi file** is created under `dist/web-ext-artifacts`.
Now you can simply go to your Firefox and select **File -> Open File... (⌘O)** and open this xpi file,
which will install it in your Firefox.

> Note: The shortcut used by **eyfo** to open its search window (`Ctrl+Shift+A` on Windows, `Command+Shift+A` on Mac)
is used by Firefox to open its add-ons page.
Until Firefox [enables users to customize add-ons keyboard shortcuts](https://www.ghacks.net/2019/01/16/manage-firefox-add-ons-keyboard-shortcuts-on-aboutaddons/),
if you want to have a keyboard shortcut for **eyfo**, you can edit the [src/manifest.json](blob/master/src/manifest.json) file
(before you build the plugin) and set the required shortcut under `commands._execute_browser_action.suggested_key`.