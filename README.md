# light-sanitize-html
Lightweight plugin for sanitize your html  
![CI status](https://circleci.com/gh/eprincev-egor/light-sanitize-html.svg?style=shield)

## Usage
```js
const sanitize = require("light-sanitize-html");

// erase open and close tags
sanitize("<script>some</script>") == "some";
sanitize("<script><script>some</script>") == "some";
sanitize("<style>some</style>") == "some";

// erase attribute with danger value
sanitize("<img src=\"JaVaScRiPt:alert('home')\">") == "<img >";

// erase danger attributes
sanitize("<img onerror=alert('some')>") == "<img >";

```
