# IngeniousSelectjs

Ingeniousselect is a small jQuery plugin, that makes one or more select elements styleable. It could be used as an alternativ for selectric. The problem with selectric is that you don't get a change-event if the value of the original select is set with vanilla-javacript or if the optionslist changes on the fly. Ingeniousselect doesn't have these problems, because it uses the original selectfield. The options are copied to a separate div-structure that will update on every click on the select.

## Usage
```javascript
$('.mySelect').ingeniousselect();
```
## Options

You can optional set your own class-prefix. But keep in mind that you have to copy the content of ingeniousselect.css and rewrite the styles with your prefix.
```javascript
$('.mySelect').ingeniousselect({
  prefix: 'yourPrefix'
});
```
### Supports
Desktop: IE9+, Edge, actual Chrome, Firefox and Safari <br>
Mobile: Android Browser 5.0, Chrome Mobile, Mobile Safari 7.0+
