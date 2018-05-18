"use strict";

const allowedTags = [
    "div", "span",
    "b", "u", "i", "strong", "em", "strike", "code",
    "p", "blockquote", "nl", "caption", "pre",
    "a",
    "br",
    "hr",
    "img",
    "ul", "ol", "nav", "li",
    "h1", "h2", "h3", "h4", "h5", "h6", "menu",
    "table", "td", "tr", "thead", "tbody", "tfoot", "th"
];

// full list here:
// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
const allowedAttributes = [
    "align", "alt", "bgcolor", "border", "class", "color",
    "colspan", "dir", "headers", "height", "hidden", "href", "size",
    "hreflang", "id", "lang", "rel", "reversed", "rowspan", "shape",
    "sizes", "spellcheck", "src", "srcset", "style",
    "summary", "title", "translate", "type", "width",
    "data", "data-*"
];

function sanitize(html, options) {
    let coach = new Coach(html);
    return coach.sanitize(options);
}

class Coach {
    constructor(str) {
        this.str = str;
        this.i = 0;
    }
    
    sanitize(options) {
        options = options || {};
        // custom allowed tags or global config
        let allowedTags = options.allowedTags || sanitize.allowedTags;
        if ( !allowedTags || !allowedTags.includes ) {
            allowedTags = false;
        }
        // custom allowed attributes or global config
        let allowedAttributes = options.allowedAttributes || sanitize.allowedAttributes;
        if ( !allowedAttributes || !allowedAttributes.includes ) {
            allowedAttributes = false;
        }
        
        // walk to tags
        while ( this.i < this.str.length ) {
            if ( !this.isTag() ) {
                this.i++;
                continue;
            }
            
            // here we find tag
            let start = this.i;
            let tagName = this.readTagName();
            
            // check banned tags
            let isWhiteTag;
            if ( allowedTags === false ) {
                isWhiteTag = true;
            } else {
                isWhiteTag = allowedTags.includes(tagName);
            }
            
            // remove bad tag
            if ( !isWhiteTag ) {
                this.cutTag(start);
                continue;
            }
            
            this.stripAttributes(tagName, allowedAttributes);
            
            this.skipSpace();
            let char = this.str[ this.i ];
            if ( char == "/" ) {
                this.i++;
                this.skipSpace();
            }
            
            // if tag is invalid, then just cut him
            // because clean html code cotain only valid tags
            if ( char != ">" ) {
                this.cutTag(start);
            }
        }
        
        return this.str;
    }
    
    isTag() {
        let char = this.str[ this.i ];
        return char == "<";
    }
    
    readTagName() {
        let char = this.str[ this.i ];
        if ( char == "<" ) {
            this.i++;
        }
        this.skipSpace();
        
        char = this.str[ this.i ];
        if ( char == "/" ) {
            this.i++;
            this.skipSpace();
        }
        
        let tagName = "";
        while ( this.i < this.str.length ) {
            let char = this.str[ this.i ];
            
            if ( /\s|>|\//.test(char) ) {
                break;
            } else {
                tagName += char;
                this.i++;
            }
        }
        return tagName.toLowerCase();
    }
    
    cutTag(start) {
        while ( this.i < this.str.length ) {
            let char = this.str[ this.i ];
            if ( char == ">" ) {
                break;
            }
            this.i++;
        }
        this.cutSubstring(start, this.i + 1);
    }
    
    stripAttributes(tagName, allowedAttributes) {
        this.skipSpace();
        
        if ( !this.isAttr() ) {
            return;
        }
        
        let start = this.i;
        let attrName = this.readAttrName();
        let attrValue = null;
        
        if ( this.isAttrValue() ) {
            attrValue = this.readAttrValue();
        }
        let end = this.i;
        
        // cut bad 
        let isWhiteAttr = allowedAttributes.includes(attrName);
        let isValidAttr = isWhiteAttr;
        
        // "<BR SIZE=\"&{alert('XSS')}\">"
        // if ( tagName == "br" ) {
        //     isValidAttr = false;
        // }
        
        if ( attrName == "src" || attrName == "href" ) {
            if ( attrValue ) {
                let isValidURL = this.isValidURL( attrValue );
                if ( !isValidURL ) {
                    isValidAttr = false;
                }
            } else {
                isValidAttr = false;
            }
        }
        
        if ( !isValidAttr ) {
            this.cutSubstring(start, end);
        }
        
        this.stripAttributes(tagName, allowedAttributes);
    }
    
    isValidURL(href) {
        // base on
        // https://github.com/punkave/sanitize-html/blob/master/src/index.js
        
        
        // Browsers ignore character codes of 32 (space) and below in a surprising
        // number of situations. Start reading here:
        // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet#Embedded_tab
        
        /* eslint-disable */
        if ( /[\x00-\x20]/g.test(href) ) {
            return false;
        }
        /* eslint-enable */
        
        // Clobber any comments in URLs, which the browser might
        // interpret inside an XML data island, allowing
        // a javascript: URL to be snuck through
        if ( /<!--.*?-->/.test(href) ) {
            return false;
        }
        
        // <IMG SRC=JaVaScRiPt:alert('XSS')>
        href = href.trim();
        if ( !/^(#|http|\/)/.test(href) ) {
            return false;
        }
        
        return true;
    }
    
    readAttrValue() {
        this.skipSpace();
        let char = this.str[ this.i ];
        if ( char == "=" ) {
            this.i++; // skip =
            this.skipSpace();
        }
        
        char = this.str[ this.i ];
        let quotes = false;
        if ( char == "\"" || char == "'" || char == "`" ) {
            quotes = char;
            this.i++;
        }
        
        let value = "";
        while ( this.i < this.str.length ) {
            let char = this.str[ this.i ];
            
            if ( quotes ) {
                if ( quotes == char ) {
                    this.i++;
                    break;
                } else {
                    value += char;
                    this.i++;
                }
            } else {
                if ( /[\s>]/.test(char) ) {
                    break;
                } else {
                    value += char;
                    this.i++;
                }
            }
        }
        
        return value;
    }
    
    isAttrValue() {
        let endPart = this.str.slice(this.i);
        return /^\s*=\s*/.test(endPart);
    }
    
    skipTagName() {
        // < word >
        let startPosition = /^<\s*(\w+)[^\w]\s*/i.exec( this.str  );
        startPosition = startPosition && startPosition[0].length || 0;
        this.i = startPosition;
    }
    
    skipSpace() {
        while ( this.i < this.str.length ) {
            let char = this.str[ this.i ];
            
            if ( /\s/.test(char) ) {
                this.i++;
            } else {
                break;
            }
        }
    }
    
    readAttrName() {
        let attrName = "";
        while ( this.i < this.str.length ) {
            let char = this.str[ this.i ];
            
            if ( /\s|=|>/.test(char) ) {
                break;
            } else {
                attrName += char;
                this.i++;
            }
        }
        
        return attrName.toLowerCase();
    }
    
    isAttr() {
        let char = this.str[ this.i ];
        return (
            // if chat is null, then test return true
            // stop recursion
            char && 
            /[^</>\s]/.test(char)
        );
    }
    
    cutSubstring(start, end) {
        this.str = (
            this.str.slice(0, start) +
            this.str.slice(end)
        );
        this.i -= end - start;
    }
}

sanitize.allowedTags = allowedTags;
sanitize.allowedAttributes = allowedAttributes;

module.exports = sanitize;
