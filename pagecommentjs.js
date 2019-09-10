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
		pagecommentsjs.bubble = bubble

		document.body.appendChild(bubble)

		bubble.addEventListener("click", pagecommentsjs.onClick)
		document.addEventListener("mouseup",pagecommentsjs.onMouseUp)
		document.addEventListener("mousedown",(e) => {
			bubble.style.opacity = 0
		})
		var style = document.createElement('style')
		style.type = 'text/css'
		style.innerHTML = '.commenthighlight { background-color: #FFFF00;} '
		style.innerHTML += ".commentdiv {width: 250px; max-width: 250px; border: solid; opacity: 1; background-color: #FFFFFF; z-index: 1; position: absolute; right: 5%;}"

		document.getElementsByTagName('head')[0].appendChild(style)
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
		let node = range.startContainer;
		let endNode = range.endContainer;
		let rangeNodes = []
		while (node) {
			if(node.nodeType === Node.TEXT_NODE){
				rangeNodes.push(node)
			}
			if(node === endNode){
				break;
			}
			node = pagecommentsjs.nextNode(node)
		}
		return rangeNodes;
	},

	clearSelection: function(div){
		let elems = div.highlighted
		for(var x in elems){
			let n = elems[x].parentNode.parentNode;
			elems[x].outerHTML = elems[x].innerHTML
			n.normalize()//removing spans splits text up into multiple nodes. use normalise to return them to normal
		}
		div.remove()
		let idx = pagecommentsjs.comments.indexof(div)
		if(idx !== -1) pagecommentsjs.comments.splice(idx, 1)
	},

	onMouseUp: function(e){
		let selection = document.getSelection()
		let bubble = pagecommentsjs.bubble
		if(selection.type === "Range"){
			let flag = true;
			outer:
			for(let x in pagecommentsjs.comments){
				let highlighted = pagecommentsjs.comments[x].highlighted 
				for(let y in highlighted){
					if(selection.containsNode(highlighted[y],true)){
						flag = false;
						break outer
					}
				}
			}
			if(flag){
				bubble.style.top=e.clientY+"px"
				bubble.style.opacity = 1
				bubble.selection = selection
			}
		}
	},
	
	onClick: function(e){
		let bubble = pagecommentsjs.bubble
		bubble.style.opacity = 0
		e.preventDefault()
		let str = bubble.selection.toString()
		if(!str || str.length === 0){
			return;			
		}
		//Creating comment box
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
		let cancel = document.createElement("button")
		submit.innerHTML = "comment"
		cancel.innerHTML = "cancel"
		cancel.addEventListener("click", ()=>pagecommentsjs.clearSelection(commentdiv))
		commentdiv.appendChild(text)
		commentdiv.appendChild(textinput)
		commentdiv.appendChild(document.createElement("br"))
		commentdiv.appendChild(submit)
		commentdiv.appendChild(cancel)
		commentdiv.className = "commentdiv"
		commentdiv.style.top = bubble.style.top
		document.body.appendChild(commentdiv)
		pagecommentsjs.comments.push(commentdiv)
		pagecommentsjs.highlight(commentdiv)
	},

	highlight: function(commentdiv){
		//highlight selection
		commentdiv.highlighted = [] 
		let selection = document.getSelection()
		for(let i = 0; i < selection.rangeCount; i++){
			let sel = selection.getRangeAt(i)
			let elems = pagecommentsjs.getRangeSelectedNodes(sel)
			for(let x in elems){
				let node = elems[x]
				if(node != sel.endContainer && node != sel.startContainer){
					let span = document.createElement("mark")
					span.className = "commenthighlight"
					span.innerHTML = node.nodeValue
					node.parentNode.replaceChild(span,node)
					commentdiv.highlighted.push(span)
				}else{
					let str = node.nodeValue
					let start = 0 
					let end = str.length
					let nodes = []
					// Split up text to highlight only selected parts
					if(node === sel.startContainer){
						start = sel.startOffset
						nodes.push(document.createTextNode(node.nodeValue.substring(0,start)))
					}
					let middle = document.createElement("mark")
					nodes.push(middle)
					if(node === sel.endContainer){
						end = sel.endOffset
						nodes.push(document.createTextNode(node.nodeValue.substring(end)))
					}
					middle.innerHTML = str.substring(start,end)
					middle.className = "commenthighlight"
					let parent = node.parentNode;
					parent.replaceChild(nodes[0],node)
					let sibling = nodes[0].nextSibling
					for(let n = 1;n < nodes.length;n++){
						parent.insertBefore(nodes[n],sibling)
					}
					commentdiv.highlighted.push(middle)
				}

			}
		}
		selection.empty();
	},
}
window.onload = pagecommentsjs.load
