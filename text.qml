import Qt 4.7

import "gnusto-wrapper.js" as Wrapper

Rectangle {
	id: page
	width: 500; height: 500

	Flickable {
		id: flick
		anchors.fill: parent;

		TextEdit {
			anchors.fill: parent;
			id: mainBody
			text: "If you can see this, the game hasn't loaded."
			wrapMode: TextEdit.Wrap
		}
	}

	Component.onCompleted: Wrapper.startUp(page, flick, mainBody)

	focus: true
	Keys.onPressed: {
		event.accepted = Wrapper.keypress(page, flick, mainBody, event.key);
	}
}
