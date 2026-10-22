/*! room-lights-card 1.0.3 | MIT License */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e5;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e5) => {
  const o6 = 1 === t4.length ? t4[0] : e5.reduce((e6, s4, o7) => e6 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o7 + 1], t4[0]);
  return new n(o6, t4, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e5 = "";
  for (const s4 of t5.cssRules) e5 += s4.cssText;
  return r(e5);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e5, set: r6 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r6?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e5 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t4);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t5 = i5.getPropertyOptions(e5), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e5;
      const r6 = h3.fromAttribute(s4, t5.type);
      this[e5] = r6 ?? this._$Ej?.get(e5) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e5 = false, h3) {
    if (void 0 !== t4) {
      const r6 = this.constructor;
      if (false === e5 && (h3 = this[t4]), i5 ?? (i5 = r6.getPropertyOptions(t4)), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r6) {
    i5 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e5 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e5 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t5) => this._$ET(t5, this[t5]))), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e5) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r6.getAttribute(t5).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r6.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t5));
        if (y2.test(r6.tagName)) {
          const t5 = r6.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r6.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t5[i6], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r6.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t4), h3._$AT(t4, s4, e5)), void 0 !== e5 ? (s4._$Co ?? (s4._$Co = []))[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i6;
        2 === r6.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r6.type ? i6 = new r6.ctor(h3, r6.name, r6.strings, this, t4) : 6 === r6.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r6 = s4[++n5];
      }
      o6 !== r6?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e5;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e5 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t5 = new R(e5, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t4) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o6 = !a2(t4) || t4 !== this._$AH && t4 !== E, o6 && (this._$AH = t4);
    else {
      const e6 = t4;
      let n5, r6;
      for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e6[s4 + n5], i5, n5), r6 === E && (r6 = this._$AH[n5]), o6 || (o6 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e5 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e5, h3) {
    super(t4, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.3");
var D = (t4, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t4 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t4.firstChild), t4;
  }
  update(t4) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t4) => (e5, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t4, e5);
  }) : customElements.define(t4, e5);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t4 = o5, e5, r6) => {
  const { kind: n5, metadata: i5 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r6.name, t4), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t4, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e5.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t4) {
  return (e5, o6) => "object" == typeof o6 ? r4(t4, e5, o6) : ((t5, e6, o7) => {
    const r6 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t5), r6 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t4, e5, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// src/const.ts
var CARD_VERSION = "1.0.3";
var DEFAULT_ICON = "mdi:lightbulb-group";
var KEY_STEP = 5;
var PAGE_STEP = 10;
var KEY_DELAY_MS = 400;

// src/lights.ts
var domainOf = (entityId) => entityId.split(".")[0];
function lightsOf(config) {
  return longForm(config.lights);
}
function scenesOf(config) {
  return longForm(config.scenes);
}
function longForm(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map((item) => typeof item === "string" ? { entity: item } : item).filter(
    (item) => !!item && typeof item === "object" && typeof item.entity === "string" && !!item.entity
  );
}
function areaOf(hass, entityId) {
  const entry = hass.entities?.[entityId];
  if (!entry) {
    return void 0;
  }
  return entry.area_id ?? (entry.device_id ? hass.devices?.[entry.device_id]?.area_id ?? void 0 : void 0);
}
function membersOf(entity) {
  if (!entity || domainOf(entity.entity_id) !== "light") {
    return [];
  }
  return stringList(entity.attributes.entity_id ?? entity.attributes.group_entities);
}
function targetsOf(entity, scripts = {}) {
  if (!entity) {
    return [];
  }
  const domain = domainOf(entity.entity_id);
  return domain === "scene" ? stringList(entity.attributes.entity_id) : domain === "script" ? scripts[entity.entity_id] ?? [] : [];
}
function lightsIn(config) {
  const found = /* @__PURE__ */ new Set();
  const walk = (value) => {
    if (typeof value === "string") {
      for (const match of value.matchAll(/\blight\.[a-z0-9_]+/g)) {
        found.add(match[0]);
      }
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.entries(value).filter(([key]) => key !== "action" && key !== "service").forEach(([, inner]) => walk(inner));
    }
  };
  walk(config);
  return [...found];
}
function stringList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}
function isDimmable(entity) {
  const modes = entity?.attributes.supported_color_modes;
  return !!entity && domainOf(entity.entity_id) === "light" && Array.isArray(modes) && modes.some((mode) => mode !== "onoff");
}
var isOn = (entity) => entity?.state === "on";
var isUnavailable = (entity) => !entity || entity.state === "unavailable";
function brightnessPct(entity) {
  const brightness = entity?.attributes.brightness;
  return isOn(entity) && typeof brightness === "number" ? Math.max(1, Math.round(brightness / 255 * 100)) : void 0;
}
function lightColor(entity) {
  const rgb = entity?.attributes.rgb_color;
  if (!isOn(entity) || !Array.isArray(rgb) || rgb.length !== 3 || luminance(rgb) > WHITE_LUMINANCE) {
    return void 0;
  }
  return `rgb(${rgb.join(", ")})`;
}
var WHITE_LUMINANCE = 0.8;
function luminance(rgb) {
  const [r6, g2, b3] = rgb.map((value) => {
    const share = value / 255;
    return share <= 0.04045 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r6 + 0.7152 * g2 + 0.0722 * b3;
}
function touches(hass, light, target) {
  return light === target || membersOf(hass.states[light]).includes(target) || membersOf(hass.states[target]).includes(light);
}
function placeOf(hass, scene, lights) {
  if (scene.position && scene.position !== "auto") {
    return lights.includes(scene.position) ? scene.position : "room";
  }
  const targets = targetsOf(hass.states[scene.entity]);
  const touched = lights.filter((light) => targets.some((target) => touches(hass, light, target)));
  return touched.length === 1 ? touched[0] : "room";
}
function sceneAreas(hass, sceneId, scripts = {}) {
  const areas = /* @__PURE__ */ new Set();
  for (const target of targetsOf(hass.states[sceneId], scripts)) {
    if (domainOf(target) !== "light") {
      continue;
    }
    const own = areaOf(hass, target);
    for (const area of own ? [own] : membersOf(hass.states[target]).map((member) => areaOf(hass, member))) {
      if (area) {
        areas.add(area);
      }
    }
  }
  return areas;
}
function roomState(hass, lights) {
  const on = lights.map((id) => hass.states[id]).filter(isOn);
  const levels = on.map(brightnessPct).filter((level) => level !== void 0);
  return {
    on: on.length,
    total: lights.length,
    brightness: levels.length ? Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length) : void 0,
    color: lightColor(on[0])
  };
}
function groupKind(hass, entityId) {
  const members = membersOf(hass.states[entityId]);
  if (!members.length) {
    return "none";
  }
  const entry = hass.entities?.[entityId];
  if (entry?.platform === "group") {
    return "left-out";
  }
  const device = entry?.device_id;
  return device && members.some((member) => hass.entities?.[member]?.device_id === device) ? "left-out" : "stands-in";
}
function areaLights(hass, area) {
  if (!area) {
    return [];
  }
  const lights = Object.values(hass.entities ?? {}).filter((entry) => !!entry && domainOf(entry.entity_id) === "light" && !entry.hidden && !entry.entity_category).map((entry) => entry.entity_id).filter((id) => hass.states[id] && areaOf(hass, id) === area);
  const replaced = new Set(lights.filter((id) => groupKind(hass, id) === "stands-in").flatMap((id) => membersOf(hass.states[id])));
  return lights.filter((id) => !replaced.has(id) && groupKind(hass, id) !== "left-out").sort((a3, b3) => friendlyName(hass, a3).localeCompare(friendlyName(hass, b3)));
}
function areaScenes(hass, area, lights, scripts = {}) {
  const scenes = Object.keys(hass.states).filter((id) => ["scene", "script"].includes(domainOf(id)));
  const chosen = area ? scenes.filter((id) => {
    const areas = sceneAreas(hass, id, scripts);
    if ([...areas].some((other) => other !== area)) {
      return false;
    }
    return areaOf(hass, id) === area || targetsOf(hass.states[id], scripts).some((target) => lights.some((light) => touches(hass, light, target)));
  }) : scenes.filter((id) => sceneAreas(hass, id, scripts).size >= 2);
  return chosen.sort((a3, b3) => friendlyName(hass, a3).localeCompare(friendlyName(hass, b3)));
}
function friendlyName(hass, entityId) {
  const name = hass.states[entityId]?.attributes.friendly_name;
  return typeof name === "string" && name ? name : entityId;
}
function lightName(hass, entityId, lights, areaName) {
  const state = hass.states[entityId];
  if (!state) {
    return entityId;
  }
  const device = hass.entities?.[entityId]?.device_id;
  const alone = !!device && lights.filter((id) => hass.entities?.[id]?.device_id === device).length === 1;
  let name = "";
  if (hass.formatEntityName) {
    name = (alone ? hass.formatEntityName(state, [{ type: "device" }]) : "") || hass.formatEntityName(state, [{ type: "device" }, { type: "entity" }]);
  }
  name = name || friendlyName(hass, entityId);
  return withoutArea(name, areaName);
}
var SEPARATORS = "\\s,|/\\-\u2013\u2014";
function withoutArea(name, areaName) {
  if (!areaName) {
    return name;
  }
  const area = areaName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const first = new RegExp(`^${area}[${SEPARATORS}]+`, "iu");
  const started = first.test(name);
  const shorter = name.replace(first, "").replace(new RegExp(`[${SEPARATORS}]+${area}(?=[${SEPARATORS}]|$)`, "giu"), "").trim();
  if (!shorter || shorter === name.trim()) {
    return name;
  }
  return started ? shorter.charAt(0).toLocaleUpperCase() + shorter.slice(1) : shorter;
}
function firstArea(hass) {
  return Object.values(hass.areas ?? {}).filter((area) => !!area).sort((a3, b3) => a3.name.localeCompare(b3.name)).map((area) => area.area_id).find((area) => areaLights(hass, area).length > 0);
}

// src/localize/languages/en.json
var en_default = {
  common: {
    name: "Room lights",
    description: "The lights of one room, each with its own brightness control, and the room's scenes",
    lights: "Lights",
    empty: "Choose an area, lights or scenes in the card's settings.",
    invalid_configuration: "Invalid configuration. Lights and scenes must be lists.",
    off: "Off",
    on: "On",
    unavailable: "Unavailable",
    lights_on: "{on}/{total} on",
    turn_on: "Turn the room's lights on",
    turn_off: "Turn the room's lights off",
    adaptive_lighting: "Adaptive lighting",
    brightness: "{name} brightness"
  },
  editor: {
    area: "Area",
    area_helper: "Gives the card its name and icon.",
    fill: "Fill in from the area",
    fill_helper: "Replaces the card's lights and scenes with the chosen area's. Without an area, the card's contents are replaced with the scenes that change the lights of several areas.",
    name: "Name",
    icon: "Icon",
    lights: "Lights",
    lights_helper: "Dimmable lights are bars, other lights and switches are buttons. A Zigbee light group is shown as one light.",
    light_entity: "Light or switch",
    light_name: "Name",
    light_name_helper: "Leave it empty to use the device's name",
    scenes: "Scenes and scripts",
    scenes_helper: "A scene that changes only one of the card's lights is shown on the same row as that light. Other scenes are buttons at the bottom of the card, with the scripts.",
    scene_entity: "Scene or script",
    scene_name: "Name",
    scene_icon: "Icon",
    position: "Place",
    position_auto: "Automatic",
    position_room: "With the room's buttons",
    adaptive_lighting: "Adaptive Lighting switch",
    adaptive_lighting_helper: "Shown in the header, turns adaptive lighting on and off.",
    turn_on: "Turning the room's lights on",
    turn_on_helper: "Which lights the button turns on. When any light is on, the button turns the room's lights off.",
    turn_on_all: "All lights",
    turn_on_lights_option: "Preselected lights",
    turn_on_scene_option: "A scene or script",
    turn_on_lights: "Lights to turn on",
    turn_on_scene: "Scene or script to start"
  }
};

// src/localize/languages/fi.json
var fi_default = {
  common: {
    name: "Huoneen valot",
    description: "Yhden huoneen valot, jokaiselle kirkkauden s\xE4\xE4t\xF6, ja huoneen tilanteet",
    lights: "Valot",
    empty: "Valitse kortin asetuksista alue, valot tai tilanteet.",
    invalid_configuration: "Virheelliset asetukset. Valojen ja tilanteiden pit\xE4\xE4 olla listoja.",
    off: "Pois",
    on: "P\xE4\xE4ll\xE4",
    unavailable: "Ei saatavilla",
    lights_on: "{on}/{total} p\xE4\xE4ll\xE4",
    turn_on: "Sytyt\xE4 huoneen valot",
    turn_off: "Sammuta huoneen valot",
    adaptive_lighting: "Mukautuva valaistus",
    brightness: "{name}, kirkkaus"
  },
  editor: {
    area: "Alue",
    area_helper: "Antaa kortille nimen ja kuvakkeen.",
    fill: "T\xE4yt\xE4 alueelta",
    fill_helper: "Korvaa kortin valot ja tilanteet valitun alueen valoilla ja tilanteilla. Jos aluetta ei ole valittu, kortin sis\xE4lt\xF6 korvataan tilanteilla, jotka vaikuttavat usean eri alueen valoihin.",
    name: "Nimi",
    icon: "Kuvake",
    lights: "Valot",
    lights_helper: "Himmennett\xE4v\xE4t valot n\xE4kyv\xE4t palkkeina, muut valot ja kytkimet painikkeina. Zigbee-valoryhm\xE4t n\xE4ytet\xE4\xE4n yhten\xE4 valaisimena.",
    light_entity: "Valo tai kytkin",
    light_name: "Nimi",
    light_name_helper: "J\xE4tt\xE4m\xE4ll\xE4 nimen sy\xF6tt\xE4m\xE4tt\xE4, k\xE4ytet\xE4\xE4n laitteen nime\xE4",
    scenes: "Tilanteet ja skriptit",
    scenes_helper: "Tilanne, joka muuttaa vain yht\xE4 kortin valoa, n\xE4ytet\xE4\xE4n samalla rivill\xE4 kyseisen valon kanssa. Muut tilanteet ovat skriptien kanssa painikkeina kortin alalaidassa.",
    scene_entity: "Tilanne tai skripti",
    scene_name: "Nimi",
    scene_icon: "Kuvake",
    position: "Paikka",
    position_auto: "Automaattinen",
    position_room: "Huoneen painikkeissa",
    adaptive_lighting: "Adaptive Lighting -kytkin",
    adaptive_lighting_helper: "N\xE4ytet\xE4\xE4n otsikkorivill\xE4, kytkee mukautuvan valaistuksen p\xE4\xE4lle ja pois.",
    turn_on: "Huoneen valojen sytytt\xE4minen",
    turn_on_helper: "Mitk\xE4 valot painikkeesta sytytet\xE4\xE4n. Kun yksikin valo on p\xE4\xE4ll\xE4, painike sammuttaa huoneen valot.",
    turn_on_all: "Kaikki valot",
    turn_on_lights_option: "Esivalitut valot",
    turn_on_scene_option: "Tilanne tai skripti",
    turn_on_lights: "Sytytett\xE4v\xE4t valot",
    turn_on_scene: "K\xE4ynnistett\xE4v\xE4 tilanne tai skripti"
  }
};

// src/localize/localize.ts
var FILES = { "./languages/en.json": en_default, "./languages/fi.json": fi_default };
var LANGUAGES = Object.fromEntries(
  Object.entries(FILES).map(([path, table]) => [path.replace(/^.*\/|\.json$/g, "").toLowerCase(), table])
);
var LANGUAGE_CODES = Object.keys(LANGUAGES).sort();
function translate(language, key) {
  const code = (language ?? "en").split(/[-_]/)[0].toLowerCase();
  return read(LANGUAGES[code], key) ?? read(LANGUAGES.en, key) ?? key;
}
function read(table, key) {
  let value = table;
  for (const part of key.split(".")) {
    if (value === null || typeof value !== "object") {
      return void 0;
    }
    value = value[part];
  }
  return typeof value === "string" ? value : void 0;
}
function browserLanguage() {
  return document.documentElement.lang || navigator.language || "en";
}

// src/editor.ts
function fromArea(hass, config, scripts = {}) {
  const lights = areaLights(hass, config.area);
  return { ...config, lights, scenes: areaScenes(hass, config.area, lights, scripts) };
}
async function readScripts(hass) {
  const ids = Object.keys(hass.states).filter((id) => domainOf(id) === "script");
  if (!hass.callWS) {
    return {};
  }
  const read2 = await Promise.all(
    ids.map(
      (id) => hass.callWS({ type: "script/config", entity_id: id }).then(
        (answer) => [id, lightsIn(answer.config)],
        () => void 0
      )
    )
  );
  return Object.fromEntries(read2.filter((entry) => entry !== void 0));
}
function compact(config) {
  const result = { ...config };
  const lights = lightsOf(config).map((light) => light.name ? { entity: light.entity, name: light.name } : light.entity);
  const scenes = scenesOf(config).map((scene) => {
    const entry = { entity: scene.entity };
    if (scene.name) {
      entry.name = scene.name;
    }
    if (scene.icon) {
      entry.icon = scene.icon;
    }
    if (scene.position && scene.position !== "auto") {
      entry.position = scene.position;
    }
    return Object.keys(entry).length > 1 ? entry : entry.entity;
  });
  result.lights = lights;
  result.scenes = scenes;
  if (result.turn_on !== "lights" || !result.turn_on_lights?.length) {
    delete result.turn_on_lights;
  }
  if (result.turn_on !== "scene") {
    delete result.turn_on_scene;
  }
  if (result.turn_on === "all") {
    delete result.turn_on;
  }
  for (const key of ["area", "name", "icon", "adaptive_lighting", "turn_on", "turn_on_scene", "lights", "scenes"]) {
    const value = result[key];
    if (value === void 0 || value === null || value === "" || Array.isArray(value) && !value.length) {
      delete result[key];
    }
  }
  return result;
}
var RoomLightsCardEditor = class extends i4 {
  constructor() {
    super(...arguments);
    this.config = { type: "custom:room-lights-card" };
  }
  setConfig(config) {
    this.config = { ...config };
  }
  render() {
    if (!this.hass) {
      return A;
    }
    const hass = this.hass;
    const lights = lightsOf(this.config);
    const ids = lights.map((light) => light.entity);
    const area = this.config.area ? hass.areas?.[this.config.area] : void 0;
    const data = {
      turn_on: "all",
      ...this.config,
      lights,
      scenes: scenesOf(this.config).map((scene) => ({ position: "auto", ...scene }))
    };
    const turnOn = this.config.turn_on ?? "all";
    return b2`
            ${this.form(data, [
      { name: "area", selector: { area: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: { placeholder: area?.icon ?? void 0 } } }
        ]
      }
    ])}
            <div class="fill">
                <ha-button appearance="filled" size="small" @click=${this.fill}>${this.text("editor.fill")}</ha-button>
                <p class="helper">${this.text("editor.fill_helper")}</p>
            </div>
            ${this.form(data, [this.lightsField()])}
            <p class="helper">${this.text("editor.lights_helper")}</p>
            ${this.form(data, [this.scenesField(lights, area?.name)])}
            <p class="helper">${this.text("editor.scenes_helper")}</p>
            ${this.form(data, [
      { name: "adaptive_lighting", selector: { entity: { filter: [{ domain: "switch", integration: "adaptive_lighting" }] } } },
      {
        name: "turn_on",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "all", label: this.text("editor.turn_on_all") },
              { value: "lights", label: this.text("editor.turn_on_lights_option") },
              { value: "scene", label: this.text("editor.turn_on_scene_option") }
            ]
          }
        }
      },
      ...turnOn === "lights" ? [{ name: "turn_on_lights", selector: { entity: { multiple: true, include_entities: ids } } }] : [],
      ...turnOn === "scene" ? [{ name: "turn_on_scene", selector: { entity: { filter: [{ domain: ["scene", "script"] }] } } }] : []
    ])}
        `;
  }
  form(data, schema) {
    return b2`<ha-form
            .hass=${this.hass}
            .data=${data}
            .schema=${schema}
            .computeLabel=${(entry) => this.text(`editor.${entry.name}`)}
            .computeHelper=${(entry) => this.helper(entry.name)}
            @value-changed=${this.valueChanged}
        ></ha-form>`;
  }
  /** A field inside the object selector takes its helper from `description`, as ha-form's computeHelper doesn't reach it. */
  lightsField() {
    return {
      name: "lights",
      selector: {
        object: {
          multiple: true,
          label_field: "entity",
          description_field: "name",
          fields: {
            entity: {
              label: this.text("editor.light_entity"),
              required: true,
              selector: { entity: { filter: [{ domain: ["light", "switch"] }] } }
            },
            name: {
              label: this.text("editor.light_name"),
              description: this.text("editor.light_name_helper"),
              selector: { text: {} }
            }
          }
        }
      }
    };
  }
  /** A scene's place is offered among the card's dimmable lights, as only they have a row of their own. */
  scenesField(lights, areaName) {
    const hass = this.hass;
    const ids = lights.map((light) => light.entity);
    const rows = lights.filter((light) => isDimmable(hass.states[light.entity])).map((light) => ({ value: light.entity, label: light.name || lightName(hass, light.entity, ids, areaName) }));
    return {
      name: "scenes",
      selector: {
        object: {
          multiple: true,
          label_field: "entity",
          description_field: "name",
          fields: {
            entity: {
              label: this.text("editor.scene_entity"),
              required: true,
              selector: { entity: { filter: [{ domain: ["scene", "script"] }] } }
            },
            name: { label: this.text("editor.scene_name"), selector: { text: {} } },
            icon: { label: this.text("editor.scene_icon"), selector: { icon: {} } },
            position: {
              label: this.text("editor.position"),
              selector: {
                select: {
                  mode: "dropdown",
                  options: [
                    { value: "auto", label: this.text("editor.position_auto") },
                    { value: "room", label: this.text("editor.position_room") },
                    ...rows
                  ]
                }
              }
            }
          }
        }
      }
    };
  }
  static get styles() {
    return i`
            ha-form {
                display: block;
                margin-bottom: 8px;
            }

            .fill {
                margin: 0 0 16px;
                padding: 0 16px;
            }

            .fill .helper {
                margin: 6px 0 0;
                padding: 0;
            }

            .helper {
                margin: 0 0 16px;
                padding: 0 16px;
                font-size: 12px;
                line-height: 1.4;
                color: var(--secondary-text-color);
            }
        `;
  }
  valueChanged(event) {
    this.changed({ ...this.config, ...event.detail.value });
  }
  async fill() {
    if (this.hass) {
      this.changed(fromArea(this.hass, this.config, await readScripts(this.hass)));
    }
  }
  changed(config) {
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: compact(config) }, bubbles: true, composed: true }));
  }
  text(key) {
    return translate(this.language(), key);
  }
  helper(name) {
    const key = `editor.${name}_helper`;
    const helper = translate(this.language(), key);
    return helper === key ? void 0 : helper;
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
};
__decorateClass([
  n4({ attribute: false })
], RoomLightsCardEditor.prototype, "hass", 2);
__decorateClass([
  r5()
], RoomLightsCardEditor.prototype, "config", 2);
RoomLightsCardEditor = __decorateClass([
  t3("room-lights-card-editor")
], RoomLightsCardEditor);

// src/room-lights-card.ts
console.info(
  `%c  ROOM-LIGHTS-CARD 
%c  ${CARD_VERSION}     `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
var registry = window;
registry.customCards = registry.customCards ?? [];
registry.customCards.push({
  type: "room-lights-card",
  name: translate(browserLanguage(), "common.name"),
  description: translate(browserLanguage(), "common.description"),
  documentationURL: "https://github.com/jesmak/room-lights-card",
  preview: true
});
function pctAt(event, bar) {
  const box = bar.getBoundingClientRect();
  const share = box.width > 0 ? (event.clientX - box.left) / box.width : 0;
  return Math.round(Math.min(1, Math.max(0, share)) * 100);
}
var RoomLightsCard = class extends i4 {
  constructor() {
    super(...arguments);
    this.pending = /* @__PURE__ */ new Map();
    /** Key presses waiting to be sent, per light, as each light's keys are sent on their own. */
    this.keyTimers = /* @__PURE__ */ new Map();
    this.dragMove = (event) => {
      if (this.drag) {
        this.drag = { ...this.drag, pct: pctAt(event, event.currentTarget) };
      }
    };
    /** The change is sent when the bar is let go, not while it moves, so a light gets one command per drag. */
    this.dragEnd = (event) => {
      if (!this.drag) {
        return;
      }
      const { entity } = this.drag;
      const pct = pctAt(event, event.currentTarget);
      this.drag = void 0;
      if (!isUnavailable(this.hass?.states[entity])) {
        this.setBrightness(entity, pct);
      }
    };
    /** The browser took the pointer for scrolling: nothing is sent. */
    this.dragCancel = () => {
      this.drag = void 0;
    };
  }
  static getConfigElement() {
    return document.createElement("room-lights-card-editor");
  }
  /** Added from the picker, the card shows the first area, by name, that has lights. */
  static getStubConfig(hass) {
    const area = hass ? firstArea(hass) : void 0;
    if (!hass || !area) {
      return {};
    }
    const lights = areaLights(hass, area);
    return { area, lights, scenes: areaScenes(hass, area, lights) };
  }
  setConfig(config) {
    if (!config || config.lights !== void 0 && !Array.isArray(config.lights) || config.scenes !== void 0 && !Array.isArray(config.scenes)) {
      throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
    }
    this.config = { ...config };
  }
  getCardSize() {
    const lights = this.config ? lightsOf(this.config) : [];
    const bars = lights.filter((light) => isDimmable(this.hass?.states[light.entity])).length;
    return 2 + bars;
  }
  /** In a sections view the card takes a whole section by default and is never narrower than half of one. */
  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }
  /**
   * A change still waiting for its keys to stop is sent at once, not lost, when the card leaves the page. A drag still
   * under way is forgotten, as its release never comes, such as when a popup closes under the finger.
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.drag = void 0;
    for (const [entity, { timer, pct }] of this.keyTimers) {
      clearTimeout(timer);
      this.sendKeys(entity, pct);
    }
  }
  shouldUpdate(changed) {
    const previous = changed.get("hass");
    if (!this.config || !this.hass || changed.size > 1 || !changed.has("hass") || !previous) {
      return true;
    }
    if (previous.areas !== this.hass.areas || previous.entities !== this.hass.entities || previous.devices !== this.hass.devices || previous.locale !== this.hass.locale) {
      return true;
    }
    return this.watched().some((id) => previous.states[id] !== this.hass?.states[id]);
  }
  willUpdate(changed) {
    if (changed.has("hass") && this.pending.size) {
      const waiting = new Map(
        [...this.pending].filter(([id, pending]) => this.keyTimers.has(id) || this.hass?.states[id] === pending.state)
      );
      if (waiting.size !== this.pending.size) {
        this.pending = waiting;
      }
    }
  }
  watched() {
    const config = this.config;
    return [
      ...lightsOf(config).map((light) => light.entity),
      ...scenesOf(config).map((scene) => scene.entity),
      ...[config.adaptive_lighting, config.turn_on_scene].filter((id) => !!id)
    ];
  }
  render() {
    if (!this.hass || !this.config) {
      return A;
    }
    const hass = this.hass;
    const lights = lightsOf(this.config);
    const ids = lights.map((light) => light.entity);
    const scenes = scenesOf(this.config);
    const area = this.config.area ? hass.areas?.[this.config.area] : void 0;
    const names = new Map(lights.map((light) => [light.entity, light.name || lightName(hass, light.entity, ids, area?.name)]));
    const bars = lights.filter((light) => isDimmable(hass.states[light.entity]));
    const pills = lights.filter((light) => !isDimmable(hass.states[light.entity]));
    const places = new Map(
      scenes.map((scene) => {
        const place = placeOf(hass, scene, ids);
        return [scene, bars.some((light) => light.entity === place) ? place : "room"];
      })
    );
    const roomScenes = scenes.filter((scene) => places.get(scene) === "room");
    const rowScenes = new Map(bars.map((light) => [light.entity, scenes.filter((scene) => places.get(scene) === light.entity)]));
    const slots = Math.max(0, ...[...rowScenes.values()].map((list) => list.length));
    const labelled = lights.length > 1;
    return b2`
            <ha-card>
                ${this.header(ids, area?.name, area?.icon ?? void 0, roomState(hass, ids))}
                ${bars.length ? b2`<div class="bars" style="--rlc-slots: ${slots}">
                              ${bars.map((light) => this.bar(light, names.get(light.entity), labelled, rowScenes.get(light.entity), slots > 0))}
                          </div>` : A}
                ${pills.length ? b2`<div class="pills">${pills.map((light) => this.pill(light, names.get(light.entity)))}</div>` : A}
                ${roomScenes.length ? b2`<div class="chips">${roomScenes.map((scene) => this.sceneButton(scene, true))}</div>` : A}
                ${!lights.length && !scenes.length ? b2`<div class="message">${this.text("common.empty")}</div>` : A}
            </ha-card>
        `;
  }
  /** The room's icon, which turns its lights on and off, its name and state, and Adaptive Lighting's switch. */
  header(ids, areaName, areaIcon, room) {
    const config = this.config;
    const name = config.name || areaName || this.text("common.lights");
    const icon = config.icon || areaIcon || DEFAULT_ICON;
    const on = room.on > 0;
    const adaptive = config.adaptive_lighting ? this.hass?.states[config.adaptive_lighting] : void 0;
    const single = ids.length === 1 ? ids[0] : void 0;
    return b2`
            <div class="header">
                ${ids.length ? b2`<button
                              class="room-icon ${on ? "on" : ""}"
                              style=${room.color ? `--light-color: ${room.color}` : ""}
                              title=${this.text(on ? "common.turn_off" : "common.turn_on")}
                              aria-label=${this.text(on ? "common.turn_off" : "common.turn_on")}
                              @click=${() => this.toggleRoom(ids, on)}
                          >
                              <ha-icon .icon=${icon}></ha-icon>
                          </button>` : b2`<span class="room-icon"><ha-icon .icon=${icon}></ha-icon></span>`}
                <div class="title">
                    ${single ? b2`<button class="name" @click=${() => this.moreInfo(single)}>${name}</button>` : b2`<div class="name">${name}</div>`}
                    ${ids.length ? b2`<div class="status">${this.status(ids, room)}</div>` : A}
                </div>
                ${config.adaptive_lighting ? b2`<button
                              class="icon-button adaptive ${isOn(adaptive) ? "on" : ""}"
                              title=${this.text("common.adaptive_lighting")}
                              aria-label=${this.text("common.adaptive_lighting")}
                              aria-pressed=${isOn(adaptive) ? "true" : "false"}
                              ?disabled=${isUnavailable(adaptive)}
                              @click=${() => this.call("switch", "toggle", config.adaptive_lighting)}
                          >
                              <ha-icon icon="mdi:theme-light-dark"></ha-icon>
                          </button>` : A}
            </div>
        `;
  }
  /** "60 % · 2/3 on". The brightness is the average of the dimmable lights that are on. */
  status(ids, room) {
    if (ids.every((id) => isUnavailable(this.hass?.states[id]))) {
      return this.text("common.unavailable");
    }
    if (room.on === 0) {
      return this.text("common.off");
    }
    const parts = [room.brightness !== void 0 ? this.percent(room.brightness) : this.text("common.on")];
    if (room.total > 1) {
      parts.push(this.text("common.lights_on", { on: String(room.on), total: String(room.total) }));
    }
    return parts.join(" \xB7 ");
  }
  bar(light, name, labelled, scenes, reserve) {
    const entity = this.hass?.states[light.entity];
    const unavailable = isUnavailable(entity);
    const actual = brightnessPct(entity) ?? (isOn(entity) ? 100 : 0);
    const shown = unavailable ? 0 : this.drag?.entity === light.entity ? this.drag.pct : this.pending.get(light.entity)?.pct ?? actual;
    const value = unavailable ? this.text("common.unavailable") : shown > 0 ? this.percent(shown) : this.text("common.off");
    return b2`
            <div class="row">
                ${labelled ? b2`<button class="label" @click=${() => this.moreInfo(light.entity)}>${name}</button>` : A}
                <div
                    class="bar ${shown > 0 ? "on" : ""} ${unavailable ? "unavailable" : ""}"
                    style="--light-color: ${lightColor(entity) ?? "var(--state-light-active-color, #ff9800)"}"
                    role="slider"
                    tabindex=${unavailable ? "-1" : "0"}
                    aria-label=${this.text("common.brightness", { name })}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow=${shown}
                    aria-valuetext=${value}
                    aria-disabled=${unavailable ? "true" : "false"}
                    @pointerdown=${(event) => this.dragStart(event, light.entity)}
                    @pointermove=${this.dragMove}
                    @pointerup=${this.dragEnd}
                    @pointercancel=${this.dragCancel}
                    @keydown=${(event) => this.key(event, light.entity, shown)}
                >
                    <div class="fill" style="width: ${shown}%"></div>
                    <span class="value">${value}</span>
                </div>
                ${reserve ? b2`<div class="row-scenes">${scenes.map((scene) => this.sceneButton(scene, false))}</div>` : A}
            </div>
        `;
  }
  pill(light, name) {
    const entity = this.hass?.states[light.entity];
    return b2`
            <button
                class="pill ${isOn(entity) ? "on" : ""}"
                ?disabled=${isUnavailable(entity)}
                aria-pressed=${isOn(entity) ? "true" : "false"}
                @click=${() => this.call("homeassistant", "toggle", light.entity)}
            >
                ${entity ? b2`<ha-state-icon .hass=${this.hass} .stateObj=${entity}></ha-state-icon>` : b2`<ha-icon icon="mdi:help-circle-outline"></ha-icon>`}
                <span>${name}</span>
            </button>
        `;
  }
  /** A scene as a named button with the room's, or as an icon on a light's row. */
  sceneButton(scene, named) {
    const entity = this.hass?.states[scene.entity];
    const name = scene.name || (this.hass ? friendlyName(this.hass, scene.entity) : scene.entity);
    const icon = scene.icon ? b2`<ha-icon .icon=${scene.icon}></ha-icon>` : entity ? b2`<ha-state-icon .hass=${this.hass} .stateObj=${entity}></ha-state-icon>` : b2`<ha-icon icon="mdi:palette"></ha-icon>`;
    const flashed = this.flashed === scene.entity ? "flash" : "";
    const activate = () => this.activate(scene.entity);
    return named ? b2`<button class="chip ${flashed}" ?disabled=${isUnavailable(entity)} @click=${activate}>
                  ${icon}<span>${name}</span>
              </button>` : b2`<button
                  class="icon-button scene ${flashed}"
                  title=${name}
                  aria-label=${name}
                  ?disabled=${isUnavailable(entity)}
                  @click=${activate}
              >
                  ${icon}
              </button>`;
  }
  dragStart(event, entity) {
    if (event.button > 0 || isUnavailable(this.hass?.states[entity])) {
      return;
    }
    const bar = event.currentTarget;
    bar.setPointerCapture?.(event.pointerId);
    this.drag = { entity, pct: pctAt(event, bar) };
  }
  key(event, entity, current) {
    const steps = {
      ArrowRight: KEY_STEP,
      ArrowUp: KEY_STEP,
      ArrowLeft: -KEY_STEP,
      ArrowDown: -KEY_STEP,
      PageUp: PAGE_STEP,
      PageDown: -PAGE_STEP
    };
    const target = event.key === "Home" ? 0 : event.key === "End" ? 100 : event.key in steps ? current + steps[event.key] : void 0;
    if (target === void 0 || isUnavailable(this.hass?.states[entity])) {
      return;
    }
    event.preventDefault();
    const pct = Math.min(100, Math.max(0, target));
    this.pending = new Map(this.pending).set(entity, { pct, state: this.hass?.states[entity] });
    clearTimeout(this.keyTimers.get(entity)?.timer);
    const timer = setTimeout(() => this.sendKeys(entity, pct), KEY_DELAY_MS);
    this.keyTimers.set(entity, { timer, pct });
  }
  /** A light that went unavailable while its keys waited can't be set, so its value is dropped instead. */
  sendKeys(entity, pct) {
    this.keyTimers.delete(entity);
    if (isUnavailable(this.hass?.states[entity])) {
      this.dropPending(entity);
    } else {
      this.setBrightness(entity, pct);
    }
  }
  /** 0 turns the light off. A value sent replaces any key presses still waiting on the light, as a drag's does. */
  setBrightness(entity, pct) {
    clearTimeout(this.keyTimers.get(entity)?.timer);
    this.keyTimers.delete(entity);
    const sent = { pct, state: this.hass?.states[entity] };
    this.pending = new Map(this.pending).set(entity, sent);
    const call = pct > 0 ? this.hass?.callService("light", "turn_on", { entity_id: entity, brightness_pct: pct }) : this.hass?.callService("light", "turn_off", { entity_id: entity });
    call?.catch(() => {
      if (this.pending.get(entity) === sent) {
        this.dropPending(entity);
      }
    });
  }
  dropPending(entity) {
    const pending = new Map(this.pending);
    pending.delete(entity);
    this.pending = pending;
  }
  /** Off when any light is on. On is the card's choice: all its lights, some of them, or a scene or script. */
  toggleRoom(ids, on) {
    const config = this.config;
    if (on) {
      this.call("homeassistant", "turn_off", ids);
    } else if (config.turn_on === "scene" && config.turn_on_scene) {
      this.activate(config.turn_on_scene);
    } else {
      const chosen = config.turn_on === "lights" ? (config.turn_on_lights ?? []).filter((id) => ids.includes(id)) : [];
      this.call("homeassistant", "turn_on", chosen.length ? chosen : ids);
    }
  }
  /** A scene has no state to show it ran, so its button flashes instead. */
  activate(entityId) {
    this.call(domainOf(entityId), "turn_on", entityId);
    this.flashed = entityId;
    setTimeout(() => {
      if (this.flashed === entityId) {
        this.flashed = void 0;
      }
    }, 600);
  }
  call(domain, service, entityId) {
    void this.hass?.callService(domain, service, { entity_id: entityId });
  }
  moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }
  percent(pct) {
    return new Intl.NumberFormat(this.language(), { style: "percent" }).format(pct / 100);
  }
  /** A text in the viewer's language, with `{name}` in it replaced, so a translation can put the value where it reads right. */
  text(key, values = {}) {
    return translate(this.language(), key).replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
  static get styles() {
    return i`
            ha-card {
                container-type: inline-size;
                padding: 12px;
                --rlc-quiet: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
            }

            button {
                padding: 0;
                border: none;
                background: none;
                color: inherit;
                font: inherit;
                text-align: left;
                cursor: pointer;
            }

            button:disabled {
                opacity: 0.5;
                cursor: default;
            }

            .header {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .room-icon {
                flex: none;
                display: grid;
                place-items: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--rlc-quiet);
                color: var(--state-icon-color, var(--secondary-text-color));
                --mdc-icon-size: 22px;
            }

            span.room-icon {
                cursor: default;
            }

            .room-icon.on {
                color: var(--light-color, var(--state-light-active-color, #ff9800));
                background: color-mix(in srgb, var(--light-color, var(--state-light-active-color, #ff9800)) 25%, transparent);
            }

            .title {
                flex: 1;
                min-width: 0;
            }

            .name {
                font-size: 16px;
                font-weight: var(--ha-font-weight-medium, 500);
                line-height: 1.3;
                overflow-wrap: anywhere;
            }

            .status {
                font-size: 12px;
                color: var(--secondary-text-color);
                font-variant-numeric: tabular-nums;
            }

            .icon-button {
                flex: none;
                display: grid;
                place-items: center;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                color: var(--secondary-text-color);
                --mdc-icon-size: 20px;
            }

            .icon-button:hover:not(:disabled) {
                background: var(--rlc-quiet);
            }

            .adaptive {
                opacity: 0.45;
            }

            .adaptive.on {
                opacity: 1;
                color: var(--primary-color);
            }

            .bars {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 10px;
            }

            .row {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .label {
                flex: 0 0 clamp(64px, 28%, 128px);
                font-size: 13px;
                line-height: 1.25;
                overflow-wrap: anywhere;
            }

            .bar {
                position: relative;
                flex: 1;
                min-width: 0;
                height: 32px;
                border-radius: 8px;
                overflow: hidden;
                background: var(--rlc-quiet);
                cursor: pointer;
                touch-action: pan-y;
                user-select: none;
            }

            .bar:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }

            .bar.unavailable {
                opacity: 0.5;
                cursor: default;
            }

            .fill {
                position: absolute;
                inset: 0 auto 0 0;
                background: var(--light-color);
                opacity: 0.6;
                pointer-events: none;
            }

            .row-scenes {
                flex: none;
                display: flex;
                justify-content: flex-end;
                width: calc(var(--rlc-slots) * 36px);
            }

            .value {
                position: absolute;
                top: 50%;
                right: 10px;
                transform: translateY(-50%);
                font-size: 12px;
                white-space: nowrap;
                font-variant-numeric: tabular-nums;
                pointer-events: none;
            }

            .pills,
            .chips {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 10px;
            }

            .pill,
            .chip {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                box-sizing: border-box;
                max-width: 100%;
                min-height: 32px;
                padding: 4px 12px 4px 8px;
                border-radius: 16px;
                background: var(--rlc-quiet);
                font-size: 13px;
                --mdc-icon-size: 18px;
            }

            /* A light is filled, as a thing with a state, and a scene is outlined, as an action, so the two never look alike. */
            .chip {
                border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
                background: none;
            }

            .pill span,
            .chip span {
                overflow-wrap: anywhere;
            }

            .pill ha-state-icon,
            .chip ha-state-icon,
            .chip ha-icon {
                flex: none;
                color: var(--secondary-text-color);
            }

            .pill.on {
                background: color-mix(in srgb, var(--state-light-active-color, #ff9800) 22%, transparent);
            }

            .pill.on ha-state-icon {
                color: var(--state-light-active-color, #ff9800);
            }

            .flash {
                animation: flash 0.6s;
            }

            @keyframes flash {
                50% {
                    background: color-mix(in srgb, var(--primary-text-color) 30%, transparent);
                }
            }

            .message {
                padding-top: 8px;
                color: var(--secondary-text-color);
            }

            /* At half a section a light's name takes a line of its own above its bar. */
            @container (max-width: 279px) {
                .row {
                    flex-wrap: wrap;
                }

                .label {
                    flex-basis: 100%;
                }
            }
        `;
  }
};
__decorateClass([
  n4({ attribute: false })
], RoomLightsCard.prototype, "hass", 2);
__decorateClass([
  r5()
], RoomLightsCard.prototype, "config", 2);
__decorateClass([
  r5()
], RoomLightsCard.prototype, "drag", 2);
__decorateClass([
  r5()
], RoomLightsCard.prototype, "pending", 2);
__decorateClass([
  r5()
], RoomLightsCard.prototype, "flashed", 2);
RoomLightsCard = __decorateClass([
  t3("room-lights-card")
], RoomLightsCard);
export {
  RoomLightsCard
};
