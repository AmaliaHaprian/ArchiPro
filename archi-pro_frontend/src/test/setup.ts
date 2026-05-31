import '@testing-library/jest-dom';

const TextEncoderPolyfill = class {
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
} as unknown as typeof globalThis.TextEncoder;

const TextDecoderPolyfill = class {
	decode(arr: BufferSource): string {
		const input = arr instanceof Uint8Array ? arr : new Uint8Array(arr as ArrayBufferLike);
		let str = '';
		for (let i = 0; i < input.length; ++i) str += String.fromCharCode(input[i]);
		return decodeURIComponent(escape(str));
	}
} as unknown as typeof globalThis.TextDecoder;

if (typeof globalThis.TextEncoder === 'undefined') {
	globalThis.TextEncoder = TextEncoderPolyfill;
}

if (typeof globalThis.TextDecoder === 'undefined') {
	globalThis.TextDecoder = TextDecoderPolyfill;
}
