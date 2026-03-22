# dom-css-dump

## dump a dom tree with computedstyle on each node

- walk the dom tree and for each node store an array of all getComputedStyle values

```
(div
	(p	"foo")
	(div
		(p	"bar")))
```
		
becomes

```
(div
	(p	"foo" [0,0,1,"auto","2px","red",...] /* computed styles values VS */ )
	(div
		(p	"bar" [0,1,1,"auto","4px","blue",...])
		[0,0,0,"auto","2px","gray",...]))
```
		
then store the list of computeStyles names in the same order

so that we can then take an array VS and recreate the computedStyle map

{ "color": "blue", "padding": "2px" } for all possible properties