import Qt 4.7

//Script { source: "wrapper.js"; }
import "wrapper.js" as Wrapper

Rectangle {
	id: page
	width: 500; height: 200
	color: "lightgray"

	Text {
		id: mainBody
		text: "If you can see this, the game hasn't loaded."
		wrapMode: Text.WrapAnywhere
	}

	Component.onCompleted: Wrapper.startUp(page, mainBody)
}
