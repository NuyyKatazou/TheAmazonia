//-----------------------------------------------------------------------------
//  Galv's Enemy AI
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_EnemyAI.js
//-----------------------------------------------------------------------------
//  2020-11-03 - Version 1.1 - fixed mp code missing
//  2016-08-29 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_EnemyAI = true;

var Galv = Galv || {};        // Galv's main object
Galv.EnemyAI = Galv.EnemyAI || {};      // Galv's plugin stuff

// Galv Notetag setup (Add notes required for this plugin if not already added)
Galv.noteFunctions = Galv.noteFunctions || [];       // Add note function to this.

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.1) Improves enemy's skill usage AI.
 *
 * @author Galv - galvs-scripts.com
 *
 * @param
 * @desc
 * @default
 *
 * @help
 *   Galv's Enemy AI
 * ----------------------------------------------------------------------------
 * This plugin adds notetags for skills that allow you to control when an enemy
 * will use the skill and on what target. This is for single-target skills and
 * I will refer to them as priority skills or prio skills.
 *
 * The priority type notetag for SKILLS (which will only affect enemies):
 *
 *
 *             <prioType: setting,value>
 *
 *
 *  setting,value - description
 * ------------------------------
 *  hp,x         - possible targets have x% or more hp
 *  -hp,x        - possible targets have x% or less hp
 *  mp,x         - possible targets have x% or more mp
 *  -mp,x        - possible targets have x% or less mp
 *  state,x      - if a battler has x state - target that battler
 *  -state,x     - if a battler doesn't have x state - target that battler
 *  dead         - possible targets have the dead state
 *
 * If there are no possible targets for the above priority type set in a skill
 * notes, then the skill will not be used by the enemy, even if the enemy's
 * skill rating enables it to.
 *
 * EXAMPLE:
 * If a 'heal' skill has note tag of:     <prioType:-hp,50>
 * And an enemy has these skills:
 * - Attack - rating 1
 * - Heal - rating 9
 * Normally, the enemy would only use Heal as the rating is a lot higher, but
 * the Heal skill has a prioType so it will only be used if there is an ally
 * with 50% or less hp. It will also only target those hurt allies.
 * If no allies are 50% or less hp, it will use its other skills instead, in
 * the case of this enemy, its only other skill would be to Attack.
 *
 *
 * HOW STUFF WORKS:
 * Skills are determined at the start of a battle round. So if nobody is hurt
 * at this time, enemies will not choose heal in that round, even if their
 * allies are hurt during it. This is true for all priority skill types.
 *
 * However, if at the start of the round priority skill conditions are met,
 * and during the battle round they are no longer met - when it comes to the
 * enemy's turn to use a priority skill, it will not use that skill and
 * instead try to use a skill that has NO prioType tag. If the enemy has no
 * skills without the prioType tag, it will not use any skill in this case.
 *
 * ----------------------------------------------------------------------------
 */

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

//-----------------------------------------------------------------------------
//  NOTE TAGS
//-----------------------------------------------------------------------------

if (!Galv.notetagAlias) {   // Add alias only if not added by another Galv plugin
	Galv.EnemyAI.Scene_Boot_start = Scene_Boot.prototype.start;
	Scene_Boot.prototype.start = function() {	
		for (var i = 0;i < Galv.noteFunctions.length; i++) {
			Galv.noteFunctions[i]();	
		};
		Galv.EnemyAI.Scene_Boot_start.call(this);
	};
	Galv.notetagAlias = true;
};

Galv.EnemyAI.notetags = function() {
	// Items
	for (var i = 1;i < $dataSkills.length;i++) {
		var note = $dataSkills[i].note.toLowerCase().match(/<prioType:(.*)>/i);
		
		if (note) {
			note = note[1].split(",");
			note[0] = note[0].trim();
			note[1] = Number(note[1]);
			$dataSkills[i].prioType = note;
		};
	};
};

Galv.noteFunctions.push(Galv.EnemyAI.notetags);

Galv.EnemyAI.party = function(battler,skill) {
	if (skill.scope >= 7) {
		return battler.friendsUnit();
	} else {
		return battler.opponentsUnit();
	};
};

Galv.EnemyAI.getPossibleList = function(party,type,value,skill) {
	if (skill.scope == 11) {
		var members = [this]; // Shouldn't use this as you can set via normal enemy skill setup
	} else if (skill.scope >= 9) {
		var members = party.deadMembers();
	} else {
		var members = party.aliveMembers();
	};
	
	var array = [];
	if (type[0] == '-') {
		var rev = true;
		type = type.slice(1);
	} else {
		var rev = false;
	};
	
	switch(type) {
		case 'hp':
			for (var i = 0; i < members.length; i++) {
				var mem = members[i];
				if ((!rev && mem.hp >= mem.mhp * (value * 0.01)) || (rev && mem.hp <= mem.mhp * (value * 0.01))) {
					array.push(mem.index());
				};
			};
			break;
		case 'mp':
			for (var i = 0; i < members.length; i++) {
				var mem = members[i];
				if ((!rev && mem.mp >= mem.mmp * (value * 0.01)) || (rev && mem.mp <= mem.mmp * (value * 0.01))) {
					array.push(mem.index());
				};
			};
			break;
		case 'state':
			for (var i = 0; i < members.length; i++) {
				var mem = members[i];
				if ((!rev && mem.isStateAffected(value)) || (rev && !mem.isStateAffected(value))) {
					array.push(mem.index());
				};
			};
			break;
		case 'dead':
			for (var i = 0; i < members.length; i++) {
				var mem = members[i];
				if ((!rev && mem.isDeathStateAffected()) || (rev && !mem.isDeathStateAffected())) {
					array.push(mem.index());
				};
			};
			break;
	};
	return array;
};


//-----------------------------------------------------------------------------
//  GAME ENEMY
//-----------------------------------------------------------------------------

Game_Enemy.prototype.prioCondition = function(skill) {
	var party = Galv.EnemyAI.party(this,skill);
	var type = skill.prioType[0];
	var value = skill.prioType[1];
    var possibles = Galv.EnemyAI.getPossibleList(party,type,value,skill);
			
	if (possibles.length <= 0) {
		return false;
	} else {
		return true;
	};
};

Galv.EnemyAI.Game_Enemy_meetsCondition = Game_Enemy.prototype.meetsCondition;
Game_Enemy.prototype.meetsCondition = function(action) {
	var skill = $dataSkills[action.skillId];
	if (skill.prioType) {
		return this.prioCondition(skill);
	} else {
		return Galv.EnemyAI.Game_Enemy_meetsCondition.call(this,action);
	};
	
};


//-----------------------------------------------------------------------------
//  GAME ACTION
//-----------------------------------------------------------------------------

Galv.EnemyAI.Game_Action_targetsForOpponents = Game_Action.prototype.targetsForOpponents;
Game_Action.prototype.targetsForOpponents = function() {
	if (this.overrideTarget != null) {
		return this.overrideTarget >= 0 ? [this.opponentsUnit().members()[this.overrideTarget]] : [];
	};
	return Galv.EnemyAI.Game_Action_targetsForOpponents.call(this);
};	

Galv.EnemyAI.Game_Action_targetsForFriends = Game_Action.prototype.targetsForFriends;
Game_Action.prototype.targetsForFriends = function() {
	if (this.overrideTarget != null) {
		return this.overrideTarget >= 0 ? [this.friendsUnit().members()[this.overrideTarget]] : [];
	};
	return Galv.EnemyAI.Game_Action_targetsForFriends.call(this);
};

Game_Action.prototype.overridePrioTarget = function(subject,skill) {
	if (!skill.prioType) return -1;
	var party = Galv.EnemyAI.party(subject,skill);
	var type = skill.prioType[0];
	var value = skill.prioType[1];
	var possibles = Galv.EnemyAI.getPossibleList(party,type,value,skill);

	if (possibles.length >= 0 && !subject.isEnemy()) return -1;
	// Get a random target from all possible targets
	return possibles[Math.randomInt(possibles.length)];

};


//-----------------------------------------------------------------------------
//  BATTLE MANAGER
//-----------------------------------------------------------------------------

Galv.EnemyAI.BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
	var changeSkill = this.doPrioSkills();
	if (!changeSkill) Galv.EnemyAI.BattleManager_startAction.call(this);
};

BattleManager.doPrioSkills = function() {
	var subject = this._subject;
    var action = subject.currentAction();
	action.overrideTarget = null;
	var skill = action.item();
	
	if (subject.isEnemy() && skill.prioType) {
		// Get possible targets for prioType skill
		var targetIndex = action.overridePrioTarget(subject,skill);
		if (targetIndex >= 0) {// && action.isForOne()) {
			action.overrideTarget = targetIndex;
		} else {
			// Do another skill instead if target of prioType skill is no longer valid
			var actions = subject.enemy().actions;
			var skillList = [];
			var newSkill = null;
			
			for (var i = 0; i < actions.length; i++) {
				var s = $dataSkills[actions[i].skillId];
				if (!s.prioType && subject.canUse(s)) {
					newSkill = actions[i].skillId;
					break;
				};
			};

			if (newSkill) {
				subject.forceAction(newSkill, -1);
			} else {
				return true;
			};
		};
	};
	return false;
};

})();