Qt.include('hhgg.js') // A game
Qt.include('remedial.js') // Crockford's remedial JS library, for string quoting
Qt.include('gnusto-engine.js') // Gnusto itself

var body = '';
var inputLeft = '';
var ge;
var current_window = 1;

var INPUT_MODE_NONE = 0;
var INPUT_MODE_CHAR = 1;
var INPUT_MODE_STRING = 2;
var input_mode = INPUT_MODE_NONE;

function changeText(text) {
	var cursor = '';

	if (input_mode == INPUT_MODE_STRING) {
		cursor = '|';
	}

	text.text = body+inputLeft+cursor;
}

function runEngine(win,flick,text) {
	var repeat = 1;

	while (repeat) {
		repeat = 0;
		ge.run();

		body += ge.consoleText();
		changeText(text);

		var effect = ge.effect(0);

		if (effect=='YW') { // ERASE WINDOW
			body = '';
			changeText(text);
			repeat = 1;
		} else if (effect=='TW') { // SPLIT WINDOW
			repeat = 1; // ignore
		} else if (effect=='SB') { // SET BUFFERING
			var buffering = ge.effect(1);

			if (buffering==1) {
				console.log("Warning: game requested buffering, which is not implemented");
			}

			repeat = 1;
		} else if (effect=='SW') { // SET WINDOW
			current_window = ge.effect(1);
			repeat = 1;
		} else if (effect=='SS') { // SET STYLE
			var style = ge.effect(1);
			console.log ("Setting style to "+style+" which is not implemented");
			repeat = 1;
		} else if (effect=='RS') { // READ STRING
			input_mode = INPUT_MODE_STRING;
			inputLeft = '';
			changeText(text);
		} else if (effect=='DS') { // SAVE
			body += '[Saving games is not implemented]\n\n';
			ge.answer(0, 0);
			repeat = 1;
		} else if (effect=='DR') { // RESTORE
			body += '[Loading games is not implemented]\n\n';
			ge.answer(0, 0);
			repeat = 1;
		} else if (effect=='QU') { // QUIT
			Qt.quit();
		} else {
			body += '[Unknown effect: '+effect+']';
			changeText(text);
			repeat = 1; // let's hope that's good
		}
	}

	flick.contentY = text.paintedHeight - win.height;
}

function keypress(win,flick,text,keystroke) {
	
	if (keystroke == Qt.Key_Backspace) {
		inputLeft = inputLeft.substring(0, inputLeft.length-1);
	} else if (keystroke == Qt.Key_Enter || keystroke == Qt.Key_Return) {
		input_mode = INPUT_MODE_NONE;
		body += inputLeft + '\n\n';
		ge.answer(1, inputLeft);
		ge.answer(2, 13);
		runEngine(win,flick,text);
	} else {
		inputLeft = inputLeft + String.fromCharCode(keystroke);
	}
	changeText(text);
	return false;
}

function startUp(win,flick,text) {

	// Load the game we just included as a literal array.
	ge = new GnustoEngine(console.log);
	ge.loadStory(zcode);

	runEngine(win,flick,text);

	changeText(text);
}

