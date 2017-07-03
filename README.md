# IngeniousSelectjs

Ingeniousselect is a small jQuery plugin, that makes one or more select elements styleable. It could be used as an alternativ for selectric. The problem with selectric is that you don't get a change-event if the value of the original select is set with vanilla-javacript or if the optionslist changes on the fly. Ingeniousselect doesn't have these problems, because it uses the original selectfield. The options are copied to a separate div-structure that will update on every click on the select.

## Usage
```javascript
$('.mySelect').ingeniousselect();
```
## Options

Set your own class-prefix:
```javascript
$('.mySelect').ingeniousselect({
  prefix: 'yourPrefix'
});
```

Set a minWidth, up to this width native selectoptions will be used. Default is 768px. If you don't want to use native selectoptions, then set it to 0.
```javascript
$('.mySelect').ingeniousselect({
  minDeviceWidth: 768
});
```
### Supports
Desktop: IE9+, Edge, actual Chrome, Firefox and Safari <br>
Mobile: Android Browser 5.0, Chrome Mobile, Mobile Safari 7.0+
