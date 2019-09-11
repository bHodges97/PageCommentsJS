"use strict"
var pagecommentsjs = {
	bubble: null,
	url: '/',
	comments: {
		count: 0,
		push: function(e){this[this.count++] = e},
		index: function(e){for(let x = 0;x < this.count; x++){if(this[x]===e)return x} return null},
		remove: function(e){let i = this.index(e);if(i){delete this[i]}},
		},

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
		style.innerHTML += ".commentbox {width: 245px; max-width: 245px; word-wrap: break-word; resize: vertical;}"
		
		pagecommentsjs.loadComments()
		document.getElementsByTagName('head')[0].appendChild(style)
	},

	loadComments: function(){
		fetch(pagecommentsjs.url + "load.php").then(res=>res.json()).then((res)=>{
			let count = res.count;
			for(let i = 0;i < count; i ++){

			
			}
		});
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
			if(node.hasChildNodes()){
				node = node.firstChild;
			}else{
				while(node && !node.nextSibling){
					node = node.parentNode;
				}
				if(node){
					node = node.nextSibling;
				}else{
					node = null
				}
			}
		}
		return rangeNodes;
	},

	onMouseUp: function(e){
		let selection = document.getSelection()
		let bubble = pagecommentsjs.bubble
		if(selection.type === "Range" && selection.toString().length > 0){
			let flag = true;
			outer:
			for(let x = 0; x < pagecommentsjs.comments.count; x++){
				let highlighted = pagecommentsjs.comments[x].highlighted 
				for(let y in highlighted){
					if(selection.containsNode(highlighted[y],true)){
						flag = false;
						break outer
					}
				}
			}
			let anchor = selection.anchorNode
			if(anchor.nodeType == Node.TEXT_NODE)anchor = anchor.parentNode;
			if(flag){
				bubble.style.top= pagecommentsjs.elemY(anchor)
				bubble.style.opacity = 1
				bubble.selection = selection
			}
		}
	},

	onClick: function(e){
		let bubble = pagecommentsjs.bubble
		bubble.style.opacity = 0
		e.preventDefault()
		let selection = document.getSelection()
		let str = selection.toString()
		if(!str || str.length === 0){
			return;			
		}
		if(selection.rangeCount > 1){
			alert("Too many selections!")
			return;
		}
		//highlight selected nodes
		let sel = selection.getRangeAt(0)
		let nodes = pagecommentsjs.getRangeSelectedNodes(sel)
		let highlighted = pagecommentsjs.highlight(nodes, selection.anchorOffset, selection.focusOffset)
		
		//create comment div
		let commentdiv = pagecommentsjs.createCommentDiv(str);
		commentdiv.style.top = pagecommentsjs.elemY(highlighted[0].parentNode) 
		commentdiv.highlighted = highlighted
		commentdiv.highlightoffset = [selection.anchorOffset, selection.focusOffset]
		pagecommentsjs.comments.push(commentdiv)
		selection.empty();
	},

	elemY: function(e){
		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		return e.getBoundingClientRect().top + scrollTop + "px" 
	},

	createCommentDiv: function(comment, users=[], comments=[]){
		let commentdiv = document.createElement("div")
		commentdiv.className = "commentdiv"
		
		//Comment target
		let text = document.createElement("div")
		if(comment.length > 200){
			comment = comment.substring(0,80) + " ... " + comment.substring(comment.length-80)
		}
		text.innerHTML = "\"" + comment + "\""
		text.className = "commentbox"
		
		//Input comment area
		let textinput = document.createElement("textarea")
		textinput.className = "commentbox"
		textinput.rows = 3
		let submit = document.createElement("button")
		let cancel = document.createElement("button")
		submit.innerHTML = "comment"
		cancel.innerHTML = "cancel"
		submit.addEventListener("click", ()=>pagecommentsjs.submitComment(commentdiv))
		cancel.addEventListener("click", ()=>pagecommentsjs.clearSelection(commentdiv))

		//append to div
		commentdiv.appendChild(text)
		commentdiv.appendChild(textinput)
		commentdiv.appendChild(document.createElement("br"))
		commentdiv.appendChild(submit)
		commentdiv.appendChild(cancel)
		document.body.appendChild(commentdiv)
		return commentdiv;
	},

	highlight: function(tohighlight, startOffset, endOffset){
		let highlighted = []
		for(let x = 0; x < tohighlight.length; x++){
			let node = tohighlight[x]
			if(x != 0 && x != tohighlight.length - 1){
				let span = document.createElement("mark")
				span.className = "commenthighlight"
				span.innerHTML = node.nodeValue
				node.parentNode.replaceChild(span,node)
				highlighted.push(span)
			}else{
				let str = node.nodeValue
				let start = 0 
				let end = str.length
				let nodes = []
				// Split up text to highlight only selected parts
				if(x == 0){
					start = startOffset
					nodes.push(document.createTextNode(node.nodeValue.substring(0,start)))
				}
				let middle = document.createElement("mark")
				nodes.push(middle)
				if(x == tohighlight.length - 1){
					end = endOffset
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
				parent.normalize()
				highlighted.push(middle)
			}
		}
		return highlighted
	},

	submitComment: function(div){
		let commentbox = div.getElementsByTagName("textarea")[0]
		if(!commentbox.value){
			alert("Comment is blank!")
			return
		}
		let comments = pagecommentsjs.comments;
		let payload = {
			id: comments.index(div),
			highlighted: [],
			position: div.style.top,
			offset: div.highlightoffset,
			comment: commentbox.value,
			username: undefined}
		for(let i = 0;i < div.highlighted.length; i++){
			payload.highlighted.push(pagecommentsjs.getDomPath(div.highlighted[i]))
		}
		fetch(pagecommentsjs.url + "submit.php", 
			{method: 'POST',headers: {'Content-Type': 'application/json',},
			body: JSON.stringify(payload),
		}).then(res=>res.text()).then((res)=>{
			let span = document.createElement("span");
			span.innerHTML = res
			div.insertBefore(span,commentbox)
			div.insertBefore(document.createElement("br"),commentbox)
		})
	},

	clearSelection: function(div){
		let elems = div.highlighted
		for(let x in elems){
			let n = elems[x].parentNode.parentNode;
			elems[x].outerHTML = elems[x].innerHTML
			n.normalize()//removing spans splits text up into multiple nodes. use normalise to return them to normal
		}
		div.remove()
		pagecommentsjs.comments.remove(div)
	},

	getDomPath: function(el) {
		if (!el) {
			return;
		}
		var stack = [];
		while (el.parentNode != null) {
			var sibCount = 0;
			var sibIndex = 0;
			for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
				var sib = el.parentNode.childNodes[i];
				if ( sib.nodeName == el.nodeName ) {
					if ( sib === el ) {
						sibIndex = sibCount;
					}
					sibCount++;
				}
			}
			var nodeName = el.nodeName.toLowerCase();
			stack.push([nodeName,sibIndex]);
			el = el.parentNode;
		}
		stack.pop();
		stack.reverse(); // removes the html element
		return stack;
	},

}
window.onload = pagecommentsjs.load
