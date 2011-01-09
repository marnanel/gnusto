const game = imports.gnusto.hhgg;
const engine = imports.gnusto.engine;
const Gtk = imports.gi.Gtk;

var current_window = 1;

var INPUT_MODE_NONE = 0;
var INPUT_MODE_CHAR = 1;
var INPUT_MODE_STRING = 2;
var input_mode = INPUT_MODE_NONE;

var content = '';
var textInput = '';
Gtk.init(0, null);

let mainWindow=new Gtk.Window({title:'Gnusto', type:Gtk.WindowType.TOPLEVEL});
mainWindow.connect('destroy', Gtk.main_quit);

let vbox = new Gtk.VBox({});
mainWindow.add(vbox);

let textArea=new Gtk.TextView({});
textArea.set_editable(false);
textArea.set_wrap_mode(Gtk.WrapMode.WORD_CHAR);
vbox.add(textArea);

let entry = new Gtk.Entry({});
vbox.add(entry);

let ge = new engine.GnustoEngine();
// FIXME: load files directly using glib
ge.loadStory(game.zcode);

function displayText() {
    let text=new Gtk.TextBuffer({});
    text.insert_at_cursor(content+textInput, -1);
    textArea.set_buffer(text);
}

function writeText(str) {
    content += str;
    displayText();
}

function runEngine() {
	var repeat = 1;

	while (repeat) {
		repeat = 0;
		ge.run();

		content += ge.consoleText();
                displayText();

		var effect = ge.effect(0);

		if (effect=='YW') { // ERASE WINDOW
			content = '';
                        displayText();
			repeat = 1;
		} else if (effect=='TW') { // SPLIT WINDOW
			repeat = 1; // ignore
		} else if (effect=='SB') { // SET BUFFERING
			var buffering = ge.effect(1);

                        // not dealing with this at present (FIXME)

			repeat = 1;
		} else if (effect=='SW') { // SET WINDOW
			current_window = ge.effect(1);
			repeat = 1;
		} else if (effect=='SS') { // SET STYLE
			var style = ge.effect(1);

                        // not dealing with this at present (FIXME)

			repeat = 1;
		} else if (effect=='RS') { // READ STRING
			input_mode = INPUT_MODE_STRING;
                        textInput = '';
			displayText();
		} else if (effect=='DS') { // SAVE
			content += '[Saving games is not implemented]\n\n';
			ge.answer(0, 0);
			repeat = 1;
		} else if (effect=='DR') { // RESTORE
			content += '[Loading games is not implemented]\n\n';
			ge.answer(0, 0);
			repeat = 1;
		} else if (effect=='QU') { // QUIT
                        Gtk.main_quit();
		} else {
			content += '[Unknown effect: '+effect+']';
			displayText();
			repeat = 1; // let's hope that's good
		}
	}

}

function textEntryActivated() {
    // FIXME: We also need to honour input_mode here,
    // so that we can do press-a-key sort of arrangements.
    writeText(entry.get_text()+'\n\n');
    ge.answer(1, entry.get_text());
    ge.answer(2, 13); // assume it was ended by Enter
    entry.set_text('');
    runEngine();
}

entry.connect('activate', textEntryActivated);
mainWindow.show_all();
mainWindow.resize(500, 300);
runEngine();
Gtk.main();
