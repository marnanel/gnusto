// gnusto-lib.js || -*- Mode: Java; tab-width: 2; -*-
// upper.js -- upper window handler.
//
// $Header: /cvs/gnusto/src/gnusto/content/upper.js,v 1.29 2003/04/25 18:25:59 naltrexone42 Exp $
//
// Copyright (c) 2003 Thomas Thurman
// thomas@thurman.org.uk
// 
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have be able to view the GNU General Public License at 
// http://www.gnu.org/copyleft/gpl.html ; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.

////////////////////////////////////////////////////////////////

var win__screen_doc = 0;
var win__screen_window = 0;
var win__current_x = [];
var win__current_y = [];
var win__top_window_height = 0;

var win__screen_width = 80; //  a good default size
var win__screen_height = 25; // a good default size

////////////////////////////////////////////////////////////////

// Called on startup.
function win_init() {
		// Does nothing at present.
}

////////////////////////////////////////////////////////////////

function win_setup() {

    win__screen_doc = barbarix_get_document(BARBARIX_INFOBOX);

		var body = win__screen_doc.getElementsByTagName('body')[0];
		barbarix_clear(body);
		win__screen_window = win__screen_doc.createElement('pre');
		win__screen_window.setAttribute('class', 'bocardo');
		win__screen_window.setAttribute('id', 'bocardomain');
		body.appendChild(win__screen_window);

    win__current_x[0] = win__current_y[0] = 0;
    win__current_x[1] = win__current_y[1] = 0;

		win_set_top_window_size(0);

		win_resize();
		// Do that every time the size changes, actually.
		window.addEventListener('resize', win_resize, 0);
}

////////////////////////////////////////////////////////////////

function win_resize() {
		/*		win__screen_width = width;
					win__screen_height = height; */

		// FIXME: Is this guaranteed to be pixels?

		var bocardoHeight = parseInt(win__screen_doc.defaultView.getComputedStyle(win__screen_window,null).getPropertyValue('height'));
		var bocardoWidth = parseInt(win__screen_doc.defaultView.getComputedStyle(win__screen_window,null).getPropertyValue('width'));

		var totalLinesHeight = 0;
		var maxLineWidth = 0;

		var lines = win__screen_window.childNodes;

		for (var i=0; i<lines.length; i++) {

				// Need to base calculations on spans, and only spans with text in.
				// Or perhaps only on textnodes.

				var lineWidth = parseInt(win__screen_doc.defaultView.getComputedStyle(lines[i],null).getPropertyValue('width'));
				var lineHeight = parseInt(win__screen_doc.defaultView.getComputedStyle(lines[i],null).getPropertyValue('height'));

				if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
				totalLinesHeight += lineHeight;
		}


		// window.title = 'Bocardo resize: '+bocardoWidth+'x'+bocardoHeight+' max '+maxLineWidth+','+totalLinesHeight;
}

////////////////////////////////////////////////////////////////

var win__screen_scroll_count = 0;

function win_reset_scroll_count() {
		win__screen_scroll_count = 0;
}

////////////////////////////////////////////////////////////////

function win_chalk(win, text) {

		var paused_for_more = 0;

    // This function is written in terms of win__subchalk(). All *we*
    // have to do is split up |text| so that it never goes
    // over the edge of the screen, and break at newlines.

		// Subfunction to move to the next line (whatever that means,
		// depending on which window we're on.)
		function newline() {
				win__current_x[win] = 0;

				win__current_y[win]++;

				if (win==0) {

						win__screen_scroll_count++;
						
						// Do we need to stop and write [MORE]?

						if (win__screen_scroll_count >= win__screen_height-win__top_window_height) {
								// Yes. Reset the scroll count.
								win__screen_scroll_count = 0;
										
								// Reconstruct the message...
								message = message + text.slice(line,text.length).join('\n');

								paused_for_more = 1;
						} else {

								while (win__current_y[0]>=win__screen_height) {
										
										// We hit the bottom of the lower window.
										// Try for a scroll.
								
										win__screen_window.removeChild(win__screen_window.childNodes[win__top_window_height]);
										win__current_y[0]--; // Get back onto the screen
								}
						}

				} else if (win==1 && win__current_y[1]==win__top_window_height) {
						// We hit the bottom of the top window.
						// The z-spec leaves the behaviour undefined, but suggests
						// that we leave the cursor where it is. Frotz's behaviour
						// is more easy to mimic: it simply wraps back to the top.

						win__current_y[1] = 0;
				}
		}

		////////////////////////////////////////////////////////////////

    text = text.toString().split('\n');

    for (var line in text) {

				var message = text[line];

				do {

						if (message.length > (win__screen_width - win__current_x[win])) {
								
								// The message is longer than the rest of this line.

								var amount = win__screen_width - win__current_x[win];
								
								// Fairly pathetic wordwrap. FIXME: replace later
								// with a better dynamic programming algorithm.

								while (amount!=0 && message[amount]!=' ') {
										amount--;
								}
					
								if (amount==0) {
										// ah, whatever, just put it back and forget the
										// wordwrap.
										amount = win__screen_width - win__current_x[win];
								}

								win__subchalk(win, message.substring(0, amount));
								
								message = message.substring(amount+1);
								newline();
								if (paused_for_more) return message;
						} else {
								
								// The message is shorter.

								win__subchalk(win, message);
								win__current_x[win] += message.length;
								message = '';
						}
				} while (message!='' && !paused_for_more);

				if (line<text.length-1) {
						newline();
						if (paused_for_more) return message;
				}
    }

		return ''; // We didn't have to scroll more than a screenful.
}

////////////////////////////////////////////////////////////////

function win_gotoxy(win, x, y) {
		win__current_x[win] = x;
		win__current_y[win] = y;
}

////////////////////////////////////////////////////////////////

function win_set_top_window_size(lines) {
		win__top_window_height = lines;
		win_gotoxy(1, 0, 0);
}

////////////////////////////////////////////////////////////////

// Clears a window. |win| must be a valid window ID.
function win_clear(win) {
		while (win__screen_window.childNodes.length!=0) {
				win__screen_window.removeChild(win__screen_window.childNodes[0]);
		}

		win__current_x[win] = 0;
		win__current_y[win] = 0;

		if (win==1) {
				// Clearing a window resets its "more" counter.
				win__screen_scroll_count = 0;
                                var body = win__screen_doc.getElementsByTagName('body')[0];
                                body.setAttribute('bgcolor', win__current_background);
		}
}

////////////////////////////////////////////////////////////////

// Prints an array of strings, |lines|, on window |win|.
// The first line will be printed at the current
// cursor position, and each subsequent line will be printed
// at the point immediately below the previous one. This function
// leaves the cursor where it started.

function win_print_table(win, lines) {

		var temp_x = win__current_x[win];
		var temp_y = win__current_y[win];

		for (i=0; i<lines.length; i++) {
				win__current_x[win] = temp_x;
				win__current_y[win] = (temp_y+i) % win__screen_height;

				if (lines[i].length + temp_x > win__screen_width) {
						lines[i] = lines[i].substring(win__screen_width-temp_x);
				}

				win_chalk(win, lines[i]);
		}

		win__current_x[win] = temp_x;
		win__current_y[win] = temp_y;
}

////////////////////////////////////////////////////////////////

var win__current_style = 0;
var win__current_foreground = 1;
var win__current_background = 1;

var win__current_css = ['ff bb','ff bb'];

// Set the current text style, foreground and background colours
// of a given window. Very Z-machine specific.
function win_set_text_style(win, style, foreground, background) {

		// List of CSS classes we want.
		var css = '';

		////////////////////////////////////////////////////////////////

		// Examine the parameters, and set the internal variables
		// which store the text style and colours of this window.
		//
		// The value -1 (for style) and 0 (for bg/fg) mean that we
		// shouldn't change the current value. Style also has the
		// particular oddity that it needs to be ORed with the
		// current style, except when it's zero (==roman text),
		// when it should set the current style to zero too.

		if (style==-1) // Don't change
				style = win__current_style;
		else if (style==0)
				win__current_style = 0;
		else {
				win__current_style |= style;
				style = win__current_style;
		}

		if (foreground==0) // Don't change
				foreground = win__current_foreground;
		else
				win__current_foreground = foreground;

		if (background==0) // Don't change
				background = win__current_background;
		else
				win__current_background = background;

		////////////////////////////////////////////////////////////////

		// Handle colours:

		var fg_code;
		var bg_code;

		if (foreground==1)
				fg_code = 'f';
		else
				fg_code = foreground.toString();

		if (background==1)
				bg_code = 'b';
		else
				bg_code = background.toString();

		// Handle styles:

		if (style & 0x1) // Reverse video.
				css = 'b' + fg_code + ' f'+bg_code;
		else
				css = 'f' + fg_code + ' b'+bg_code;

		if (style & 0x2) css = css + ' sb'; // bold
		if (style & 0x4) css = css + ' si'; // italic
		if (style & 0x8) css = css + ' sm'; // monospace

		win__current_css[win] = css;
}

////////////////////////////////////////////////////////////////
//
//                      Private functions
//
////////////////////////////////////////////////////////////////

function win__subchalk(win, text) {

		var x = win__current_x[win];
		var y = win__current_y[win];

    // Let's get a handle on the line we want to modify.

    var lines = win__screen_window.childNodes;

    // If the line doesn't yet exist, we must create it.
    // FIXME: possibly this will become redundant when we handle
    // dynamic screen resizing.
    while (lines.length <= y) {
				var newdiv = win__screen_doc.createElement('div');

				newdiv.setAttribute('style', 'width: 100%;');
				// Possibly the line above will become redundant
				// once bug 3658 is fixed.

				newdiv.setAttribute('class', win__current_css[current_window]);
				win__screen_window.appendChild(newdiv);
    }

    // We delete any bits of that line we're going to overwrite,
		// and work out where to insert the new span. The line consists of a
		// sequence of spans.
    var current_line = lines[y];

		var spans = current_line.childNodes;

		var charactersSeen = 0;
		var cursor = 0;

		// Go past all the spans before us.

		while (cursor<spans.length && charactersSeen+spans[cursor].childNodes[0].data.length <= x) {
				charactersSeen += spans[cursor].childNodes[0].data.length;
				cursor++;
		} 

		// |cursor| is now either pointing at the point where we want to
		// write the current span, or at the span which contains that
		// point. In the latter case, we must break it.

		var charactersTrimmed = 0;
		var doppelganger = 0;
		var appendPoint = -1;

		if (cursor==spans.length) {

				if (charactersSeen < x) {
						// There aren't enough characters to go round. We
						// must add extra spaces to the start of the text.

						var padding = '';

						for (var i=0; i<(x-charactersSeen); i++) {
								padding = padding + ' ';
						}

						doppelganger = win__screen_doc.createElement('span');
						doppelganger.appendChild(win__screen_doc.createTextNode(padding));
				}

				// Just append the text.

		} else {
				if (charactersSeen < x) {

						// We've seen fewer characters than we were expecting, so the
						// last span is over-long: we must trim it.

						var amountToKeep = x - charactersSeen;

						if (text.length < spans[cursor].childNodes[0].data.length-amountToKeep) {
								// The whole of the new text fits within this node. Let's keep this
								// node before the new text, and create another node to go after it.
								doppelganger = spans[cursor].cloneNode(1);
								doppelganger.childNodes[0].data = doppelganger.childNodes[0].data.substring(amountToKeep+text.length);
						}

						charactersTrimmed = spans[cursor].childNodes[0].data.length - amountToKeep;

						spans[cursor].childNodes[0].data = spans[cursor].childNodes[0].data.substring(0, amountToKeep);

						// And push them on one place; they insert *after* us.
						cursor++;
				}

				appendPoint = cursor;

				if (cursor<spans.length) {
						// Delete any spans which are hidden by our span.
						var charactersDeleted = charactersTrimmed;
						var spansToDelete = 0;

						while (cursor<spans.length && charactersDeleted+spans[cursor].childNodes[0].data.length <= text.length) {
								charactersDeleted += spans[cursor].childNodes[0].data.length;
								cursor++;
								spansToDelete++;
						}

						// And trim the RHS of the first span after our new span.
						if (cursor<spans.length) {
								spans[cursor].childNodes[0].data = spans[cursor].childNodes[0].data.substring(text.length - charactersDeleted);
						}
				}

				// Now we've finished looking at the line, we can start modifying it.

				// Delete the spans which are underneath our text...
				for (var i=appendPoint; i<appendPoint+spansToDelete; i++) {
						current_line.removeChild(spans[appendPoint]); // the others will slide up.
				}

		}

		// ...add the broken span, if there was one...
		if (doppelganger) {
				current_line.insertBefore(doppelganger, spans[cursor]);
		}

		// ..and append our text.
		var newSpan = win__screen_doc.createElement('span');
		newSpan.setAttribute('class', win__current_css[win]);
		newSpan.appendChild(win__screen_doc.createTextNode(text));

		if (appendPoint == -1) {
				current_line.appendChild(newSpan);
		} else {
				current_line.insertBefore(newSpan, spans[appendPoint]);
		}
}

////////////////////////////////////////////////////////////////

/*

// FIXME: In transition from mozilla-glue.
function win__store_screen_size() {

		var screen_width = 80;
		var screen_height = 25;

		if (window.innerHeight!=1 && window.innerWidth!=1) {

				// FIXME: work something out about getting font metrics
				screen_width  = Math.floor(window.innerWidth/glue__font_width)-1;
				screen_height = Math.floor(window.innerHeight/glue__font_height)-1;

				// Why -1? Check whether we're off-by-one anywhere.

				// Screen minima (s8.4): 60x14.
				if (screen_width<60) screen_width=60;
				if (screen_height<14) screen_height=14;

				// Maxima: we can't have a screen > 255 in either direction
				// (which is really possible these days).

				if (screen_width>255) screen_width=255;
				if (screen_height>255) screen_height=255;
		}

		//	FIXME: Figure out how to signal this to the environment
		setbyte(screen_height,                   0x20); // screen h, chars
		setbyte(screen_width,                    0x21); // screen w, chars
		setword(screen_width *glue__font_width,  0x22); // screen w, units
		setword(screen_height*glue__font_height, 0x24); // screen h, units
		setbyte(glue__font_width,                0x26); // font w, units
		setbyte(glue__font_height,               0x27); // font h, units

		// Tell the window drivers about it
		win_resize(screen_width, screen_height);
}

*/

////////////////////////////////////////////////////////////////
UPPER_HAPPY = 1;
////////////////////////////////////////////////////////////////
