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
