Qt.include('hhgg.js') // A game
Qt.include('remedial.js') // Crockford's remedial JS library, for string quoting
Qt.include('gnusto-engine.js') // Gnusto itself

var body = '';
var ge;
var current_window = 1;

function changeText(text) {
	text.text = body;
}

function runEngine(text) {
	var repeat = 1;

	while (repeat) {
		repeat = 0;
		ge.run();

		body += ge.consoleText();
		changeText(text);

		var effect = ge.effect(0);
		console.log(effect);

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
		} else {
			console.log("Problem: unknown effect "+effect);
		}
	}
}

function startUp(win,text) {

	// Load the game we just included as a literal array.
	ge = new GnustoEngine(console.log);
	ge.loadStory(zcode);

	runEngine(text);

	changeText(text);
}

