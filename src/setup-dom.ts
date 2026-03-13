import { GlobalWindow } from 'happy-dom';
const window = new GlobalWindow() as any;
(globalThis as any).document = window.document;
(globalThis as any).window = window;
(globalThis as any).navigator = window.navigator;
(globalThis as any).HTMLElement = window.HTMLElement;
