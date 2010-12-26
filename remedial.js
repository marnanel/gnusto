// this is a partial copy of Douglas Crockford's remedial.js



if (!String.prototype.quote) {
	String.prototype.quote = function () {
		var c, i, l = this.length, o = '"';
		for (i = 0; i < l; i += 1) {
			c = this.charAt(i);
			if (c >= ' ') {
				if (c === '\\' || c === '"') {
					o += '\\';
				}
				o += c;
			} else {
				switch (c) {
					case '\b':
						o += '\\b';
						break;
					case '\f':
						o += '\\f';
						break;
					case '\n':
						o += '\\n';
						break;
					case '\r':
						o += '\\r';
						break;
					case '\t':
						o += '\\t';
						break;
					default:
						c = c.charCodeAt();
						o += '\\u00' + Math.floor(c / 16).toString(16) +
							(c % 16).toString(16);
				}
			}
		}
		return o + '"';
	};
} 

if (!String.prototype.supplant) {
	String.prototype.supplant = function (o) {
		return this.replace(/{([^{}]*)}/g,
				function (a, b) {
				var r = o[b];
				return typeof r === 'string' || typeof r === 'number' ? r : a;
				}
				);
	};
}

if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
	};
}
