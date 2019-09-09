"use strict"
var pagecommentsjs = {
	bubble: null,
	comments: [],

	load: function(){
		let image = document.createElement("img")
		image.src = "addicon.png"
		image.alt = "Add a comment" 
		let bubble = document.createElement("div")
		bubble.appendChild(image)
		bubble.style.opacity = 0
		bubble.style.position = 'absolute'
		bubble.style.right = "22%"
		bubble.style.cursor = "pointer"
		this.bubble = bubble
		let comments = this.comments

		document.body.appendChild(bubble)

		bubble.addEventListener("click", (e)=>{
			bubble.style.opacity = 0
			e.preventDefault()
			let str = bubble.selection.toString()
			if(!str || str.length == 0){
				return;			
			}

			let commentdiv = document.createElement("div")
			let text = document.createElement("div")
			let textinput = document.createElement("textarea")
			if(str.length > 100){
				str = str.substring(0,40) + " ... " + str.substring(str.length-40)
			}
			text.innerHTML = "\"" + str + "\""
			text.style.maxWidth = "245px"
			text.style.wordWrap = "break-word"
			textinput.rows = 3
			textinput.style.width = "245px"
			textinput.style.resize = "vertical"
			let submit = document.createElement("button")
			submit.innerHTML = "comment"
			commentdiv.appendChild(text)
			commentdiv.appendChild(textinput)
			commentdiv.appendChild(document.createElement("br"))
			commentdiv.appendChild(submit)
			commentdiv.style.cssText += ";width: 250px; max-width: 250px; border: solid; opacity: 1; background-color: #FFFFFF; z-index: 1"
			commentdiv.style.position = "absolute"
			commentdiv.style.top = bubble.style.top
			commentdiv.style.right = "5%"
			document.body.appendChild(commentdiv)
			pagecommentsjs.comments.push(commentdiv)
			commentdiv.selection = bubble.selection

			//highlight selection
			let bg = "#FFFF00"
			commentdiv.highlighted = [] 
			for(let i = 0; i < bubble.selection.rangeCount; i++){
				let sel = bubble.selection.getRangeAt(i)
				let elems = pagecommentsjs.getRangeSelectedNodes(sel)
				for(let x in elems){
					let node = elems[x]
					if(node != sel.endContainer && node != sel.startContainer && node.nodeType == Node.TEXT_NODE){
						let span = document.createElement("span")
						span.style.backgroundColor = bg
						span.innerHTML = node.nodeValue
						node.parentNode.replaceChild(span,node)
						commentdiv.highlighted.push(span)
					}else{
						// Split up text to highlight only selected parts
						if(node == sel.startContainer){
							let span = document.createElement("span")
							let start = document.createElement("span")
							let end = document.createElement("span")

							start.innerHTML = node.nodeValue.substring(0,sel.startOffset)
							end.innerHTML = node.nodeValue.substring(sel.startOffset) 
							span.appendChild(start)
							span.appendChild(end)
							node.parentNode.replaceChild(span,node)
							node = end.firstChild
							end.style.backgroundColor = bg
						}
						if(node == sel.endContainer){
							let span = document.createElement("span")
							let start = document.createElement("span")
							let end = document.createElement("span")

							start.innerHTML = node.nodeValue.substring(0,sel.endOffset)
							end.innerHTML = node.nodeValue.substring(sel.endOffset) 
							span.appendChild(start)
							span.appendChild(end)
							node.parentNode.replaceChild(span,node)
							node = start.firstChild
							start.style.backgroundColor = bg
						}
					}

				}
			}
			window.getSelection().empty();
		})
		document.addEventListener("mouseup",(e)=>{
			let selection = document.getSelection();
			if(selection.type == "Range")
			{
				let flag = true;
				outer:
				for(let x in comments){
					let highlighted = comments[x].highlighted 
					for(let y in highlighted){
						if(selection.containsNode(highlighted[y],true)){
							flag = false;
							break outer
						}
					}
				}
				if(flag){
					bubble.style.top=e.clientY+"px";
					bubble.style.opacity = 1
					bubble.selection = selection
				}
			}

		})

		document.addEventListener("mousedown",(e) => {
			bubble.style.opacity = 0;
		})

	},

	nextNode: function(node){
		if(node.hasChildNodes()){
			return node.firstChild;
		}
		while(node && !node.nextSibling){
			node = node.parentNode;
		}
		if(!node){
			return null;
		}
		return node.nextSibling;
	},

	getRangeSelectedNodes: function(range){
		var node = range.startContainer;
		var endNode = range.endContainer;
		if (node == endNode) {
			return [node];
		}
		var rangeNodes = [node];
		while (node && node != endNode) {
			rangeNodes.push(node = this.nextNode(node))
		}
		return rangeNodes;
	},

	clearSelection: function(sel){
	}
}
window.onload = pagecommentsjs.load
