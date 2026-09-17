import {test} from 'node:test';
import assert from 'node:assert/strict';
import {restoreInputViewport} from '../src/input-viewport.js';

function setup(t, scale = 1) {
  const original = 'width=device-width, initial-scale=1';
  let content = original;
  const input = new EventTarget();
  const doc = new EventTarget();
  doc.querySelector = () => ({getAttribute: () => content, setAttribute: (_, value) => {content = value;}});
  doc.activeElement = null;
  const scrolls = [];
  const win = {visualViewport: {scale}, innerWidth: 390, scrollX: 0, scrollY: 420,
    scrollTo: value => scrolls.push(value)};
  const oldDoc = globalThis.document, oldWin = globalThis.window;
  globalThis.document = doc;
  globalThis.window = win;
  t.after(() => {globalThis.document = oldDoc; globalThis.window = oldWin;});
  t.mock.timers.enable({apis: ['setTimeout']});
  restoreInputViewport(input);
  input.dispatchEvent(new Event('focus'));
  return {input, doc, win, scrolls, original, content: () => content};
}

test('automatic focus zoom returns to the previous scale and releases zoom limits', t => {
  const state = setup(t, 1.5);
  state.win.visualViewport.scale = 2;
  state.input.dispatchEvent(new Event('blur'));
  assert.match(state.content(), /initial-scale=1.5,maximum-scale=1.5/);
  t.mock.timers.tick(300);
  assert.equal(state.content(), state.original);
  assert.deepEqual(state.scrolls, [{left: 0, top: 420, behavior: 'instant'}]);
});

test('manual pinch, unchanged scale and rotation do not trigger zoom restoration', t => {
  const state = setup(t);
  state.input.dispatchEvent(new Event('blur'));
  assert.equal(state.content(), state.original);
  state.input.dispatchEvent(new Event('focus'));
  state.win.visualViewport.scale = 2;
  const pinch = new Event('touchstart');
  Object.defineProperty(pinch, 'touches', {value: [{}, {}]});
  state.doc.dispatchEvent(pinch);
  state.input.dispatchEvent(new Event('blur'));
  assert.equal(state.content(), state.original);
  state.input.dispatchEvent(new Event('focus'));
  state.win.innerWidth = 844;
  state.win.visualViewport.scale = 3;
  state.input.dispatchEvent(new Event('blur'));
  assert.equal(state.content(), state.original);
  assert.deepEqual(state.scrolls, []);
});

test('a new interaction cancels the pending scroll and releases the temporary cap', t => {
  const state = setup(t);
  state.win.visualViewport.scale = 2;
  state.input.dispatchEvent(new Event('blur'));
  state.doc.dispatchEvent(new Event('pointerdown'));
  t.mock.timers.tick(300);
  assert.equal(state.content(), state.original);
  assert.deepEqual(state.scrolls, []);
});
