# PageCommentsJS
Produced as part of an internship under [Julian Kunkel](https://hps.vi4io.org/about/people/julian_kunkel)

When selecting a section of text, adds a button for leaving a comment. The selection of text is then wrapped around in the html tag <mark>.


## Usage
In a html file, call pagecommenjs.load after the page is loaded.
```
<script type="text/javascript" src="pagecommentjs.js"></script>
<script>
  window.onload = pagecommentjs.onload
</script>
```

load.php and submit.php contains a prototype for saving comments to a server.

The json  format for submitting comments is as followed:
```
{
  //desc: highlighted text,
  //id: commentbox id,
  //highlighted: array of paths to highlighted elements (more below),
  //position: pixel position of comment box relative to top of page,
  //offset: if text is partially highlighted, the start/end offset is heere,
  //comment: comment,
  //username: username
}
```

The path to a highlighted element is represented as an array of tuples of tag name and index. Where each element is the nth child with the specified tag of the parent node. For example the the second paragraph in the body would be reprented as [["body",0],["p",1]].

The current method of saving the json is to write the json directly to a file with its id as the name.

User and color are both place holders at the moment.
