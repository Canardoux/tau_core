"use strict";
import { TokenIterator } from "./SourceMap.js";
export function decodeOriginalScopes(encodedOriginalScopes, names) {
  return encodedOriginalScopes.map((scope) => decodeOriginalScope(scope, names));
}
function decodeOriginalScope(encodedOriginalScope, names) {
  const scopeForItemIndex = /* @__PURE__ */ new Map();
  const scopeStack = [];
  let line = 0;
  let kindIdx = 0;
  for (const [index, item] of decodeOriginalScopeItems(encodedOriginalScope)) {
    line += item.line;
    const { column } = item;
    if (isStart(item)) {
      let kind;
      if (item.kind !== void 0) {
        kindIdx += item.kind;
        kind = resolveName(kindIdx, names);
      }
      const name = resolveName(item.name, names);
      const variables = item.variables.map((idx) => names[idx]);
      const scope = {
        start: { line, column },
        end: { line, column },
        kind,
        name,
        isStackFrame: Boolean(item.flags & 4 /* IS_STACK_FRAME */),
        variables,
        children: []
      };
      scopeStack.push(scope);
      scopeForItemIndex.set(index, scope);
    } else {
      const scope = scopeStack.pop();
      if (!scope) {
        throw new Error('Scope items not nested properly: encountered "end" item without "start" item');
      }
      scope.end = { line, column };
      if (scopeStack.length === 0) {
        return { root: scope, scopeForItemIndex };
      }
      scope.parent = scopeStack[scopeStack.length - 1];
      scopeStack[scopeStack.length - 1].children.push(scope);
    }
  }
  throw new Error("Malformed original scope encoding");
}
export var EncodedOriginalScopeFlag = /* @__PURE__ */ ((EncodedOriginalScopeFlag2) => {
  EncodedOriginalScopeFlag2[EncodedOriginalScopeFlag2["HAS_NAME"] = 1] = "HAS_NAME";
  EncodedOriginalScopeFlag2[EncodedOriginalScopeFlag2["HAS_KIND"] = 2] = "HAS_KIND";
  EncodedOriginalScopeFlag2[EncodedOriginalScopeFlag2["IS_STACK_FRAME"] = 4] = "IS_STACK_FRAME";
  return EncodedOriginalScopeFlag2;
})(EncodedOriginalScopeFlag || {});
function isStart(item) {
  return "flags" in item;
}
function* decodeOriginalScopeItems(encodedOriginalScope) {
  const iter = new TokenIterator(encodedOriginalScope);
  let prevColumn = 0;
  let itemCount = 0;
  while (iter.hasNext()) {
    if (iter.peek() === ",") {
      iter.next();
    }
    const [line, column] = [iter.nextVLQ(), iter.nextVLQ()];
    if (line === 0 && column < prevColumn) {
      throw new Error("Malformed original scope encoding: start/end items must be ordered w.r.t. source positions");
    }
    prevColumn = column;
    if (!iter.hasNext() || iter.peek() === ",") {
      yield [itemCount++, { line, column }];
      continue;
    }
    const startItem = {
      line,
      column,
      flags: iter.nextVLQ(),
      variables: []
    };
    if (startItem.flags & 1 /* HAS_NAME */) {
      startItem.name = iter.nextVLQ();
    }
    if (startItem.flags & 2 /* HAS_KIND */) {
      startItem.kind = iter.nextVLQ();
    }
    while (iter.hasNext() && iter.peek() !== ",") {
      startItem.variables.push(iter.nextVLQ());
    }
    yield [itemCount++, startItem];
  }
}
export function decodeGeneratedRanges(encodedGeneratedRange, originalScopeTrees, names) {
  const rangeStack = [{
    start: { line: 0, column: 0 },
    end: { line: 0, column: 0 },
    isStackFrame: false,
    isHidden: false,
    children: [],
    values: []
  }];
  const rangeToStartItem = /* @__PURE__ */ new Map();
  for (const item of decodeGeneratedRangeItems(encodedGeneratedRange)) {
    if (isRangeStart(item)) {
      const range = {
        start: { line: item.line, column: item.column },
        end: { line: item.line, column: item.column },
        isStackFrame: Boolean(item.flags & 4 /* IS_STACK_FRAME */),
        isHidden: Boolean(item.flags & 8 /* IS_HIDDEN */),
        values: [],
        children: []
      };
      if (item.definition) {
        const { scopeIdx, sourceIdx } = item.definition;
        if (!originalScopeTrees[sourceIdx]) {
          throw new Error("Invalid source index!");
        }
        const originalScope = originalScopeTrees[sourceIdx].scopeForItemIndex.get(scopeIdx);
        if (!originalScope) {
          throw new Error("Invalid original scope index!");
        }
        range.originalScope = originalScope;
      }
      if (item.callsite) {
        const { sourceIdx, line, column } = item.callsite;
        if (!originalScopeTrees[sourceIdx]) {
          throw new Error("Invalid source index!");
        }
        range.callsite = {
          sourceIndex: sourceIdx,
          line,
          column
        };
      }
      rangeToStartItem.set(range, item);
      rangeStack.push(range);
    } else {
      const range = rangeStack.pop();
      if (!range) {
        throw new Error('Range items not nested properly: encountered "end" item without "start" item');
      }
      range.end = { line: item.line, column: item.column };
      resolveBindings(range, names, rangeToStartItem.get(range)?.bindings);
      rangeStack[rangeStack.length - 1].children.push(range);
    }
  }
  if (rangeStack.length !== 1) {
    throw new Error("Malformed generated range encoding");
  }
  return rangeStack[0].children;
}
function resolveBindings(range, names, bindingsForAllVars) {
  if (bindingsForAllVars === void 0) {
    return;
  }
  range.values = bindingsForAllVars.map((bindings) => {
    if (bindings.length === 1) {
      return resolveName(bindings[0].nameIdx, names);
    }
    const bindingRanges = bindings.map((binding) => ({
      from: { line: binding.line, column: binding.column },
      to: { line: binding.line, column: binding.column },
      value: resolveName(binding.nameIdx, names)
    }));
    for (let i = 1; i < bindingRanges.length; ++i) {
      bindingRanges[i - 1].to = { ...bindingRanges[i].from };
    }
    bindingRanges[bindingRanges.length - 1].to = { ...range.end };
    return bindingRanges;
  });
}
export var EncodedGeneratedRangeFlag = /* @__PURE__ */ ((EncodedGeneratedRangeFlag2) => {
  EncodedGeneratedRangeFlag2[EncodedGeneratedRangeFlag2["HAS_DEFINITION"] = 1] = "HAS_DEFINITION";
  EncodedGeneratedRangeFlag2[EncodedGeneratedRangeFlag2["HAS_CALLSITE"] = 2] = "HAS_CALLSITE";
  EncodedGeneratedRangeFlag2[EncodedGeneratedRangeFlag2["IS_STACK_FRAME"] = 4] = "IS_STACK_FRAME";
  EncodedGeneratedRangeFlag2[EncodedGeneratedRangeFlag2["IS_HIDDEN"] = 8] = "IS_HIDDEN";
  return EncodedGeneratedRangeFlag2;
})(EncodedGeneratedRangeFlag || {});
function isRangeStart(item) {
  return "flags" in item;
}
function* decodeGeneratedRangeItems(encodedGeneratedRange) {
  const iter = new TokenIterator(encodedGeneratedRange);
  let line = 0;
  const state = {
    line: 0,
    column: 0,
    defSourceIdx: 0,
    defScopeIdx: 0,
    callsiteSourceIdx: 0,
    callsiteLine: 0,
    callsiteColumn: 0
  };
  while (iter.hasNext()) {
    if (iter.peek() === ";") {
      iter.next();
      ++line;
      continue;
    } else if (iter.peek() === ",") {
      iter.next();
      continue;
    }
    state.column = iter.nextVLQ() + (line === state.line ? state.column : 0);
    state.line = line;
    if (iter.peekVLQ() === null) {
      yield { line, column: state.column };
      continue;
    }
    const startItem = {
      line,
      column: state.column,
      flags: iter.nextVLQ(),
      bindings: []
    };
    if (startItem.flags & 1 /* HAS_DEFINITION */) {
      const sourceIdx = iter.nextVLQ();
      const scopeIdx = iter.nextVLQ();
      state.defScopeIdx = scopeIdx + (sourceIdx === 0 ? state.defScopeIdx : 0);
      state.defSourceIdx += sourceIdx;
      startItem.definition = {
        sourceIdx: state.defSourceIdx,
        scopeIdx: state.defScopeIdx
      };
    }
    if (startItem.flags & 2 /* HAS_CALLSITE */) {
      const sourceIdx = iter.nextVLQ();
      const line2 = iter.nextVLQ();
      const column = iter.nextVLQ();
      state.callsiteColumn = column + (line2 === 0 && sourceIdx === 0 ? state.callsiteColumn : 0);
      state.callsiteLine = line2 + (sourceIdx === 0 ? state.callsiteLine : 0);
      state.callsiteSourceIdx += sourceIdx;
      startItem.callsite = {
        sourceIdx: state.callsiteSourceIdx,
        line: state.callsiteLine,
        column: state.callsiteColumn
      };
    }
    while (iter.hasNext() && iter.peek() !== ";" && iter.peek() !== ",") {
      const bindings = [];
      startItem.bindings.push(bindings);
      const idxOrSubrangeCount = iter.nextVLQ();
      if (idxOrSubrangeCount >= -1) {
        bindings.push({ line: startItem.line, column: startItem.column, nameIdx: idxOrSubrangeCount });
        continue;
      }
      bindings.push({ line: startItem.line, column: startItem.column, nameIdx: iter.nextVLQ() });
      const rangeCount = -idxOrSubrangeCount;
      for (let i = 0; i < rangeCount - 1; ++i) {
        const line2 = iter.nextVLQ();
        const column = iter.nextVLQ();
        const nameIdx = iter.nextVLQ();
        const lastLine = bindings.at(-1)?.line ?? 0;
        const lastColumn = bindings.at(-1)?.column ?? 0;
        bindings.push({
          line: line2 + lastLine,
          column: column + (line2 === 0 ? lastColumn : 0),
          nameIdx
        });
      }
    }
    yield startItem;
  }
}
function resolveName(idx, names) {
  if (idx === void 0 || idx < 0) {
    return void 0;
  }
  return names[idx];
}
//# sourceMappingURL=SourceMapScopes.js.map
