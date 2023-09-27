//-----------------------------------------------------------------------------
//  Galv's Prize Wheel
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_PrizeWheel.js
//-----------------------------------------------------------------------------
//  2017-09-26 - Version 1.3 - fixed issues created in 1.5.1 update
//  2017-04-12 - Version 1.2 - added ability to use background and foreground
//                           - pictures in the wheel scene as well as disable
//                           - default map background blur
//  2017-02-21 - Version 1.1 - fixed mouse/touch input
//  2017-02-20 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_PrizeWheel = true;

var Galv = Galv || {};                  // Galv's main object
Galv.PRIZE = Galv.PRIZE || {};          // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.3) Get random items by spinning a prize wheel
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Wheel Graphic
 * @desc The wheel graphic used for prize wheel scene from /img/pictures/
 * @default prizewheel
 * @require 1
 * @dir img/pictures/
 * @type file
 *
 * @param Wheel Y
 * @desc The distance from the top of the screen that the wheel appears at
 * @default 30
 *
 * @param Notch Graphic
 * @desc The notch graphic used for prize wheel scene from /img/pictures/
 * @default prizewheel_notch
 * @require 1
 * @dir img/pictures/
 * @type file
 *
 * @param Arrow Graphic
 * @desc The arrow graphic used for prize wheel scene from /img/pictures/
 * @default prizewheel_arrow
 * @require 1
 * @dir img/pictures/
 * @type file
 *
 * @param Notch SE
 * @desc Sound effect plays when arrow passes a notch
 * FileName,volume,pitch.
 * @default Cursor1,80,150
 *
 * @param Confirm SE
 * @desc Sound effect plays when player presses a button
 * FileName,volume,pitch.
 * @default Decision2,80,100
 *
 * @param Disable Background Blur
 * @desc true to disable the scene background blur. False to keep it enabled.
 * @default true
 *
 * @help
 *   Galv's Prize Wheel
 * ----------------------------------------------------------------------------
 * This plugin adds a new animated scene where the player spins a wheel that
 * can land on a prize from a list that you create using script calls.
 * ----------------------------------------------------------------------------
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT CALLS
 * ----------------------------------------------------------------------------
 *
 *    Galv.PRIZE.addPrizes(s,s,s);    // Adds prizes to the prize pool for the
 *                                    // next time the prize wheel is run.
 *                                    // s can be one of the following:
 *                                    // 'wx,z'   // weapon
 *                                    // 'ax,z'   // armor
 *                                    // 'ix,z'   // item
 *                                    // 'cx,z'   // custom
 *                                    // x is the item id, z is the no. gained.
 *                                    // Examples:
 *                                    // 'w12,1'  - gain 1 of weapon 12
 *                                    // 'a4,2'   - gain 2 of armor 4
 *                                    // 'i1,20'  - gain 20 of item 1
 *                                    // Custom works slightly different with x
 *                                    // being icon id and z being a string. eg
 *                                    // 'c1,Nothing'
 *
 *
 *    Galv.PRIZE.start();             // Starts the wheel spin using prizes
 *                                    // that were added previously.
 *
 *    Galv.PRIZE.give();              // gives the player the prize that was
 *                                    // landed on. Must do this else the
 *                                    // player won't receive it!
 *
 *    Galv.PRIZE.setBack('picture');  // use image from /img/pictures folder
 *                                    // for the background behind wheel
 *
 *    Galv.PRIZE.setFront('picture'); // use image from /img/pictures folder
 *                                    // for the foreground in front of wheel
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT for CONDITIONAL BRANCH or CONTROL VARIABLES
 * ----------------------------------------------------------------------------
 *
 *    Galv.PRIZE.result.isCustom        // returns true if custom prize
 *    Galv.PRIZE.result.item            // returns the resulting item (object)
 *    Galv.PRIZE.result.item.name       // returns the item name (string)
 *    Galv.PRIZE.result.item.iconIndex  // returns the item's icon id (number)
 *    Galv.PRIZE.result.item.id         // returns the item id (number)
 *    Galv.PRIZE.result.amount          // returns the amount of item (number)
 *
 * ----------------------------------------------------------------------------
 */


//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

var p = PluginManager.parameters('Galv_PrizeWheel');

Galv.PRIZE.wheelY = Number(p["Wheel Y"]);
Galv.disableBlur = p["Disable Background Blur"].toLowerCase() == 'true' ? true : false;

Galv.PRIZE.wheelimg = p["Wheel Graphic"];
Galv.PRIZE.notchimg = p["Notch Graphic"];
Galv.PRIZE.arrowimg = p["Arrow Graphic"];

Galv.PRIZE.prizes = [];
Galv.PRIZE.result = null;

Galv.PRIZE.addPrizes = function() {
	var array = arguments;
	for (var i = 0; i < array.length; i++) {
		Galv.PRIZE.prizes.push(Galv.PRIZE.obj(array[i]));
	};
};

Galv.PRIZE.removePrizes = function() {
	var array = arguments;
	for (var i = 0; i < array.length; i++) {
		var index = Galv.PRIZE.prizes.indexOf(array[i]);
		if (index >= 0) {
			Galv.PRIZE.prizes.push(Galv.PRIZE.obj(array[i]));
		}
	};
};

Galv.PRIZE.clearPrizes = function() {
	Galv.PRIZE.prizes = [];
};

Galv.PRIZE.obj = function(data) {
	var data = data.split(',');
	var string = data[0];
	var extra = data[1] || 1;
	string[0] = string[0].toLowerCase();
	switch (string[0]) {
		case 'w':
			var id = string.slice(1);
			return {item: $dataWeapons[Number(id)], amount: Number(extra)};
			break;
		case 'i':
			var id = string.slice(1);
			return {item: $dataItems[Number(id)], amount: Number(extra)};
			break;
		case 'a':
			var id = string.slice(1);
			return {item: $dataArmors[Number(id)], amount: Number(extra)};
			break;
		case 'c':
			var id = string.slice(1);
			return {item: {iconIndex: Number(id), name: extra, id: Number(id)}, isCustom: true, amount: 1};
			break;
	}
};

Galv.PRIZE.start = function() {
	if (Galv.PRIZE.prizes.length <= 0) {
		return Galv.PRIZE.result = null;
	} else {
		Galv.PRIZE.noBlur = true;
		SceneManager.push(Scene_PrizeWheel);
	}
};

Galv.PRIZE.give = function() {
	if (!Galv.PRIZE.result.isCustom) {
		var amount = Galv.PRIZE.result.amount;
		var item = Galv.PRIZE.result.item;
		$gameParty.gainItem(item,amount);
	} else {
		// custom here
	}
};

Galv.PRIZE.makeSound = function(txt) {
	if (Array.isArray(txt)) {
		var arr = txt;
	} else {
		var arr = txt.split(",");
	};
	var obj = {
		name: arr[0],
		pan: 0,
		pitch: Number(arr[2]),
		volume: Number(arr[1])
	};
	return obj;
};

Galv.PRIZE.seTick = Galv.PRIZE.makeSound(p["Notch SE"]);
Galv.PRIZE.seConfirm = Galv.PRIZE.makeSound(p["Confirm SE"]);

Galv.PRIZE.setBack = function() {
	$gameSystem._prizeWheelBack = Array.prototype.slice.call(arguments);
};

Galv.PRIZE.setFront = function() {
	$gameSystem._prizeWheelFront = Array.prototype.slice.call(arguments);
};



})();


//-----------------------------------------------------------------------------
//  GAME SYSTEM
//-----------------------------------------------------------------------------

Galv.PRIZE.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	this._prizeWheelBack = [];
	this._prizeWheelFront = [];
	Galv.PRIZE.Game_System_initialize.call(this);
};


//-----------------------------------------------------------------------------
//  SCENE PRIZE WHEEL
//-----------------------------------------------------------------------------

function Scene_PrizeWheel() {
    this.initialize.apply(this, arguments);
}

Scene_PrizeWheel.prototype = Object.create(Scene_MenuBase.prototype);
Scene_PrizeWheel.prototype.constructor = Scene_PrizeWheel;

Scene_PrizeWheel.prototype.initialize = function() {
	this.loadRequiredImages();
	Scene_ItemBase.prototype.initialize.call(this);
};

Scene_PrizeWheel.prototype.initializeSpin = function() {
	this._inputActive = false;
	this._stopping = false;
	this._end = false;
	this._timer = 0;
	this._speed = 0;
	this._targetRadian = 0;
	this._rand = 40 + Math.floor(Math.random() * 10);
	this._randSlowdown = 0.006 + Math.random() * 0.005;
};

Scene_PrizeWheel.prototype.loadRequiredImages = function() {
	Galv.PRIZE.noBlur = false;
	ImageManager.loadPicture(Galv.PRIZE.wheelimg);
	ImageManager.loadPicture(Galv.PRIZE.notchimg);
};

Scene_PrizeWheel.prototype.create = function() {
	Scene_ItemBase.prototype.create.call(this);
	this.createGraphics();
	this.initializeSpin();
	this.buildWheel();
};

Scene_PrizeWheel.prototype.update = function() {
	Scene_MenuBase.prototype.update.call(this);
	this.updateTimer();
	this.updateWheel();
	this.updateInput();
};

Scene_PrizeWheel.prototype.updateTimer = function() {
	this._timer += 1;
	if (this._stopping) {
		this._speed = Math.max(this._speed - 0.001,0);
		if (this._speed == 0) {
			this.saveResult();
			this._end = true;
			this._stopping = false;
			this._timer = 0;
		}
	} else if (this._end) {
		if (this._timer === 80) SceneManager.pop();
	} else {
		if (this._timer === 100) this._inputActive = true;
		if (this._timer > 20 && this._timer < 40) {
			this._speed += -0.0006;
		} else if (this._timer > this._rand && this._timer < 80) {
			//this._speed += 0.008;
			this._speed += this._randSlowdown;
		}
	}
};

Scene_PrizeWheel.prototype.updateWheel = function() {
	this._wheel.rotation += this._speed;
	if (this._wheel.rotation >= 6.28319) {
		// keep within 360 degrees to determine result based on radian
		this._wheel.rotation = this._wheel.rotation - 6.28319;
		this._targetRadian = 0;
	}

	if (this._wheel.rotation > this._targetRadian) {
		// when hit a notch, play SE
		this._targetRadian = this._wheel.rotation + this._gapRSize;
		AudioManager.playSe(Galv.PRIZE.seTick);
	};
};

Scene_PrizeWheel.prototype.updateInput = function() {
	if (this._inputActive && (Input.isTriggered('ok') || TouchInput.isPressed())) {
		// stop spin motion
		AudioManager.playSe(Galv.PRIZE.seConfirm);
		this._stopping = true;
		this._inputActive = false;
	};
};

Scene_PrizeWheel.prototype.createGraphics = function() {
	// background
	this._backImages = [];
	for (var i = 0; i < $gameSystem._prizeWheelBack.length; i++) {
		this._backImages[i] = new Sprite();
		this._backImages[i].bitmap = ImageManager.loadPicture($gameSystem._prizeWheelBack[i]);
		this.addChild(this._backImages[i]);
	}
	
	// wheel
	this._wheel = new Sprite();
	var wheelBitmap = ImageManager.loadPicture(Galv.PRIZE.wheelimg);
	var w = wheelBitmap.width;
	var h = wheelBitmap.height;
	this._wheel.bitmap = new Bitmap(wheelBitmap.width,wheelBitmap.height);
	this._wheel.bitmap.blt(wheelBitmap, 0, 0, w, h, 0, 0);
	
	this._wheel.x = Graphics.boxWidth / 2;
	this._wheel.y = this._wheel.bitmap.width / 2 + Galv.PRIZE.wheelY;
	this._wheel.anchor.x = 0.5;
	this._wheel.anchor.y = 0.5;
	this.addChild(this._wheel);
	
	// arrow
	this._arrow = new Sprite();
	this._arrow.bitmap = ImageManager.loadPicture(Galv.PRIZE.arrowimg);
	this._arrow.anchor.x = 0.5;
	this._arrow.x = this._wheel.x;
	this.addChild(this._arrow);
	
	// Foreground
	this._frontImages = [];
	for (var i = 0; i < $gameSystem._prizeWheelFront.length; i++) {
		this._frontImages[i] = new Sprite();
		this._frontImages[i].bitmap = ImageManager.loadPicture($gameSystem._prizeWheelFront[i]);
		this.addChild(this._frontImages[i]);
	}
};

// 360 degrees = 6.28319 radians
// 0 degrees = 0 radians
Scene_PrizeWheel.prototype.buildWheel = function() {
	var no = Galv.PRIZE.prizes.length;
	var center = this._wheel.bitmap.width / 2;

	this._prizeRadians = [];
	this._gap = 360 / no;
	this._gapRSize = this._gap * 0.0174532925;
	this._radius = center - 30;
	
	// Draw Notches
	var bitmap = ImageManager.loadPicture(Galv.PRIZE.notchimg);
	for (var i = 0; i < no; i++) {
		var angle = this.getAngle(i);
		this._prizeRadians[i] = Number(angle);
		angle = angle - 1.5708; // take 90 degrees in radians
		var x = Math.cos(angle) * this._radius + center - bitmap.width / 2;
		var y = Math.sin(angle) * this._radius + center - bitmap.height / 2;
		var w = bitmap.width;
		var h = bitmap.height;
		this.drawNotch(bitmap,x,y,w,h);
		
		var angle = this.getAngle(i + 0.5) - 1.5708; // take 90 degrees in radians
		var x = Math.cos(angle) * (center - 60) + center - bitmap.width / 2;
		var y = Math.sin(angle) * (center - 60) + center - bitmap.height / 2;
		
		this.drawIcon(Galv.PRIZE.prizes[i].item.iconIndex,x,y);
	}
};

Scene_PrizeWheel.prototype.getAngle = function(index) {
	return (this._gap * index) * 0.0174532925; // degrees to radians
};

Scene_PrizeWheel.prototype.drawNotch = function(bitmap,x,y,pw,ph) {
    this._wheel.bitmap.blt(bitmap, 0, 0, pw, ph, x, y);
};

Scene_PrizeWheel.prototype.drawIcon = function(iconIndex, x, y) {
    var bitmap = ImageManager.loadSystem('IconSet');
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    this._wheel.bitmap.blt(bitmap, sx, sy, pw, ph, x, y);
};

Scene_PrizeWheel.prototype.saveResult = function() {
	var result = null;
	var no = this._prizeRadians.length;
	for (var i = no - 1; i >= 0; i--) {
		if (this._wheel.rotation >= this._prizeRadians[i]) {
			result = Galv.PRIZE.prizes[no - 1 - i];
			break;
		};
	}
	Galv.PRIZE.result = result;
	Galv.PRIZE.clearPrizes();
};

if (Galv.disableBlur) {
Galv.PRIZE.SceneManager_snapForBackground = SceneManager.snapForBackground;
SceneManager.snapForBackground = function() {
	if (Galv.PRIZE.noBlur) {
		this._backgroundBitmap = this.snap();
	} else {
		Galv.PRIZE.SceneManager_snapForBackground.call(this);
	}
};
};