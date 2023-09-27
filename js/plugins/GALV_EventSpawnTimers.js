//-----------------------------------------------------------------------------
//  Galv's Event Spawn Timers
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_EventSpawnTimers.js
//-----------------------------------------------------------------------------
//  2016-07-20 - Version 1.2 - fixed a bug causing too many move route updates
//  2016-03-26 - Version 1.1 - added script calls to modify timers. Fixed bugs.
//  2016-03-25 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_EventSpawnTimers = true;

var Galv = Galv || {};            // Galv's main object
Galv.EST = Galv.EST || {};        // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc Enable psuedo-timers that can control event self-switches, switches and variables.
 * 
 * @author Galv - galvs-scripts.com
 *
 * @help
 *   Galv's Event Spawn Timers
 * ----------------------------------------------------------------------------
 * This plugin allows you to set multiple respawn timers for events and change
 * switches or self switches when their timer expires.
 *
 * Just simply creating an event timer doesn't do anything until you call a
 * script that checks if the timer is up and then modifies the switches in the
 * way you specify.
 *
 * The timer checks can be made in event move routes, which means the switch 
 * effect activates once the player gets in range of the events. The reason for
 * doing this is to allow many timers to exist without causing lag due to many
 * countdowns running simultaneously.
 *
 * Timer checks can also be made using a script call any time you need to check
 * and activate the results of any event timer in the game.
 * ----------------------------------------------------------------------------
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT call for MOVE ROUTE
 * ---------------------------------------------------------------------------- 
 *
 *       this.doTimer(switch,status,forceEnd);
 *
 * switch   = the ID number of the switch OR letter in quotes for self switch
 * status   = true to turn ON and false to turn OFF
 * forceEnd = true or false - when using this, timer activates and ends even
 *            if it still had time left. You can leave this one out to not use.
 *
 * This is the command that checks if a timer is up and controls the specified
 * switch to turn on or off for the event the move route belongs to. The
 * frequency this check is done depends on the movement "Freq" of the event.
 * EXAMPLES:
 * this.doTimer("B",false);  // turn self-switch B off once timer expires
 * this.doTimer(5,true);     // turn switch 1 on once timer expires
 * this.doTimer("A",true,true); // turn switch 1 on forcibly NOW!
 * ----------------------------------------------------------------------------
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT calls for event commands
 * ----------------------------------------------------------------------------
 *
 *       this.setSpawn(mapId,eventId,time);
 *
 * mapId    = the map the event is on. Use 0 for the current map.
 * eventId  = the event. Use 0 for the event the script call is in.
 * time     = how many seconds until the timer is complete.
 *
 * This command will create a timer for an event. If it is used while a timer
 * exists for an event, the latest time will overwrite the old one.
 * EXAMPLES:
 * this.setSpawn(12,5,80);  // set timer for event 5 on map 12 for 80 seconds
 * this.setSpawn(0,0,30);   // set timer for this event, this map, 30 seconds
 * ----------------------------------------------------------------------------
 *
 *       this.doTimer(mapId,eventId,switch,status,forceEnd);
 *
 * mapId    = the map of the target event. Use 0 for the current map.
 * eventId  = the target event. Use 0 for the event the script call is in.
 * switch   = the ID number of the switch OR letter in quotes for self switch
 * status   = true to turn ON and false to turn OFF
 * forceEnd = true or false - when using this, timer activates and ends even
 *            if it still had time left. You can leave this one out to not use.
 *
 * This command checks if a timer is up for an event on specified map and turns
 * a switch or that event's self-switch on or off. This is used if you need to
 * check and activate an event's timer from anywhere in the game.
 * EXAMPLES:
 * this.doTimer(4,7,"C",false);    // Map 4, event 7, self switch C off
 * this.doTimer(0,2,9,true);       // This map, event 2, switch 9 on
 * this.doTimer(0,2,9,true,true); // This map, event 2, switch 9 on, end timer
 * ----------------------------------------------------------------------------
 *
 *       this.doMapTimers(mapId,switch,status,forceEnd);
 *
 * mapId    = the map the event is on. Use 0 for the current map.
 *
 * This commend does the same as the above doTimer command, except it does it
 * for all event timers currently running on the map.
 * EXAMPLE:
 * this.doMapTimers(2,"B",false);  // turn self-switch B off when timer expires
 *                                 // for all timer-events on map 2
 * ---------------------------------------------------------------------------- 
 * 
 *       this.purgeEventTimers();              // Remove ALL timers
 *
 *       this.purgeEventTimers(mapId);         // Remove all timers on map
 *
 *       this.purgeEventTimers(mapId,eventId); // Remove specified event timer
 *
 * This command purges timers as above.
 * ----------------------------------------------------------------------------
 *
 *       this.modEventTimers(mapId,eventId,amount);   // mod specific timer
 *
 *       this.modEventTimers(mapId,amount);  // mod all timers on specified map
 *
 *       this.modEventTimers(amount);    // modify ALL timers
 *
 * mapId    = the map of the target event. Use 0 for the current map.
 * eventId  = the target event. Use 0 for the event the script call is in.
 * amount   = change timer by this much. (negative reduce, positive increase)
 *
 * These commands change the time left on specified timers.
 * EXAMPLES
 * this.modEventTimers(2,7,-10);  // decrease timer for map 2, event 7 by 10s
 * this.modEventTimers(0,2);  // increase all timers for the current map by 2s
 * this.modEventTimers(-20);  // decrease ALL timers by 20s
 * ----------------------------------------------------------------------------
 *  SCRIPT for CONTROL VARIABLES
 * ----------------------------------------------------------------------------
 *
 *       this.respawnTime(mapId,eventId);
 *
 * mapId    = the map of the target event. Use 0 for the current map.
 * eventId  = the target event. Use 0 for the event the script call is in.
 *
 * This command, used in Control Variables 'script' will return the amount of
 * seconds the event timer has remaining. It will return 0 if no timer exists.
 * ----------------------------------------------------------------------------
 */

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------


(function() {

Galv.EST.x = PluginManager.parameters('Galv_EventSpawnTimers')['X'];

// Game_System
//-----------------------------------------------------------------------------
Galv.EST.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	this.purgeEventTimers();
	Galv.EST.Game_System_initialize.call(this);
};


Game_System.prototype.purgeEventTimers = function(mapId,eventId) {
	if (!mapId) {               // Purge all
		this.eventTimers = {};
	} else if (!eventId) {      // Purge map
		if (this.eventTimers) {
			delete(this.eventTimers[mapId]);
		};
	} else {                    // Purge event
		if (this.eventTimers && this.eventTimers[mapId]) {
			delete(this.eventTimers[mapId][eventId]);
		};
	};
};


// Game_Interpreter
//-----------------------------------------------------------------------------
Game_Interpreter.prototype.setSpawn = function(mapId,eventId,time) {
	if (mapId <= 0) mapId = this._mapId;
	if (eventId <= 0) eventId = this._eventId;
	$gameSystem.eventTimers[mapId] = $gameSystem.eventTimers[mapId] || {};
	$gameSystem.eventTimers[mapId][eventId] = $gameSystem.playtime() + time;
};

Game_Interpreter.prototype.respawnTime = function(mapId,eventId) {
	if (mapId <= 0) mapId = this._mapId;
	if (eventId <= 0) eventId = this._eventId;
	
	if ($gameSystem.eventTimers[mapId] && $gameSystem.eventTimers[mapId][eventId]) {
		return $gameSystem.eventTimers[mapId][eventId] - $gameSystem.playtime();
	} else {
		return 0;	
	};
};

Game_Interpreter.prototype.doTimer = function(mapId,eventId,s,status,force) {
	if (mapId <= 0) mapId = this._mapId;
	if (eventId <= 0) eventId = this._eventId;
	if ($gameSystem.eventTimers[mapId] && $gameSystem.eventTimers[mapId][eventId]) {
		if (force || $gameSystem.playtime() >= $gameSystem.eventTimers[mapId][eventId]) {
			if (isNaN(s)) { // If letter
				$gameSelfSwitches.setValue(mapId + "," + eventId + "," + s,status);
			} else { // If number
				$gameSwitches.setValue(s,status);
			};
			delete($gameSystem.eventTimers[mapId][eventId]);
		};
	};
};

Game_Interpreter.prototype.doMapTimers = function(mapId,s,status,force) {
	if (mapId <= 0) mapId = this._mapId;
	for (var e in $gameSystem.eventTimers[mapId]) {
		var eventId = e;
		this.doTimer(mapId,eventId,s,status,force);
	};
};

Game_Interpreter.prototype.purgeEventTimers = function(mapId,eventId) {
	if (mapId != null && mapId <= 0) mapId = this._mapId;
	if (eventId != null && eventId <= 0) eventId = this._eventId;
	$gameSystem.purgeEventTimers(mapId,eventId);
};

Game_Interpreter.prototype.modEventTimers = function(mapId,eventId,amount) {
	if (!eventId) { // all timers
		// mapId field used as amount
		amount = mapId;
		
		if ($gameSystem.eventTimers) {
			for (var m in $gameSystem.eventTimers) {
				var map = $gameSystem.eventTimers[m];
				for (var e in map) {
					map[e] += amount;
				};
			};
		};
		
	} else if (!amount) {  // all on map
		// eventId field used as amount
		if (mapId != null && mapId <= 0) mapId = this._mapId;
		amount = eventId;
		if ($gameSystem.eventTimers[mapId]) {
			for (var e in $gameSystem.eventTimers[mapId]) {
				$gameSystem.eventTimers[mapId][e] += amount;
			};
		};
		
	} else { // Singe event
		if (mapId != null && mapId <= 0) mapId = this._mapId;
		if (eventId != null && eventId <= 0) eventId = this._eventId;
		if ($gameSystem.eventTimers && $gameSystem.eventTimers[mapId]) {
			$gameSystem.eventTimers[mapId][eventId] += amount;
		};
	};
};


// Game_Event
//-----------------------------------------------------------------------------
Game_Event.prototype.doTimer = function(s,status,force) {
	var mapId = $gameMap._mapId;
	var eventId = this._eventId;
	if ($gameSystem.eventTimers[mapId] && $gameSystem.eventTimers[mapId][eventId]) {
		if (force || $gameSystem.playtime() >= $gameSystem.eventTimers[mapId][eventId]) {
			if (isNaN(s)) { // If letter
				$gameSelfSwitches.setValue(mapId + "," + eventId + "," + s,status);
			} else { // If number
				$gameSwitches.setValue(s,status);
			};
			delete($gameSystem.eventTimers[mapId][eventId]);
		};
	};
	this.resetStopCount();
};


})();