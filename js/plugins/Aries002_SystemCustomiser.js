//=============================================================================
// ★ Aries002_SystemCustomiser ★                                        1.0.0
//=============================================================================
/*:
 * @plugindesc Additional features and customisation of basic system features.
 * @author Aries
 *
 * @help
 * ★ Aries002_SystemCustomiser ★                                        1.0.0
 * ----------------------------------------------------------------------------
 * Allows you to change various basic features of RPG Maker MV.
 * 
 * Refer to the parameters to adjust the features you like.
 * 
 * 
 * ★ Credits
 * ----------------------------------------------------------------------------
 * Created with the help of Olivia. I'm always grateful for your help.
 *  ● https://fallenangelolivia.itch.io/
 * 
 * 
 * @param Cursor
 * @default
 * 
 * @param System Sounds
 * @default
 * 
 * @param Font
 * @default
 * 
 * @param Windowskin
 * @default
 * 
 * @param Cursor Blink
 * @parent Cursor
 * @type boolean
 * @on On
 * @off Off
 * @desc Allow the cursor to blink.
 * Valid: True/False
 * @default true
 * 
 * @param Cursor Blink Speed
 * @parent Cursor
 * @type number
 * @min 0
 * @max 600
 * @desc The frame duration it takes for a cursor to blink. Lower is faster.
 * Valid: A number between 1 to 600
 * @default 40
 * 
 * @param Cursor Blink Opacity Min
 * @parent Cursor
 * @type number
 * @min 0
 * @max 255
 * @desc The minimum opacity the cursor should be when blinking.
 * Valid: A number between 0 to 255
 * @default 160
 * 
 * @param Cursor Blink Opacity Max
 * @parent Cursor
 * @type number
 * @min 0
 * @max 255
 * @desc The maximum opacity the cursor should be when blinking.
 * Valid: A number between 0 to 255
 * @default 255
 * 
 * @param Cursor SE Pitch Variation
 * @parent System Sounds
 * @type number
 * @min 0
 * @max 50
 * @desc Alters the Pitch of the Cursor SE.
 * Valid: A number between 0 to 50
 * @default 0
 * 
 * @param Decision SE Pitch Variation
 * @parent System Sounds
 * @type number
 * @min 0
 * @max 50
 * @desc Alters the Pitch of the Decision SE.
 * Valid: A number between 0 to 50
 * @default 0
 * 
 * @param Cancel SE Pitch Variation
 * @parent System Sounds
 * @type number
 * @min 0
 * @max 50
 * @desc Alters the Pitch of the Cancel SE.
 * Valid: A number between 0 to 50
 * @default 0
 * 
 * @param Buzzer SE Pitch Variation
 * @parent System Sounds
 * @type number
 * @min 0
 * @max 50
 * @desc Alters the Pitch of the Buzzer SE.
 * Valid: A number between 0 to 50
 * @default 0
 * 
 * @param Windowskin Background Opacity
 * @parent Windowskin
 * @type number
 * @min 0
 * @max 255
 * @desc Change the background opacity of windows.
 * Valid: A number between 0 to 255
 * @default 192
 * 
 * @param Font Outline Type
 * @parent Font
 * @desc Change the font outline type.
 * Valid: Normal | Shadow | None
 * @default Normal
 * 
 * @param Font Outline: Outline Size
 * @parent Font
 * @type number
 * @min 0
 * @max 20
 * @desc Change the width of font outlines.
 * Valid: A number between 0 to 9
 * @default 4
 * 
 * @param Font Shadow: Shadow Size
 * @parent Font
 * @type number
 * @min 1
 * @max 10
 * @desc Change the shadow size for the fonts.
 * Valid: A number between 1 to 10
 * @default 4
 * 
 * @param Font Shadow: Shadow Offset X
 * @parent Font
 * @type number
 * @min 0
 * @max 5
 * @desc Change the X offset of the shadow.
 * Valid: A number between 0 to 5
 * @default 1
 * 
 * @param Font Shadow: Shadow Offset Y
 * @parent Font
 * @type number
 * @min 0
 * @max 5
 * @desc Change the Y offset of the shadow.
 * Valid: A number between 0 to 5
 * @default 1
 * 
 */

// ★ Evaluate Parameters
var Aries = Aries || {};
var Imported = Imported || {};
Aries.P002_SYSX = {};
Aries.P002_SYSX.Param = PluginManager.parameters('Aries002_SystemCustomiser');

Aries.P002_SYSX.CursorBlink = eval(Aries.P002_SYSX.Param["Cursor Blink"]);

Aries.P002_SYSX.CursorBlinkSpeed = Number(Aries.P002_SYSX.Param["Cursor Blink Speed"]);
Aries.P002_SYSX.CursorBlinkOpacityMin = Number(Aries.P002_SYSX.Param["Cursor Blink Opacity Min"]);
Aries.P002_SYSX.CursorBlinkOpacityMax = Number(Aries.P002_SYSX.Param["Cursor Blink Opacity Max"]);

Aries.P002_SYSX.CursorSEPitchVar = Number(Aries.P002_SYSX.Param["Cursor SE Pitch Variation"]);
Aries.P002_SYSX.DecideSEPitchVar = Number(Aries.P002_SYSX.Param["Decision SE Pitch Variation"]);
Aries.P002_SYSX.CancelSEPitchVar = Number(Aries.P002_SYSX.Param["Cancel SE Pitch Variation"]);
Aries.P002_SYSX.BuzzerSEPitchVar = Number(Aries.P002_SYSX.Param["Buzzer SE Pitch Variation"]);

Aries.P002_SYSX.WindowskinBGOpacity = Number(Aries.P002_SYSX.Param["Windowskin Background Opacity"]);

switch (String(Aries.P002_SYSX.Param["Font Outline Type"]).toUpperCase()) {
    case 'NORMAL': Aries.P002_SYSX.FontOutlineType = 0; break;
    case 'SHADOW': Aries.P002_SYSX.FontOutlineType = 1; break;
    case 'NONE'  : Aries.P002_SYSX.FontOutlineType = 2; break;
    default      : Aries.P002_SYSX.FontOutlineType = 0; break;
}

Aries.P002_SYSX.FontOutlineSize = Number(Aries.P002_SYSX.Param["Font Outline: Outline Size"]);
Aries.P002_SYSX.FontShadowSize = Number(Aries.P002_SYSX.Param["Font Shadow: Shadow Size"]);
Aries.P002_SYSX.FontShadowOffsetX = Number(Aries.P002_SYSX.Param["Font Shadow: Shadow Offset X"]);
Aries.P002_SYSX.FontShadowOffsetY = Number(Aries.P002_SYSX.Param["Font Shadow: Shadow Offset Y"]);

Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
    // Note: Firefox Bug 737852
    if (text !== undefined) {
        var tx = x;
        var ty = y + lineHeight - (lineHeight - this.fontSize * 0.7) / 2;
        var context = this._context;
        var alpha = context.globalAlpha;
        maxWidth = maxWidth || 0xffffffff;
        if (align === 'center') {
            tx += maxWidth / 2;
        }
        if (align === 'right') {
            tx += maxWidth;
        }
        context.save();
        context.font = this._makeFontNameText();
        context.textAlign = align;
        context.textBaseline = 'alphabetic';
        if(Aries.P002_SYSX.FontOutlineType == 0) { 
            context.globalAlpha = 1; 
            this._drawTextOutline(text, tx, ty, maxWidth); 
        }
        context.globalAlpha = alpha;
        this._drawTextBody(text, tx, ty, maxWidth);
        context.restore();
        this._setDirty();
    }
};

Bitmap.prototype._drawTextOutline = function(text, tx, ty, maxWidth) {
    var context = this._context;
    context.strokeStyle = this.outlineColor;
    context.lineWidth = Aries.P002_SYSX.FontOutlineSize;
    context.lineJoin = 'round';
    context.strokeText(text, tx, ty, maxWidth);
};

Bitmap.prototype._drawTextBody = function(text, tx, ty, maxWidth) {
   var context = this._context;
   context.fillStyle = this.textColor;
   if(Aries.P002_SYSX.FontOutlineType == 1) {
       context.shadowColor = 'black';
       context.shadowBlur = Aries.P002_SYSX.FontShadowSize;
       context.shadowOffsetX = Aries.P002_SYSX.FontShadowOffsetX;
       context.shadowOffsetY = Aries.P002_SYSX.FontShadowOffsetY;
   }
   context.fillText(text, tx, ty, maxWidth);
};

Window.prototype._updateCursor = function() {
    var halfBlinkSpeed = Aries.P002_SYSX.CursorBlinkSpeed / 2;
    var blinkCount = Math.abs((this._animationCount % Aries.P002_SYSX.CursorBlinkSpeed) - halfBlinkSpeed);
    var cursorOpacity = this.contentsOpacity;
    if (this.active) {
        if (Aries.P002_SYSX.CursorBlink === true) {
            
            var lerpA1 = (halfBlinkSpeed - blinkCount) / halfBlinkSpeed;
            var lerpA2 = blinkCount / halfBlinkSpeed;
            cursorOpacity = (lerpA1 * Aries.P002_SYSX.CursorBlinkOpacityMin) + (lerpA2 * Aries.P002_SYSX.CursorBlinkOpacityMax);
        } else {
            cursorOpacity = Aries.P002_SYSX.CursorBlinkOpacityMax;
        }
    }
    this._windowCursorSprite.alpha = cursorOpacity / 255;
    this._windowCursorSprite.visible = this.isOpen();
};

SoundManager.playSystemSound = function(n) {
    if ($dataSystem) {
        var newSound = JsonEx.makeDeepCopy($dataSystem.sounds[n]);
        switch (n) {
            case 0:  // cursor
                var adj = Aries.P002_SYSX.CursorSEPitchVar;
                newSound.pitch = $dataSystem.sounds[n].pitch + ((-0.5 * adj) + Math.randomInt(adj)); 
                break;
            case 1: // ok
                var adj = Aries.P002_SYSX.DecideSEPitchVar;
                newSound.pitch = $dataSystem.sounds[n].pitch + ((-0.5 * adj) + Math.randomInt(adj)); 
                break;
            case 2: // cancel
                var adj = Aries.P002_SYSX.CancelSEPitchVar;
                newSound.pitch = $dataSystem.sounds[n].pitch + ((-0.5 * adj) + Math.randomInt(adj)); 
                break;
            case 3: // buzz
                var adj = Aries.P002_SYSX.BuzzerSEPitchVar;
                newSound.pitch = $dataSystem.sounds[n].pitch + ((-0.5 * adj) + Math.randomInt(adj)); 
                break;
        }
        AudioManager.playStaticSe(newSound);

    }
};

Window_Base.prototype.standardBackOpacity = function() {
    return Aries.P002_SYSX.WindowskinBGOpacity;
};