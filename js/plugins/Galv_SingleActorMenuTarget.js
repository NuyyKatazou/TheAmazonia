//-----------------------------------------------------------------------------
//  Galv's Single Actor Menu Target
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_SingleActorMenuTarget.js
//-----------------------------------------------------------------------------
//  2016-12-28 - Version 1.0 - release
//  2026-11-17 - Version 1.1 - rewrite for MV 1.6.x + YEP_ItemCore,
//                             YEP_BattleEngineCore, SRD_SkillExtender
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_SingleActorMenuTarget = true;

var Galv = Galv || {};                  // Galv's main object
Galv.SAMT = Galv.SAMT || {};            // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.1) Remove target selection when using an item/skill on an actor with only 1 actor in party.
 *
 * @author Galv - galvs-scripts.com (v1.1 fix)
 *
 * @param Battle
 * @desc true or false to activate this plugin in battles or not.
 * @default true
 *
 * @param Menus
 * @desc true or false to activate this plugin in other menus
 * @default true
 *
 * @help
 *   Galv's Single Actor Menu Target
 * ----------------------------------------------------------------------------
 * This plugin changes menus (skill, item, main menu) to skip the actor select
 * step when there is only one actor in the party.
 *
 * v1.1 changes:
 * - Menus: the skip now happens in Scene_ItemBase.determineItem, i.e. AFTER
 *   the player confirmed the use. This makes it work with YEP_ItemCore's
 *   "Use / Discard" action window and SRD_SkillExtender, instead of
 *   consuming the item as soon as it is highlighted.
 * - Battle: with MV 1.6+ (and YEP_BattleEngineCore) the actor window is not
 *   opened at all; the single actor is set as target directly.
 * - Main menu: the menu actor is properly set before opening Skill / Equip /
 *   Status scenes.
 * - single_actor_fix.js is no longer needed.
 *
 * Place this plugin BELOW YEP_ItemCore, YEP_BattleEngineCore and
 * SRD_SkillExtender.
 * ----------------------------------------------------------------------------
 */

(function() {

var params = PluginManager.parameters('Galv_SingleActorMenuTarget');
var toBool = function(value, fallback) {
	if (value === undefined || value === null || value === '') return fallback;
	return String(value).trim().toLowerCase() === 'true';
};

Galv.SAMT.battle = toBool(params['Battle'], true);
Galv.SAMT.menus = toBool(params['Menus'], true);

// Menus: all party members (reserve included) can be targeted.
Galv.SAMT.oneMember = function() {
	return $gameParty.members().length === 1;
};

// Battle: only battle members can be targeted.
Galv.SAMT.oneBattleMember = function() {
	return $gameParty.battleMembers().length === 1;
};


//-----------------------------------------------------------------------------
//  MENUS
//-----------------------------------------------------------------------------

if (Galv.SAMT.menus) {

	// Main menu: Skill / Equip / Status go straight to the only actor.
	Galv.SAMT.Scene_Menu_commandPersonal = Scene_Menu.prototype.commandPersonal;
	Scene_Menu.prototype.commandPersonal = function() {
		Galv.SAMT.Scene_Menu_commandPersonal.call(this);
		if (Galv.SAMT.oneMember()) {
			this._statusWindow.select(0);
			$gameParty.setMenuActor($gameParty.members()[0]);
			this.onPersonalOk();
		}
	};

	// Item / Skill: called once the player confirmed the use (after YEP's
	// "Use" command, SRD's skill extend window, etc.).
	Galv.SAMT.Scene_ItemBase_determineItem = Scene_ItemBase.prototype.determineItem;
	Scene_ItemBase.prototype.determineItem = function() {
		if (!Galv.SAMT.oneMember()) {
			return Galv.SAMT.Scene_ItemBase_determineItem.call(this);
		}
		var action = new Game_Action(this.user());
		action.setItemObject(this.item());
		if (!action.isForFriend()) {
			return Galv.SAMT.Scene_ItemBase_determineItem.call(this);
		}
		// Prepare the (hidden) actor window so itemTargetActors() targets
		// actor 0, then use the item without showing the window.
		this._actorWindow.selectForItem(this.item());
		if (!this._actorWindow._cursorAll) this._actorWindow.select(0);
		if (this.canUse()) {
			this.useItem();
		} else {
			SoundManager.playBuzzer();
		}
		this.activateItemWindow();
	};
}


//-----------------------------------------------------------------------------
//  BATTLE
//-----------------------------------------------------------------------------

if (Galv.SAMT.battle) {

	Galv.SAMT.Scene_Battle_selectActorSelection = Scene_Battle.prototype.selectActorSelection;
	Scene_Battle.prototype.selectActorSelection = function() {
		var action = BattleManager.inputtingAction();
		if (!action || !Galv.SAMT.oneBattleMember()) {
			return Galv.SAMT.Scene_Battle_selectActorSelection.call(this);
		}
		var target = $gameParty.battleMembers()[0];
		// Revive items on a living actor (or the opposite): keep normal flow
		// so the player gets the usual feedback instead of a wasted turn.
		if (action.isForDeadFriend() !== target.isDead()) {
			return Galv.SAMT.Scene_Battle_selectActorSelection.call(this);
		}
		action.setTarget(target.index());
		this._actorWindow.hide();
		this._actorWindow.deactivate();
		this._skillWindow.hide();
		this._itemWindow.hide();
		if (this._helpWindow) this._helpWindow.hide();
		this.selectNextCommand();
	};
}

})();
