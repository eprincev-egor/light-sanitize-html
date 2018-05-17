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
    "colspan", "dir", "headers", "height", "hidden", "href",
    "hreflang", "id", "lang", "rel", "reversed", "rowspan", "shape",
    "sizes", "spellcheck", "src", "srcset", "style",
    "summary", "title", "translate", "type", "width"
];

function sanitize(html, options) {
    options = options || {};
    // custom allowed tags or global config
    let allowedTags = options.allowedTags || sanitize.allowedTags;
    if ( !allowedTags || !allowedTags.includes ) {
        allowedTags = false;
    }
    // custom allowrd attributes or global config
    let allowedAttributes = options.allowedAttributes || sanitize.allowedAttributes;
    if ( !allowedAttributes || !allowedAttributes.includes ) {
        allowedAttributes = false;
    }
    
    return html.replace(/<[^>]+>/gi, tag => {
        let isOpenTag = /^<\s*\w+[^\w]/i.test(tag);
        let isCloseTag = /^<\s*\/\s*\w+[^\w]/i.test(tag);
        let isInvalidTag = !isOpenTag && !isCloseTag;
        
        if ( isInvalidTag ) {
            return "";
        }
        
        if ( isCloseTag ) {
            // < / div >
            let isValidCloseTag = /^<\s*\/\s*\w+\s*>$/i.test(tag);
            
            if ( !isValidCloseTag ) {
                return "";
            }
        }
        
        let tagName = getTagName(tag, isCloseTag);
        
        // check banned tags
        let isWhiteTag;
        if ( allowedTags === false ) {
            isWhiteTag = true;
        } else {
            isWhiteTag = allowedTags.includes(tagName);
        }
        
        if ( !isWhiteTag ) {
            return "";
        }
        
        if ( isOpenTag ) {
            let coach = new Coach(tag);
            tag = coach.stripAttributes( allowedAttributes );
        }
        
        return tag;
    });
}

function getTagName(tag, isCloseTag) {
    let tagName;
    
    if ( isCloseTag ) {
        // < / word>
        tagName = /^<\s*\/\s*(\w+)[^\w]/i.exec(tag);
    } else {
        // < word >
        tagName = /^<\s*(\w+)[^\w]/i.exec(tag);
    }
    tagName = tagName && tagName[1];
    if ( !tagName ) { return ""; } // imposible
    
    tagName = tagName.toLowerCase();
    
    return tagName;
}

class Coach {
    constructor(str) {
        this.str = str;
        this.i = 0;
    }
    
    stripAttributes(allowedAttributes) {
        this.skipTagName();
        
        while ( this.i < this.str.length ) {
            this.skipSpace();
            
            let start = this.i;
            let attrName = this.readAttrName();
            
            if ( this.isAttrValue() ) {
                this.readAttrValue();
            }
            let end = this.i;
            
            // cut bad 
            let isWhiteAttr = allowedAttributes.includes(attrName);
            if ( !isWhiteAttr ) {
                this.cutSubstring(start, end);
                continue;
            }
            
            this.i++;
        }
        
        return this.str;
    }
    
    readAttrValue() {
        this.skipSpace();
        this.i++; // skip =
        this.skipSpace();
        
        let value = "";
        while ( this.i < this.str.length ) {
            let char = this.str[ this.i ];
            
            if ( /\s/.test(char) ) {
                return value;
            } else {
                value += char;
                this.i++;
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
            
            if ( /\s|=/.test(char) ) {
                return attrName;
            } else {
                attrName += char;
                this.i++;
            }
        }
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
