"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLRewriter = exports.TextChunk = exports.Element = exports.ContentType = void 0;
const htmlparser2_1 = require("htmlparser2");
const stream_1 = require("stream");
const html_entities_1 = require("html-entities");
const css_what_1 = require("css-what");
const selfClosingTags = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);
var ContentType;
(function (ContentType) {
    ContentType["Html"] = "html";
    ContentType["Text"] = "text";
})(ContentType = exports.ContentType || (exports.ContentType = {}));
const entities = new html_entities_1.AllHtmlEntities();
class ElementInsert {
    constructor(content, type) {
        this.content = content;
        this.type = type;
    }
    serialize(out) {
        switch (this.type) {
            case ContentType.Html: {
                out.write(this.content);
            }
            case ContentType.Text: {
                const ser = entities.encode(this.content);
                out.write(ser);
            }
        }
    }
}
/** represents the start tag of an element */
class Element {
    constructor(name, attributes, parent) {
        this.name = name;
        this.attributes = attributes;
        this.parent = parent;
        this.wasReplaced = false;
        this.replaceIns = null;
        this.innerIns = null;
        this.beforeIns = [];
        this.afterIns = [];
        this.prependIns = [];
        this.appendIns = [];
        this.textCbs = [];
        this.noChildNodes = false;
        this.selfClosing = false;
        this.originalTagName = name;
        this.selfClosing = selfClosingTags.has(name);
    }
    get tagName() {
        return this.name;
    }
    set tagName(name) {
        this.name = name;
        this.selfClosing = selfClosingTags.has(name);
    }
    getAttribute(name) {
        return this.attributes[name];
    }
    hasAttribute(name) {
        return name in this.attributes;
    }
    setAttribute(name, value) {
        this.attributes[name] = value !== null && value !== void 0 ? value : null;
    }
    removeAttribute(name) {
        delete this.attributes[name];
    }
    before(content, type) {
        this.beforeIns.push(new ElementInsert(content, type));
    }
    after(content, type) {
        this.afterIns.splice(0, 0, new ElementInsert(content, type));
    }
    prepend(content, type) {
        if (this.selfClosing) {
            throw new Error("self-closing tags cannot have content");
        }
        this.prependIns.push(new ElementInsert(content, type));
    }
    append(content, type) {
        if (this.selfClosing) {
            throw new Error("self-closing tags cannot have content");
        }
        this.appendIns.splice(0, 0, new ElementInsert(content, type));
    }
    setInnerContent(content, type) {
        this.innerIns = new ElementInsert(content, type);
    }
    replace(content, type) {
        this.replaceIns = new ElementInsert(content, type);
    }
    onText(cb) {
        this.textCbs.push(cb);
    }
    serializeStart(out) {
        for (const ins of this.beforeIns) {
            ins.serialize(out);
        }
        this.beforeIns = []; // cleanup
        if (this.replaceIns != null) {
            this.replaceIns.serialize(out);
            // cleanup
            this.wasReplaced = true;
            this.noChildNodes = true;
            this.replaceIns = null;
            // definitely never read
            this.prependIns = [];
            this.appendIns = [];
            return;
        }
        const attrs = Object.entries(this.attributes)
            .map(([key, val]) => (val != null ? ` ${key}="${val}"` : ` ${key}`))
            .join("");
        const closer = this.selfClosing ? " /" : "";
        out.write(`<${this.name}${attrs}${closer}>`);
        for (const ins of this.prependIns) {
            ins.serialize(out);
        }
        this.prependIns = []; // cleanup
        if (this.innerIns != null) {
            this.innerIns.serialize(out);
            this.innerIns = null;
            this.noChildNodes = true;
        }
    }
    serializeEnd(out) {
        if (this.selfClosing) {
            return;
        }
        if (!this.wasReplaced) {
            for (const ins of this.appendIns) {
                ins.serialize(out);
            }
            out.write(`</${this.name}>`);
        }
        for (const ins of this.afterIns) {
            ins.serialize(out);
        }
    }
    matchesAttributeSelector(selector) {
        var _a, _b;
        const attrVal = this.getAttribute(selector.name);
        switch (selector.action) {
            case "any":
            case "exists":
                return !!attrVal;
            case "equals":
                return attrVal == selector.value;
            case "start":
                return (_a = attrVal === null || attrVal === void 0 ? void 0 : attrVal.startsWith(selector.value)) !== null && _a !== void 0 ? _a : false;
            case "end":
                return (_b = attrVal === null || attrVal === void 0 ? void 0 : attrVal.endsWith(selector.value)) !== null && _b !== void 0 ? _b : false;
            case "not":
                return attrVal != selector.value;
            case "element": {
                if (!attrVal) {
                    return false;
                }
                const pieces = attrVal.split(" ");
                return pieces.indexOf(selector.value) != -1;
            }
        }
        return false;
    }
    matchesSelector(selector) {
        switch (selector.type) {
            case "universal":
                return true; // matches anything
            case "tag":
                return this.tagName == selector.name;
            case "attribute":
                return this.matchesAttributeSelector(selector);
            case "pseudo":
            case "pseudo-element":
                console.warn("Pseudo selectors are not supported");
                return false;
        }
    }
    matchesSelectors(selectors) {
        for (const sel of selectors) {
            if (!this.matchesSelector(sel)) {
                return false;
            }
        }
        return true;
    }
    matchesUpwards(selectors, upwards) {
        var _a, _b;
        if (this.matchesSelectors(selectors)) {
            return this;
        }
        if (!upwards) {
            return null;
        }
        return (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.matchesUpwards(selectors, upwards)) !== null && _b !== void 0 ? _b : null;
    }
    matches(query) {
        if (typeof query === "string") {
            const queries = css_what_1.parse(query);
            return this.matchesAny(queries);
        }
        let elem = this;
        let matchUpwards = false;
        // stack of selectors to test against an element
        const selectorStack = [];
        // matches from right to left
        // this is useful because we only have access to ancestors,
        // not children or siblings
        // obviously cannot support sibiling selectors
        for (const prop of [...query].reverse()) {
            switch (prop.type) {
                case "descendant":
                case "child":
                    const matchedElem = elem.matchesUpwards(selectorStack, matchUpwards);
                    if (!matchedElem) {
                        return false;
                    }
                    if (!matchedElem.parent) {
                        return false;
                    }
                    elem = matchedElem.parent;
                    matchUpwards = false;
                    selectorStack.splice(0, selectorStack.length); // clear
                    break; // check next selectors
                case "adjacent":
                case "sibling":
                case "parent":
                    console.warn(`${prop.type} selectors are not supported`);
                    return false;
                default:
                    // will be evaluated when a traversal selector is encountered
                    selectorStack.push(prop);
            }
            if (prop.type === "descendant") {
                matchUpwards = true;
            }
        }
        return !!elem.matchesUpwards(selectorStack, matchUpwards);
    }
    matchesAny(queries) {
        for (const query of queries) {
            if (this.matches(query)) {
                return true;
            }
        }
        return false;
    }
    // for internal use
    triggerText(text) {
        for (const cb of this.textCbs) {
            cb(text);
        }
    }
}
exports.Element = Element;
class DiscardedElement extends Element {
    constructor(name, parent) {
        super(name, {}, parent);
    }
}
class TextChunk {
    constructor(text) {
        this.text = text;
        this.beforeIns = [];
        this.afterIns = [];
    }
    replace(text) {
        this.text = text;
    }
    before(content, type) {
        this.beforeIns.push(new ElementInsert(content, type));
    }
    after(content, type) {
        this.afterIns.splice(0, 0, new ElementInsert(content, type));
    }
    serialize(out) {
        for (const ins of this.beforeIns) {
            ins.serialize(out);
        }
        out.write(this.text);
        for (const ins of this.afterIns) {
            ins.serialize(out);
        }
    }
}
exports.TextChunk = TextChunk;
class HTMLRewriterTransformer extends stream_1.Writable {
    constructor(handler, out) {
        super();
        this.handler = handler;
        this.out = out;
        this.parser = null;
        this.stack = [];
        this.stream = new htmlparser2_1.WritableStream(this);
    }
    _write(chunk, encoding, callback) {
        this.stream.write(chunk, encoding, callback);
    }
    onparserinit(streamParser) {
        this.parser = streamParser;
    }
    /** Methods for the parser */
    onreset() {
        throw new Error("this parser cannot be reset");
    }
    onend() {
        // output any leftover elements (unlikely if html was valid)
        for (const elem of this.stack) {
            elem.serializeEnd(this.out);
        }
    }
    onerror(error) {
        throw error;
    }
    onopentag(name, attribs) {
        var _a, _b;
        const parent = this.stack[this.stack.length - 1];
        if (parent && (parent.noChildNodes || parent instanceof DiscardedElement)) {
            // if the element or one of it's ancestors replaced its inner content
            // we still need to maintain a correct stack
            // but don't trigger any callbacks
            this.stack.push(new DiscardedElement(name, parent));
            return;
        }
        const elem = new Element(name, attribs, parent);
        (_b = (_a = this.handler).element) === null || _b === void 0 ? void 0 : _b.call(_a, elem);
        elem.serializeStart(this.out);
        this.stack.push(elem);
    }
    onclosetag(name) {
        if (this.stack[this.stack.length - 1].originalTagName != name) {
            // this should be very rare since htmlparser2 does most of the input validation
            console.warn("closed element in input html that was never opened. ignoring.");
            return;
        }
        const top = this.stack.pop();
        if (top instanceof DiscardedElement) {
            return;
        }
        top === null || top === void 0 ? void 0 : top.serializeEnd(this.out);
    }
    ontext(text) {
        const chunk = new TextChunk(text);
        const current = this.stack[this.stack.length - 1];
        if (current &&
            (current.noChildNodes || current instanceof DiscardedElement)) {
            return;
        }
        current === null || current === void 0 ? void 0 : current.triggerText(chunk);
        chunk.serialize(this.out);
    }
    oncomment(data) {
        // todo: expose comment callback
        this.out.write(`<!--${data}-->`);
    }
    oncommentend() { }
    oncdatastart() { }
    oncdataend() { }
    onprocessinginstruction(name, data) {
        // todo: expose document level callbacks
        this.out.write(`<${data}>`);
    }
}
class HTMLRewriter {
    constructor() {
        this.rules = [];
    }
    on(selector, cb) {
        const queries = css_what_1.parse(selector);
        this.rules.push({
            queries,
            cb,
        });
        return this;
    }
    transformInto(writer) {
        const rules = this.rules;
        return new HTMLRewriterTransformer({
            element(elem) {
                for (const rule of rules) {
                    if (elem.matchesAny(rule.queries)) {
                        rule.cb(elem);
                    }
                }
            },
        }, writer);
    }
}
exports.HTMLRewriter = HTMLRewriter;
