"use strict";

const assert = require("assert");
const sanitize = require("../src/index");

describe("check default valid html", () => {
    it("div style", () => {
        let html = "<div style='color:red;'>nice</div>";
        let clean = sanitize(html);
        
        assert.equal(html, clean);
    });
});
