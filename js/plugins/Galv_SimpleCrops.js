//-----------------------------------------------------------------------------
//  Galv's Simple Crops
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_SimpleCrops.js
//-----------------------------------------------------------------------------
//  2017-10-25 - Version 1.4 - tweaked for compatibility
//  2017-10-12 - Version 1.3 - added watering info to documentation and also a
//                             'water all' script call.
//  2017-05-06 - Version 1.2 - added plugin setting for fixing the lower/front
//                             priority when activating CROP events only.
//  2016-12-14 - Version 1.1 - added priority types to growth stages of crops
//  2016-11-20 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_SimpleCrops = true;

var Galv = Galv || {};                  // Galv's main object
Galv.CROPS = Galv.CROPS || {};          // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.4) A simple farming/growing crop system.
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Crop Charset Name
 * @desc All crops use charsets named this which will be followed by an imgId selection number.
 * @default !Crops
 *
 * @param Watered Time
 * @desc The number of seconds/varDays a crop remains watered for before drying out and can be watered again
 * @default 60
 *
 * @param Watered Benefit
 * @desc The number of seconds/varDays removed from a crop's grow time when watered.
 * @default 5
 *
 * @param Crop Priority
 * @desc Change priority during growth. 0 under, 1 same as player
 * empty,seed,sprouting,halfGrown,fullGrown
 * @default 0,0,1,1,1
 *
 * @param Crop Under or Front Fix
 * @desc true or false - use a fix that prioritises crop in front when interacting instead of crop under.
 * @default true
 *
 * @help
 *   Galv's Simple Crops
 * ----------------------------------------------------------------------------
 * This plugin allows the player to plant and grow crops in designated plots
 * by selecting seeds from their inventory. It's labelled as simple crops
 * because the gameplay is simple, not because it's simple to set up. You'll
 * need to use eventing to control how it works.
 *
 * Creating Plots
 * --------------
 * Events can become plots by adding a <crop> tag to the note field and will
 * enable the player to plant and grow seeds in them.
 *
 * Creating Seeds
 * --------------
 * Items can be set as seeds by adding a <seed> tag to their notes box. This
 * tag will contain settings that control how the plant will grow (more details
 * further down).
 *
 * The Plant Graphic
 * -----------------
 * Plant charactersets in /img/characters/ need to be named using the 'Crop
 * Charset Name' from the plugin settings, plus an imgId number.
 * eg. if the plugin setting is: !Crops
 * Your crop characters should be named like:
 * !Crops0.png, !Crops1.png, !Crops2.png, etc. (!Crops0.png top left character
 * will be used for empty plot or seeds just planted plot)
 *
 * Plant charactersets must be set up in a certain way. Each character within
 * a characterset contains 2 plants, each with 3 growing frames for watered/
 * unwatered (6 frames total). These use facing directions of the characters,
 * for example:
 * Down  = 1st plant unwatered
 * Left  = 1st plant watered
 * Right = 2nd plant unwatered
 * Up    = 2nd plant watered
 *
 * Character 1's 1st plant in imgId 0, however, is used for an empty plot or
 * plot that has seeds freshly planted in it. Examine the demo for a better
 * understanding of this.
 *
 * Growing
 * -------
 * After selecting a grow time, plants will go through 4 stages/images during
 * their growth.
 * 1. As soon as a seed is planted, it uses the seed planted charset.
 * 2. After 20% grow time has elapsed, it uses the 1st pattern of the plant
 * 3. After 60% grow time has elapsed, it uses the 2nd pattern of the plant
 * 2. When 100% or more has elapsed, it uses the 3rd pattern of the plant
 *    (and is ready to harvest)
 *
 * Growing can be done based on playtime seconds or based on a variable. This
 * can be specified in the event you setup to plant a seed (further below).
 *
 * There is a plugin setting to specify if the crop event is under or same as
 * player during each stage of growth. A note tag is also available to use to
 * specify different priorities for each crop seed if required.
 * 
 *
 * Careful if using this with time based growing because you could trap your
 * player if a crop grows into a priority that will block their movement.
 *
 * The Plant
 * ---------
 * The plant itself is just an item you specify in the seed settings which will
 * be gained upon harvest, returning the plot to empty again.
 * ----------------------------------------------------------------------------
 *
 * ----------------------------------------------------------------------------
 *  NOTE TAGS for ITEMS
 * ----------------------------------------------------------------------------
 * 
 *    <seed:imgId,charId,pId,growTime,itemId>
 *
 * EXPLANATION:
 * seed     = the keyword required. Don't change this.
 * imgId    = the number that will select which crop charset to use.
 * charId   = the id of the character in the charset (1-8)
 * pId      = the plant id to select which plant in the character to use (1-2)
 * growTime = the amount of seconds passed until plant is able to be harvested
 * itemId   = the item obtained when plant is harvested. Make this 0 if the
 *            plant cannot be harvested at all.
 *
 *    <seedPrio:seed,sprouting,halfGrown,fullGrown>
 *
 * EXPLANATION:
 * This is to override the default 'Crop Priority' plugin setting.
 * It is to control what priority the crop event is during each stage of
 * growth. 0 = below player, 1 = same as player.
 * eg.
 * <seedPrio:0,1,1,1>
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT info
 * ----------------------------------------------------------------------------
 * eId = event id
 * iId = item id
 * vId = variable id
 * You can replace eId inside a non-parallel event with this._eventId to use
 * the current event's id.
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT for CONDITIONAL BRANCHES
 * ----------------------------------------------------------------------------
 *
 *    Galv.CROPS.isCrop(eId)     // Check if event has <crop> note tag
 * 
 *    Galv.CROPS.hasSeed(eId)    // Check if event has a seed planted
 *
 *    Galv.CROPS.isReady(eId)    // Check if event seed is ready to harvest
 *
 *    Galv.CROPS.isSeed(iId)     // Check if item has <seed> tag and is a seed
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT calls
 * ----------------------------------------------------------------------------
 *
 *    Galv.CROPS.harvest(eId,v);  // Harvest an event's crop.
 *                                // v refers to a variable id to store the
 *                                // NAME of the ITEM obtained from the crop
 *                                // as a string to use in messages with \v[x]
 *
 *    Galv.CROPS.remove(eId);     // Remove the plant from an event.
 *
 *    Galv.CROPS.plant(eId,iId,vId);  // plant a seed item into an event.
 *                                    // leave vId blank for the crop to grow
 *                                    // based on seconds of game time.
 *                                    // if you use vId it will instead grow
 *                                    // based on the chosen variable id.
 *
 * Watering crops reduces the grow time by a certain number of days or time
 * (depending on your plugin settings). They will remain watered for the
 * watered time in the settings and cannot gain the benefit of being watered
 * again until the watered time passes.
 *
 *    Galv.CROPS.water(eId,vId);   // water the crop event starting now
 *                                 // leave vId blank to use game time for the
 *                                 // time the crop was watered.
 *                                 // If you use vId it will instead use the
 *                                 // variable day from the variable id chosen.
 *
 *    Galv.CROPS.waterAll(vId);  // same as above but applies to all events on
 *                               // the current map.
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT call in AUTONOMOUS MOVE ROUTE
 * ----------------------------------------------------------------------------
 *
 *    this.updateCrop();   // uses move route frequency to control the growing
 *                         // of crops near the player. This is done so many
 *                         // timers do not have to be running at the same time
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT call
 * ----------------------------------------------------------------------------
 *
 *    Galv.CROPS.update();   // update all crops on the map
 *
 * ----------------------------------------------------------------------------  
 */



//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

Galv.CROPS.img = PluginManager.parameters('Galv_SimpleCrops')["Crop Charset Name"];
Galv.CROPS.wateredTime = Number(PluginManager.parameters('Galv_SimpleCrops')["Watered Time"]);
Galv.CROPS.wateredBenefit = Number(PluginManager.parameters('Galv_SimpleCrops')["Watered Benefit"]);

Galv.CROPS.useFix = PluginManager.parameters('Galv_SimpleCrops')["Crop Under or Front Fix"] === 'true' ? true : false;


var txt = PluginManager.parameters('Galv_SimpleCrops')["Crop Priority"].split(',');
Galv.CROPS.prio = [1,1,1,1,1];
for (var i = 0; i < txt.length; i++) {
	Galv.CROPS.prio[i] = Number(txt[i]);
}

Galv.CROPS.isCrop = function(eventId) {
	return $gameMap.event(eventId) && $gameMap.event(eventId).crop();
};

Galv.CROPS.hasSeed = function(eventId) {
	return Galv.CROPS.isCrop(eventId) && $gameMap.event(eventId).crop()._seed;
};

Galv.CROPS.isReady = function(eventId) {
	return Galv.CROPS.hasSeed(eventId) ? $gameMap.event(eventId).crop().isReady() : false;
};

Galv.CROPS.harvest = function(eventId,varId) {
	$gameVariables._data[varId] = 0;
	if (Galv.CROPS.isReady(eventId)) {
		var itemId = $gameMap.event(eventId).crop()._seed.itemId;
		var item = $dataItems[itemId];
		if (item) {
			$gameParty.gainItem(item,1);
			var name = item.name;
		} else {
			var name = '';
		}
		
		if (varId > 0 && name != '') {
			$gameMap.event(eventId).crop().resetPlot(true);
			$gameMap.event(eventId).updateCropGraphic();
			$gameVariables._data[varId] = name;
		}
	};
};

Galv.CROPS.remove = function(eventId,keepWatered) {
	if (Galv.CROPS.isCrop(eventId)) {
		$gameMap.event(eventId).crop().resetPlot(!keepWatered); // remove crop but keep watered
		$gameMap.event(eventId).updateCropGraphic();
	}
};

Galv.CROPS.water = function(eventId,daysVar) {
	if (Galv.CROPS.isCrop(eventId)) {
		$gameMap.event(eventId).crop().waterPlot(daysVar);
		$gameMap.event(eventId).updateCropGraphic();
	}
};

Galv.CROPS.waterAll = function(daysVar) {
	var events = $gameMap.events();
	for (var i = 0; i < events.length; i++) {
		if (events[i]) Galv.CROPS.water(events[i]._eventId,daysVar);
	}
};

Galv.CROPS.plant = function(eventId,itemId,daysVar) {
	$gameParty.loseItem($dataItems[itemId],1);
	$gameMap.event(eventId).plantCrop(itemId,daysVar);
};

Galv.CROPS.isSeed = function(itemId) {
	return $dataItems[itemId] && $dataItems[itemId].meta.seed;
};

Galv.CROPS.update = function(mapId) {
	var events = $gameMap.events();
	for (var e in events) {
		if (events[e].event().meta.crop) events[e].updateCrop();
	}
};


//-----------------------------------------------------------------------------
//  GAME SYSTEM
//-----------------------------------------------------------------------------

Galv.CROPS.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	Galv.CROPS.Game_System_initialize.call(this);
	this._crops = {}; //mapId: {eventId: Game_Crop},
};

})();


//-----------------------------------------------------------------------------
//  GAME CROP
//-----------------------------------------------------------------------------

// Game crop timer needs to check what % is left.
// if 100-80 left, show seeds
// if 80-40 left, show pattern 0
// if 40-1 left, show pattern 1
// if 0 left, show pattern 2 (ready to harvest)


function Game_Crop() {
    this.initialize.apply(this, arguments);
}

Game_Crop.prototype.initialize = function(eventId,type) {
	this._type = Number(type) || 0;
	this._eventId = eventId;
	this._daysVar = 0; // dont reset this. Keep last var used. // if want to use a variable to controls days instead of seconds.
	this.resetPlot();
};

Game_Crop.prototype.event = function() {
	return $gameMap.events(this._eventId);
};

Game_Crop.prototype.hasPlant = function() {
	return this._plantTime > 0;
};

Game_Crop.prototype.resetPlot = function(keepWatered) {
	this._plantTime = 0;   // game time when planted
	this._growTime = 0;    // target game time when fully grown
	
	if (!keepWatered) {
		this._wateredTime = 0; // game time when watered
		this._dryTime = 0;     // target game time when watered status ends
	}

	this._seed = null;
};

Game_Crop.prototype.getSeedSettings = function(seedId) {
	// get string from meta <seed> tag
	if ($dataItems[seedId] && $dataItems[seedId].meta.seed) {
		return $dataItems[seedId].meta.seed;
	} else {
		this.resetPlot();
		return null;	
	}
};

Game_Crop.prototype.growRate = function() {
	if (this._seed) {
		var full = this._seed.growTime;
		if (this._daysVar) { // use variable and days
			//var full = this._seed.growTime;
			var isAt = this._growTime - $gameVariables.value(this._daysVar);
			
		} else { // used seconds
			//var full = this._seed.growTime;
			var isAt = this._growTime - $gameSystem.playtime();
		}
		return Math.max(isAt / full,0);
	} else {
		return 0;
	}
};

Game_Crop.prototype.isWatered = function() {
	var playtime = this._daysVar ? $gameVariables.value(this._daysVar) : $gameSystem.playtime();
	return playtime < this._dryTime;
};

Game_Crop.prototype.isReady = function() {
	return this.growRate() <= 0;
};

Game_Crop.prototype.plantCrop = function(seedId,daysVar) {
	this._daysVar = daysVar || 0;
	var s = this.getSeedSettings(seedId);
	if (s) {
		var s = s.split(',');
		
		// create seed settings <seed:imgId,charId,pId,growTime,itemId>
		this._seed = {
			seedId: seedId,
			imgId: Number(s[0]),
			charId: Number(s[1]),
			pId: Number(s[2]),
			growTime: Number(s[3]),
			itemId: Number(s[4]),
			prio: Galv.CROPS.prio.slice(1)
		}
		
		// create prio settings <seedPrio:empty,seed,sprouting,halfGrown,fullGrown>
		var s2 = $dataItems[seedId].meta.seedPrio;
		if (s2) {
			s2 = s2.split(',');
			for (var i = 0; i < s2.length; i++) {
				this._seed.prio[i] = Number(s2[i]);
			}
		}
		
		this._plantTime = this._daysVar ? $gameVariables.value(this._daysVar) : $gameSystem.playtime();
		this._growTime = this._plantTime + this._seed.growTime;
	}
};

Game_Crop.prototype.waterPlot = function(daysVar) {
	if (this.isWatered()) return; // don't allow multiple waterings

	if (daysVar) this._daysVar = daysVar;
	this._wateredTime = this._daysVar ? $gameVariables.value(this._daysVar) : $gameSystem.playtime();
	if (this._seed) this._growTime -= Galv.CROPS.wateredBenefit;
	this._dryTime = this._wateredTime + Galv.CROPS.wateredTime;
};

//-----------------------------------------------------------------------------
//  SCENE LOAD
//-----------------------------------------------------------------------------

Galv.CROPS.Scene_Load_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
Scene_Load.prototype.onLoadSuccess = function() {
	Galv.CROPS.reSetupCropEvents = true; // set crops to reload graphics on load
	Galv.CROPS.Scene_Load_onLoadSuccess.call(this);
};


//-----------------------------------------------------------------------------
//  SCENE MAP
//-----------------------------------------------------------------------------

Galv.CROPS.Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    Galv.CROPS.Scene_Map_start.call(this);
	this.setupCropEvents();
};

Scene_Map.prototype.setupCropEvents = function() {
	if (Galv.CROPS.reSetupCropEvents) {
		var events = $gameMap.events();
		for (var e in events) {
			if (events[e].setupCropEvent) events[e].setupCropEvent($gameMap._mapId,e._eventId);
		}
	}
	Galv.CROPS.reSetupCropEvents = false;
};


//-----------------------------------------------------------------------------
//  GAME EVENT
//-----------------------------------------------------------------------------

Galv.CROPS.Game_Event_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId) {
	Galv.CROPS.Game_Event_initialize.call(this,mapId,eventId);
	this.setupCropEvent(mapId,eventId);
};


Game_Event.prototype.setupCropEvent = function(mapId,eventId) {
	var e = this.event().note.match(/<crop(.*)>/i);
	if (e) {
		var type = e[1];
		this._isCrop = true;
		this._cropType = type || 0;
		// create crop data if not created already
		$gameSystem._crops[mapId][eventId] = $gameSystem._crops[mapId][eventId] || new Game_Crop(eventId,type);
		this.updatePattern = function() {}; // remove pattern update from crop event
		this.updateCropGraphic();
	}
	
};

Game_Event.prototype.crop = function() {
	return $gameSystem._crops[this._mapId][this._eventId];
};

Game_Event.prototype.updateCrop = function() {
	this.updateCropGraphic();
	this.resetStopCount();
};

Game_Event.prototype.getCropDir = function(crop) {
	// change crop event direction
	if (!crop._seed) return crop.isWatered() ? 4 : 2;
	if (crop._seed.pId == 1) {
		return crop.isWatered() ? 4 : 2;
	} else {
		return crop.isWatered() ? 8 : 6;
	}
};

Game_Event.prototype.updateCropGraphic = function() {
	var crop = this.crop();
	if (!crop) return;

	// Update Graphic
	var rate = crop.growRate();
	
	if (crop._seed) {
		var charset = crop._seed.imgId;
		var ind = crop._seed.charId - 1;
		var dir = this.getCropDir(crop);

		if (rate <= 0) {
			// pattern 2 (full grown)
			var pat = 2;
			this._priorityType = crop._seed.prio[3];
		} else if (rate <= 0.4) {
			// pattern 1 (half grown)
			var pat = 1;
			this._priorityType = crop._seed.prio[2];
		} else if (rate <= 0.8) {
			// pattern 0 (sprouting)
			var pat = 0;
			this._priorityType = crop._seed.prio[1];
		} else {
			// charset and pattern for seed
			this._priorityType = crop._seed.prio[0];
			var charset = 0;
			var pat = 2;
			var ind = 0;
			var dir = crop.isWatered() ? 4 : 2;
		}
	} else {
		// No seed planted
		this._priorityType = Galv.CROPS.prio[0];
		var charset = 0;
		var pat = 1;
		var ind = 0;
		var dir = crop.isWatered() ? 4 : 2;
	}

	this._direction = dir;
	this._pattern = pat;
	this._characterName = Galv.CROPS.img + charset;
	this._characterIndex = ind;
	
};

Game_Event.prototype.plantCrop = function(id,daysVar) {
	this.crop().plantCrop(id,daysVar);
	this.updateCropGraphic();
};


//-----------------------------------------------------------------------------
//  GAME MAP
//-----------------------------------------------------------------------------

Galv.CROPS.Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
	$gameSystem._crops[mapId] = $gameSystem._crops[mapId] || {};
	Galv.CROPS.Game_Map_setup.call(this,mapId);
};



if (Galv.CROPS.useFix) {

Galv.CROPS.Game_Player_checkEventTriggerHere = Game_Player.prototype.checkEventTriggerHere;
Game_Player.prototype.checkEventTriggerHere = function(triggers) {
	if (Input.isTriggered('ok')) this.checkCropEventThere(triggers);
	if ($gameMap.setupStartingEvent()) return true;
	Galv.CROPS.Game_Player_checkEventTriggerHere.call(this,triggers);
};

Game_Player.prototype.checkCropEventThere = function(triggers) {
	if (this.canStartLocalEvents()) {
		var direction = this.direction();
		var x = $gameMap.roundXWithDirection(this.x, direction);
		var y = $gameMap.roundYWithDirection(this.y, direction);
	
		if (!$gameMap.isEventRunning()) {
			$gameMap.eventsXy(x, y).forEach(function(event) {
				if (event.crop()) {
					event.start();
				}
			});
		}
	}
};

}; // end Galv.CROPS.useFix
