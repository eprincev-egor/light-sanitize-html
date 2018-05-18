"use strict";

const assert = require("assert");
const sanitize = require("../src/index");

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

describe("check attributes", () => {
    // good
    testTags("<div style='color:red;'>nice</div>");
    testTags("<div style='color :red;'>nice</div>");
    testTags("<div style='color : red;'>nice</div>");
    testTags("<div color=red>nice</div>");
    
    // xss examples from https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    testTags("<IMG onerror=' javascript:void(0) '>", "<IMG >");
    testTags("<IMG onerror=\" javascript:void(0) \">", "<IMG >");
    testTags("<IMG SRC=javascript:alert('XSS')>", "<IMG >");
    testTags("<IMG SRC=javascript:alert(&quot;XSS&quot;)>", "<IMG >");
    testTags("<IMG SRC=`javascript:alert(\"RSnake says, 'XSS'\")`>", "<IMG >");
    testTags("<IMG \"\"\"><SCRIPT>alert(\"XSS\")</SCRIPT>\">", "<IMG >alert(\"XSS\")\">");
    testTags("<IMG SRC=javascript:alert(String.fromCharCode(88,83,83))>", "<IMG >");
    testTags("<IMG SRC=# onmouseover=\"alert('xxs')\">", "<IMG SRC=# >");
    testTags("<IMG SRC= onmouseover=\"alert('xxs')\">", "<IMG >");
    testTags("<IMG onmouseover=\"alert('xxs')\">", "<IMG >");
    testTags("<IMG SRC=/ onerror=\"alert(String.fromCharCode(88,83,83))\"></img>", "<IMG SRC=/ ></img>");
    testTags("<img src=x onerror=\"&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041\">", "<img  >");
    testTags("<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;>", "<IMG >");
    testTags(`<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;
&#39;&#88;&#83;&#83;&#39;&#41;>`, "<IMG \n>");

    testTags(`<IMG SRC=&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&
#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041>`, "<IMG \n>");
    testTags("<IMG SRC=&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A&#x61&#x6C&#x65&#x72&#x74&#x28&#x27&#x58&#x53&#x53&#x27&#x29>", "<IMG >");
    
    testTags("<IMG SRC=\"jav	ascript:alert('XSS');\">", "<IMG >");
    testTags("<IMG SRC=\"jav&#x09;ascript:alert('XSS');\">", "<IMG >");
    testTags("<IMG SRC=\"jav&#x0A;ascript:alert('XSS');\">", "<IMG >");
    testTags("<IMG SRC=\"jav&#x0D;ascript:alert('XSS');\">", "<IMG >");
    testTags("<IMG SRC=\"jav\nascript:alert('XSS');\">", "<IMG >");
    testTags("<IMG SRC=\"jav\0ascript:alert('XSS');\">", "<IMG >");
    testTags("<IMG SRC=\" &#14;  javascript:alert('XSS');\">", "<IMG >");
    
    testTags("<SCRIPT/XSS SRC=\"http://xss.rocks/xss.js\"></SCRIPT>", "");
    testTags("<BODY onload!#$%&()*~+-_.,:;?@[/|\\]^`=alert(\"XSS\")>", "");
    testTags("<SCRIPT/SRC=\"http://xss.rocks/xss.js\"></SCRIPT>", "");
    testTags("<<SCRIPT>alert(\"XSS\");//<</SCRIPT>", "alert(\"XSS\");//");
    testTags("<SCRIPT SRC=http://xss.rocks/xss.js?< B >", "");
    testTags("<SCRIPT SRC=//xss.rocks/.j>", "");
    testTags("<IMG SRC=\"javascript:alert('XSS')\"", "");
    testTags("<iframe src=http://xss.rocks/scriptlet.html <", "");
    testTags("</script><script>alert('XSS');</script>", "alert('XSS');");
    testTags("<INPUT TYPE=\"IMAGE\" SRC=\"javascript:alert('XSS');\">", "");
    testTags("<BODY BACKGROUND=\"javascript:alert('XSS')\">", "");
    testTags("<IMG DYNSRC=\"javascript:alert('XSS')\">", "<IMG >");
    testTags("<IMG LOWSRC=\"javascript:alert('XSS')\">", "<IMG >");
    testTags("<STYLE>li {list-style-image: url(\"javascript:alert('XSS')\");}</STYLE><UL><LI>XSS</br>", "li {list-style-image: url(\"javascript:alert('XSS')\");}<UL><LI>XSS</br>");
    testTags("<IMG SRC='vbscript:msgbox(\"XSS\")'>", "<IMG >");
    testTags("<IMG SRC=\"livescript:[code]\">", "<IMG >");
    testTags("<svg/onload=alert('XSS')>", "");
    testTags("<BGSOUND SRC=\"javascript:alert('XSS');\">", "");
    // testTags("<BR SIZE=\"&{alert('XSS')}\">", "<BR >");
    testTags("<LINK REL=\"stylesheet\" HREF=\"javascript:alert('XSS');\">", "");
    testTags("<LINK REL=\"stylesheet\" HREF=\"http://xss.rocks/xss.css\">", "");
    testTags("<STYLE>@import'http://xss.rocks/xss.css';</STYLE>", "@import'http://xss.rocks/xss.css';");
    // testTags("<META HTTP-EQUIV=\"Link\" Content=\"<http://xss.rocks/xss.css>; REL=stylesheet\">", "");
    
});
