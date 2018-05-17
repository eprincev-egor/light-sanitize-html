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
    "h1", "h2", "h3", "h4", "h5", "h6", 
    "table", "td", "tr", "thead", "tbody", "tfoot", "th"
];
function sanitize(html, options) {
    options = options || {};
    // custom allowed tags or global config
    let allowedTags = options.allowedTags || sanitize.allowedTags;
    if ( !allowedTags || !allowedTags.includes ) {
        allowedTags = false;
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
            tag = stripAttributes( tag );
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

function stripAttributes(tag) {
    return tag;
}

sanitize.allowedTags = allowedTags;

module.exports = sanitize;
