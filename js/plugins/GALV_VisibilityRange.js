//-----------------------------------------------------------------------------
//  Galv's Visibility Range
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_VisibilityRange.js
//-----------------------------------------------------------------------------
//  2016-12-19 - Version 1.2 - visrange now only exists when you create it
//                             instead of always.
//  2016-08-10 - Version 1.1 - fixed issue with MV 1.3 update
//  2015-12-19 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_VisibilityRange = true;

var Galv = Galv || {};        // Galv's main object
Galv.pCmd = Galv.pCmd || {};  // Plugin Command manager
Galv.VR = Galv.VR || {};      // Galv's plugin stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.2) Use an image to display a visibility range image around the player's position
 *
 * @author Galv - galvs-scripts.com
 *
 * @param Zoom Variable
 * @desc In-Game variable ID used for zooming the visibility range in and out.
 * @default 0
 *
 * @param Opacity Variable
 * @desc In-Game variable ID used for opacity of the visibility range image.
 * @default 0
 *
 * @param Z Position
 * @desc The layer the visibility image displays at. Lower if it appears above objects you dont want it to.
 * @default 10
 *
 * @help
 *   Galv's Visibility Range
 * ----------------------------------------------------------------------------
 * This plugin allows you to display a solid colour above a character with an
 * image cut out in the middle.
 * The idea is to give the impression of visibility range. This image will
 * follow the player and can zoom and change opacity by setting the variable
 * ID's in the plugin config and then using the 'Control Variables' event
 * command to change them.
 *
 * NOTE: VARIABLES ARE SET TO 0 BY DEFAULT. YOU WILL NEED TO CHANGE THEM IN
 * ORDER TO USE THIS FUNCTIONALITY.
 *
 * The Zoom variable that controls the growing/shrinking works as follows:
 * Set the variable to the desired ID you will use.
 * The zoom level is 50% + variable%.
 * For this example, assuming we set the config to use Variable #1.
 * When variable #1 is equal or less than 0, the visibility range will be
 * displayed at 50% of it's normal size. This is the smallest size possible.
 * When variable is set to 50, it will be shown at 100% (50 + 50 = 100).
 * 
 * The opacity variable can be 0 - 255 and controls how transparent the
 * visibility range is.
 *
 * The image used for the transparency is taken from:
 * YourProject/img/system/
 * And will only appear if the plugin command has created it. The visrange
 * image will persist across maps, so must be removed on maps you do not want
 * it to appear on.
 * This image must have transparency to show the map under it. You can change
 * the image during game with the plugin command found further below.
 *
 * Advanced Info:
 * The top left pixel of the graphic specifies what colour the rest of the
 * 'darkness' will be. The example image uses black with a blurred transparent
 * circle, the top left black pixel indicates the colour of the rest of the
 * surrounding.
 * ----------------------------------------------------------------------------
 *   PLUGIN COMMAND
 * ----------------------------------------------------------------------------
 *
 *   VISRANGE imageName           // set the visrange image to a new image from
 *                                // /img/system/ folder in your project.
 *                                // Make sure to have correct capitalization
 *                                // Use X for imageName to remove vis image
 *
 * Example:
 * VISRANGE VisibilityRange2    // add visrange using VisibilityRange2 image
 * VISRANGE X                   // remove visibility range
 *
 * ----------------------------------------------------------------------------
 *   SCRIPT
 * ----------------------------------------------------------------------------
 *
 *    $gameSystem.galvVis   // returns the image name of the current vis range.
 *
 */

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

// GALV'S PLUGIN MANAGEMENT. INCLUDED IN ALL GALV PLUGINS THAT HAVE PLUGIN COMMAND CALLS, BUT ONLY RUN ONCE.
if (!Galv.aliased) {
	var Galv_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		if (Galv.pCmd[command]) {
			Galv.pCmd[command](args);
			return;
		};
		Galv_Game_Interpreter_pluginCommand.call(this, command, args);
	};
	Galv.aliased = true; // Don't keep aliasing for other Galv scripts.
};

// Direct to Plugin Object
Galv.pCmd.VISRANGE = function(arguments) {
	Galv.VR.setImage(arguments[0]);
};
// END GALV'S PLUGIN MANAGEMENT


Galv.VR.setImage = function(image) {
	if (SceneManager._scene.constructor.name == 'Scene_Map') {
		if (SceneManager._scene._spriteset) SceneManager._scene._spriteset.doVisSprite(image);
	}
};


Galv.VR.zoom = Number(PluginManager.parameters('Galv_VisibilityRange')["Zoom Variable"]);
Galv.VR.opacity = Number(PluginManager.parameters('Galv_VisibilityRange')["Opacity Variable"]);
Galv.VR.z = Number(PluginManager.parameters('Galv_VisibilityRange')["Z Position"]);

//-----------------------------------------------------------------------------
// Spriteset_Map

var Galv_Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
	Galv_Spriteset_Map_createLowerLayer.call(this);
	this.doVisSprite($gameSystem.galvVis);
};

Spriteset_Map.prototype.doVisSprite = function(img) {
	if (!img || img == "X") {
		this.removeVisibilityRange();
	} else {
		this.setVisibilityRange(img);
	}
};

Spriteset_Map.prototype.setVisibilityRange = function(image) {
	$gameSystem.galvVis = image;
	if (!this._galvVisRange) {
		this._galvVisRange = new Sprite_GalvVisRange();
		this._tilemap.addChild(this._galvVisRange);
	};
};

Spriteset_Map.prototype.removeVisibilityRange = function() {
	$gameSystem.galvVis = null;
	if (this._galvVisRange) {
		this._tilemap.removeChild(this._galvVisRange);
		this._galvVisRange = null;
	};
};


//-----------------------------------------------------------------------------
// Sprite_GalvVisRange

function Sprite_GalvVisRange() {
    this.initialize.apply(this, arguments);
}

Sprite_GalvVisRange.prototype = Object.create(Sprite.prototype);
Sprite_GalvVisRange.prototype.constructor = Sprite_GalvVisRange;

Sprite_GalvVisRange.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
	this.name = null;
	this.opacity = 0;
    this.update();
};

Sprite_GalvVisRange.prototype.update = function() {
    Sprite.prototype.update.call(this);
    if (this.name != $gameSystem.galvVis) this.loadBitmap();  // If image changed, reload bitmap
	this.opacity = $gameVariables.value(Galv.VR.opacity);
	if (this.opacity <= 0) return;
	
	this.x = $gamePlayer.screenX();
	this.y = $gamePlayer.screenY() - 24;
	var zoom = Math.max($gameVariables.value(Galv.VR.zoom) * 0.01 + 0.5,0.5);
	this.scale.x = zoom;
	this.scale.y = zoom;
};

Sprite_GalvVisRange.prototype.loadBitmap = function() {
	var img = ImageManager.loadSystem($gameSystem.galvVis);
	if (img.isReady()) {
		if (this.bitmap) {
			//this._destroyCachedSprite();
			this.bitmap = null;
		};
		
		// Middle Graphic
		var tempSprite = new Sprite();
		tempSprite.bitmap = ImageManager.loadSystem($gameSystem.galvVis);
		var iw = tempSprite.bitmap.width;
		var ih = tempSprite.bitmap.height;
		var color = tempSprite.bitmap.getPixel(0,0);

		// Background Color
		this.bitmap = new Bitmap(Graphics.boxWidth * 4,Graphics.boxHeight * 4);
		this.bitmap.fillRect(0, 0, Graphics.boxWidth * 4, Graphics.boxHeight * 4, color);
	
		// Position
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this.x = $gamePlayer.screenX();
		this.y = $gamePlayer.screenY();
		this.z = Galv.VR.z;
	
		// Join Bitmaps
		var cx = ((Graphics.boxWidth * 4) / 2) - (iw / 2);
		var cy = ((Graphics.boxHeight * 4) / 2) - (ih / 2);
		this.bitmap.clearRect(cx, cy, iw, ih);
		this.bitmap.blt(tempSprite.bitmap, 0, 0, iw, ih, cx, cy);

		this.name = $gameSystem.galvVis;
	};
};
})();