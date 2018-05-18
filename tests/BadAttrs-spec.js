"use strict";

const assert = require("assert");
const sanitize = require("../src/index");
if ( typeof window !== "undefined" ) { window.sanitize = sanitize; }

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
    
    testTags("1<SCRIPT/XSS SRC=\"http://xss.rocks/xss.js\"></SCRIPT>2", "12");
    testTags("1<BODY onload!#$%&()*~+-_.,:;?@[/|\\]^`=alert(\"XSS\")>2", "12");
    testTags("1<SCRIPT/SRC=\"http://xss.rocks/xss.js\"></SCRIPT>2", "12");
    testTags("1<<SCRIPT>alert(\"XSS\");//<</SCRIPT>", "1alert(\"XSS\");//");
    testTags("1<SCRIPT SRC=http://xss.rocks/xss.js?< B >", "1");
    testTags("1<SCRIPT SRC=//xss.rocks/.j>2", "12");
    testTags("1<IMG SRC=\"javascript:alert('XSS')\"", "1");
    testTags("1<iframe src=http://xss.rocks/scriptlet.html <", "1");
    testTags("1</script><script>alert('XSS');</script>", "1alert('XSS');");
    testTags("1<INPUT TYPE=\"IMAGE\" SRC=\"javascript:alert('XSS');\">", "1");
    testTags("1<BODY BACKGROUND=\"javascript:alert('XSS')\">", "1");
    testTags("<IMG DYNSRC=\"javascript:alert('XSS')\">", "<IMG >");
    testTags("<IMG LOWSRC=\"javascript:alert('XSS')\">", "<IMG >");
    testTags("1<STYLE>li {list-style-image: url(\"javascript:alert('XSS')\");}</STYLE><UL><LI>XSS</br>", "1li {list-style-image: url(\"javascript:alert('XSS')\");}<UL><LI>XSS</br>");
    testTags("<IMG SRC='vbscript:msgbox(\"XSS\")'>", "<IMG >");
    testTags("<IMG SRC=\"livescript:[code]\">", "<IMG >");
    testTags("1<svg/onload=alert('XSS')>2", "12");
    testTags("1<BGSOUND SRC=\"javascript:alert('XSS');\">2", "12");
    // testTags("<BR SIZE=\"&{alert('XSS')}\">", "<BR >");
    testTags("1<LINK REL=\"stylesheet\" HREF=\"javascript:alert('XSS');\">2", "12");
    testTags("1<LINK REL=\"stylesheet\" HREF=\"http://xss.rocks/xss.css\">2", "12");
    testTags("<STYLE>@import'http://xss.rocks/xss.css';</STYLE>", "@import'http://xss.rocks/xss.css';");
    
    testTags("1<META HTTP-EQUIV=\"Link\" Content=\"<http://xss.rocks/xss.css>; REL=stylesheet\">2", "12");
    testTags("1<META HTTP-EQUIV=\"refresh\" CONTENT=\"0;url=javascript:alert('XSS');\">2", "12");
    testTags("1<META HTTP-EQUIV=\"refresh\" CONTENT=\"0;url=data:text/html base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K\">2", "12");
    testTags("1¼script¾window.x¼/script¾2", "1window.x2");
    // testTags("<div STYLE=\"xss:expression(alert('XSS'))\">", "<div >");
    
});
