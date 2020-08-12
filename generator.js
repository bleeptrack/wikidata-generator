paper.install(window);

//colors from styleguide
var concreteColor = '#D0D0CE';
var textColor = '#FE5000';
var leafColor = '#00BB31';

var wikidataColors = ['#990000', '#339966', '#006699'];
var darkColor = '#484848';
var lightColor = 'white';
var lastcolor = _.sample([0,1,2]);

var groundheight = 800;


var simText = "WIKIDATA";

var letters = [];
var blobs = [];
var lines = [];
var decos = [];
var centerLetter;
var textBlob = [];
var littleTexts = [];
var font;
var darkTheme = true;

window.onload = function() {
	paper.setup('paperCanvas');

	generate();


}


function generate(){
	opentype.load("NotoSans-Bold.ttf", function(err, f) {
		font = f;
		text = simText;

		var amount, glyph, ctx, x, y, fontSize;
		if (err) {
			console.log(err.toString());
			return;
		}

		let lines = text.split(" ");
        let coloredLines = new Group();
        for(let i = 0; i<lines.length; i++){
            let newline = textLine(lines[i]);
            if(coloredLines.lastChild){
                newline.bounds.topLeft = coloredLines.lastChild.bounds.bottomLeft.add([200,70]);
            }
            coloredLines.addChild( newline );
        }

        coloredLines.position = paper.view.bounds.center;

        if(coloredLines.bounds.width > coloredLines.bounds.height){
            paper.view.zoom = paper.view.zoom * (paper.view.bounds.width / coloredLines.bounds.width) * 0.65;
        }else{
            paper.view.zoom = paper.view.zoom * (paper.view.bounds.height / coloredLines.bounds.height) * 0.55;
        }


		centerLetter = _.sample(letters);
		centerLetter.fillColor = lightColor;

		for(let i = 0; i< _.random(8,15); i++){
			setBlob(centerLetter);
		}

		connectBlobs();
		decorateBlobs();
		setBirthdayText();

        coloredLines.bringToFront();

        if(textBlob.length<2){
            updateText();
        }
	});
}

function textLine(text){
    let textwidth = font.getAdvanceWidth(text, 500);
    let fontpaths = font.getPaths(text,(paper.view.viewSize.width-textwidth)/2,0,500);
    let line = new Group();
    for(var i = 0; i<fontpaths.length; i++){


        if(fontpaths[i].commands == 0) continue;

        //import test as SVG into paper
        let boundingboxData = fontpaths[i].getBoundingBox();
        let paperpath = paper.project.importSVG(fontpaths[i].toSVG());
        paperpath.applyMatrix = true;
        lastcolor = _.sample(_.without([0,1,2], lastcolor));
        paperpath.fillColor = wikidataColors[lastcolor]


        letters.push(paperpath);
        line.addChild(paperpath);
    }
    return line;
}

function tinyFont(text){
	let letterGroup = new Group();
	let textwidth = font.getAdvanceWidth(text, 80);
	let fontpaths = font.getPaths(text,(paper.view.viewSize.width-textwidth)/2,0,80);

	for(var i = 0; i<fontpaths.length; i++){


		if(fontpaths[i].commands == 0) continue;

			//import test as SVG into paper
		let boundingboxData = fontpaths[i].getBoundingBox();
		let boundingbox = new Rectangle([boundingboxData.x1, boundingboxData.y1], [boundingboxData.x2-boundingboxData.x1, boundingboxData.y2-boundingboxData.y1]);
		let paperpath = paper.project.importSVG(fontpaths[i].toSVG());
		paperpath.applyMatrix = true;
		lastcolor = _.sample(_.without([0,1,2], lastcolor));
		//paperpath.fillColor = wikidataColors[lastcolor]


		paperpath.bounds.bottomCenter = [boundingbox.center.x, groundheight-80];
		letterGroup.addChild(paperpath);
	}
	letterGroup.fillColor = 'white';
	return letterGroup;
}

function toggleShapeColor(shape){
    if(darkTheme){
        if(shape.fillColor != null){
            shape.fillColor = shape.fillColor.equals(lightColor) ? darkColor : lightColor;
        }
        if(shape.strokeColor != null){
            shape.strokeColor = shape.strokeColor.equals(lightColor) ? darkColor : lightColor;
        }
    }else{
        if(shape.fillColor != null){
            shape.fillColor = shape.fillColor.equals(lightColor) ? 'black' : lightColor;
        }
        if(shape.strokeColor != null){
            shape.strokeColor = shape.strokeColor.equals(lightColor) ? 'black' : lightColor;
        }
    }

}

function toggleColor(){
	blobs.forEach(blob => toggleShapeColor(blob) );
	lines.forEach(line => toggleShapeColor(line) );
	decos.forEach(deco => toggleShapeColor(deco) );
    littleTexts.forEach(text => toggleShapeColor(text) );
	toggleShapeColor(centerLetter);
	document.body.style.backgroundColor = document.body.style.backgroundColor == 'white' ? 'black' : 'white';
    darkTheme = !darkTheme;
}


function setBlob(letter){
	let circ = new Path.Circle(getBlobPoint(letter), _.random(40,100));
	circ.sendToBack();
	while(hitsOtherShape(circ, blobs)){
		circ.position = getBlobPoint(letter);
	}
	if(!hitsOtherShape(circ, letters) && textBlob.length<2){
		circ.scale(3);
		textBlob.push(circ);
	}
	circ.fillColor = lightColor;
	blobs.push(circ);
}

function setBirthdayText(){
	console.log("länge:"+textBlob.length);
    if(textBlob.length>1){
        textOnBlob(tinyFont("WIKI"), tinyFont("DATA"), textBlob[0]);
        textOnBlob(tinyFont("BIRTH"), tinyFont("DAY"), textBlob[1], [0,10]);
    }
}

function textOnBlob(text1, text2, blob, offset){
	let c1 = blob;
	let t1 = text1;
	let t2 = text2;
	t2.bounds.topCenter = t1.bounds.bottomCenter.add([0,20]);
	let tGroup = new Group(t1,t2);
	tGroup.fillColor = 'white';

	tGroup.position = c1.position;
	let w = tGroup.bounds.width;
	let h = tGroup.bounds.height;
	tGroup.scale((c1.bounds.height) / (Math.sqrt(w*w + h*h)) * 0.7);
	if(c1.fillColor && c1.fillColor.equals('white')){
		tGroup.fillColor = 'black';
	}
	if(offset){
		tGroup.position = tGroup.position.add(offset);
	}
	littleTexts.push(tGroup);
}

function getPointOnRect(rect){
	let rim = rect.expand(50);
	let rec = new Path.Rectangle(rim);
	let rndPoint = rec.getPointAt(_.random(0, rec.length, true));
	rec.remove();
	return rndPoint;
}

function getBlobPoint(shape){
	let recPoint = getPointOnRect(shape.bounds);
	let p = shape.getNearestPoint(recPoint);
	let vec = recPoint.subtract(p).normalize(_.random(200,450));
	return p.add(vec);
}

function hitsOtherShape(shape, shapes){
	for(let i = 0; i<shapes.length; i++){
		if(shapes[i].intersects(shape) || (shape.closed==true && shapes[i].contains(shape.bounds.center) )){
			//shapes[i].fillColor = 'red';
			//shapes[i].strokeColor = 'red';
			return true;
		}
	};
	return false;
}

function decorateBlobs(){
	for(let i = 0; i<blobs.length; i++){
		let blob = blobs[i];

		let variation = _.random(0,2);
		let deco = blob.clone();

		switch(variation){
			case 0:
				deco.scale(0.8);
				deco.strokeColor = 'black';
				deco.dashArray = getRandomDashArray(deco);
				deco.strokeWidth = _.random(3,12);
				break;
			case 1:
				blob.scale(0.8);
				deco.fillColor = null;
				deco.strokeColor = lightColor;
				deco.dashArray = getRandomDashArray(deco);
				deco.strokeWidth = _.random(3,12);
				break;
			case 2:
				blob.scale(0.8);
				blob.fillColor = null;
				blob.strokeWidth = _.random(3,12);
				blob.dashArray = getRandomDashArray(blob);
				blob.strokeColor = lightColor;
				deco.fillColor = null;
				deco.strokeColor = lightColor;
				deco.dashArray = getRandomDashArray(deco);
				deco.strokeWidth = _.random(3,12);
				break;
		}
		decos.push(deco);
	}
}

function getRandomDashArray(shape){
	let partNr = _.random(3,Math.floor(shape.length/20));
	let partLength = shape.length/partNr;
	let gapLength =  _.random(5,11)
	gapLength = gapLength==11 ? 0 : gapLength;
	return [partLength-gapLength, gapLength];
}

function connectBlobs(){

	for(let i = 0; i<blobs.length-1; i++){
		for(let j = i+1; j<blobs.length; j++){

			let line = new Path.Line(blobs[i].position, blobs[j].position);
			line.strokeColor = lightColor;
			line.strokeWidth = _.random(3,9);

			let b1 = PaperOffset.offset(blobs[i], 20, { join: 'round', insert:false })
			let b2 = PaperOffset.offset(blobs[j], 20, { join: 'round', insert:false })

			let inters1 = line.getIntersections(b1);
			let rest = line.splitAt(inters1[0]);
			line.remove();
			line = rest;

			let inters2 = line.getIntersections(b2);
			let rest2 = line.splitAt(inters2[0]);
			rest2.remove();

			//line.dashArray = [_.random(10,30), _.random(0,15)];

			if(hitsOtherShape(line, lines) || hitsOtherShape(line, blobs)){
				line.remove();
				//line.strokeColor = 'blue';
			}else{
				line.sendToBack();
				lines.push(line);
			}
		}
	}
}


//transforms a paper.js path into points for matter engine
function paper2matter(paperpath) {
	var pp;

	if(paperpath._class == "CompoundPath"){
		pp = paperpath.children[0].clone();
	}else{
		pp = paperpath.clone();
	}
	//paperpath.simplify(1);
	pp.flatten(4);
	var points = [];
	for(var i = 0; i<pp.segments.length; i++){
		var p = pp.segments[i].point;
		var vert = {
			x: p.x,
			y: p.y
		};
		points.push(vert);
	}
	pp.remove();
	return points;
}

//shuffles array elements
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


//canvas zoom in
function zoomIn(){
	paper.view.zoom = paper.view.zoom+0.05;
}

//canvas zoom out
function zoomOut(){
	paper.view.zoom = paper.view.zoom-0.05;
}

//let user download canvas content as SVG
function downloadSVG(){
    var svg = project.exportSVG({ asString: true, bounds: 'content' });
    var svgBlob = new Blob([svg], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = simText+".svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

//let user download canvas content as PNG
function downloadPNG(){
    var canvas = document.getElementById("paperCanvas");
    var downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png;base64");
    downloadLink.download = simText+'.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function updateText(){
	simText = document.getElementById('simulationtext').value.toUpperCase();
	project.activeLayer.removeChildren();
	letters = [];
	blobs = [];
	lines = [];
	decos = [];
	centerLetter = null;
    textBlob = [];
    littleTexts = [];
	console.log(simText);
	generate();
}
