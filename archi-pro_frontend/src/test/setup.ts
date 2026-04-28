import '@testing-library/jest-dom';
// Polyfill for TextEncoder/TextDecoder for Jest (jsdom)
if (typeof globalThis.TextEncoder === 'undefined') {
	globalThis.TextEncoder = class TextEncoder {
		encoding = 'utf-8';
		encode(str: string): Uint8Array {
			const utf8 = unescape(encodeURIComponent(str));
			const arr = new Uint8Array(utf8.length);
			for (let i = 0; i < utf8.length; ++i) arr[i] = utf8.charCodeAt(i);
			return arr;
		}
		encodeInto(str: string, dest: Uint8Array): { read: number; written: number } {
			const arr = this.encode(str);
			dest.set(arr);
			return { read: str.length, written: arr.length };
		}
	};
}

if (typeof globalThis.TextDecoder === 'undefined') {
	globalThis.TextDecoder = class TextDecoder {
		decode(arr) {
			if (!(arr instanceof Uint8Array)) arr = new Uint8Array(arr);
			let str = '';
			for (let i = 0; i < arr.length; ++i) str += String.fromCharCode(arr[i]);
			return decodeURIComponent(escape(str));
		}
	};
}
