# light-sanitize-html
Lightweight plugin for sanitize your html  
![CI status](https://circleci.com/gh/eprincev-egor/light-sanitize-html.svg?style=shield)

## Usage
```js
const sanitize = require("light-sanitize-html");
let html = `
    <script>window.$ = false</script>
    <style></style>
    <p>
        some image
        <img src="javascript:alter('hello')" onerror="alert('world')">
    </p>
`;

html = sanitize(html);
html == `
    window.$ = false
    
    <p>
        some image
        <img  >
    </p>
`; // true

```
