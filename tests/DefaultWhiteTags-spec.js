"use strict";

const assert = require("assert");
const sanitize = require("../src/index");

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

function testTags(from, to) {
    it(from, () => {
        let result = sanitize(from);
        
        if ( to == null ) {
            assert.equal(result, from);
        } else {
            assert.equal(result, to);
        }
    });
}

function testBannedTag(tagName) {
    testTags(`<${tagName}>1</${tagName}>`, "1");
    testTags(`<${ tagName.toUpperCase() }>1</${tagName}>`, "1");
    testTags(`<${tagName}>1</${ tagName.toUpperCase() }>`, "1");
    testTags(`<${tagName}  >1</${tagName}>`, "1");
    testTags(`<${tagName}  >1</${tagName}  >`, "1");
    testTags(`< ${tagName}  >1</${tagName}  >`, "1");
    testTags(`< ${tagName}  >1</ ${tagName}  >`, "1");
    testTags(`< ${tagName}  >1<  / ${tagName}  >`, "1");
    testTags(`< ${tagName} any-attribute >1<  / ${tagName}  >`, "1");
    testTags(`< ${tagName} any-attribute = '' >1<  / ${tagName}  >`, "1");
    testTags(`< ${tagName} any-attribute = "" >1<  / ${tagName}  >`, "1");
    testTags(`< ${tagName} onerror='alert("")' >1<  / ${tagName}  >`, "1");
}

function testAllowedTag(tagName) {
    testTags(`<${tagName}>sweet!</${tagName}>`);
    testTags(`<${ tagName.toUpperCase() }>sweet!</${tagName}>`);
    testTags(`<${tagName}>sweet!</${ tagName.toUpperCase() }>`);
    testTags(`<${tagName}  >sweet!</${tagName}>`);
    testTags(`<${tagName}  >sweet!</${tagName}  >`);
    testTags(`< ${tagName}  >sweet!</${tagName}  >`);
    testTags(`< ${tagName}  >sweet!</ ${tagName}  >`);
    testTags(`< ${tagName}  >sweet!<  / ${tagName}  >`);
}

describe("check default banned tags", () => {
    // ANY variation for script
    testBannedTag("script");
    testTags("<script src = '/some' />", "");
    testTags("<script src = '/some' >", "");
    testTags("<SCRIPT SRC=http://xss.rocks/xss.js></SCRIPT>", "");
    
    // ANY variation for script
    testBannedTag("style");
    
    // ANY variation for iframe
    testBannedTag("iframe");
    testTags("<iframe src = '/some' />", "");
    testTags("<iframe src = '/some' >", "");
    
    // ANY variation for frame
    testBannedTag("frame");
    testTags("<frame src = '/some' />", "");
    testTags("<frame src = '/some' >", "");
    
    // ANY variation for embed
    testBannedTag("embed");
    
    // ANY variation for object
    testBannedTag("object");
    
    // ANY variation for object
    testBannedTag("meta");
    
    // ANY variation for applet
    testBannedTag("applet");
    
    // ANY variation for canvas
    testBannedTag("canvas");
    
    // ANY variation for link
    testBannedTag("link");
    testTags("<link href = '/some' />", "");
    testTags("<link href = '/some' >", "");
    
    // ANY variation for link
    testBannedTag("link");
    testTags("<link href = '/some' >", "");
    testTags("<link href = '/some' />", "");
    
});

describe("check default valid html", () => {
    allowedTags.forEach(tagName => {
        testAllowedTag(tagName);
    });
});
