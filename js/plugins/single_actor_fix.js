//Patches YEP_ItemCore.js v1.28 and Galv_SingleActorMenuTarget.js v1.0

Scene_ItemBase.prototype.itemTargetActors = function() {
    var action = new Game_Action(this.user());
    action.setItemObject(this.item());
    if (!action.isForFriend()) {
        return [];
    } else if (action.isForAll() || Galv.SAMT.oneMember()) {
        return $gameParty.members();
    } else {
        return [$gameParty.members()[this._actorWindow.index()]];
    }
};