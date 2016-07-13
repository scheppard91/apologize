/** SplitType 
  * A javascript utility that splits text into indivual lines words and characters
  * that can be animated and styled independently. 
  * Date: May 2015
  * @author: Luke Peavey 
  * @version: 0.8
  * @license MIT
  */

var SplitType = (function (window, document, undefined) {
'use strict';

/********************
- DEFAULT SETTINGS - 
*********************/ 
// Internal defaults object 
// Stores the global default settings used for all splitType calls. 
var _defaults = {
	lineClass : 'line',
	wordClass : 'word',
	charClass : 'char',
	splitClass : 'split-item',
	split : 'lines, words, chars',
	position : 'rel',
	nodeName : 'div',
	text : false,
	// === Read Only === 
	// (boolean) checks settings to see if text is being split into lines 
	get splitLines() { return this.split.indexOf('lines') !== -1 },
	// (boolean) checks settings to see if text is being split  into words 
	get splitWords() { return this.split.indexOf('words') !== -1 },
	// (boolean) checks settings to see if text is being split into being characters 
	get splitChars() { return this.split.indexOf('chars') !== -1 },
	// (boolean) checks settings to see if position is set to absolute
	get isAbsolute() { return typeof this.position === "string" && this.position.toLowerCase() === 'absolute' || this.absolute === true }
}

/** 
 * SplitType.defaults is public property on the global SplitType object. 
 * It allows people to access or modify global default settings from outside.
 * Individual settings can be changed like this: SplitType.settings.settingName = 'new value'
 * Multiple settings can be changed like this: SplitType.settings = {setting1: 'value1', setting2: 'value2'}
 */
Object.defineProperty(SplitType, 'settings', {
	get: function() { return _defaults },
	set: function(obj) { 
		_defaults = extend(_defaults, obj); 
	}
})

/***************************************
 - Utility Methods - 
 ***************************************/  
/* jquery type */ 
 function type( obj ) {
	if ( obj == null ) {
		return obj + "";
	}
	return typeof obj === "object" || typeof obj === "function" ? 
		class2type[ toString.call(obj) ] || "object" : 
			typeof obj;
};
/* jquery isArraylike */
function isArraylike(obj) {
	if(typeof obj !== 'object' || obj === null) return false; 
	var length = obj.length; 
	return length === 0 || typeof length === 'number' && length > 0 && (length - 1) in obj;
};
/* Shorthands for native DOM methods */ 
var text = function(str) { return document.createTextNode(str) }
var space = function() { return text(' ') }
var fragment = function() { return document.createDocumentFragment() } 

/* for jquery type */ 
var class2type = {}, 
toString = class2type.toString; 
'Boolean Number String Function Array Object Null'.split(' ').
forEach(function(name) { class2type["[object " + name + "]"] = name.toLowerCase() });

/** 
 * Merges two or more objects into a new object. 
 * Chris Ferdinandi https://gist.github.com/cferdinandi/ 
 * Objects on the right override matching properties of those on the left. 
 * Modified to use getOwnPropertyDescriptor and defineProperty to allow copying of getter/setters
 * IE9 and up
 */
function extend( objects ) {
    var extended = {};
    var merge = function (obj) {
        for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            	var propDefinition = Object.getOwnPropertyDescriptor(obj, prop)
            	Object.defineProperty(extended, prop, propDefinition)
            }
        }
    };
    merge(arguments[0]);
    for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i]; 
        if( typeof obj === 'object' && obj !== null ) 
        	merge(obj);	
    }
    return extended;
};

/**
 * Tests if an object is an element-like node. For our purposes, this includes: 
 * a) element node, b) text node, c) document fragment.  
 * @param: obj: the object to test 
 * returns: boolean 
 */
function isElement(obj) {
	if (typeof obj !== 'object' || obj === null) return false; 
	return obj.nodeType === 1 || obj.nodeType === 3 || obj.nodeType === 11; 
}
/** 
 * Inserts a new stylesheet in the page's <head>.  
 * css rules can be added to the stylesheet using the addCSSRule() method
 * // var mySheet = styleSheet(); 
 * // addCSSRule(mySheet, "body", "color: #fff");
 * David Walsh (http://davidwalsh.name/add-rules-stylesheets)
 * @returns: a CSSStyleSheet object 
 */ 
function position(elem) {
	if (!elem) return; 
	return {
		top: elem.offsetTop, 
		left: elem.offsetLeft, 
		width: elem.offsetWidth, 
		height: elem.offsetHeight, 
	}
}
function styleSheet() {
	var style = document.createElement("style"); // Create the <style> node
	style.appendChild(document.createTextNode("")); // Webkit hack; 	
	document.head.appendChild(style); // add style element to page
	return style.sheet; // Returns the CSSStyleSheet object
}
function addCSSRule(sheet, selector, rules, index) {
	if( "insertRule" in sheet ) {
		sheet.insertRule(selector + "{" + rules + "}", (index || 0));
	}
	else if( "addRule" in sheet ) {
		sheet.addRule(selector, rules, (index || 0));
	}
}

/** Creates an HTML Element with the specified attributes and content. 
  * @param: attributes (object): 
  * 	@param: class: (string) one or more class names
  * 	@param: style: (string) string of css styles 
  * 	@param: tagName: (string) the type of HTML element
  * 	@param: content: (string) the inner HTML of the new element (HTML string or text)
  * 	@param: data: (object) attach custom data attributes to the element
  *			Define data attrs as key value pairs { dataName : 'value' } 
  * @returns: HTML string 
  */
function createHtmlElement(attributes) {
	var a = attributes || {},
		content = typeof a.content === 'string' ? a.content : '',
		tagName = a.tagName || _defaults.nodeName,
		classNames = ((a.class || '') + ' ' + _defaults.splitClass).trim(),
		styleAttribute = a.style ? 'style="' + a.style + '"' : '',
		dataAttribute = ''; 
		// Add custom data attributes 
		type(a.data) === 'object' && Object.keys(a.data).forEach(function(key) {
			dataAttribute += ' data-' + key + '=' + a.data[key] ; 
		})
	return '<' + tagName + ' class="' + classNames + '" ' + styleAttribute + dataAttribute + '>'+ content + ' </'+ tagName + '>';  
};


/** Create a DOM Element with the specified attributes and content. 
  * Same as createHtmlElement() except it returns a DOM node instead of HTML string. 
  * @param: attributes (object) :
  * 	@param: class: (string) one or more class names
  * 	@param: style: (string) string of css styles 
  * 	@param: nodeName: (string) the type of element
  * 	@param: content: (element node | array of elements | string) 
  * 	@param: data: (object) attach custom data attributes to the element. 
  *  		Define as key value pairs {dataName:'value'}
  * @returns: Element Node 
  */
function createDomElement(attributes) {
	// Let a = attributes;
	var a = attributes || {},
			content = a.content,
			data = a.data,
			node = document.createElement( a.nodeName || _defaults.nodeName ); 
	// 1. Set the class, style, and data.
	node.className = (( a['class'] || '') + ' ' + _defaults.splitClass).trim(); 
	a.style && (node.style.cssText = a.style); 
	type(data) === 'object' && Object.keys(data).forEach(function(prop) {
		node.dataset[prop] = data[prop]; 
	})
	// If content was passed in, determine how to insert it
	switch ( type(content) ) {
		// if its a single node, append it to the element
		case "object" : 
			isElement( content ) && node.appendChild( content ); 
		break; 
		// if its an array of elements, interate over array and append each element
		case "array" : 
			content.forEach(function(element) {
				isElement( element ) &&  node.appendChild( element );
			});  
		break;
		// if its a string, insert it as HTML 
		case "string" : node.innerHTML = content; 
	}
	return node; 
}


/****************************************
 - Internal Functions - 
 ***************************************/ 

/** Creates an array of the target elements for a splitType call. 
  * Elements can be passed into splitType() in several different forms: 
  * a) single DOM element; b) nodelist; c) jquery/zepto object; d) array; e) selector string;
  * this method takes those various formats and converts them into a plain array of DOM elements.
  * @param: elements: any of the formats listed above  
  * @returns: an array of DOM nodes representing each of the target elements
  */
function _sanitizeElements( elements ) {
	var elementsArray = []; 
	// 1. If elements is a selector string...
	// its its an ID, use getElementById to search for a single element (faster) 
	// Otherwise, use querySelectorAll to find a set of matched elements
	if ( typeof elements === "string" ) {
		var selector = elements.trim(); 
		if (selector.split(' ').length === 1 && selector.indexOf(',') > -1 
				&& selector.indexOf('>') > -1 && selector.charAt(0) === '#' ) {
			elements = document.getElementById( selector.substring(1) )
		} else {
			elements = document.querySelectorAll(selector); 
		}
	}
	// If elements is an array, nodelist, or jquery object...
	// flatten it and convert it to a plain array of DOM elements
	if( isArraylike( elements ) ) {
		var len = elements.length;
		for (var i = 0; i < len; i++ ) {
			if(isArraylike(elements[i])) {
				for(var j = 0, len2 = elements[i].length; j<len2; j++) {
					isElement( elements[i][j] ) && elementsArray.push(elements[i][j])
				}
			} else {
				isElement(elements[i]) && elementsArray.push(elements[i]);	
			}
		}
	// If elements is single element...
	// just wrap it an array so we can use iteration methods
	} else if ( isElement(elements) ) {
		elementsArray = [elements]; 
	}
	return elementsArray; 
}
/** Splits the text content of a single element according to the settings for that instance. 
  * @param: element (DOM Node):  the target element for the split operation
  * @this: refers to the splitType instance 
  */
function _split (element, index) {
	var data = this._SPLIT,
		s = data.settings,
	// Define Variables 
		splitLines = s.splitLines,
		splitWords = s.splitWords,
		splitChars = s.splitChars,
		isAbsolute = s.isAbsolute,
		lines = [], words = [], chars =[], 
		textContent = element.textContent.replace(/\s+/g,' ').trim(),
		splitText = fragment(),
		wordContent, word, charNode; 

	// 1. Iterate over each word of text 
	textContent.split(' ').forEach(function(currentWord, index) {
			// 2. If splitting text into characters... 
			if( splitChars ) {
				// Let wordContent be a doc fragment to hold the wrapped character elements for this word
				wordContent = fragment(); 
				// Iterate over each character of text in the current word.
				// Wrap the character in a new DOM element. 
				// Append the element to wordContent.
				// Push the element to the chars array.
				currentWord.split('').forEach(function(currentChar, index, array){
					chars.push(
						wordContent.appendChild(
							charNode = createDomElement({
								class: s.charClass, 
								content: currentChar,
								nodeName: 'div',
								data: {
									// true if its the last character in the word 
									last : (splitLines && !splitWords) && index === array.length - 1,
								}
							})
						) 
					)
				});
			}
			// 3. NOT splitting into characters... 
			else {
				//  Let wordContent be a textNode containing the current word text
				wordContent = text( currentWord );
			}
			// 4. If splitting text into words... 
			if( splitWords || splitLines) { 
				// wrap wordContent in a new DOM element 
				// Let word be the DOM element that contains wordContent.
				word = createDomElement({
					class: s.wordClass, 
					content: wordContent,
				});
			// 5. NOT splitting into words 
			} else {
				// proceed without wrapping wordContent in an element. 
				// Let word be equal to wordContent 
				word = wordContent;  
			}
			// append the word to splitText (followed by a space). 
			// Push it to words array if splitting text into words or lines. 
			splitText.appendChild( word ); 
			splitText.appendChild( space() ); 
			if ( splitWords || splitLines ) {
				words.push(word); 
			}
	}, this); // END OF LOOP 

	// Empty the target element. Append splitText document fragement
	element.innerHTML = ''; 
	element.appendChild(splitText); 
	
	// Push the words and characters for this element to allChars and allWords. 
	data.allWords = splitWords ? data.allWords.concat(words) : []; 
	data.allChars = splitChars ? data.allChars.concat(chars) : []; 
	
	// Now move on to splitting text into lines, or return. 
	if (!splitLines && !isAbsolute) {
		return; 
	}
	if(splitLines) {
		lines = _splitLines.call(this, element, words, chars); 
		words = splitWords ? words : []; 
	}

	if( isAbsolute ) {
		_setPosition.call(this, element, lines, words, chars)
	}
	
}
/** 3. Split Lines
  * Detects where natural line breaks (line wraps) occur in text, then wraps each in its own HTML element. 
  * @param: element (DOM Node)
  * @returns: lines (an array of all split line elements); 
  * @this: refers to the SplitType instance 
  */
function _splitLines( element, words, chars ) {
	var data = this._SPLIT,
		s = data.settings, 
		splitLines = s.splitLines, 
		splitWords = s.splitWords, 
		splitChars = s.splitChars,
		// Variables 
		lines = [],
		currentLine = [],
		lineOffsetY = -999,
		offsetY, 
		splitText = fragment(); 
	// Iterate over words and detect where natural line breaks occur in the text. 
	words.forEach(function(wordNode) {
		offsetY = wordNode.offsetTop;
		if( offsetY !== lineOffsetY ) {
			currentLine = []; 
			lines.push(currentLine); 
			lineOffsetY = offsetY;
		}
		currentLine.push( wordNode ); 
	}, this)

	// Iterate over the array of lines, create a wrapper element for each one
	lines.forEach(function(currentLine, index) {
		var lineNode = createDomElement({
			class: s.lineClass
		});
		// loop over the array of word elements in the current line.
		// if splitting text in words, just append each node to the line wrapper
		// If not, append the character nodes or the plain text (if we are only splitting text into lines).
		currentLine.forEach(function (wordNode, i) {
			var word; 
			if( splitWords ) {
				word = wordNode; 
			}
			else if (splitChars) {
				word = fragment(); 
				[].slice.call( wordNode.children ).forEach(function(charNode) {
					word.appendChild( charNode ); 
				})
			}
			else {
				word = text(wordNode.textContent); 
			}
			// Append the word to the line element, followed a space. 
			lineNode.appendChild( word ); 
			lineNode.appendChild( space() ); 
		})
		// Append each line element to splitText (doc fragment)
		splitText.appendChild( lineNode ); 
		data.allLines.push( lineNode ); 
		lines.splice(index, 1, lineNode); 
	}, this); 
	// Empty The target Element, Then append spliText
	while ( element.firstChild ) {
	  element.removeChild( element.firstChild );
	}
	element.appendChild( splitText ); 
	return lines; 
}
/** Absolute position 
 * Set all split lines, words and characters to absolute position
 */
function _setPosition(element, lines, words, chars) {
	var data = this._SPLIT,
		s = data.settings, 
		splitLines = s.splitLines, 
		splitWords = s.splitWords, 
		splitChars = s.splitChars,
		lineHeight = 0,
		elHeight = element.offsetHeight, 
		elWidth = element.offsetWidth,
		nodes = [].concat(lines, words, chars),
		len = nodes.length, 
		s = window.getComputedStyle(element),
		i;
	element.style.position = s.position === 'static' ? 'relative' : s.position; 
	element.style.height = elHeight + 'px'; 
	element.style.width = elWidth + 2 + 'px';
	
	for (i = 0; i < len; i++) {
		nodes[i].pos = position(nodes[i]); 
	}

	for (i = 0; i < len; i++) {
		// cache the current element and its style prop
		var node = nodes[i];
		node.style.top = node.pos.top + 'px';
		node.style.left= node.pos.left + 'px';
		node.style.height= node.pos.height + 'px';  
		node.style.width= node.pos.width +  'px'; 
		node.style.position = 'absolute'; 
	}
}
// Add some global styles to the page. These apply to all split nodes
var sheet = styleSheet(); 
addCSSRule(sheet, '.is-splitting', 'visibility: hidden; position: absolute;');
addCSSRule(sheet, '.split-item', 'display: inline-block; position: relative;');

/*********************************************
  SplitType Constructor
 *********************************************/ 
function SplitType (elements, options) {
	// Abort if SplitType was called without new
	if(!this instanceof SplitType) return; 
	var data = this._SPLIT =  {
		settings: {}, 
		splitNodes : [], 
		elements : [],
		allLines : [],
		allWords : [],
		allChars : [],
		originals : []
	};
	data.settings = extend(_defaults, options);
	data.elements = _sanitizeElements( elements ); 
	data.elements.forEach(function(element, i) {
		data.originals[i] = element.innerHTML; 
	});
	
	this.split(); 
}
/*********************************************
  PUBLIC PROPERTIES AND METHODS 
 *********************************************/ 
 SplitType.prototype = {
	/** Split 
		* Initiates the text splitting process. It gets called automatically when new splitType 
		* instance is created. But it can also be called manually to re-split the text in an instance. 
		* New options can be passed into split() each time its called. 
		* @param: newOptions (object): modifies the settings for the splitType instance
		* @this: refers to the splitType instance
		*/ 
	split: function( newOptions ) {
		var data = this._SPLIT, 
		s = data.settings, 
		elements = data.elements,
		// cache vertical scroll position before splitting 
		// it will change when elements are removed from doc flow
		scrollPos = [ window.scrollX, window.scrollY ];
		// Empty the arrays of split elements before proceeding 
		data.allLines.length = data.allWords.length = data.allChars.length = 0; 
		
		// If new options were passed in, update the settings for this instance 
		data.settings = newOptions ? extend(data.settings, newOptions) : data.settings; 

		// add "is-splitting" class to each target element before starting the process. 
		// This temporarily hides the parent element and removes it from document flow. 
		elements.forEach(function(element) {
			element.parentElement.classList.add('is-splitting'); 
		})

		// split the text in each of the target elements. n
		elements.forEach(function(element, index) {
			_split.call( this, element ) ; 
		}, this)

		// Remove the 'is-splitting' class from all elements once the process is complete.
		elements.forEach(function(element) {
			element.parentElement.classList.remove('is-splitting');
		})
		// Set scroll position to cached value.
		window.scrollTo(scrollPos[0], scrollPos[1]); 
		return this;  
	},
	/** Revert:
	  * Removes the HTML elements created by splitType and reverts 
		* the elements back to thier original content
		* @this: refers to the splitType instance
		*/ 
	revert: function() {
		var data = this._SPLIT; 
		// Empty the arrays of split items
		// Remove split text from target elements and restore original content
		data.allLines.length = data.allWords.length = data.allChars.length = 0; 	
		data.elements.forEach(function(element, i) {
			element.innerHTML = data.originals[i]; 
		})
	},
	/** lines
		* Returns an array of elements for each lines in the splitType instance. 
		*/  
 	get lines() { return this._SPLIT.allLines }, 
	/** words
		* Returns an array of elements for each words in the splitType instance. 
		*/  
	get words() { return this._SPLIT.allWords },
	/** chars
		* Returns an array of elements for each characters in the splitType instance. 
		*/
	get chars() { return this._SPLIT.allChars }
}
// Returns the SplitType Constructor 
return SplitType; 
})(window, document);

this.gsTransform = (function() {
	var prop, t = {transform: 1, WebkitTransform: 1, MozTransform: 1, msTransform: 1, OTransform: 1, '': 0};
	for (prop in t) if (prop in document.documentElement.style) break;
	return prop;
})();

this.gsTransformOrigin = gsTransform ? gsTransform + 'Origin' : '';

(this._gsQueue || (this._gsQueue = [])).push(function() {

	function getPercent(value, size) {
		if (value == undefined) return;
		value = value.toString().toLowerCase();
		switch (value) {
			case 'top': case 'left': return 0;
			case 'center': return 50;
			case 'bottom': case 'right': return 100;
		}
		var percent = parseFloat(value);
		if (value.indexOf('%') < 0) percent *= 100 / size;
		return percent;
	}

	_gsDefine.plugin({
		propName: "origin",
		API: 2,
		version: "0.2",

		init: function(target, value, tween) {
			var o = target.style[gsTransformOrigin].split(' ');
			this.target = target;
			this._x = getPercent(o[0], target.offsetWidth ) || 50;
			this._y = getPercent(o[1], target.offsetHeight) || 50;
			this._z = parseInt(o[2]) || 0;
			o = value.trim().split(/\s+/);
			this.x = getPercent(o[0], target.offsetWidth );
			this.y = getPercent(o[1], target.offsetHeight);
			this.z = parseInt(o[2]) || 0;
			if (this._x == this.x) delete this.x;
			if (this._y == this.y) delete this.y;
			if (this._z == this.z) delete this.z;
			return gsTransformOrigin && ('x' in this || 'y' in this || 'z' in this);
		},

		set: function(ratio) {
			var x = this._x, y = this._y, z = this._z, r = ratio < 1 ? ratio : 1;
			if ('x' in this) x = r * (this.x - x) + x;
			if ('y' in this) y = r * (this.y - y) + y;
			if ('z' in this) z = r * (this.z - z) + z;
			this.target.style[gsTransformOrigin] = x+"% "+y+"% "+z+"px";
			//console.log(this.target.style[gsTransformOrigin]);
			// this.target._gsTransform.zOrigin = z; ???
		}
  });

}), this._gsDefine && _gsQueue.pop()();

function gsConvertEase(ease) {
	var m = ease.match(/(easeInOut|easeIn|easeOut|ease)(.+)/);
	return m ? window[ m[2] ][ m[1] ] : Linear.easeNone;
}

function gsRect(clip, w, h) {
	var i, c = clip.trim().split(/[,\s]+/), d = [h, w];
	for (i = 0; i < c.length; i++)
		c[i] = c[i].indexOf('%') < 0 ? parseInt(c[i]) : parseFloat(c[i]) / 100 * d[i % 2];
	if (c.length < 2) c[1] = c[0];
	if (c.length < 3) c[2] = c[0];
	if (c.length < 4) c[3] = c[1];
	c[1] = d[1] - c[1];
	c[2] = d[0] - c[2];
	c.length = 4;
	return 'rect('+ c.join() +')';
}

function lsShowNotice(lsobj,issue,ver){

	var el;

	if( typeof lsobj == 'string' ){
		el = jQuery('#'+lsobj);
	}else if( typeof lsobj == 'object' ){
		el = lsobj;
	}

	var errorTitle, errorText;

	switch(issue){
		case 'jquery':
		errorTitle = 'multiple jQuery issue';
		errorText = 'It looks like that another plugin or your theme loads an extra copy of the jQuery library causing problems for LayerSlider to show your sliders.';
		break;
		case 'oldjquery':
		errorTitle = 'old jQuery issue';
		errorText = 'It looks like you are using an old version ('+ver+') of the jQuery library. LayerSlider requires at least version 1.7.0 or newer. Please update jQuery to 1.10.x or higher.</a>';
		break;
	}

	el.addClass('ls-error');
	el.append('<p class="ls-exclam">!</p>');
	el.append('<p class="ls-error-title">LayerSlider: '+errorTitle+'</p>');
	el.append('<p class="ls-error-text">'+errorText+'</p>');
}

(function($) {
	window.lsjq = $;
	// IMPROVEMENT v5.3.0 Fixed multiple Greensock issues

	if( typeof kmGS !== 'undefined' ){
		for(var prop in kmGS) {
			this[prop] = kmGS[prop];
		}
	}

	var scrollWidth; // calc scrollWidth
	$(function() {
		var outer = document.createElement("div");
		outer.style.visibility = "hidden";
		outer.style.width = "100px";
		document.body.appendChild(outer);
		var widthNoScroll = outer.offsetWidth;
		outer.style.overflow = "scroll";
		var inner = document.createElement("div");
		inner.style.width = "100%";
		outer.appendChild(inner);
		var widthWithScroll = inner.offsetWidth;
		outer.parentNode.removeChild(outer);
		scrollWidth = widthNoScroll - widthWithScroll;
	});

	$.fn.layerSlider = function( options ){

		// IMPROVEMENT v4.1.0 Checking jQuery version
		// IMPROVEMENT v4.1.3 Changed required version from 1.7.2 to 1.7.0

		var reqVer = '1.7.0';
		var curVer = $.fn.jquery;
		var el = $(this);

		var checkVersions = function(v1,v2){

			var v1parts = v1.split('.');
			var v2parts = v2.split('.');

			for (var i = 0; i < v1parts.length; ++i) {

				if (v2parts.length == i) {
					return false;
				}

				if(parseInt(v1parts[i]) == parseInt(v2parts[i])){
					continue;
				}else if (parseInt(v1parts[i]) > parseInt(v2parts[i])){
					return false;
				}else{
					return true;
				}
			}

			if (v1parts.length != v2parts.length) {
				return true;
			}

			return true;
		};

		if( !checkVersions('1.8.0',curVer) ){
			el.addClass('ls-norotate');
		}

		// Initializing if jQuery version is greater than 1.7.0

		if( !checkVersions(reqVer,curVer) ){
			lsShowNotice( el, 'oldjquery', curVer );
		}else{

			if( (typeof(options)).match('object|undefined') ){
				return this.each(function(i){
					new layerSlider(this, options);
				});
			}else{
				if( options === 'data' ){
					var lsData = $(this).data('LayerSlider').g;
					if( lsData ){
						return lsData;
					}

				// NEW FEATURES v5.2.0 option to get userInitData & defaultInitData

				}else if( options === 'userInitData' ){
					var lsInitData = $(this).data('LayerSlider').o;
					if( lsInitData ){
						return lsInitData;
					}
				}else if( options === 'defaultInitData' ){
					var lsInitData = $(this).data('LayerSlider').defaults;
					if( lsInitData ){
						return lsInitData;
					}

				}else{
					return this.each(function(i){

						// Control functions: prev, next, start, stop & change

						var lsData = $(this).data('LayerSlider');
						if( lsData ){
							if( !lsData.g.isAnimating && !lsData.g.isLoading ){
								if( typeof options == 'number' ){
									if( options > 0 && options < lsData.g.layersNum + 1 && options != lsData.g.curLayerIndex ){
										lsData.change(options);
									}
								}else{
									switch(options){
										case 'prev':
											lsData.o.cbPrev(lsData.g);
											lsData.prev('clicked');
											break;
										case 'next':
											lsData.o.cbNext(lsData.g);
											lsData.next('clicked');
											break;
										case 'start':
											if( !lsData.g.autoSlideshow ){
												lsData.o.cbStart(lsData.g);
												lsData.g.originalAutoSlideshow = true;
												lsData.start();
											}
											break;
									}
								}
							}
							// if( options === 'debug' ){
							// 	lsData.d.show();
							// }
							if( options === 'redraw' ){
								lsData.resize();
							}
							if( ( lsData.g.autoSlideshow || ( !lsData.g.autoSlideshow && lsData.g.originalAutoSlideshow ) ) && options == 'stop' ){
								lsData.o.cbStop(lsData.g);
								lsData.g.originalAutoSlideshow = false;
								lsData.g.curLayer.find('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="player.vimeo"]').each(function(){

									// Clearing videoTimeouts

									clearTimeout( $(this).data( 'videoTimer') );
								});

								lsData.stop();
							}
							if( options == 'forceStop'){
								lsData.forcestop();
							}
						}
					});
				}
			}
		}
	};

	// LayerSlider methods

	var layerSlider = function(el, options) {

		var ls = this;
		ls.$el = $(el).addClass('ls-container');
		ls.$el.data('LayerSlider', ls);

		ls.load = function(){

			// Setting options (user settings) and global (not modificable) parameters

			ls.defaults = layerSlider.options;
			ls.o = $.extend({},ls.defaults, options);
			ls.g = $.extend({},layerSlider.global);
			ls.lt = $.extend({},layerSlider.layerTransitions );
			ls.st = $.extend({},layerSlider.slideTransitions );

			ls.g.enableCSS3 = $(el).hasClass('ls-norotate') ? false : true;


			if (ls.o.fullPage) {
				// Disable pause on hover in case of FullPage slider
				ls.o.pauseOnHover = false;
				// Set overflow hidden in case of FullPage slider
				if (ls.o.thumbnailNavigation != 'always') {
					ls.$el.css('overflow', 'hidden');
				}
			}

			// NEW FEATURE v5.2.0 saving original HTML Markup

			ls.g.originalMarkup = $(el).html();

			if( ls.g.ie78 ){
				ls.o.lazyLoad = false;
			}

			// WP parameters

			if( ls.o.autoPauseSlideshow === 'enabled' ){
				ls.o.autoPauseSlideshow = true;
			}
			if( ls.o.autoPauseSlideshow === 'disabled' ){
				ls.o.autoPauseSlideshow = false;
			}

			// If layerslider.transitions.js is loaded...

			if( typeof layerSliderTransitions !== 'undefined' ){
				ls.t = $.extend({},layerSliderTransitions);
			}

			// If custom transitions are loaded...

			if( typeof layerSliderCustomTransitions !== 'undefined' ){
				ls.ct = $.extend({},layerSliderCustomTransitions);
			}

			// NEW IMPROVEMENT v3.6 forbid to call the init code more than once on the same element

			if( !ls.g.initialized ){

				ls.g.initialized = true;

				// Added debug mode v3.5

				// ls.debug();

				if( $('html').find('meta[content*="WordPress"]').length ){
					ls.g.wpVersion = $('html').find('meta[content*="WordPress"]').attr('content').split('WordPress')[1];
				}

				if( $('html').find('script[src*="layerslider"]').length ){
					if( $('html').find('script[src*="layerslider"]').attr('src').indexOf('?') != -1 ){
						ls.g.lswpVersion = $('html').find('script[src*="layerslider"]').attr('src').split('?')[1].split('=')[1];
					}
				}

				// NEW LOAD METHOD v3.5
				// FIXED v4.0 If the selected skin is already loaded, calling the ls.init() function immediately

				if( !ls.o.skin || ls.o.skin == '' || !ls.o.skinsPath || ls.o.skinsPath == '' ){

					// ls.d.aT('Loading without skin. Possibilities: mistyped skin and / or skinsPath.');

					ls.init();
				}else{

					// ls.d.aT('Trying to load with skin: '+ls.o.skin, true);
					// Applying skin

					$(el).addClass('ls-'+ls.o.skin);

					var skinStyle = ls.o.skinsPath;console

					var cssContainer = $('head');

					if( !$('head').length ){
						cssContainer = $('body');
					}

					if( $('link[href="'+skinStyle+'"]').length ){

						// ls.d.aU('Skin "'+ls.o.skin+'" is already loaded.');

						curSkin = $('link[href="'+skinStyle+'"]');

						if( !ls.g.loaded ){

							ls.g.loaded = true;

							// IMPROVEMENT v4.5.0 Added delay because of caching bugs

					ls.g.t1 = setTimeout(function(){
								ls.init();
							},150);
						}
					}
					// $(window).load(); function for older webkit ( < v536 ).

					$(window).load(function(){

						if( !ls.g.loaded ){

							// ls.d.aU('$(window).load(); fired');

							ls.g.loaded = true;

							// IMPROVEMENT v4.5.0 Added delay because of caching bugs

					ls.g.t3 = setTimeout(function(){
								ls.init();
							},150);
						}
					});

					// Fallback: if $(window).load();� not fired in 2 secs after $(document).ready(),
					// curSkin.load(); not fired at all or the name of the skin and / or the skinsPath
					// mistyped, we must call the init function manually.

					ls.g.t4 = setTimeout( function(){

						if( !ls.g.loaded ){

							// ls.d.aT('Fallback mode: Neither curSkin.load(); or $(window).load(); were fired');

							ls.g.loaded = true;
							ls.init();
						}
					}, 1000);
				}
			}
		};

		ls.init = function(){

			// NEW FEATURE v5.5.0 Appending the slider element into the element specified in appendTo

			$(el).prependTo( $( ls.o.appendTo ) );

			// IMPROVEMENT v4.0.1 Trying to add special ID to <body> or <html> (required to overwrite WordPresss global styles)

			if( !$('html').attr('id') ){
				$('html').attr('id','ls-global');
			}else if( !$('body').attr('id') ){
				$('body').attr('id','ls-global');
			}

			// NEW FEATURES v5.2.0 Hiding the slider on mobile devices, smaller resolutions
			// or changing it to a static but responsive image

			if( ls.g.isMobile() === true && ls.o.hideOnMobile === true ){
				$(el).addClass('ls-forcehide');
				$(el).closest('.ls-wp-fullwidth-container').addClass('ls-forcehide');
			}

			var showHide = function(){

				if( ls.o.hideOnMobile === true && ls.g.isMobile() === true ){
					$(el).addClass('ls-forcehide');
					$(el).closest('.ls-wp-fullwidth-container').addClass('ls-forcehide');
					ls.o.autoStart = false;
				}else{
					if( $(window).width() < ls.o.hideUnder || $(window).width() > ls.o.hideOver ){
						$(el).addClass('ls-forcehide');
						$(el).closest('.ls-wp-fullwidth-container').addClass('ls-forcehide');
					}else{
						$(el).removeClass('ls-forcehide');
						$(el).closest('.ls-wp-fullwidth-container').removeClass('ls-forcehide');
					}
				}
			};

			$(window).resize( function(){

				showHide();
			});

			showHide();

			// NEW FEATURE v1.7 making the slider responsive

			ls.g.sliderWidth = function(){
				return $(el).width();
			}

			ls.g.sliderHeight = function(){
				return $(el).height();
			}

			// Compatibility mode v5.0.0
			//	.ls-layer 	-> .ls-slide
			//	.ls-s 		-> .ls-l

			$(el).find('.ls-layer').removeClass('ls-layer').addClass('ls-slide');
			$(el).find('.ls-slide > *[class*="ls-s"]').each(function(){
				var oldDistanceNum = $(this).attr('class').split('ls-s')[1].split(' ')[0];
				$(this).removeClass('ls-s'+oldDistanceNum).addClass('ls-l'+oldDistanceNum);
			});


			if( ls.o.firstLayer ){
				ls.o.firstSlide = ls.o.firstLayer;
			}
			if( ls.o.animateFirstLayer === false ){
				ls.o.animateFirstSlide = false;
			}

			// REPLACED FEATURE v2.0 If there is only ONE layer, instead of duplicating it, turning off slideshow and loops, hiding all controls, etc.

			if( $(el).find('.ls-slide').length == 1 ){
				ls.o.autoStart = false;
				ls.o.navPrevNext = false;
				ls.o.navStartStop = false;
				ls.o.navButtons = false;
				ls.o.loops = 0;
				ls.o.forceLoopNum = false;
				ls.o.autoPauseSlideshow	= true;
				ls.o.firstSlide = 1;
				ls.o.thumbnailNavigation = 'disabled';
			}

			// IMPROVEMENT v5.2.0 the original width of a full width slider should be always 100% even if the user forgot to set that value
			// BUGFIX v5.3.0 An additional check required (with the original improvement full-width sliders with "normal" responsiveness couldn't be created)

			if( $(el).parent().hasClass('ls-wp-fullwidth-helper') && ls.o.responsiveUnder !== 0 ){
				$(el)[0].style.width = '100%';
			}

			// NEW FEATURE v3.0 added "normal" responsive mode with image and font resizing
			// NEW FEATURE v3.5 responsiveUnder

			if( ls.o.width ){
				ls.g.sliderOriginalWidthRU = ls.g.sliderOriginalWidth = '' + ls.o.width;
			}else{
				ls.g.sliderOriginalWidthRU = ls.g.sliderOriginalWidth = $(el)[0].style.width;
			}

			if( ls.o.height ){
				ls.g.sliderOriginalHeight = '' + ls.o.height;
			}else{
				ls.g.sliderOriginalHeight = $(el)[0].style.height;
			}

			if( ls.g.sliderOriginalWidth.indexOf('%') == -1 && ls.g.sliderOriginalWidth.indexOf('px') == -1 ){
				ls.g.sliderOriginalWidth += 'px';
			}

			if( ls.g.sliderOriginalHeight.indexOf('%') == -1 && ls.g.sliderOriginalHeight.indexOf('px') == -1 ){
				ls.g.sliderOriginalHeight += 'px';
			}

			if( ls.o.responsive && ls.g.sliderOriginalWidth.indexOf('px') != -1 && ls.g.sliderOriginalHeight.indexOf('px') != -1 ){
				ls.g.responsiveMode = true;
			}else{
				ls.g.responsiveMode = false;
			}

			// IMPROVEMENT v3.0 preventing WordPress to wrap your sublayers in <code> or <p> elements

			$(el).find('*[class*="ls-l"], *[class*="ls-bg"]').each(function(){
				if( !$(this).parent().hasClass('ls-slide') ){
					$(this).insertBefore( $(this).parent() );
				}
			});

			$(el).find('.ls-slide').each(function(){
				$(this).children(':not([class*="ls-"])').each(function(){
					$(this).remove();
				});

				var hd = $('<div>').addClass('ls-gpuhack');
				if( $(this).find('.ls-bg').length ){
					hd.insertAfter( $(this).find('.ls-bg').eq('0') );
				}else{
					hd.prependTo( $(this) );
				}
			});

			$(el).find('.ls-slide, *[class*="ls-l"]').each(function(){

				if( $(this).data('ls') || $(this).attr('rel') || $(this).attr('style') ){
					if( $(this).data('ls') ){
						var params = $(this).data('ls').toLowerCase().split(';');
					}else if( $(this).attr('rel') && $(this).attr('rel').indexOf(':') != -1 && $(this).attr('rel').indexOf(';') != -1 ){
						var params = $(this).attr('rel').toLowerCase().split(';');
					}else{
						var params = $(this).attr('style').toLowerCase().split(';');
					}
					for(x=0;x<params.length;x++){
						param = params[x].split(':');

						if( param[0].indexOf('easing') != -1 ){
							param[1] = ls.ieEasing( param[1] );
						}

						var p2 = '';
						if( param[2] ){
							p2 = ':'+$.trim(param[2]);
						}

						if( param[0] != ' ' && param[0] != '' ){
							$(this).data( $.trim(param[0]), $.trim(param[1]) + p2 );
						}
					}
				}

				this.style.visibility = 'hidden'; // blink fix for slower devices

				// NEW FEATURE v5.2.0 Starts the slider only if it is in the viewport

				if( ls.o.startInViewport === true && ls.o.autoStart === true ){

					ls.o.autoStart = false;
					ls.g.originalAutoStart = true;
				}

				// NEW FEATURE v1.7 and v3.0 making the slider responsive - we have to use style.left instead of jQuery's .css('left') function!

				var sl = $(this);

				sl.data( 'originalLeft', sl[0].style.left );
				sl.data( 'originalTop', sl[0].style.top );

				if( $(this).is('a') && $(this).children().length > 0 ){
					sl = $(this).children();
				}

				var _w = sl.width();
				var _h = sl.height();

				if( sl[0].style.width && sl[0].style.width.indexOf('%') != -1 ){
					_w = sl[0].style.width;
				}
				if( sl[0].style.height && sl[0].style.height.indexOf('%') != -1 ){
					_h = sl[0].style.height;
				}

				sl.data( 'originalWidth', _w );
				sl.data( 'originalHeight', _h );

				sl.data( 'originalPaddingLeft', sl.css('padding-left') );
				sl.data( 'originalPaddingRight', sl.css('padding-right') );
				sl.data( 'originalPaddingTop', sl.css('padding-top') );
				sl.data( 'originalPaddingBottom', sl.css('padding-bottom') );

				// iOS fade bug when GPU acceleration is enabled #1

				var _o = typeof parseFloat( sl.css('opacity') ) == 'number'  ? Math.round( parseFloat( sl.css('opacity') ) * 100 ) / 100  : 1;
				$(this).data( 'originalOpacity', _o );

				if( sl.css('border-left-width').indexOf('px') == -1 ){
					sl.data( 'originalBorderLeft', sl[0].style.borderLeftWidth );
				}else{
					sl.data( 'originalBorderLeft', sl.css('border-left-width') );
				}
				if( sl.css('border-right-width').indexOf('px') == -1 ){
					sl.data( 'originalBorderRight', sl[0].style.borderRightWidth );
				}else{
					sl.data( 'originalBorderRight', sl.css('border-right-width') );
				}
				if( sl.css('border-top-width').indexOf('px') == -1 ){
					sl.data( 'originalBorderTop', sl[0].style.borderTopWidth );
				}else{
					sl.data( 'originalBorderTop', sl.css('border-top-width') );
				}
				if( sl.css('border-bottom-width').indexOf('px') == -1 ){
					sl.data( 'originalBorderBottom', sl[0].style.borderBottomWidth );
				}else{
					sl.data( 'originalBorderBottom', sl.css('border-bottom-width') );
				}

				sl.data( 'originalFontSize', sl.css('font-size') );
				sl.data( 'originalLineHeight', sl.css('line-height') );
			});

			// CHANGED FEATURE v3.5 url- / deep linking layers

			if( document.location.hash ){
				for( var dl = 0; dl < $(el).find('.ls-slide').length; dl++ ){
					if( $(el).find('.ls-slide').eq(dl).data('deeplink') == document.location.hash.split('#')[1] ){
						ls.o.firstSlide = dl+1;
					}
				}
			}

			// NEW FEATURE v2.0 linkTo

			$(el).find('*[class*="ls-linkto-"]').each(function(){
				var lClasses = $(this).attr('class').split(' ');
				for( var ll=0; ll<lClasses.length; ll++ ){
					if( lClasses[ll].indexOf('ls-linkto-') != -1 ){
						var linkTo = parseInt( lClasses[ll].split('ls-linkto-')[1] );
						$(this).css({
							cursor: 'pointer'
						}).click(function(e){
							e.preventDefault();
							$(el).layerSlider( linkTo );
						});
					}
				}
			});

			// Setting variables

			ls.g.layersNum = $(el).find('.ls-slide').length;

			// NEW FEATURE v3.5 randomSlideshow

			if( ls.o.randomSlideshow && ls.g.layersNum > 2 ){
				ls.o.firstSlide == 'random';
				ls.o.twoWaySlideshow = false;
			}else{
				ls.o.randomSlideshow = false;
			}

			// NEW FEATURE v3.0 random firstSlide

			if( ls.o.firstSlide == 'random' ){
				ls.o.firstSlide = Math.floor(Math.random() * ls.g.layersNum+1);
			}

			ls.o.fisrtSlide = ls.o.fisrtSlide < ls.g.layersNum + 1 ? ls.o.fisrtSlide : 1;
			ls.o.fisrtSlide = ls.o.fisrtSlide < 1 ? 1 : ls.o.fisrtSlide;

			// NEW FEATURE v2.0 loops

			ls.g.nextLoop = 1;

			if( ls.o.animateFirstSlide ){
				ls.g.nextLoop = 0;
			}

			// NEW FEATURE v2.0 videoPreview

			ls.media.youtube.init();
			ls.media.vimeo.init();
			ls.media.html5.init();

			// NEW FEATURE v1.7 animating first layer

			if( ls.o.animateFirstSlide ){
				ls.o.firstSlide = ls.o.firstSlide - 1 === 0 ? ls.g.layersNum : ls.o.firstSlide-1;
			}

			ls.g.curLayerIndex = ls.o.firstSlide;
			ls.g.curLayer = $(el).find('.ls-slide:eq('+(ls.g.curLayerIndex-1)+')');

			// Moving all layers to .ls-inner container

			$(el).find('.ls-slide').wrapAll('<div class="ls-inner"></div>');
			ls.g.i = $(el).find('.ls-inner');

			// Creating HTML markup for layer transitions

			ls.g.ltContainer = $('<div>').addClass('ls-lt-container').addClass('ls-overflow-hidden').css({
				width : ls.g.i.width(),
				height : ls.g.i.height()
			}).prependTo( ls.g.i );

			// NEW FEATURE v4.5.0 Timers

			if( ls.o.showBarTimer ){
				ls.g.barTimer = $('<div>').addClass('ls-bar-timer').appendTo( ls.g.i );
			}

			if( ls.o.showCircleTimer && !ls.g.ie78 ){
				ls.g.circleTimer = $('<div>').addClass('ls-circle-timer').appendTo( ls.g.i );
				ls.g.circleTimer.append( $('<div class="ls-ct-left"><div class="ls-ct-rotate"><div class="ls-ct-hider"><div class="ls-ct-half"></div></div></div></div><div class="ls-ct-right"><div class="ls-ct-rotate"><div class="ls-ct-hider"><div class="ls-ct-half"></div></div></div></div><div class="ls-ct-center"></div>') );
			}

			// NEW FEATURE v4.0 Adding loading indicator into the element

			ls.g.li = $('<div>').css({
				zIndex: -1,
				display: 'none'
			}).addClass('ls-loading-container').appendTo( $(el) );

			$('<div>').addClass('ls-loading-indicator').appendTo( ls.g.li );

			// Adding styles

			if( $(el).css('position') == 'static' ){
				$(el).css('position','relative');
			}

			// IMPROVEMENT & BUGFIX v4.6.0 Fixed transparent global background issue under IE7 & IE8

			if( ls.o.globalBGImage ){
				ls.g.i.css({
					backgroundImage : 'url("'+ls.o.globalBGImage+'")',
					backgroundPosition : ls.o.globalBGPosition,
					backgroundSize : ls.o.globalBGSize,
					backgroundRepeat : ls.o.globalBGRepeat,
					backgroundAttachment : ls.o.globalBGBehaviour
				});
			}
			ls.g.i.css({
				backgroundColor : ls.o.globalBGColor
			});

			if( ls.o.globalBGColor == 'transparent' && ls.o.globalBGImage == false ){
				ls.g.i.css({
					background : 'none transparent !important'
				});
			}

			// NEW FEATURES v5.0.0 Lazy-load & remove unnecessary width & height attributes from images

			$(el).find('.ls-slide img').each(function(){

				$(this).removeAttr('width').removeAttr('height');

				if( ls.o.imgPreload === true && ls.o.lazyLoad === true ){

					if( typeof $(this).data('src') !== 'string' ){

						$(this).data('src', $(this).attr('src') );
						var src = ls.o.skinsPath+'../css/blank.gif';
						$(this).attr('src',src);
					}
				}else{
					if( typeof $(this).data('src') === 'string' ){

						$(this).attr('src',$(this).data('src'));
						$(this).removeAttr('data-src');
					}
				}

			});

			// NEW FEATURE v5.0.0 Parallax layers by mousemove
			if (ls.o.parallaxType != 'scroll') {
				var parallaxLayers = $([]);

				$(el).find('*:not(.ls-bg)').each(function(){

					if( typeof $(this).data('parallaxlevel') !== 'undefined' && parseInt( $(this).data('parallaxlevel') ) !== 0 ){

						parallaxLayers = parallaxLayers.add( $(this) );
					}
				});

				ls.g.i.on('mouseenter',function(e){

					ls.g.parallaxStartX = e.pageX - $(this).parent().offset().left;
					ls.g.parallaxStartY = e.pageY - $(this).parent().offset().top;
				});

				ls.g.i.on('mousemove',function(e){

					var mX0 = $(this).parent().offset().left + ls.g.parallaxStartX;
					var mY0 = $(this).parent().offset().top + ls.g.parallaxStartY;

					var mX = e.pageX - mX0;
					var mY = e.pageY - mY0;

					parallaxLayers.each(function(){

						$(this).css({
							marginLeft : -mX / 100 * parseInt( $(this).data('parallaxlevel') ),
							marginTop : -mY / 100 * parseInt( $(this).data('parallaxlevel') )
						});
					});
				});

				ls.g.i.on('mouseleave',function(){

					parallaxLayers.each(function(){

						TweenLite.to( this, .4, {
							css:{
								marginLeft : 0,
								marginTop : 0
							}
						});
					});
				});
			}

			// Creating navigation

			if( ls.o.navPrevNext ){

				$('<a class="ls-nav-prev" href="#" />').click(function(e){
					e.preventDefault();
					$(el).layerSlider('prev');
				}).appendTo($(el));

				$('<a class="ls-nav-next" href="#" />').click(function(e){
					e.preventDefault();
					$(el).layerSlider('next');
				}).appendTo($(el));

				if( ls.o.hoverPrevNext ){
					$(el).find('.ls-nav-prev, .ls-nav-next').css({
						display: 'none'
					});

					$(el).hover(
						function(){
 							if( !ls.g.forceHideControls ){
								if( ls.g.ie78 ){
									$(el).find('.ls-nav-prev, .ls-nav-next').css('display','block');
								}else{
									$(el).find('.ls-nav-prev, .ls-nav-next').stop(true,true).fadeIn(300);
								}
							}
						},
						function(){
							if( ls.g.ie78 ){
								$(el).find('.ls-nav-prev, .ls-nav-next').css('display','none');
							}else{
								$(el).find('.ls-nav-prev, .ls-nav-next').stop(true,true).fadeOut(300);
							}
						}
					);
				}
			}

			// Creating bottom navigation

			if( ls.o.navStartStop || ls.o.navButtons ){

				var bottomNav = $('<div class="ls-bottom-nav-wrapper" />').appendTo( $(el) );

				ls.g.bottomWrapper = bottomNav;

				if( ls.o.thumbnailNavigation == 'always' ){
					bottomNav.addClass('ls-above-thumbnails');
				}

				if( ls.o.navButtons && ls.o.thumbnailNavigation != 'always' ){

					$('<span class="ls-bottom-slidebuttons" />').appendTo( $(el).find('.ls-bottom-nav-wrapper') );

					// NEW FEATURE v3.5 thumbnailNavigation ('hover')

					if( ls.o.thumbnailNavigation == 'hover' ){

						var thumbs = $('<div class="ls-thumbnail-hover"><div class="ls-thumbnail-hover-inner"><div class="ls-thumbnail-hover-bg"></div><div class="ls-thumbnail-hover-img"><img></div><span></span></div></div>').appendTo( $(el).find('.ls-bottom-slidebuttons') );
					}

					for(x=1;x<ls.g.layersNum+1;x++){

						var btn = $('<a href="#" />').appendTo( $(el).find('.ls-bottom-slidebuttons') ).click(function(e){
							e.preventDefault();
							$(el).layerSlider( ($(this).index() + 1) );
						});

						// NEW FEATURE v3.5 thumbnailNavigation ('hover')

						if( ls.o.thumbnailNavigation == 'hover' ){

							$(el).find('.ls-thumbnail-hover, .ls-thumbnail-hover-img').css({
								width : ls.o.tnWidth,
								height : ls.o.tnHeight
							});

							var th = $(el).find('.ls-thumbnail-hover');

							var ti = th.find('img').css({
								height : ls.o.tnHeight
							});

							var thi = $(el).find('.ls-thumbnail-hover-inner').css({
								visibility : 'hidden',
								display: 'block'
							});

							btn.hover(
								function(){

									var hoverLayer = $(el).find('.ls-slide').eq( $(this).index() );
									var tnSrc;

									if( ls.o.imgPreload === true && ls.o.lazyLoad === true ){

										if( hoverLayer.find('.ls-tn').length ){
											tnSrc = hoverLayer.find('.ls-tn').data('src');
										}else if( hoverLayer.find('.ls-videopreview').length ){
											tnSrc = hoverLayer.find('.ls-videopreview').attr('src');
										}else if( hoverLayer.find('.ls-bg').length ){
											tnSrc = hoverLayer.find('.ls-bg').data('src');
										}else{
											tnSrc = ls.o.skinsPath+ls.o.skin+'/nothumb.png';
										}
									}else{

										if( hoverLayer.find('.ls-tn').length ){
											tnSrc = hoverLayer.find('.ls-tn').attr('src');
										}else if( hoverLayer.find('.ls-videopreview').length ){
											tnSrc = hoverLayer.find('.ls-videopreview').attr('src');
										}else if( hoverLayer.find('.ls-bg').length ){
											tnSrc = hoverLayer.find('.ls-bg').attr('src');
										}else{
											tnSrc = ls.o.skinsPath+ls.o.skin+'/nothumb.png';
										}
									}

									$(el).find('.ls-thumbnail-hover-img').css({
										left: parseInt( th.css('padding-left') ),
										top: parseInt( th.css('padding-top') )
									});

									ti.load(function(){

										if( $(this).width() == 0 ){
											ti.css({
												position: 'relative',
												margin: '0 auto',
												left: 'auto'
											});
										}else{
											ti.css({
												position: 'absolute',
												marginLeft : - $(this).width() / 2,
												left: '50%'
											});
										}
									}).attr( 'src', tnSrc );

									th.css({
										display: 'block'
									}).stop().animate({
										left: $(this).position().left + ( $(this).width() - th.outerWidth() ) / 2
									}, 250 );

									thi.css({
										display : 'none',
										visibility : 'visible'
									}).stop().fadeIn(250);
								},
								function(){
									thi.stop().fadeOut(250, function(){
										th.css({
											visibility : 'hidden',
											display: 'block'
										});
									});
								}
							);
						}
					}

					if( ls.o.thumbnailNavigation == 'hover' ){

						thumbs.appendTo( $(el).find('.ls-bottom-slidebuttons') );
					}

				}

				if( ls.o.navStartStop ){

					var buttonStart = $('<a class="ls-nav-start" href="#" />').click(function(e){
						e.preventDefault();
						$(el).layerSlider('start');
					}).prependTo( $(el).find('.ls-bottom-nav-wrapper') );

					var buttonStop = $('<a class="ls-nav-stop" href="#" />').click(function(e){
						e.preventDefault();
						$(el).layerSlider('stop');
					}).appendTo( $(el).find('.ls-bottom-nav-wrapper') );

				}else if( ls.o.thumbnailNavigation != 'always' ){

					$('<span class="ls-nav-sides ls-nav-sideleft" />').prependTo( $(el).find('.ls-bottom-nav-wrapper') );
					$('<span class="ls-nav-sides ls-nav-sideright" />').appendTo( $(el).find('.ls-bottom-nav-wrapper') );
				}

				if( ls.o.hoverBottomNav && ls.o.thumbnailNavigation != 'always' ){

					bottomNav.css({
						display: 'none'
					});

					$(el).hover(
						function(){
							if( !ls.g.forceHideControls ){
								if( ls.g.ie78 ){
									bottomNav.css('display','block');
								}else{
									bottomNav.stop(true,true).fadeIn(300);
								}
							}
						},
						function(){
							if( ls.g.ie78 ){
								bottomNav.css('display','none');
							}else{
								bottomNav.stop(true,true).fadeOut(300);
							}
						}
					)
				}
			}

			// NEW FEATURE v3x.5 thumbnailNavigation ('always')

			if( ls.o.thumbnailNavigation == 'always' ){

				ls.g.thumbsWrapper = $('<div class="ls-thumbnail-wrapper"></div>').appendTo( $(el) );
				var thumbs = $('<div class="ls-thumbnail"><div class="ls-thumbnail-inner"><div class="ls-thumbnail-slide-container"><div class="ls-thumbnail-slide"></div></div></div></div>').appendTo( ls.g.thumbsWrapper );

				ls.g.thumbnails = $(el).find('.ls-thumbnail-slide-container');

				if( !('ontouchstart' in window) ){
					ls.g.thumbnails.hover(
						function(){
							$(this).addClass('ls-thumbnail-slide-hover');
						},
						function(){
							$(this).removeClass('ls-thumbnail-slide-hover');
							ls.scrollThumb();
						}
					).mousemove(function(e){

						var mL = parseInt(e.pageX - $(this).offset().left ) / $(this).width() * ( $(this).width() - $(this).find('.ls-thumbnail-slide').width() );
						$(this).find('.ls-thumbnail-slide').stop().css({
							marginLeft : mL
						});
					});
				}else{
					ls.g.thumbnails.addClass('ls-touchscroll');
				}

				$(el).find('.ls-slide').each(function(){

					var tempIndex = $(this).index();
					var tnSrc;

					if( ls.o.imgPreload === true && ls.o.lazyLoad === true ){

						if( $(this).find('.ls-tn').length ){
							tnSrc = $(this).find('.ls-tn').data('src');
						}else if( $(this).find('.ls-videopreview').length ){
							tnSrc = $(this).find('.ls-videopreview').attr('src');
						}else if( $(this).find('.ls-bg').length ){
							tnSrc = $(this).find('.ls-bg').data('src');
						}else{
							tnSrc = ls.o.skinsPath+ls.o.skin+'/nothumb.png';
						}
					}else{

						if( $(this).find('.ls-tn').length ){
							tnSrc = $(this).find('.ls-tn').attr('src');
						}else if( $(this).find('.ls-videopreview').length ){
							tnSrc = $(this).find('.ls-videopreview').attr('src');
						}else if( $(this).find('.ls-bg').length ){
							tnSrc = $(this).find('.ls-bg').attr('src');
						}else{
							tnSrc = ls.o.skinsPath+ls.o.skin+'/nothumb.png';
						}
					}

					var thumb = $('<a href="#" class="ls-thumb-' + tempIndex + '"><img src="'+tnSrc+'"></a>');
					thumb.appendTo( $(el).find('.ls-thumbnail-slide') );

					if( !('ontouchstart' in window) ){

						thumb.hover(
							function(){
								$(this).children().stop().fadeTo(300,ls.o.tnActiveOpacity/100);
							},
							function(){
								if( !$(this).children().hasClass('ls-thumb-active') ){
									$(this).children().stop().fadeTo(300,ls.o.tnInactiveOpacity/100);
								}
							}
						);
					}

					thumb.click(function(e){
						e.preventDefault();
						$(el).layerSlider( tempIndex );
					});
				});

				if( buttonStart && buttonStop ){
					var lsBottomBelowTN = ls.g.bottomWrapper = $('<div class="ls-bottom-nav-wrapper ls-below-thumbnails"></div>').appendTo( $(el) );
					buttonStart.clone().click(function(e){
						e.preventDefault();
						$(el).layerSlider('start');
					}).appendTo( lsBottomBelowTN );
					buttonStop.clone().click(function(e){
						e.preventDefault();
						$(el).layerSlider('stop');
					}).appendTo( lsBottomBelowTN );
				}

				if( ls.o.hoverBottomNav ){

					ls.g.thumbsWrapper.css('display','none');

					if( lsBottomBelowTN ){
						ls.g.bottomWrapper = lsBottomBelowTN.css('display') == 'block' ? lsBottomBelowTN : $(el).find('.ls-above-thumbnails');
						ls.g.bottomWrapper.css('display','none');
					}

					// BUGFIXES v4.1.3 Added checking of the bottomWrapper variable

					$(el).hover(
						function(){
							$(el).addClass('ls-hover');
							if( !ls.g.forceHideControls ){
								if( ls.g.ie78 ){
									ls.g.thumbsWrapper.css('display','block');
									if( ls.g.bottomWrapper ){
										ls.g.bottomWrapper.css('display','block');
									}
								}else{
									ls.g.thumbsWrapper.stop(true,true).fadeIn(300);
									if( ls.g.bottomWrapper ){
										ls.g.bottomWrapper.stop(true,true).fadeIn(300);
									}
								}
							}
						},
						function(){
							$(el).removeClass('ls-hover');
							if( ls.g.ie78 ){
								ls.g.thumbsWrapper.css('display','none');
								if( ls.g.bottomWrapper ){
									ls.g.bottomWrapper.css('display','none');
								}
							}else{
								ls.g.thumbsWrapper.stop(true,true).fadeOut(300);
								if( ls.g.bottomWrapper ){
									ls.g.bottomWrapper.stop(true,true).fadeOut(300);
								}
							}
						}
					)
				}
			}

			// Adding shadow wrapper

			ls.g.shadow = $('<div class="ls-shadow"></div>').appendTo( $(el) );
			if( ls.g.shadow.css('display') == 'block' && !ls.g.shadow.find('img').length ){
				ls.g.showShadow = function(){
					ls.g.shadow.css({
						display: 'none',
						visibility: 'visible'
					}).fadeIn( 500, function(){
						ls.g.showShadow = false;
					});
				}
				ls.g.shadowImg = $('<img>').attr('src',ls.o.skinsPath+ls.o.skin+'/shadow.png').appendTo( ls.g.shadow );
				ls.g.shadowBtmMod = typeof parseInt( $(el).css('padding-bottom') ) == 'number' ? parseInt( $(el).css('padding-bottom') ) : 0;
			}
			ls.resizeShadow();

			// Adding keyboard navigation if turned on and if number of layers > 1

			if( ls.o.keybNav && $(el).find('.ls-slide').length > 1 ){

				$('body').bind('keydown',function(e){
					if( !ls.g.isAnimating && !ls.g.isLoading ){
						if( e.which == 37 ){
							ls.o.cbPrev(ls.g);
							ls.prev('clicked');
						}else if( e.which == 39 ){
							ls.o.cbNext(ls.g);
							ls.next('clicked');
						}
					}
				});
			}

			// Adding touch-control navigation if number of layers > 1

			if('ontouchstart' in window && $(el).find('.ls-slide').length > 1 && ls.o.touchNav ){

			   ls.g.i.bind('touchstart', function( e ) {
					var t = e.touches ? e.touches : e.originalEvent.touches;
					if( t.length == 1 ){
						ls.g.touchStartX = ls.g.touchEndX = t[0].clientX;
					}
			    });

			   ls.g.i.bind('touchmove', function( e ) {
					var t = e.touches ? e.touches : e.originalEvent.touches;
					if( t.length == 1 ){
						ls.g.touchEndX = t[0].clientX;
					}
					if( Math.abs( ls.g.touchStartX - ls.g.touchEndX ) > 45 ){
						e.preventDefault();
					}
			    });

				ls.g.i.bind('touchend',function( e ){
					if( Math.abs( ls.g.touchStartX - ls.g.touchEndX ) > 45 ){
						if( ls.g.touchStartX - ls.g.touchEndX > 0 ){
							ls.o.cbNext(ls.g);
							$(el).layerSlider('next');
						}else{
							ls.o.cbPrev(ls.g);
							$(el).layerSlider('prev');
						}
					}
				});
			}

			// Feature: pauseOnHover (if number of layers > 1)

			if( ls.o.pauseOnHover == true && $(el).find('.ls-slide').length > 1 ){

				// BUGFIX v1.6 stop was not working because of pause on hover

				ls.g.i.hover(
					function(){

						// Calling cbPause callback function

						ls.o.cbPause(ls.g);
						if( ls.g.autoSlideshow ){
							ls.g.paused = true;
							ls.stop();

							// Stopping the animation of Timers

							if( ls.g.barTimer ){
								ls.g.barTimer.stop();
							}

							if( ls.g.circleTimer ){
								if( ls.g.cttl ){
									ls.g.cttl.pause();
								}
							}
							ls.g.pausedSlideTime = new Date().getTime();
						}
					},
					function(){
						if( ls.g.paused == true ){
							ls.start();
							ls.g.paused = false;
						}
					}
				);
			}

			ls.resizeSlider();

			// NEW FEATURE v1.7 added yourLogo

			if( ls.o.yourLogo ){
				ls.g.yourLogo = $('<img>').addClass('ls-yourlogo').appendTo($(el)).attr('style', ls.o.yourLogoStyle ).css({
					visibility: 'hidden',
					display: 'bock'
				}).load(function(){

					// NEW FEATURE v3.0 added responsive yourLogo

					var logoTimeout = 0;

					if( !ls.g.yourLogo ){
						logoTimeout = 1000;
					}

					setTimeout( function(){

						ls.g.yourLogo.data( 'originalWidth', ls.g.yourLogo.width() );
						ls.g.yourLogo.data( 'originalHeight', ls.g.yourLogo.height() );
						if( ls.g.yourLogo.css('left') != 'auto' ){
							ls.g.yourLogo.data( 'originalLeft', ls.g.yourLogo[0].style.left );
						}
						if( ls.g.yourLogo.css('right') != 'auto' ){
							ls.g.yourLogo.data( 'originalRight', ls.g.yourLogo[0].style.right );
						}
						if( ls.g.yourLogo.css('top') != 'auto' ){
							ls.g.yourLogo.data( 'originalTop', ls.g.yourLogo[0].style.top );
						}
						if( ls.g.yourLogo.css('bottom') != 'auto' ){
							ls.g.yourLogo.data( 'originalBottom', ls.g.yourLogo[0].style.bottom );
						}

						// NEW FEATURES v1.8 added yourLogoLink & yourLogoTarget

						if( ls.o.yourLogoLink != false ){
							$('<a>').appendTo($(el)).attr( 'href', ls.o.yourLogoLink ).attr('target', ls.o.yourLogoTarget ).css({
								textDecoration : 'none',
								outline : 'none'
							}).append( ls.g.yourLogo );
						}

						ls.g.yourLogo.css({
							display: 'none',
							visibility: 'visible'
						});

						ls.resizeYourLogo();

					}, logoTimeout );

				}).attr( 'src', ls.o.yourLogo );
			}

			// NEW FEATURE v1.7 added window resize function for make responsive layout better

			ls.resize.width = $(window).width();
			ls.resize.height = $(window).height();

			$(window).resize(function(){
				ls.resize();
			});

			// NEW FEATURE v5.x scroll parallax effect
			if (ls.o.parallaxType == 'scroll' || ls.o.slideParallax > 0) {
				$(window).on('scroll.ls resize.ls', ls.onscroll);

				if (ls.o.slideParallax > 0) {
					ls.g.i.css('overflow', 'hidden');
				}
			}

			// BUGFIX v5.3.0 Responsiveness not worked in some cases while changed orientation on mobile devices

			$(window).on('orientationchange',function(){

				$(window).resize();
			});

			ls.g.showSlider = true;

			// NEW FEATURE v1.7 animating first slide

			if( ls.o.animateFirstSlide == true ){
				if( ls.o.autoStart ){
					ls.g.autoSlideshow = true;
					$(el).find('.ls-nav-start').addClass('ls-nav-start-active');
				}else{
					$(el).find('.ls-nav-stop').addClass('ls-nav-stop-active');
				}
				ls.next();
			}else if( typeof ls.g.curLayer[0] !== 'undefined' ){
				ls.imgPreload(ls.g.curLayer,function(){
					ls.g.curLayer.fadeIn(ls.o.sliderFadeInDuration, function(){

						ls.g.isLoading = false;

						$(this).addClass('ls-active');

						// NEW FEATURE v2.0 autoPlayVideos

						if( ls.o.autoPlayVideos ){
							$(this).delay( $(this).data('delayin') + 25 ).queue(function(){

								// YouTube & Vimeo videos

								$(this).find('.ls-videopreview').click();

								// HTML5 videos

								$(this).find('video, audio').each(function(){
									if( typeof $(this)[0].currentTime !== 0){
										$(this)[0].currentTime = 0;
									}
									$(this).click();
								});

								$(this).dequeue();
							});
						}

						// NEW FEATURE v3.0 showUntil sublayers

						ls.g.curLayer.find(' > *[class*="ls-l"]').each(function(){

							// Setting showUntilTimers

							var cursub = $(this);

							// IMPROVEMENT v5.2.0 video layers with auto play will skip showuntil feature

							if( ( !cursub.hasClass('ls-video-layer') || ( cursub.hasClass('ls-video-layer') && ls.o.autoPlayVideos === false ) ) && cursub.data('showuntil') > 0 ){

								// IMPROVEMENT v4.5.0 sublayerShowUntil will be called anly if necessary

								cursub.data('showUntilTimer', setTimeout(function(){
									ls.sublayerShowUntil( cursub );
								}, cursub.data('showuntil') ));
							}
						});
					});

					ls.changeThumb(ls.g.curLayerIndex)

					// If autoStart is true

					if( ls.o.autoStart ){
						ls.g.isLoading = false;
						ls.start();
					}else{
						$(el).find('.ls-nav-stop').addClass('ls-nav-stop-active');
					}
				});
			}

			// NEW FEATURE: HOVER SUBLAYER

			function initHover(node) {
				// init hover transition
				var $node = $(node);
				var data = $node.data();
				var duration = data.durationhover == '' || !('durationhover' in data) ? 0.5 : parseInt(data.durationhover) / 1000 || 0.01;
				var ease = data.easinghover || 'easeOutQuint';
				var originalOpacity = data.originalOpacity || 1;
				var lml = parseInt(data.offsetxhover || 0);
				var lmt = parseInt(data.offsetyhover || 0);

				var transition = {
					paused: true,
					ease: gsConvertEase(ease),
					css: {
						opacity: parseFloat('opacityhover' in data ? data.opacityhover : originalOpacity),
						transformOrigin: data.transformoriginhover,
						x: lml * ls.g.ratio,
						y: lmt * ls.g.ratio,
						rotation: parseInt(data.rotatehover || 0),
						rotationX: parseInt(data.rotatexhover || 0),
						rotationY: parseInt(data.rotateyhover || 0),
						skewX: parseInt(data.skewxhover || 0),
						skewY: parseInt(data.skewyhover || 0),
						scaleX: parseFloat('scalexhover' in data ? data.scalexhover : 1),
						scaleY: parseFloat('scaleyhover' in data ? data.scaleyhover : 1)
					},
					data: {x: lml, y: lmt}
				};
				transition.reverseEase = gsConvertEase(data.easingreverse || ease);
				transition.reverseDuration = data.durationreverse == '' || !('durationreverse' in data) ? duration : parseInt(data.durationreverse) / 1000 || 0.01;

				data.inithover = {
					opacity: originalOpacity,
					x: 0,
					y: 0,
					rotation: 0,
					rotationX: 0,
					rotationY: 0,
					skewX: 0,
					skewY: 0,
					scaleX: 1,
					scaleY: 1
				};

				if (data.backgroundhover) {
					data.inithover.backgroundColor = $node.css('backgroundColor');
					transition.css.backgroundColor = data.backgroundhover;
				}
				if (data.colorhover) {
					data.inithover.color = $node.css('color');
					transition.css.color = data.colorhover;
				}
				if (data.borderradiushover) {
					data.inithover.borderRadius =
						$node.css('border-top-left-radius')+' '+$node.css('border-top-right-radius')+' '+
						$node.css('border-bottom-right-radius')+' '+$node.css('border-bottom-left-radius');
					transition.css.borderRadius = data.borderradiushover;
					transition.css.overflow = 'hidden';
				}
				data.hover = TweenLite.to(node, duration, transition);
			}

			$(el).on('mouseenter.ls', '.ls-mover', function(e) {
				var data = $(this).data();
				if (data.status == 'in') {
					// handle mouseenter during transitionIn
					data.tr.vars.triggerHover = function() {
						initHover(data.tr.target);
						data.hover.play();
					};
				} else {	// handle mouseenter after transitionIn
					if (!data.hover) initHover(this);
					if (data.hout && !data.hout.paused()) {
						var pr = data.hout.pause().progress();
						var duration = data.hover.duration() - data.hout.duration() * data.hout.ratio;
						data.hout.kill();
					} else {
						var pr = data.hover.pause().progress();
						var duration = data.hover.duration() * (1 - data.hover.ratio);
					}
					if (pr > 0) { // transition not finished
						data.hin = TweenLite.to(this, duration, {
							ease: data.hover.vars.ease,
							css: data.hover.vars.css,
						});
					} else {	// transition already finished
						data.hover.progress(0);
						data.hover.timeScale(1);
						data.hover._ease = data.hover.vars.ease;
						data.hover._easePower = data.hover._ease._power;
						data.hover._easeType = data.hover._ease._type;
						data.hover.play();
					}
				}
			}).on('mouseleave.ls', '.ls-mover', function() {
				var data = $(this).data();
				if (data.status == 'in') {
					// handle mouseleave during transitionIn
					clearTimeout(data.timeouthover);
				} else {	// handle mouseleave after transitionIn
					if (data.hin && !data.hin.paused()) {
						var pr = data.hin.pause().progress();
						var duration = data.hin.duration() * data.hin.ratio + data.hover.duration() - data.hin.duration();
						data.hin.kill();
					} else {
						var pr = data.hover.pause().progress();
						var duration = data.hover.duration() * data.hover.ratio;
					}
					if (pr < 1) { // transition not finished
						data.hover.pause();
						var hout = {
							overwrite: 0,
							paused: true,
							ease: data.hover.vars.reverseEase,
							css: data.inithover
						};
						data.hout = TweenLite.from(this, duration, hout);
						data.hout.progress(1);
						data.hout.reverse();
					} else {	// transition already finished
						data.hover.progress(1);
						data.hover._ease = data.hover.vars.reverseEase;
						data.hover._easePower = data.hover._ease._power;
						data.hover._easeType = data.hover._ease._type;
						data.hover.timeScale(data.hover.duration() / data.hover.vars.reverseDuration);
						data.hover.reverse();
					}
				}
			});

			// NEW FEATURE v1.7 added cbInit function

			ls.o.cbInit($(el));
		};

		ls.resize = function(){
				// BUGFIX: don't resize slider when width and height didn't change (iPhone/iPad/iPod scroll fix)
				var width = $(window).width(), height = $(window).height();
				if (ls.resize.width == width && ls.resize.height == height) return;
				ls.resize.width = width, ls.resize.height = height;

				ls.g.resize = true;

				if( !ls.g.isAnimating ){

					ls.makeResponsive( ls.g.curLayer, function(){
						if( ls.g.ltContainer ){
							ls.g.ltContainer.empty();
						}
						ls.g.resize = false;
					});
					if( ls.g.yourLogo ){
						ls.resizeYourLogo();
					}
				}
		};

		ls.onscroll = function(event) {

			var isEnabled = !ls.g.isMobile() || ls.o.parallaxScrollOnMobile;
			var scrollDur = event ? ls.o.parallaxScrollDuration / 1000 : 0;
			var scrollTop = $(window).scrollTop();
			var offsetTop = ls.g.i.offset().top;
			ls.g.scrollTop = scrollTop > offsetTop ? scrollTop - offsetTop : 0;
			ls.g.slideTop = ls.g.scrollTop * ls.o.slideParallax / 10;

			var nextBg = ls.g.nextLayer[0].children[0];
			if (isEnabled && $(nextBg).hasClass('ls-bg')) {
				TweenLite.to(nextBg, scrollDur, { y: ls.g.slideTop });
			}
			if (isEnabled && ls.g.ltContainer) {
				TweenLite.to(ls.g.ltContainer[0], scrollDur, { y: ls.g.slideTop });
			}
			if (isEnabled && ls.o.parallaxType == 'scroll') {
				if (ls.o.parallaxOrigin == 'center')
					ls.g.scrollY = ($(window).height() - ls.g.sliderHeight()) / 2 + scrollTop - offsetTop;
				else if (ls.o.parallaxOrigin == 'bottom')
					ls.g.scrollY = ($(window).height() - ls.g.sliderHeight()) + scrollTop - offsetTop;
				else // top (default)
					ls.g.scrollY = ls.g.scrollTop;

				ls.g.nextLayer.find('[data-ls*=parallaxlevel]').each(function() {
					TweenLite.to(this, scrollDur, { marginTop: ls.g.scrollY * $(this).data('parallaxlevel') / 10 });
				});
			}
		};

		ls.start = function(){

			if( ls.g.autoSlideshow ){
				if( ls.g.prevNext == 'prev' && ls.o.twoWaySlideshow ){
					ls.prev();
				}else{
					ls.next();
				}
			}else{
				ls.g.autoSlideshow = true;
				if( !ls.g.isAnimating && !ls.g.isLoading ){
					ls.timer();
				}
			}

			$(el).find('.ls-nav-start').addClass('ls-nav-start-active');
			$(el).find('.ls-nav-stop').removeClass('ls-nav-stop-active');
		};

		ls.timer = function(){

			if( $(el).find('.ls-active').data('ls') ){
				var sD = ls.st.slideDelay;
			}else{
				var sD = ls.o.slideDelay;
			}

			var delaytime = $(el).find('.ls-active').data('slidedelay') ? parseInt( $(el).find('.ls-active').data('slidedelay') ) : sD;

			// BUGFIX v3.0 delaytime did not work on first layer if animateFirstSlide was set to off
			// BUGFIX v3.5 delaytime did not work on all layers in standalone version after bugfix 3.0 :)

			if( !ls.o.animateFirstSlide && !$(el).find('.ls-active').data('slidedelay') ){
				var tempD = $(el).find('.ls-slide:eq('+(ls.o.firstSlide-1)+')').data('slidedelay');
				delaytime = tempD ? tempD : sD;
			}

			clearTimeout( ls.g.slideTimer );

			// NEW FEATURE v4.5.0 Timers

			if( ls.g.pausedSlideTime ){
				if( !ls.g.startSlideTime ){
					ls.g.startSlideTime = new Date().getTime();
				}
				if( ls.g.startSlideTime > ls.g.pausedSlideTime ){
					ls.g.pausedSlideTime =  new Date().getTime();
				}
				if(! ls.g.curSlideTime ){
					ls.g.curSlideTime = delaytime;
				}
				ls.g.curSlideTime -= (ls.g.pausedSlideTime - ls.g.startSlideTime);
				ls.g.pausedSlideTime = false;
				ls.g.startSlideTime = new Date().getTime();
			}else{
				ls.g.curSlideTime = delaytime;
				ls.g.startSlideTime = new Date().getTime();
			}

			// BUGFIX v4.6.0 fixed Bar Timer animation on the fisrt slide if animateFirstSlide is false

			ls.g.curSlideTime = parseInt( ls.g.curSlideTime );

			ls.g.slideTimer = setTimeout(function(){
				ls.g.startSlideTime = ls.g.pausedSlideTime = ls.g.curSlideTime = false;
				ls.start();
			}, ls.g.curSlideTime );

			// Animating Timers

			if( ls.g.barTimer ){
				ls.g.barTimer.animate({
					width : ls.g.sliderWidth()
				}, ls.g.curSlideTime, 'linear', function(){
					$(this).css({
						width: 0
					});
				});
			}

			if( ls.g.circleTimer ){

				var ct1 = ls.g.circleTimer.find('.ls-ct-right .ls-ct-rotate');
				var ct2 = ls.g.circleTimer.find('.ls-ct-left .ls-ct-rotate');

				if( ls.g.circleTimer.css('display') == 'none' ){

					ct1.css({
						rotate : 0
					});

					ct2.css({
						rotate : 0
					});

					ls.g.circleTimer.fadeIn(350);
				}

				if( !ls.g.cttl ){
					ls.g.cttl = new TimelineLite();
					ls.g.cttl.add( TweenLite.fromTo(ct1[0],delaytime/2000,{
						rotation : 0
					},{
						ease : Linear.easeNone,
						rotation : 180,
						onReverseComplete : function(){
							ls.g.cttl = false;
						}
					}));
					ls.g.cttl.add( TweenLite.fromTo(ct2[0],delaytime/2000,{
						rotation : 0
					},{
						ease : Linear.easeNone,
						rotation : 180
					}));
				}else{
					ls.g.cttl.resume();
				}

			}
		};

		ls.stop = function(){

			// Stopping Timers

			ls.g.pausedSlideTime = new Date().getTime();

			if( ls.g.barTimer ){
				ls.g.barTimer.stop();
			}

			if( ls.g.circleTimer ){
				if( ls.g.cttl ){
					ls.g.cttl.pause();
				}
			}

			if( !ls.g.paused && !ls.g.originalAutoSlideshow ){
				$(el).find('.ls-nav-stop').addClass('ls-nav-stop-active');
				$(el).find('.ls-nav-start').removeClass('ls-nav-start-active');
			}
			clearTimeout( ls.g.slideTimer );
			ls.g.autoSlideshow = false;
		};

		ls.forcestop = function(){

			clearTimeout( ls.g.slideTimer );
			ls.g.autoSlideshow = false;

			clearTimeout( ls.g.t1 );
			clearTimeout( ls.g.t2 );
			clearTimeout( ls.g.t3 );
			clearTimeout( ls.g.t4 );
			clearTimeout( ls.g.t5 );

			if( ls.g.barTimer ){
				ls.g.barTimer.stop();
			}

			if( ls.g.circleTimer ){
				if( ls.g.cttl ){
					ls.g.cttl.pause();
				}
			}

			$(el).find('*').stop(true,false).dequeue();
			$(el).find('.ls-slide >').each(function(){
				if( $(this).data('tr') ){
					$(this).data('tr').pause();
				}
			});

			if( !ls.g.paused && !ls.g.originalAutoSlideshow ){
				$(el).find('.ls-nav-stop').addClass('ls-nav-stop-active');
				$(el).find('.ls-nav-start').removeClass('ls-nav-start-active');
			}
		};

		ls.restart = function(){

			$(el).find('*').stop();
			clearTimeout( ls.g.slideTimer );
			ls.change(ls.g.curLayerIndex,ls.g.prevNext);
		};

		// Because of an ie7 bug, we have to check & format the strings correctly

		ls.ieEasing = function( e ){

			// BUGFIX v1.6 and v1.8 some type of animations didn't work properly

			if( $.trim(e.toLowerCase()) == 'swing' || $.trim(e.toLowerCase()) == 'linear'){
				return e.toLowerCase();
			}else{
				return e.replace('easeinout','easeInOut').replace('easein','easeIn').replace('easeout','easeOut').replace('quad','Quad').replace('quart','Quart').replace('cubic','Cubic').replace('quint','Quint').replace('sine','Sine').replace('expo','Expo').replace('circ','Circ').replace('elastic','Elastic').replace('back','Back').replace('bounce','Bounce');
			}
		};

		// Calculating prev layer

		ls.prev = function(clicked){

			// NEW FEATURE v2.0 loops

			if( ls.g.curLayerIndex < 2 ){
				ls.g.nextLoop += 1;
			}

			if( ( ls.g.nextLoop > ls.o.loops ) && ( ls.o.loops > 0 ) && !clicked ){
				ls.g.nextLoop = 0;
				ls.stop();
				if( ls.o.forceLoopNum == false ){
					ls.o.loops = 0;
				}
			}else{
				var prev = ls.g.curLayerIndex < 2 ? ls.g.layersNum : ls.g.curLayerIndex - 1;
				ls.g.prevNext = 'prev';
				ls.change(prev,ls.g.prevNext);
			}
		};

		// Calculating next layer

		ls.next = function(clicked){

			// NEW FEATURE v2.0 loops

			if( !ls.o.randomSlideshow ){

				if( !(ls.g.curLayerIndex < ls.g.layersNum) ){
					ls.g.nextLoop += 1;
				}

				if( ( ls.g.nextLoop > ls.o.loops ) && ( ls.o.loops > 0 ) && !clicked ){

					ls.g.nextLoop = 0;
					ls.stop();
					if( ls.o.forceLoopNum == false ){
						ls.o.loops = 0;
					}
				}else{

					var next = ls.g.curLayerIndex < ls.g.layersNum ? ls.g.curLayerIndex + 1 : 1;
					ls.g.prevNext = 'next';
					ls.change(next,ls.g.prevNext);
				}
			}else if( !clicked ){

				// NEW FEATURE v3.5 randomSlideshow

				var next = ls.g.curLayerIndex;

				var calcRand = function(){

					next = Math.floor(Math.random() * ls.g.layersNum) + 1;

					if( next == ls.g.curLayerIndex ){

						calcRand();
					}else{
						ls.g.prevNext = 'next';
						ls.change(next,ls.g.prevNext);
					}
				}

				calcRand();
			}else if( clicked ){

				var next = ls.g.curLayerIndex < ls.g.layersNum ? ls.g.curLayerIndex + 1 : 1;
				ls.g.prevNext = 'next';
				ls.change(next,ls.g.prevNext);
			}

		};

		// ls.media > EMBEDDED VIDEO & AUDIO FUNCTIONS > added in v5.6.0

		ls.media = {

			youtube : {

				// BUGFIX v5.6.0 Fixed YouTube Iframe Player API issue

				init : function(){

					// IMPROVEMENT v4.6.0 http / https support of embedded videos

					var HTTP = document.location.href.indexOf('file:') === -1 ? '' : 'http:';

					// Youtube videos

					var youTube = $(el).find('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');

					// UPDATE v5.5.0 Changed to YouTube iFrame Player API 3.0

					if( youTube.length ){

						$('<script>').attr({
							'src' : HTTP + '//www.youtube.com/iframe_api',
							'type' : 'text/javascript'
						}).appendTo('head');

						var numOfYouTube = youTube.length;

						window.onYouTubeIframeAPIReady = function(){

							youTube.each(function(){

								// BUGFIX v4.1.0 Firefox embedded video fix

								$(this).parent().addClass('ls-video-layer');

								if( $(this).parent('[class*="ls-l"]') ){

									var http = HTTP;

									var vpContainer = $('<div>').addClass('ls-vpcontainer').appendTo( $(this).parent() );

									$('<img>').appendTo( vpContainer ).addClass('ls-videopreview').attr('alt', 'Play video').attr('src',  http + '//img.youtube.com/vi/' + $(this).attr('src').split('embed/')[1].split('?')[0] + '/' + ls.o.youtubePreview );

									$('<div>').appendTo( vpContainer ).addClass('ls-playvideo');

									$(this).parent().css({
										width : $(this).width(),
										height : $(this).height()
									}).click(function(){

										var iframe = $(this).find('iframe');

										iframe.css('display','block');

										// IMPROVEMENT v5.2.0 if video playing is in progress, video layers with auto play will skip showuntil feature

										if( $(this).data('showuntil') > 0 && $(this).data('showUntilTimer') ){
											clearTimeout( $(this).data('showUntilTimer') );
										}

										if( !ls.g.pausedByVideo ){

											ls.g.isAnimating = true;

											if( ls.g.paused ){
												if( ls.o.autoPauseSlideshow != false ){
													ls.g.paused = false;
												}
												ls.g.originalAutoSlideshow = true;
											}else{
												ls.g.originalAutoSlideshow = ls.g.autoSlideshow;
											}

											if( ls.o.autoPauseSlideshow != false ){
												ls.stop();
											}

											ls.g.pausedByVideo = true;
										}

										if( typeof iframe.data('ytplayer') == 'undefined' ){

											iframe.attr('src', src );

											var videoEnded = function(event){
												if( event.data === 0 ){
													ls.g.numYouTubeCurSlide += 1;
													if( ls.o.autoPauseSlideshow == 'auto' && ls.g.originalAutoSlideshow == true ){
														if( ls.g.numYouTubeCurSlide == ls.g.curLayer.find('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').length ){
															ls.g.curSlideTime = 1;
															ls.start();
														}
													}
												}
											}

											var onPlayerReady = function(event){
												event.target.playVideo();
											}

											iframe.data('ytplayer', new YT.Player( iframe[0], {
												events : {
													'onReady': onPlayerReady,
													'onStateChange' : videoEnded
												}
											}));
										}else{
											iframe.data('ytplayer').seekTo(0).playVideo();
										}


										$(this).find('.ls-vpcontainer').delay(ls.g.v.d).fadeOut(ls.g.v.fo, function(){

											ls.g.isAnimating = false;
											if( ls.g.resize == true ){
												ls.makeResponsive( ls.g.curLayer, function(){
													ls.g.resize = false;
												});
											}
										});
									});

									http = $(this).attr('src').indexOf('http') === -1 ? HTTP : '';

									var src = http + $(this).attr('src');

									var sep = '&';
									if( src.indexOf('?') == -1 ){
										sep = '?';
									}

									// BUGFIX v5.6.0 We don't need autoplay parameter any more

									if( src.indexOf('autoplay') == -1 ){
										src += sep;
									}else{
										src.replace('autoplay=1','autoplay=0');
									}

									// BUGFIX v5.1.0 Fixed several issues with embedded videos (mostly under Firefox and IE)
									// fixed 'only audio but no video' bug, fixed 'unclickable video controls' bug, fixed 'hidden slider controls' bug
									// UPDATE v5.5.0 Changed to YouTube iFrame Player API 3.0

									src += '&wmode=opaque&html5=1&enablejsapi=1&version=3';

									$(this).data( 'videoSrc', src );

									$(this).data( 'originalWidth', $(this).attr('width') );
									$(this).data( 'originalHeight', $(this).attr('height') );

									$(this).attr('src', '');

								}
							});
						};
					}
				},

				play : function( video ){

				},

				stop : function( video ){

					video.parent().find('.ls-vpcontainer').fadeIn(ls.g.v.fi,function(){

						video.parent().find('iframe').data('ytplayer').stopVideo();
						video.parent().find('iframe').css('display','none');
					});
				}
			},

			vimeo : {

				init : function(){

					// IMPROVEMENT v4.6.0 http / https support of embedded videos

					var HTTP = document.location.href.indexOf('file:') === -1 ? '' : 'http:';

					// Vimeo videos

					$(el).find('iframe[src*="player.vimeo"]').each(function(){

						// BUGFIX v4.1.0 Firefox embedded video fix

						$(this).parent().addClass('ls-video-layer');

						if( $(this).parent('[class*="ls-l"]') ){

							var iframe = $(this);
							var http = HTTP;

							// Getting thumbnail

							var vpContainer = $('<div>').addClass('ls-vpcontainer').appendTo( $(this).parent() );

							$.getJSON( http + '//vimeo.com/api/v2/video/'+ ( $(this).attr('src').split('video/')[1].split('?')[0] ) +'.json?callback=?', function(data){

								$('<img>').appendTo( vpContainer ).addClass('ls-videopreview').attr('alt', 'Play video').attr('src', data[0]['thumbnail_large'] );

								iframe.data( 'videoDuration', parseInt( data[0]['duration'] ) * 1000 );
								$('<div>').appendTo( vpContainer ).addClass('ls-playvideo');
							});


							$(this).parent().css({
								width : $(this).width(),
								height : $(this).height()
							}).click(function(){

								// IMPROVEMENT v5.2.0 if video playing is in progress, video layers with auto play will skip showuntil feature

								if( $(this).data('showuntil') > 0 && $(this).data('showUntilTimer') ){
									clearTimeout( $(this).data('showUntilTimer') );
								}

								ls.g.isAnimating = true;

								if( ls.g.paused ){
									if( ls.o.autoPauseSlideshow != false ){
										ls.g.paused = false;
									}
									ls.g.originalAutoSlideshow = true;
								}else{
									ls.g.originalAutoSlideshow = ls.g.autoSlideshow;
								}

								if( ls.o.autoPauseSlideshow != false ){
									ls.stop();
								}

								ls.g.pausedByVideo = true;

								http = $(this).find('iframe').data('videoSrc').indexOf('http') === -1 ? HTTP : '';

								$(this).find('iframe').attr('src', http + $(this).find('iframe').data('videoSrc') );
								$(this).find('.ls-vpcontainer').delay(ls.g.v.d).fadeOut(ls.g.v.fo, function(){
									if( ls.o.autoPauseSlideshow == 'auto' && ls.g.originalAutoSlideshow == true ){
										var videoTimer = setTimeout(function() {
												ls.start();
										}, iframe.data( 'videoDuration') - ls.g.v.d );
										iframe.data( 'videoTimer', videoTimer );
									}
									ls.g.isAnimating = false;
									if( ls.g.resize == true ){
										ls.makeResponsive( ls.g.curLayer, function(){
											ls.g.resize = false;
										});
									}
								});
							});

							var sep = '&';

							if( $(this).attr('src').indexOf('?') == -1 ){
								sep = '?';
							}

							// BUGFIX v5.1.0 Fixed several issues with embedded videos (mostly under Firefox and IE)
							// fixed 'only audio but no video' bug, fixed 'unclickable video controls' bug, fixed 'hidden slider controls' bug

							var videoFix = '&wmode=opaque';

							// BUGFIX v5.1.0 Fixed autoplay parameter

							if( $(this).attr('src').indexOf('autoplay') == -1 ){
								$(this).data( 'videoSrc', $(this).attr('src') + sep + 'autoplay=1' + videoFix );
							}else{
								$(this).data( 'videoSrc', $(this).attr('src').replace('autoplay=0','autoplay=1') + videoFix );
							}

							$(this).data( 'originalWidth', $(this).attr('width') );
							$(this).data( 'originalHeight', $(this).attr('height') );
							$(this).attr('src','');
						}
					});
				},

				play : function( video ){

				},

				stop : function( video ){

					video.parent().find('.ls-vpcontainer').fadeIn(ls.g.v.fi,function(){

						video.parent().find('iframe').attr('src','');
					});
				}
			},

			html5 : {

				init : function(){

					// NEW FEATURE v5.0.0 HTML5 Video & Audio Support

					$(el).find('video, audio').each(function(){

						// BUGFIX v5.1.0 fixed HTML5 video sizing issue (again :)

						var ow = typeof $(this).attr('width') !== 'undefined' ? $(this).attr('width') : '640';
						var oh = typeof $(this).attr('height') !== 'undefined' ? $(this).attr('height') : '' + $(this).height();

						if( ow.indexOf('%') === -1 ){
							ow = parseInt( ow );
						}

						if( oh.indexOf('%') === -1 ){
							oh = parseInt( oh );
						}

						if( ow === '100%' && ( oh === 0 || oh === '0' || oh === '100%' ) ){
							$(this).attr('height', '100%');
							oh = 'auto';
						}

						$(this).parent().addClass('ls-video-layer').css({
							width : ow,
							height : oh
						}).data({
							originalWidth : ow,
							originalHeight : oh
						});

						var curVideo = $(this);

						// BUGFIX v5.3.0 'ended' function removed from 'click' function due to multiply

						$(this).on('ended', function(){
							if( ls.o.autoPauseSlideshow === 'auto' && ls.g.originalAutoSlideshow === true ){
								ls.start();
							}
						});

						$(this).removeAttr('width').removeAttr('height').css({
							width : '100%',
							height : '100%'
						}).click(function(e){

							// BUGFIX v5.3.0 autoplay didn't work in all cases

							if( !ls.g.pausedByVideo ){

								if( this.paused ){
									e.preventDefault();
								}

								this.play();

								ls.g.isAnimating = true;

								if( ls.g.paused ){
									if( ls.o.autoPauseSlideshow !== false ){
										ls.g.paused = false;
									}
									ls.g.originalAutoSlideshow = true;
								}else{
									ls.g.originalAutoSlideshow = ls.g.autoSlideshow;
								}

								if( ls.o.autoPauseSlideshow !== false ){
									ls.stop();
								}

								ls.g.pausedByVideo = true;
								ls.g.isAnimating = false;

								if( ls.g.resize === true ){
									ls.makeResponsive( ls.g.curLayer, function(){
										ls.g.resize = false;
									});
								}
							}
						});
					});
				},

				play : function( video ){

				},

				stop : function( video ){

					video[0].pause();
				}
			}
		};

		ls.change = function(num,prevnext){

			// Stopping Timers if needed

			ls.g.startSlideTime = ls.g.pausedSlideTime = ls.g.curSlideTime = false;

			// IMPROVEMENT v4.6.0 Bar Timer animation

			if( ls.g.barTimer ){
				ls.g.barTimer.stop().delay(300).animate({
					width: 0
				},450);
			}
			if( ls.g.circleTimer ){
				ls.g.circleTimer.fadeOut(500);
				if( ls.g.cttl ){
					ls.g.cttl.reverse().duration(.35);
				}
			}

			// NEW FEATURE v2.0 videoPreview & autoPlayVideos

			if( ls.g.pausedByVideo == true ){
				ls.g.pausedByVideo = false;
				ls.g.autoSlideshow = ls.g.originalAutoSlideshow;

				ls.g.curLayer.find('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').each(function(){

					ls.media.youtube.stop( $(this) );
				});

				ls.g.curLayer.find('iframe[src*="player.vimeo"]').each(function(){

					ls.media.vimeo.stop( $(this) );
				});

				ls.g.curLayer.find('video, audio').each(function(){

					ls.media.html5.stop( $(this) );
				});
			}

			$(el).find('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="player.vimeo"]').each(function(){

				// Clearing videoTimeouts

				clearTimeout( $(this).data( 'videoTimer') );
			});

			clearTimeout( ls.g.slideTimer );
			ls.g.nextLayerIndex = num;
			ls.g.nextLayer = $(el).find('.ls-slide:eq('+(ls.g.nextLayerIndex-1)+')');

			// update active bullet
			$(el).find('.ls-bottom-slidebuttons a').removeClass('ls-nav-active').eq(num - 1).addClass('ls-nav-active');

			// BUGFIX v1.6 fixed wrong directions of animations if navigating by slidebuttons

			if( !prevnext ){

				if( ls.g.curLayerIndex < ls.g.nextLayerIndex ){
					ls.g.prevNext = 'next';
				}else{
					ls.g.prevNext = 'prev';
				}
			}

			// Added timeOut to wait for the fade animation of videoPreview image...

			var timeOut = 0;

			if( $(el).find('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="player.vimeo"]').length > 0 ){
				timeOut = ls.g.v.fi;
			}

			if( typeof ls.g.nextLayer[0] !== 'undefined' ){
				ls.imgPreload(ls.g.nextLayer,function(){
					ls.animate();
				});
			}
		};

		// Preloading images

		ls.imgPreload = function(layer,callback){

			ls.g.isLoading = true;

			// Showing slider for the first time

			if( ls.g.showSlider ){
				$(el).css({
					visibility : 'visible'
				});
			}

			// If image preload is on

			if( ls.o.imgPreload ){

				var preImages = [];
				var preloaded = 0;

				// NEW FEATURE v1.8 Preloading background images of layers

				if( layer.css('background-image') != 'none' && layer.css('background-image').indexOf('url') != -1 && !layer.hasClass('ls-preloaded') && !layer.hasClass('ls-not-preloaded') ){
					var bgi = layer.css('background-image');
					bgi = bgi.match(/url\((.*)\)/)[1].replace(/"/gi, '');
					preImages[preImages.length] = [bgi, layer];
				}

				// Images inside layers

				layer.find('img:not(.ls-preloaded, .ls-not-preloaded)').each(function(){

					// NEW FEATURE v5.0.0 Lazy-load

					if( ls.o.lazyLoad === true ){
						$(this).attr('src',$(this).data('src'));
					}
					preImages[preImages.length] = [$(this).attr('src'), $(this)];
				});

				// Background images inside layers

				layer.find('*').each(function(){

					// BUGFIX v1.7 fixed preload bug with sublayers with gradient backgrounds

					if( $(this).css('background-image') != 'none' && $(this).css('background-image').indexOf('url') != -1 && !$(this).hasClass('ls-preloaded') && !$(this).hasClass('ls-not-preloaded') ){
						var bgi = $(this).css('background-image');
						bgi = bgi.match(/url\((.*)\)/)[1].replace(/"/gi, '');
						preImages[preImages.length] = [bgi, $(this)];
					}
				});

				// BUGFIX v1.7 if there are no images in a layer, calling the callback function

				if(preImages.length == 0){

					$('.ls-thumbnail-wrapper, .ls-nav-next, .ls-nav-prev, .ls-bottom-nav-wrapper').css({
						visibility : 'visible'
					});

					ls.makeResponsive(layer, callback);
				}else{

					// NEW FEATURE v4.0 Showing loading indicator

					if( ls.g.ie78 ){
						ls.g.li.css('display','block');
					}else{

						// BUGIFX v4.1.3 Adding delay to the showing of the loading indicator

						ls.g.li.delay(400).fadeIn(300);
					}

					var afterImgLoad = function(){

						// NEW FEATURE v4.0 Hiding loading indicator

						ls.g.li.stop(true,true).css({
							display: 'none'
						});

						$('.ls-thumbnail-wrapper, .ls-nav-next, .ls-nav-prev, .ls-bottom-nav-wrapper').css({
							visibility : 'visible'
						});

						// We love you so much IE... -.-

						if( navigator.userAgent.indexOf('Trident/7') !== -1 || ls.g.ie78 ){
							setTimeout(function(){
								ls.makeResponsive(layer, callback);
							},50);
						}else{
							ls.makeResponsive(layer, callback);
						}

					};

					for(x=0;x<preImages.length;x++){

						$('<img>').data('el',preImages[x]).load(function(){

							$(this).data('el')[1].addClass('ls-preloaded');

							if( ++preloaded == preImages.length ){

								afterImgLoad();
							}
						}).error(function(){
							var imgURL = $(this).data('el')[0].substring($(this).data('el')[0].lastIndexOf("/") + 1, $(this).data('el')[0].length);
							if( window.console ){
								console.log('LayerSlider error:\r\n\r\nIt seems like the URL of the image or background image "'+imgURL+'" is pointing to a wrong location and it cannot be loaded. Please check the URLs of all your images used in the slider.');
							}else{
								alert('LayerSlider error:\r\n\r\nIt seems like the URL of the image or background image "'+imgURL+'" is pointing to a wrong location and it cannot be loaded. Please check the URLs of all your images used in the slider.');
							}

							$(this).addClass('ls-not-preloaded');

							// IMPROVEMENT v5.2.0 The slider should not stop even if an image cannot be loaded

							if( ++preloaded == preImages.length ){

								afterImgLoad();
							}

						}).attr('src',preImages[x][0]);
					}
				}
			}else{

				$('.ls-thumbnail-wrapper, .ls-nav-next, .ls-nav-prev, .ls-bottom-nav-wrapper').css({
					visibility : 'visible'
				});

				ls.makeResponsive(layer, callback);
			}
		};

		// NEW FEATURE v1.7 making the slider responsive

		ls.makeResponsive = function(layer, callback ){

			layer.css({
				visibility: 'hidden',
				display: 'block'
			});

			if( ls.g.showShadow ){
				ls.g.showShadow();
			}

			ls.resizeSlider();

			if( ls.o.thumbnailNavigation == 'always' ){
				ls.resizeThumb();
			}

			// responsiveUnder fix for fullPage
			if (ls.o.fullPage) {
				ls.o.responsiveUnder = ls.o.layersContainer;
			}

			// if fullpage, change slide image size to cover
			var imgsize = ls.o.fullPage ? 'cover' : layer.data('imgsize') || 'auto';
			// init slide img position
			var imgpos = (layer.data('imgposition') || '50% 50%').trim().split(/\s+/);
			imgpos[0] = parseInt(imgpos[0]) / 100;
			imgpos[1] = parseInt(imgpos[1]) / 100;

			if (imgsize == 'cover') {
				var _cow = ls.g.layersOriginalContainer;				// container original width
				var _soh = parseInt(ls.g.sliderOriginalHeight);	// slider original height
				var _sw = ls.g.sliderWidth();				// slider width
				var _sh = ls.g.sliderHeight();			// slider height
				var _cw = _sw > _cow ? _cow : _sw;	// conainer widt
				var _ch = _cw / _cow * _soh;				// container height
				var _pt = _sw / _cow < ls.g.ratioY || ls.g.ratio == 1 ? (_sh - _ch) / 2 : 0;
			} else {
				var _pt = 0;
			}
			var layers = layer.children();
			layers.each(function(){

				var sl = $(this);

				// positioning

				var ol = sl.data('originalLeft') ? sl.data('originalLeft') : '0';
				var ot = sl.data('originalTop') ? sl.data('originalTop') : '0';

				if( sl.is('a') && sl.children().length > 0 ){
					sl.css({
						display : 'block'
					});
					sl = sl.children();
				}

				var ow = 'auto';
				var oh = 'auto';

				if( sl.data('originalWidth') ){

					if( typeof sl.data('originalWidth') == 'number' ){
						ow = parseInt( sl.data('originalWidth') ) * ls.g.ratio;
					}else if( sl.data('originalWidth').indexOf('%') != -1 ){
						ow = sl.data('originalWidth');
					}
				}

				if( sl.data('originalHeight') ){
					if( typeof sl.data('originalHeight') == 'number' ){
						oh = parseInt( sl.data('originalHeight') ) * ls.g.ratio;
					}else if( sl.data('originalHeight').indexOf('%') != -1 ){
						oh = sl.data('originalHeight');
					}
				}

				// padding

				var opl = sl.data('originalPaddingLeft') ? parseInt( sl.data('originalPaddingLeft') ) * ls.g.ratio : 0;
				var opr = sl.data('originalPaddingRight') ? parseInt( sl.data('originalPaddingRight') ) * ls.g.ratio : 0;
				var opt = sl.data('originalPaddingTop') ? parseInt( sl.data('originalPaddingTop') ) * ls.g.ratio : 0;
				var opb = sl.data('originalPaddingBottom') ? parseInt( sl.data('originalPaddingBottom') ) * ls.g.ratio : 0;

				// border

				var obl = sl.data('originalBorderLeft') ? parseInt( sl.data('originalBorderLeft') ) * ls.g.ratio : 0;
				var obr = sl.data('originalBorderRight') ? parseInt( sl.data('originalBorderRight') ) * ls.g.ratio : 0;
				var obt = sl.data('originalBorderTop') ? parseInt( sl.data('originalBorderTop') ) * ls.g.ratio : 0;
				var obb = sl.data('originalBorderBottom') ? parseInt( sl.data('originalBorderBottom') ) * ls.g.ratio : 0;

				// font

				var ofs = sl.data('originalFontSize');
				var olh = sl.data('originalLineHeight');

				// NEW FEATURE v3.0 added "normal" responsive mode with image and font resizing
				// NEW FEATURE v3.5 added responsiveUnder

				if( ls.g.responsiveMode || ls.o.responsiveUnder > 0 ){

					if( sl.is('img') && !sl.hasClass('ls-bg') && sl.attr('src') ){

						sl.css({
							width: 'auto',
							height: 'auto'
						});

						// IMPROVEMENT v4.5.0 Images can have now starting width / height

						if( ( ow == 0 || ow == 'auto' ) && typeof oh == 'number' && oh != 0 ){
							ow = ( oh / sl.height() ) * sl.width();
						}

						if( ( oh == 0 || oh == 'auto' ) && typeof ow == 'number' && ow != 0 ){
							oh = ( ow / sl.width() ) * sl.height();
						}

						if( ow == 'auto'){
							if (oh.indexOf && oh.indexOf('%') > -1) {
								var ohr = parseFloat(oh)/100 * sl.closest('.ls-container').height() / sl.height();
								ow = sl.width() * ohr;
							} else
								ow = sl.width() * ls.g.ratio;
						}

						if( oh == 'auto'){
							if (ow.indexOf && ow.indexOf('%') > -1) { // !!! fix for keep image ratio when width is in %
								var owr = parseFloat(ow)/100 * sl.closest('.ls-container').width() / sl.width();
								oh = sl.height() * owr;
							}
							else
								oh = sl.height() * ls.g.ratio;
						}

						sl.css({
							width : ow,
							height : oh
						});
					}

					if( !sl.is('img') ){
						sl.css({
							width : ow,
							height : oh,
							'font-size' : parseInt(ofs) * ls.g.ratio +'px',
							'line-height' : parseInt(olh) * ls.g.ratio + 'px'
						});

						// bugfix for splittext on safari mobile
						if (navigator.userAgent.match(/iPad|iPod|iPhone/i)) {
							var split = sl.data('split');
							if (split) {
								var types = [];
								split.chars.length && types.push('chars');
								split.words.length && types.push('words');
								split.lines.length && types.push('lines');
								split.split({ split: types.join(',') });
								sl.css('visibility', '');
							}
						}
					}

					if( sl.is('div') && sl.find('iframe').data('videoSrc') ){

						var videoIframe = sl.find('iframe');
						videoIframe.attr('width', parseInt( videoIframe.data('originalWidth') ) * ls.g.ratio ).attr('height', parseInt( videoIframe.data('originalHeight') ) * ls.g.ratio );

						sl.css({
							width : parseInt( videoIframe.data('originalWidth') ) * ls.g.ratio,
							height : parseInt( videoIframe.data('originalHeight') ) * ls.g.ratio
						});
					}

					sl.css({
						padding : opt + 'px ' + opr + 'px ' + opb + 'px ' + opl + 'px ',
						borderLeftWidth : obl + 'px',
						borderRightWidth : obr + 'px',
						borderTopWidth : obt + 'px',
						borderBottomWidth : obb + 'px'
					});
					// if hover is added to the layer
					var hover = sl.data('hover');
					if (hover) {
						//sl.data('connecthover') ? sl.parent().trigger('mouseleave') : sl.trigger('mouseleave');
						var hin = sl.data('hin');
						if (hin) {
							hin.kill();
							sl.removeData('hin');
						}
						var hout = sl.data('hout');
						if (hout) {
							hout.kill();
							sl.removeData('hout');
						}
						clearTimeout(sl.data('timeouthover'));
						hover.kill();
						sl.removeData('hover');

						var inithover = sl.data('inithover');
						TweenLite.set(hover.target, {css: inithover});
					}
				}

				// If it is NOT a bg sublayer

				if( !sl.hasClass('ls-bg') ){

					var sl2 = sl;

					if( sl.parent().is('a') ){
						sl = sl.parent();
					}

					// NEW FEATURE v3.5 sublayerContainer

					var slC = 0;
					if( ls.o.layersContainer ){
						slC = ls.o.layersContainer > 0 ? ( ls.g.sliderWidth() - ls.o.layersContainer ) / 2 : 0;
					}else if( ls.o.sublayerContainer ){
						slC = ls.o.sublayerContainer > 0 ? ( ls.g.sliderWidth() - ls.o.sublayerContainer ) / 2 : 0;
					}
					slC = slC < 0 ? 0 : slC;

					// (RE)positioning sublayer (left property)

					if( ol.indexOf('%') != -1 ){
						var leftPercent = parseFloat(ol);
						if (leftPercent == 0)
							sl.css('left', ls.g.sliderWidth() / 100 * leftPercent);
						else if (leftPercent == 100)
							sl.css('left', ls.g.sliderWidth() / 100 * leftPercent - sl2.outerWidth());
						else
							sl.css('left', ls.g.sliderWidth() / 100 * leftPercent - sl2.outerWidth() / 2);
					}else if( slC > 0 || ls.g.responsiveMode || ls.o.responsiveUnder > 0 ){
						sl.css('left', slC + parseInt(ol) * ls.g.ratio);
					}

					// (RE)positioning sublayer (top property)

					if( ot.indexOf('%') != -1 ){
						var topPercent = parseFloat(ot);
						if (topPercent == 0)
							sl.css('top', ls.g.sliderHeight() / 100 * topPercent);
						else if (topPercent == 100)
							sl.css('top', ls.g.sliderHeight() / 100 * topPercent - sl2.outerHeight());
						else
							sl.css('top', ls.g.sliderHeight() / 100 * topPercent - sl2.outerHeight() / 2);
					}else if( ls.g.responsiveMode || ls.o.responsiveUnder > 0 ){
						sl.css('top', parseInt(ot) * ls.g.ratio + _pt);
					}

				}else{

					var inner = ls.g.i;
					var iw = inner.width();
					var ih = inner.height();

					sl.css({
						width : 'auto',
						height : 'auto'
					});

					ow = sl.width();
					oh = sl.height();

					// IMPROVEMENT v4.5.0 Resizing smaller background images in full width mode as well to fill the whole slide
					if (imgsize == 'cover') { // cover or fullsize
						if (ow / oh < iw / ih) {
							sl.css({
								width: iw,
								height: iw / ow * oh,
								marginLeft: 0,
								marginTop: (_sh - oh / ow * _sw) * imgpos[1]
							});
						} else {
							sl.css({
								width: ih / oh * ow,
								height: ih,
								marginLeft: (_sw - ow / oh * _sh) * imgpos[0],
								marginTop: 0
							});
						}
					}	else if (imgsize == 'contain') { // contain
						if (ow / oh < iw / ih) {
							sl.css({
								width: ih / oh * ow,
								height: ih,
								marginLeft: (ls.g.sliderWidth() - ih / oh * ow) * imgpos[0],
								marginTop: 0
							});
						} else {
							sl.css({
								width: iw,
								height: iw / ow * oh,
								marginLeft: 0,
								marginTop: (ls.g.sliderHeight() - oh / ow * _sw) * imgpos[1]
							});
						}
					} else if (imgsize == 'stretch') { // stretch
						sl.css({
							width: ls.g.sliderWidth(),
							height: ls.g.sliderHeight(),
							marginLeft: 0,
							marginTop: 0
						});
					} else { // auto
						var or = ls.g.ratio;

						if( ls.g.sliderOriginalWidth.indexOf('%') != -1 ){
							if( ls.g.sliderWidth() > ow ){
								or = ls.g.sliderWidth() / ow;
								if( ls.g.sliderHeight() > oh * or ){
									or = ls.g.sliderHeight() / oh;
								}
							}else if( ls.g.sliderHeight() > oh ){
								or = ls.g.sliderHeight() / oh;
								if( ls.g.sliderWidth() > ow * or ){
									or = ls.g.sliderWidth() / ow;
								}
							}
						}

						sl.css({
							width : ow * or,
							height : oh * or,
							marginLeft : (iw - ow * or) * imgpos[0],
							marginTop : (ih - oh * or) * imgpos[1]
						});
					}
//					$('#w2 span:eq(0)').html( ( inner.width() / 2 ) - Math.round( ow * or / 2 ) );
				}
			});

			layer.css({
				display: 'none',
				visibility: 'visible'
			});

			// Resizing shadow

			ls.resizeShadow();

			callback();

			$(this).dequeue();
		};

		// Resizing shadow

		ls.resizeShadow = function(){
			if( ls.g.shadowImg ){
				var resizeShadow = function(){
					if( ls.g.shadowImg.height() > 0 ){
						if( ls.g.shadowBtmMod > 0 ){
							ls.g.shadow.css({
								height: ls.g.shadowImg.height() / 2
							});
						}else{
							ls.g.shadow.css({
								height: ls.g.shadowImg.height(),
								marginTop: - ls.g.shadowImg.height() / 2
							});
						}
					}else{
						setTimeout(function(){
							resizeShadow();
						},50);
					}
				};

				resizeShadow();
			}
		};

		// Resizing the slider

		ls.resizeSlider = function(){

			if( ls.o.responsiveUnder > 0 ){

				if( $(window).width() < ls.o.responsiveUnder ){
					ls.g.responsiveMode = true;
					ls.g.sliderOriginalWidth = ls.o.responsiveUnder + 'px';
				}else{
					ls.g.responsiveMode = false;
					ls.g.sliderOriginalWidth = ls.g.sliderOriginalWidthRU;
					ls.g.ratio = 1;
				}
			}

			// BUGFIX 5.3.0 Fixed full-width resize issue

			if( $(el).closest('.ls-wp-fullwidth-container').length ){

					$(el).closest('.ls-wp-fullwidth-helper').css({
						width : $(window).width()
					});
			}

			if (ls.o.fullPage) {
				ls.g.responsiveMode = true;
				ls.g.sliderHeight = function() {
					var vh = $(window).height();
					if (ls.o.reduceHeight) $(ls.o.reduceHeight).each(function() {
						vh -= $(this).outerHeight();
					})
					return vh;
				};

				if (ls.g.layersOriginalContainer == undefined) {
					ls.g.layersOriginalContainer = ls.o.layersContainer;
				}
				var _soh = parseInt(ls.g.sliderOriginalHeight);	// slider original heigh
				var _sh = ls.g.sliderHeight();			// slider height

				if (_sh < _soh) {
					ls.o.layersContainer = _sh / _soh * ls.g.layersOriginalContainer;
				} else {
					ls.o.layersContainer = ls.g.layersOriginalContainer;
				}
			}

			// NEW FEATURE v3.0 added "normal" responsive mode with image and font resizing

			if( ls.g.responsiveMode ){

				var parent = $(el).parent();

				// BUGFIX v4.0 there is no need to subtract the values of the left and right paddings of the container element!

				if (ls.g.sliderOriginalWidthRU == "100%") {
					// BUGFIX: resize full-width slide
					$(el).css({
						width : $(window).width()
					});
				} else {
					$(el).css({
						width : parent.width() - parseInt($(el).css('padding-left')) - parseInt($(el).css('padding-right'))
					});
				}

				if (ls.o.fullPage) {
					$(el).height( _sh );
					ls.g.ratio = $(el).width() / ls.g.layersOriginalContainer;
					ls.g.ratioY = _sh / _soh;
					if (ls.g.ratioY < ls.g.ratio) {
						ls.g.ratio = ls.g.ratioY < 1 ? ls.g.ratioY : 1;
					} else {
						ls.g.ratio = ls.g.ratio < 1 ? ls.g.ratio : 1;
					}
				} else {
					ls.g.ratio = $(el).width() / parseInt( ls.g.sliderOriginalWidth );
					$(el).css({
						height : ls.g.ratio * parseInt( ls.g.sliderOriginalHeight )
					});
				}

			}else{
				ls.g.ratio = 1;
				$(el).css({
					width : ls.g.sliderOriginalWidth,
					height : ls.g.sliderOriginalHeight
				});
			}

			// WP fullWidth mode (originally forceResponsive mode)

			if( $(el).closest('.ls-wp-fullwidth-container').length ){

				$(el).closest('.ls-wp-fullwidth-helper').css({
					height : $(el).outerHeight(true)
				});

				$(el).closest('.ls-wp-fullwidth-container').css({
					height : $(el).outerHeight(true)
				});

				var helper = $(el).closest('.ls-wp-fullwidth-helper');
				var node = helper[0].parentNode, offsetLeft = 0;
				do {
					offsetLeft += node.offsetLeft;
					node = node.offsetParent;
				} while (node && !$(node).is('html, .sm-content-inner'));

				var scroll = $(node).is('.sm-content-inner') && node.offsetHeight > node.parentNode.offsetHeight ? scrollWidth : 0;

				helper.css({
					width : $(window).width() - scroll,
					left : -offsetLeft
				});
				ls.g.sliderWidth = function(){
					return $(window).width() - scroll;
				}

				if( ls.g.sliderOriginalWidth.indexOf('%') != -1 ){

					var percentWidth = parseInt( ls.g.sliderOriginalWidth );
					var newWidth = $('body').outerWidth() / 100 * percentWidth - ( $(el).outerWidth() - $(el).width() );
					$(el).width( newWidth - scroll );
				}
			}

			$(el).find('.ls-inner, .ls-lt-container').css({
				width : ls.g.sliderWidth(),
				height : ls.g.sliderHeight()
			});

			// BUGFIX v2.0 fixed width problem if firstSlide is not 1

			if( ls.g.curLayer && ls.g.nextLayer ){

				ls.g.curLayer.css({
					width : ls.g.sliderWidth(),
					height : ls.g.sliderHeight()
				});

				ls.g.nextLayer.css({
					width : ls.g.sliderWidth(),
					height : ls.g.sliderHeight()
				});

			}else{

				$(el).find('.ls-slide').css({
					width : ls.g.sliderWidth(),
					height : ls.g.sliderHeight()
				});
			}
		};

		// NEW FEATURE v3.0 added responsive yourLogo

		ls.resizeYourLogo = function(){

			ls.g.yourLogo.css({
				width : ls.g.yourLogo.data( 'originalWidth' ) * ls.g.ratio,
				height : ls.g.yourLogo.data( 'originalHeight' ) * ls.g.ratio
			});

			if( ls.g.ie78 ){
				ls.g.yourLogo.css('display','block');
			}else{
				ls.g.yourLogo.fadeIn(300);
			}

			var oL = oR = oT = oB = 'auto';

			if( ls.g.yourLogo.data( 'originalLeft' ) && ls.g.yourLogo.data( 'originalLeft' ).indexOf('%') != -1 ){
				oL = ls.g.sliderWidth() / 100 * parseInt( ls.g.yourLogo.data( 'originalLeft' ) ) - ls.g.yourLogo.width() / 2 + parseInt( $(el).css('padding-left') );
			}else{
				oL = parseInt( ls.g.yourLogo.data( 'originalLeft' ) ) * ls.g.ratio;
			}

			if( ls.g.yourLogo.data( 'originalRight' ) && ls.g.yourLogo.data( 'originalRight' ).indexOf('%') != -1 ){
				oR = ls.g.sliderWidth() / 100 * parseInt( ls.g.yourLogo.data( 'originalRight' ) ) - ls.g.yourLogo.width() / 2 + parseInt( $(el).css('padding-right') );
			}else{
				oR = parseInt( ls.g.yourLogo.data( 'originalRight' ) ) * ls.g.ratio;
			}

			if( ls.g.yourLogo.data( 'originalTop' ) && ls.g.yourLogo.data( 'originalTop' ).indexOf('%') != -1 ){
				oT = ls.g.sliderHeight() / 100 * parseInt( ls.g.yourLogo.data( 'originalTop' ) ) - ls.g.yourLogo.height() / 2 + parseInt( $(el).css('padding-top') );
			}else{
				oT = parseInt( ls.g.yourLogo.data( 'originalTop' ) ) * ls.g.ratio;
			}

			if( ls.g.yourLogo.data( 'originalBottom' ) && ls.g.yourLogo.data( 'originalBottom' ).indexOf('%') != -1 ){
				oB = ls.g.sliderHeight() / 100 * parseInt( ls.g.yourLogo.data( 'originalBottom' ) ) - ls.g.yourLogo.height() / 2 + parseInt( $(el).css('padding-bottom') );
			}else{
				oB = parseInt( ls.g.yourLogo.data( 'originalBottom' ) ) * ls.g.ratio;
			}

			ls.g.yourLogo.css({
				left : oL,
				right : oR,
				top : oT,
				bottom : oB
			});
		};

		// NEW FEATURE v3.5 thumbnailNavigation ('always')

		// Resizing thumbnails

		ls.resizeThumb = function(){

			ls.bottomNavSizeHelper('on');

			var sliderW = ls.g.sliderOriginalWidth.indexOf('%') == -1 ? parseInt( ls.g.sliderOriginalWidth ) : ls.g.sliderWidth();

			$(el).find('.ls-thumbnail-slide a').css({
				width : parseInt( ls.o.tnWidth * ls.g.ratio ),
				height : parseInt( ls.o.tnHeight * ls.g.ratio )
			});

			$(el).find('.ls-thumbnail-slide a:last').css({
				margin: 0
			});

			$(el).find('.ls-thumbnail-slide').css({
				height : parseInt( ls.o.tnHeight * ls.g.ratio )
			});

			var tn = $(el).find('.ls-thumbnail');

			var originalWidth = ls.o.tnContainerWidth.indexOf('%') == -1 ? parseInt( ls.o.tnContainerWidth ) : parseInt( sliderW / 100 * parseInt( ls.o.tnContainerWidth ) );

			tn.css({
				width : originalWidth * Math.floor( ls.g.ratio * 100 ) / 100
			});

			if( tn.width() > $(el).find('.ls-thumbnail-slide').width() ){
				tn.css({
					width : $(el).find('.ls-thumbnail-slide').width()
				});
			}

			ls.bottomNavSizeHelper('off');
		};

		// Changing thumbnails

		ls.changeThumb = function(index){

			var curIndex = index ? index : ls.g.nextLayerIndex;

			$(el).find('.ls-thumbnail-slide a:not(.ls-thumb-'+curIndex+')').children().each(function(){
				$(this).removeClass('ls-thumb-active').stop().fadeTo(750,ls.o.tnInactiveOpacity/100);
			});

			$(el).find('.ls-thumbnail-slide a.ls-thumb-'+curIndex).children().addClass('ls-thumb-active').stop().fadeTo(750,ls.o.tnActiveOpacity/100);
		};

		// Scrolling thumbnails

		ls.scrollThumb = function(){

			if( !$(el).find('.ls-thumbnail-slide-container').hasClass('ls-thumbnail-slide-hover') ){
				var curThumb = $(el).find('.ls-thumb-active').length ? $(el).find('.ls-thumb-active').parent() : false;
				if( curThumb ){
					var thumbCenter = curThumb.position().left + curThumb.width() / 2;
					var mL = $(el).find('.ls-thumbnail-slide-container').width() / 2 - thumbCenter;
					mL = mL < $(el).find('.ls-thumbnail-slide-container').width() - $(el).find('.ls-thumbnail-slide').width() ? $(el).find('.ls-thumbnail-slide-container').width() - $(el).find('.ls-thumbnail-slide').width() : mL;
					mL = mL > 0 ? 0 : mL;
					$(el).find('.ls-thumbnail-slide').animate({
						marginLeft : mL
					}, 600 );
				}
			}
		};

		// IMPROVEMENT v4.1.3 Changed the working of some Thumbnail and Bottom Navigation features

		ls.bottomNavSizeHelper = function(val){

			if( ls.o.hoverBottomNav && !$(el).hasClass('ls-hover') ){
				switch(val){
					case 'on':
						ls.g.thumbsWrapper.css({
							visibility: 'hidden',
							display: 'block'
						});
					break;
					case 'off':
						ls.g.thumbsWrapper.css({
							visibility: 'visible',
							display: 'none'
						});
					break;
				}
			}
		};

		// Animating layers and sublayers

		ls.animate = function(){

			/* GLOBAL (used by both old and new transitions ) */

					ls.g.numYouTubeCurSlide = 0;

					// Changing variables
					// BUGFIX v4.6.0 If there is only one layer, there is no need to set ls.g.isAnimating to true

					if( $(el).find('.ls-slide').length > 1 ){
						ls.g.isAnimating = true;
					}

					ls.g.isLoading = false;

					// Clearing timeouts

					clearTimeout( ls.g.slideTimer );
					clearTimeout( ls.g.changeTimer );

					ls.g.stopLayer = ls.g.curLayer;

					// Calling cbAnimStart callback function

					ls.o.cbAnimStart(ls.g);

					// NEW FEATURE v3.5 thumbnailNavigation ('always')

					if( ls.o.thumbnailNavigation == 'always' ){

						// ChangeThumb

						ls.changeThumb();

						// ScrollThumb

						if( !('ontouchstart' in window) ){
							ls.scrollThumb();
						}
					}

					// Adding .ls-animating class to next layer

					ls.g.nextLayer.addClass('ls-animating');

			/* OLD layer transitions (version 3.x) */

					// Setting position and styling of current and next layers

					var curLayerLeft = curLayerRight = curLayerTop = curLayerBottom = nextLayerLeft = nextLayerRight = nextLayerTop = nextLayerBottom = layerMarginLeft = layerMarginRight = layerMarginTop = layerMarginBottom = 'auto';
					var curLayerWidth = nextLayerWidth = ls.g.sliderWidth();
					var curLayerHeight = nextLayerHeight = ls.g.sliderHeight();

					// Calculating direction

					var prevOrNext = ls.g.prevNext == 'prev' ? ls.g.curLayer : ls.g.nextLayer;
					var chooseDirection = prevOrNext.data('slidedirection') ? prevOrNext.data('slidedirection') : ls.o.slideDirection;

					// Setting the direction of sliding

					var slideDirection = ls.g.slideDirections[ls.g.prevNext][chooseDirection];

					if( slideDirection == 'left' || slideDirection == 'right' ){
						curLayerWidth = curLayerTop = nextLayerWidth = nextLayerTop = 0;
						layerMarginTop = 0;
					}
					if( slideDirection == 'top' || slideDirection == 'bottom' ){
						curLayerHeight = curLayerLeft = nextLayerHeight = nextLayerLeft = 0;
						layerMarginLeft = 0;
					}

					switch(slideDirection){
						case 'left':
							curLayerRight = nextLayerLeft = 0;
							layerMarginLeft = -ls.g.sliderWidth();
							break;
						case 'right':
							curLayerLeft = nextLayerRight = 0;
							layerMarginLeft = ls.g.sliderWidth();
							break;
						case 'top':
							curLayerBottom = nextLayerTop = 0;
							layerMarginTop = -ls.g.sliderHeight();
							break;
						case 'bottom':
							curLayerTop = nextLayerBottom = 0;
							layerMarginTop = ls.g.sliderHeight();
							break;
					}

					// Setting start positions and styles of layers

					ls.g.curLayer.css({
						left : curLayerLeft,
						right : curLayerRight,
						top : curLayerTop,
						bottom : curLayerBottom
					});
					ls.g.nextLayer.css({
						width : nextLayerWidth,
						height : nextLayerHeight,
						left : nextLayerLeft,
						right : nextLayerRight,
						top : nextLayerTop,
						bottom : nextLayerBottom
					});

					// Creating variables for the OLD transitions of CURRENT LAYER

					// BUGFIX v1.6 fixed some wrong parameters of current layer
					// BUGFIX v1.7 fixed using of delayout of current layer

					var curDelay = ls.g.curLayer.data('delayout') ? parseInt(ls.g.curLayer.data('delayout')) : ls.o.delayOut;

					var curDuration = ls.g.curLayer.data('durationout') ? parseInt(ls.g.curLayer.data('durationout')) : ls.o.durationOut;
					var curEasing = ls.g.curLayer.data('easingout') ? ls.g.curLayer.data('easingout') : ls.o.easingOut;

					// Creating variables for the OLD transitions of NEXT LAYER

					var nextDelay = ls.g.nextLayer.data('delayin') ? parseInt(ls.g.nextLayer.data('delayin')) : ls.o.delayIn;
					var nextDuration = ls.g.nextLayer.data('durationin') ? parseInt(ls.g.nextLayer.data('durationin')) : ls.o.durationIn;

					// BUGFIX v5.2.0 duration cannot be 0

					if( nextDuration === 0 ){ nextDuration = 1 }
					var nextEasing = ls.g.nextLayer.data('easingin') ? ls.g.nextLayer.data('easingin') : ls.o.easingIn;

					var curLayer = function(){

						// BUGFIX v1.6 added an additional delaytime to current layer to fix the '1px gap' bug
						// BUGFIX v3.0 modified from curDuration / 80 to curDuration / 15

						ls.g.curLayer.delay( curDelay + curDuration / 15).animate({
							width : curLayerWidth,
							height : curLayerHeight
						}, curDuration, curEasing,function(){

							curLayerCallback();
						});
					};

					var curLayerCallback = function(){

						// Stopping current sublayer animations if needed (they are not visible at this point).

						ls.g.stopLayer.find(' > *[class*="ls-l"]').each(function(){
							if( $(this).data('tr') ){
								$(this).data('tr').kill();
							}

							$(this).css({
								filter: 'none'
							});
						});

						// Setting current layer

						ls.g.curLayer = ls.g.nextLayer;

						// IMPROVEMENT v5.2.0 added prevLayerIndex and fixing curLayerIndex (nextLayerIndex is the same as curLayerIndex because the slider doesn't know at this point which slide will be the next)

						ls.g.prevLayerIndex = ls.g.curLayerIndex;
						ls.g.curLayerIndex = ls.g.nextLayerIndex;

						ls.o.cbAnimStop(ls.g);

						// NEW FEATURE v5.0.0 Lazy-load (preloading here the images of the next layer)

						if( ls.o.imgPreload && ls.o.lazyLoad ){

							var preLayerIndex = ls.g.curLayerIndex == ls.g.layersNum ? 1 : ls.g.curLayerIndex + 1;
							$(el).find('.ls-slide').eq(preLayerIndex-1).find('img:not(.ls-preloaded)').each(function(){
								$(this).load(function(){
									$(this).addClass('ls-preloaded');
								}).error(function(){
									var imgURL = $(this).data('src').substring($(this).data('src').lastIndexOf("/") + 1, $(this).data('src').length);
									if( window.console ){
										console.log('LayerSlider error:\r\n\r\nIt seems like the URL of the image or background image "'+imgURL+'" is pointing to a wrong location and it cannot be loaded. Please check the URLs of all your images used in the slider.');
									}else{
										alert('LayerSlider error:\r\n\r\nIt seems like the URL of the image or background image "'+imgURL+'" is pointing to a wrong location and it cannot be loaded. Please check the URLs of all your images used in the slider.');
									}
									$(this).addClass('ls-not-preloaded');
								}).attr('src', $(this).data('src'));
							});
						}

						// Changing some css classes

						$(el).find('.ls-slide').removeClass('ls-active');
						$(el).find('.ls-slide:eq(' + ( ls.g.curLayerIndex - 1 ) + ')').addClass('ls-active').removeClass('ls-animating');

						// Setting timer if needed

						if( ls.g.autoSlideshow ){
							ls.timer();
						}

						// Changing variables

						ls.g.isAnimating = false;
						if( ls.g.resize == true ){
							ls.makeResponsive( ls.g.curLayer, function(){
								ls.g.resize = false;
							});
						}
					};

					var curSubLayers = function(sublayersDurationOut){

						ls.g.curLayer.find(' > *[class*="ls-l"]').each(function(){

							if( !$(this).data('transitiontype') ){
								ls.transitionType( $(this) );
							}

							// BUGFIX v5.1.0 Removing ls-videohack class before starting transition

							$(this).removeClass('ls-videohack');

							var curSubSlideDir = $(this).data('slidedirection') ? $(this).data('slidedirection') : slideDirection;
							var lml, lmt;

							switch(curSubSlideDir){
								case 'left':
									lml = -ls.g.sliderWidth();
									lmt = 0;
									break;
								case 'right':
									lml = ls.g.sliderWidth();
									lmt = 0;
									break;
								case 'top':
									lmt = -ls.g.sliderHeight();
									lml = 0;
									break;
								case 'bottom':
									lmt = ls.g.sliderHeight();
									lml = 0;
									break;
								case 'fade':
									lmt = 0;
									lml = 0;
									break;
							}

							// NEW FEATURE v1.6 added slideoutdirection to sublayers
							// NEW FEATURES 5.0.0 added axis-free transitions with offsetx and offsety properties

							if( $(this).data('transitiontype') === 'new' ){
								var curSubSlideOutDir = 'new';
							}else{
								var curSubSlideOutDir = $(this).data('slideoutdirection') ? $(this).data('slideoutdirection') : false;
							}

							var curSubSplit = $(this).data('splitout') ? $(this).data('splitout') : ls.lt.splitOut;
							var curSubShift = $(this).data('shiftout') ? $(this).data('shiftout') : ls.lt.shiftOut;

							switch(curSubSlideOutDir){
								case 'left':
									lml = ls.g.sliderWidth();
									lmt = 0;
									break;
								case 'right':
									lml = -ls.g.sliderWidth();
									lmt = 0;
									break;
								case 'top':
									lmt = ls.g.sliderHeight();
									lml = 0;
									break;
								case 'bottom':
									lmt = -ls.g.sliderHeight();
									lml = 0;
									break;
								case 'fade':
									lmt = 0;
									lml = 0;
									break;
								case 'new':
									var xout = $(this).data('offsetxout');
									if( xout ){
										var cycle = xout.trim().split(/[,\s]+/);
										$.each(cycle, function(i, xout) {
											if( xout === 'left' ){
												cycle[i] = ls.g.sliderWidth();
											}else if( xout === 'right' ){
												cycle[i] = -ls.g.sliderWidth();
											}else{
												cycle[i] = xout.indexOf('%') < 0 ? parseInt(xout) * ls.g.ratio : parseFloat(xout) / 100 * el.outerWidth();
											}
										});
										lml = curSubSplit && cycle.length > 1 ? cycle : cycle[0];
									}else{
										lml = ls.lt.offsetXOut;
									}
									var yout = $(this).data('offsetyout');
									if( yout ){
										var cycle = yout.trim().split(/[,\s]+/);
										$.each(cycle, function(i, yout) {
											if( yout === 'top' ){
												cycle[i] = ls.g.sliderHeight();
											}else if( yout === 'bottom' ){
												cycle[i] = -ls.g.sliderHeight();
											}else{
												cycle[i] = yout.indexOf('%') < 0 ? parseInt(yout) * ls.g.ratio : parseFloat(yout) / 100 * el.outerHeight();
											}
										});
										lmt = curSubSplit && cycle.length > 1 ? cycle : cycle[0];
									}else{
										lmt = ls.lt.offsetYOut;
									}
									break;
							}

							// NEW FEATURES v4.5.0 Rotating & Scaling sublayers
							// BUGFIX v4.5.5 changing the default value from 0 to 'none' (because of old jQuery, 1.7.2)
							// NEW FEATURES v5.0.0 Added SkewX, SkewY, ScaleX, ScaleY, RotateX & RotateY transitions

							var curSubRotate, curSubRotateX, curSubRotateY, curSubScale, curSubSkewX, curSubSkewY, curSubScaleX, curSubScaleY, curSubClip;

							curSubRotate = $(this).data('rotateout') ? $(this).data('rotateout') : ls.lt.rotateOut;
							curSubRotateX = $(this).data('rotatexout') ? $(this).data('rotatexout') : ls.lt.rotateXOut;
							curSubRotateY = $(this).data('rotateyout') ? $(this).data('rotateyout') : ls.lt.rotateYOut;
							curSubScale = $(this).data('scaleout') ? $(this).data('scaleout') : ls.lt.scaleOut;
							curSubSkewX = $(this).data('skewxout') ? $(this).data('skewxout') : ls.lt.skewXOut;
							curSubSkewY = $(this).data('skewyout') ? $(this).data('skewyout') : ls.lt.skewYOut;
							if( curSubScale === 1 ){
								curSubScaleX = $(this).data('scalexout') ? $(this).data('scalexout') : ls.lt.scaleXOut;
								curSubScaleY = $(this).data('scaleyout') ? $(this).data('scaleyout') : ls.lt.scaleYOut;
							}else{
								curSubScaleX = curSubScaleY = curSubScale;
							}
							curSubClip = $(this).data('clipout') ? $(this).data('clipout') : ls.lt.clipOut;

							var too = $(this).data('transformoriginout') ? $(this).data('transformoriginout').split(' ') : ls.lt.transformOriginOut;
							for(var t =0;t<too.length;t++){
								if( too[t].indexOf('%') === -1 && too[t].indexOf('left') !== -1 && too[t].indexOf('right') !== -1 && too[t].indexOf('top') !== -1 && too[t].indexOf('bottom') !== -1 ){
									too[t] = '' + parseInt( too[t] ) * ls.g.ratio + 'px';
								}
							}
							var curSubTransformOrigin = too.join(' ');
							var curSubPerspective = $(this).data('perspectiveout') ? $(this).data('perspectiveout') : ls.lt.perspectiveOut;

							// IMPROVEMENT v4.0 Distance (P.level): -1

							var endLeft = parseInt( $(this).css('left') );
							var endTop = parseInt( $(this).css('top') );

							var curSubPLevel = parseInt( $(this).attr('class').split('ls-l')[1] );

							var wh = $(this).outerWidth() > $(this).outerHeight() ? $(this).outerWidth() : $(this).outerHeight();
							var modX = parseInt( curSubRotate ) === 0 ? $(this).outerWidth() : wh;
							var modY = parseInt( curSubRotate ) === 0 ? $(this).outerHeight() : wh;

							if( ( curSubPLevel === -1 && curSubSlideOutDir !== 'new' ) || ( $(this).data('offsetxout') === 'left' || $(this).data('offsetxout') === 'right' ) ){
								if( lml < 0 ){
									lml = ls.g.sliderWidth() - endLeft + ( curSubScaleX / 2 - .5 ) * modX + 100;
								}else if( lml > 0 ){
									lml = - (endLeft + ( curSubScaleX / 2 + .5 ) * modX + 100);
								}
							}

							if( ( curSubPLevel === -1 && curSubSlideOutDir !== 'new' ) || ( $(this).data('offsetyout') === 'top' || $(this).data('offsetyout') === 'bottom' ) ){
								if( lmt < 0 ){
									lmt = ls.g.sliderHeight() - endTop + ( curSubScaleY / 2 - .5 ) * modY + 100;
								}else if( lmt > 0 ){
									lmt = - (endTop + ( curSubScaleY / 2 + .5 ) * modY + 100);
								}
							}

							if( curSubPLevel === -1 || curSubSlideOutDir === 'new' ){
								var curSubPar = 1;
							}else{
								var curSubParMod = ls.g.curLayer.data('parallaxout') ? parseInt(ls.g.curLayer.data('parallaxout')) : ls.o.parallaxOut;
								var curSubPar = curSubPLevel * curSubParMod;
								lml *= -curSubPar;
								lmt *= -curSubPar;
							}

							if( $(this).data('transitiontype') === 'new' ){
								var deO = ls.lt.delayOut;
								var duO = ls.lt.durationOut;
								var eO = ls.lt.easingOut;
							}else{
								var deO = ls.o.delayOut;
								var duO = ls.o.durationOut;
								var eO = ls.o.easingOut;
							}

							var curSubDelay = $(this).data('delayout') ? parseInt($(this).data('delayout')) : deO;
							var curSubTime = $(this).data('durationout') ? parseInt($(this).data('durationout')) : duO;

							// BUGFIX v5.2.0 duration cannot be 0

							if( curSubTime === 0 ){ curSubTime = 1 }
							var curSubEasing = $(this).data('easingout') ? $(this).data('easingout') : eO;

							// On new layer transitions, all sublayer will be slide / fade out in 500ms without any delays

							if(sublayersDurationOut){
								curSubDelay = 0;
								curSubTime = sublayersDurationOut;
								// curSubEasing = 'easeInExpo';
							}

							// Clearing showUntilTimers

							if( $(this).data('showUntilTimer') ){
								clearTimeout( $(this).data('showUntilTimer') );
							}

							var el = $(this);

							var css = {
								transformOrigin : curSubTransformOrigin,
								transformPerspective : curSubPerspective
							};

							var transition = {
								x : lml,
								y : lmt,
								rotation : curSubRotate,
								rotationX : curSubRotateX,
								rotationY : curSubRotateY,
								skewX : curSubSkewX,
								skewY : curSubSkewY,
								scaleX : curSubScaleX,
								scaleY : curSubScaleY,
								delay : curSubDelay/1000,
								ease : curSubEasing,
								onComplete : function() {
									el.data('status', 'forceoutend');
									el.css({visibility: 'hidden', clip: ''});
								}
							};

							if( curSubSlideOutDir == 'fade' || ( !curSubSlideOutDir && curSubSlideDir === 'fade' ) || ( $(this).data('fadeout') !== 'false' && $(this).data('transitiontype') === 'new' ) ){
								transition.opacity = 0;
							}

							if (curSubClip) {
								var ow = $(this).outerWidth(), oh = $(this).outerHeight();
								css.clip = 'rect(0 '+ow+' '+oh+' 0)';
								transition.clip = gsRect(curSubClip, ow, oh);
							}

							var hover = $(this).removeClass('ls-mover').data('hover');
							if (hover) {
								hover.kill();
								var t = this._gsTransform;
								if (t.rotation || t.rotationX || t.rotationY || t.scaleX != 1 || t.scaleY != 1) {
									transition.origin = css.transformOrigin;
									delete css.transformOrigin;
								}
							}

							if( $(this).data('tr') ){
								$(this).data('tr').kill();
							}

							// don't run again the out transition when it has been ended
							if ($(this).data('status') == 'outend') return;
							// update status
							$(this).data('status', 'forceout');

							var splitOut = $(this).is('img, div') ? [] : curSubSplit.split('_');
							// if splittext is enabled for transition out
							if (splitOut[0]) {
								var text = $(this).data('split'),
										ns = text[ splitOut[0] ],
										nodes;
								if (splitOut[1] == 'asc') {
									nodes = ns;
								} else if (splitOut[1] == 'desc') {
									nodes = ns.slice(0).reverse();
								} else if (splitOut[1] == 'rand') {
									nodes = ns.slice(0).sort(function() { return 0.5 - Math.random() });
								} else if (splitOut[1] == 'center') {
									var i, c = Math.floor(ns.length / 2);
									nodes = [ ns[c] ];
									for (i = 1; i <= c; i++) nodes.push(ns[c - i], ns[c + i]);
									nodes.length = ns.length;
								} else if (splitOut[1] == 'edge') {
									var i, c = Math.floor(ns.length / 2);
									nodes = [ ns[0] ];
									for (i = 1; i <= c; i++) nodes.push(ns[ns.length - i], ns[i]);
									nodes.length = ns.length;
								}
								TweenLite.set(nodes, css);
								var tl = new TimelineLite({paused: true, onComplete: transition.onComplete});
								delete transition.onComplete;

								transition.cycle = {};
								if (transition.x.length) {
									transition.cycle.x = transition.x;
									delete transition.x;
								}
								if (transition.y.length) {
									transition.cycle.y = transition.y;
									delete transition.y;
								}

								tl.staggerTo(nodes, curSubTime/1000, transition, curSubShift/1000);
								$(this).data('tr', tl);
								tl.duration(curSubTime/1000);	// fix for call onComplete event before it will be killed
								tl.play();
							}else {
								TweenLite.set(this, css);
								$(this).data('tr', TweenLite.to(this, curSubTime/1000, transition));
							}

						});
					};

					var nextLayer = function(){

						ls.g.nextLayer.delay( curDelay + nextDelay ).animate({
							width : ls.g.sliderWidth(),
							height : ls.g.sliderHeight()
						}, nextDuration, nextEasing );
					};

					var nextSubLayers = function(){

						if( ls.g.totalDuration ){
							curDelay = 0;
						}

						// Needed for the Timeline
						if( typeof ls.o.cbTimeLineStart === 'function' ){
							ls.o.cbTimeLineStart(ls.g, curDelay+nextDelay );
						}

						ls.g.nextLayer.find(' > *[class*="ls-l"]').each(function(){
							var cursub = $(this);
							var nextSubShift = $(this).data('shiftin') ? $(this).data('shiftin') : ls.lt.shiftIn;
							var nextSubSplit = $(this).data('splitin') ? $(this).data('splitin') : ls.lt.splitIn;

							// Replacing global parameters with unique if need
							// NEW FEATURES 5.0.0 added axis-free transitions with offsetx and offsety properties

							if( !$(this).data('transitiontype') ){
								ls.transitionType( $(this) );
							}

							if( $(this).data('transitiontype') === 'new' ){
								var nextSubSlideDir = 'new';
							}else{
								var nextSubSlideDir = $(this).data('slidedirection') ? $(this).data('slidedirection') : slideDirection;
							}
							var lml, lmt;

							switch(nextSubSlideDir){
								case 'left':
									lml = -ls.g.sliderWidth();
									lmt = 0;
									break;
								case 'right':
									lml = ls.g.sliderWidth();
									lmt = 0;
									break;
								case 'top':
									lmt = -ls.g.sliderHeight();
									lml = 0;
									break;
								case 'bottom':
									lmt = ls.g.sliderHeight();
									lml = 0;
									break;
								case 'fade':
									lmt = 0;
									lml = 0;
									break;
								case 'new':
									var xin = $(this).data('offsetxin');
									if( xin ){
										var cycle = xin.trim().split(/[,\s]+/);
										$.each(cycle, function(i, xin) {
											if( xin === 'left' ){
												cycle[i] = -ls.g.sliderWidth();
											}else if( xin === 'right' ){
												cycle[i] = ls.g.sliderWidth();
											}else{
												cycle[i] = xin.indexOf('%') < 0 ? parseInt(xin) * ls.g.ratio : parseFloat(xin) / 100 * cursub.outerWidth();
											}
										});
										lml = nextSubSplit && cycle.length > 1 ? cycle : cycle[0];
									}else{
										lml = ls.lt.offsetXIn;
									}
									var yin = $(this).data('offsetyin');
									if( yin ){
										var cycle = yin.trim().split(/[,\s]+/);
										$.each(cycle, function(i, yin) {
											if( yin === 'top' ){
												cycle[i] = -ls.g.sliderHeight();
											}else if( yin === 'bottom' ){
												cycle[i] = ls.g.sliderHeight();
											}else{
												cycle[i] = yin.indexOf('%') < 0 ? parseInt(yin) * ls.g.ratio : parseFloat(yin) / 100 * cursub.outerHeight();
											}
										});
										lmt = nextSubSplit && cycle.length > 1 ? cycle : cycle[0];
									}else{
										lmt = ls.lt.offsetYIn;
									}
									break;
							}

							// NEW FEATURE v4.5.0 Rotating & Scaling sublayers
							// BUGFIX v4.5.5 changing the default value from 0 to 'none' (because of old jQuery, 1.7.2)
							// NEW FEATURES v5.0.0 Added SkewX, SkewY, ScaleX, ScaleY, RotateX & RotateY transitions

							var nextSubRotate, nextSubRotateX, nextSubRotateY, nextSubScale, nextSubSkewX, nextSubSkewY, nextSubScaleX, nextSubScaleY, nextSubClip;
							nextSubRotate = $(this).data('rotatein') ? $(this).data('rotatein') : ls.lt.rotateIn;
							nextSubRotateX = $(this).data('rotatexin') ? $(this).data('rotatexin') : ls.lt.rotateXIn;
							nextSubRotateY = $(this).data('rotateyin') ? $(this).data('rotateyin') : ls.lt.rotateYIn;
							nextSubScale = $(this).data('scalein') ? $(this).data('scalein') : ls.lt.scaleIn;
							nextSubSkewX = $(this).data('skewxin') ? $(this).data('skewxin') : ls.lt.skewXIn;
							nextSubSkewY = $(this).data('skewyin') ? $(this).data('skewyin') : ls.lt.skewYIn;
							if( nextSubScale === 1 ){
								nextSubScaleX = $(this).data('scalexin') ? $(this).data('scalexin') : ls.lt.scaleXIn;
								nextSubScaleY = $(this).data('scaleyin') ? $(this).data('scaleyin') : ls.lt.scaleYIn;
							}else{
								nextSubScaleX = nextSubScaleY = nextSubScale;
							}
							nextSubClip = $(this).data('clipin') ? $(this).data('clipin') : ls.lt.clipIn;

							var toi = $(this).data('transformoriginin') ? $(this).data('transformoriginin').split(' ') : ls.lt.transformOriginIn;
							for(var t =0;t<toi.length;t++){
								if( toi[t].indexOf('%') === -1 && toi[t].indexOf('left') !== -1 && toi[t].indexOf('right') !== -1 && toi[t].indexOf('top') !== -1 && toi[t].indexOf('bottom') !== -1 ){
									toi[t] = '' + parseInt( toi[t] ) * ls.g.ratio + 'px';
								}
							}
							var nextSubTransformOrigin = toi.join(' ');
							var nextSubPerspective = $(this).data('perspectivein') ? $(this).data('perspectivein') : ls.lt.perspectiveIn;

							// IMPROVEMENT v4.0 Distance (P.level): -1

							var endLeft = parseInt( $(this).css('left') );
							var endTop = parseInt( $(this).css('top') );

							var nextSubPLevel = parseInt( $(this).attr('class').split('ls-l')[1] );

							// BUGFIX v5.0.1 Fixed the starting position of layers with percentage value of width

							if( $(this)[0].style.width.indexOf('%') !== -1 ){
								$(this).css({
									width: ls.g.sliderWidth() / 100 * parseInt( $(this)[0].style.width )
								});
							}

							var wh = $(this).outerWidth() > $(this).outerHeight() ? $(this).outerWidth() : $(this).outerHeight();
							var modX = parseInt( nextSubRotate ) === 0 ? $(this).outerWidth() : wh;
							var modY = parseInt( nextSubRotate ) === 0 ? $(this).outerHeight() : wh;

							if( ( nextSubPLevel === -1 && nextSubSlideDir !== 'new' ) || ( $(this).data('offsetxin') === 'left' || $(this).data('offsetxin') === 'right' ) ){

								if( lml < 0 ){
									lml = - ( endLeft + ( nextSubScaleX / 2 + .5 ) * modX + 100  );
								}else if( lml > 0 ){
									lml = ls.g.sliderWidth() - endLeft + ( nextSubScaleX / 2 - .5 ) * modX + 100;
								}
							}

							if( ( nextSubPLevel === -1 && nextSubSlideDir !== 'new' ) || ( $(this).data('offsetyin') === 'top' || $(this).data('offsetyin') === 'bottom' ) ){

								if( lmt < 0 ){
									lmt = - ( endTop + ( nextSubScaleY / 2 + .5 ) * modY + 100  );
								}else if( lmt > 0 ){
									lmt = ls.g.sliderHeight() - endTop + ( nextSubScaleY / 2 - .5 ) * modY + 100;
								}
							}

							if( nextSubPLevel === -1 || nextSubSlideDir === 'new'){
								var nextSubPar = 1;
							}else{
								var nextSubParMod = ls.g.nextLayer.data('parallaxin') ? parseInt(ls.g.nextLayer.data('parallaxin')) : ls.o.parallaxIn;
								var nextSubPar = nextSubPLevel * nextSubParMod;
								lml *= nextSubPar;
								lmt *= nextSubPar;
							}

							if( $(this).data('transitiontype') === 'new' ){
								var deI = ls.lt.delayIn;
								var duI = ls.lt.durationIn;
								var eI = ls.lt.easingIn;
							}else{
								var deI = ls.o.delayIn;
								var duI = ls.o.durationIn;
								var eI = ls.o.easingIn;
							}

							var nextSubDelay = $(this).data('delayin') ? parseInt($(this).data('delayin')) : deI;
							var nextSubTime = $(this).data('durationin') ? parseInt($(this).data('durationin')) : duI;
							var nextSubEasing = $(this).data('easingin') ? $(this).data('easingin') : eI;

							var nextSubCallback = function(){

								// BUGFIX v5.1.0 Removing transition property from video layers

								if( cursub.hasClass('ls-video-layer') ){
									cursub.addClass('ls-videohack');
								}

								// NEW FEATURE v2.0 autoPlayVideos

								if( ls.o.autoPlayVideos == true ){

									// YouTube & Vimeo videos

									cursub.find('.ls-videopreview').click();

									// HTML5 videos

									cursub.find('video, audio').each(function(){
										if( typeof this.currentTime !== 0){
											this.currentTime = 0;
										}
										$(this).click();
									});
								}

								// NEW FEATURE v3.0 showUntil sublayers
								// IMPROVEMENT v5.2.0 video layers with auto play will skip showuntil feature

								if( ( !cursub.hasClass('ls-video-layer') || ( cursub.hasClass('ls-video-layer') && ls.o.autoPlayVideos === false ) ) && cursub.data('showuntil') > 0 ){

									// IMPROVEMENT v4.5.0 sublayerShowUntil will be called anly if necessary

									cursub.data('showUntilTimer', setTimeout(function(){
										ls.sublayerShowUntil( cursub );
									}, cursub.data('showuntil') ));
								}
							};

							if (ls.o.parallaxType != 'scroll') {
								$(this).css({ marginLeft: 0, marginTop: 0 });
							}

							var css = {
								visibility : 'visible',
								opacity: $(this).data( 'originalOpacity' ),
								transformPerspective : nextSubPerspective,
								transformOrigin : nextSubTransformOrigin,
								x : lml,
								y : lmt,
								rotation: parseFloat(nextSubRotate), // !!! skewY bug (try from instead of fromTo)
								rotationX : nextSubRotateX,
								rotationY : nextSubRotateY,
								skewX : nextSubSkewX,
								skewY : nextSubSkewY,
								scaleX : nextSubScaleX,
								scaleY : nextSubScaleY
							};

							var transition = {
								css: {
									x : 0,
									y : 0,
									rotation : 0,
									rotationX : 0,
									rotationY : 0,
									skewX : 0,
									skewY : 0,
									scaleX : 1,
									scaleY : 1
								},
								ease : nextSubEasing,
								delay : nextSubDelay/1000,
								onComplete : function() {
									cursub.data('status', 'inend');
									cursub.css('clip', '');
									this.vars.triggerHover && this.vars.triggerHover();
									nextSubCallback();
								}
							};

							if( nextSubSlideDir.indexOf('fade') != -1 || ( $(this).data('fadein') !== 'false' && $(this).data('transitiontype') === 'new' ) ){
								css['opacity'] = 0;
								transition.css['opacity'] = $(this).data( 'originalOpacity' );
							}

							if (nextSubClip) {
								var ow = cursub.outerWidth(), oh = cursub.outerHeight();
								css.clip = gsRect(nextSubClip, ow, oh);
								transition.css.clip = 'rect(0 '+ow+' '+oh+' 0)';
							}

							// init hover
							if (cursub.data('enablehover') == 1 || cursub.data('enablehover') == 'true') {
								cursub.addClass('ls-mover')
							}

							if( $(this).data('tr') ){
								$(this).data('tr').kill();
							}

							// disable splittext in case of img / div
							var splitIn = [],  splitOut = [];
							if (!$(this).is('img, div')) {
								// split text: use splitIn and splitOut values for split type
								splitIn = nextSubSplit.split('_'),
								splitOut = (cursub.data('splitout') || ls.lt.splitOut).split('_');
								if (!$(this).data('split') && (splitIn[0] || splitOut[0])) {
									var stype = {};
									stype[ splitIn[0] ] = stype[ splitOut[0] ] = true;
									if (stype.chars) stype.words = true; // !!! layout fix for animated chars
									$(this).data('split', new SplitType(this, { split: Object.keys(stype).join() }));
								}
							}

							var reset = {visibility: '', opacity: '', clip: ''};
							reset[gsTransform] = '';

							// update status
							$(this).data('status', 'in');


							// if split text is enabled for transition in
							if (splitIn[0]) {
								var text = $(this).data('split'),
										ns = text[ splitIn[0] ],
										nodes;
								if (splitIn[1] == 'asc') {
									nodes = ns;
								} else if (splitIn[1] == 'desc') {
									nodes = ns.slice(0).reverse();
								} else if (splitIn[1] == 'rand') {
									nodes = ns.slice(0).sort(function() {return 0.5 - Math.random()});
								} else if (splitIn[1] == 'center') {
									var i, c = Math.floor(ns.length / 2);
									nodes = [ ns[c] ];
									for (i = 1; i <= c; i++) nodes.push(ns[c - i], ns[c + i]);
									nodes.length = ns.length;
								} else if (splitIn[1] == 'edge') {
									var i, c = Math.floor(ns.length / 2);
									nodes = [ ns[0] ];
									for (i = 1; i <= c; i++) nodes.push(ns[ns.length - i], ns[i]);
									nodes.length = ns.length;
								}

								// is it necessary? $(nodes).css('visibility', 'hidden') // blink fix for slower devices

								this.style.opacity = transition.css.opacity;
								transition.css.opacity = 1;
								var tl = new TimelineLite({paused: true, onComplete: transition.onComplete});
								delete transition.onComplete;

								// Cycle support for splitText
								css.cycle = {};
								if (css.x.length) {
									css.cycle.x = css.x;
									delete css.x;
								}
								if (css.y.length) {
									css.cycle.y = css.y;
									delete css.y;
								}
								// reset splitText CSS
								if (splitIn[0] || splitOut[0]) {
									$('.line, .word, .char', this).add(this).css(reset).each(function() { delete this._gsTransform });
								}
								tl.staggerFromTo(nodes, nextSubTime/1000, css, transition, nextSubShift/1000);
								$(this).data('tr', tl);
								tl.play();
							}
							else {
								// reset splitText CSS
								if (splitIn[0] || splitOut[0]) {
									$('.line, .word, .char', this).css(reset).each(function() { delete this._gsTransform });
								}
								$(this).data('tr', TweenLite.fromTo(this, nextSubTime/1000, css, transition) );
							}
						});

						if (ls.o.parallaxType == 'scroll') {
							ls.onscroll();
						}
					};

			/* NEW FEATURE v4.0 2D & 3D Layer Transitions */

					// Selecting ONE transition (random)
					// If the browser doesn't support CSS3 3D, 2D fallback mode will be used instead
					// In this case, if user didn't specify any 2D transitions, a random will be selected

					var selectTransition = function(){

						// fix for random 2D & 3D transitions
						var D = [];
						if ( ls.g.nextLayer.data('transition3d') || ls.g.nextLayer.data('customtransition3d') ){
							D.push(3);
						}
						if ( ls.g.nextLayer.data('transition2d') || ls.g.nextLayer.data('customtransition2d') || !lsSupport3D( $(el) ) ) {
							D.push(2);
						}
						if (D.length == 1) {
							D.push(D[0]);
						}
						if( D[Math.floor(Math.random() * 2)] == 3 ){

							if( ls.g.nextLayer.data('transition3d') && ls.g.nextLayer.data('customtransition3d') ){
								var rnd = Math.floor(Math.random() * 2);
								var rndT = [['3d',ls.g.nextLayer.data('transition3d')],['custom3d',ls.g.nextLayer.data('customtransition3d')]];
								getTransitionType(rndT[rnd][0],rndT[rnd][1]);
							}else if( ls.g.nextLayer.data('transition3d') ){
								getTransitionType('3d',ls.g.nextLayer.data('transition3d'));
							}else{
								getTransitionType('custom3d',ls.g.nextLayer.data('customtransition3d'));
							}

						}else{

							if( ls.g.nextLayer.data('transition2d') && ls.g.nextLayer.data('customtransition2d') ){
								var rnd = Math.floor(Math.random() * 2);
								var rndT = [['2d',ls.g.nextLayer.data('transition2d')],['custom2d',ls.g.nextLayer.data('customtransition2d')]];
								getTransitionType(rndT[rnd][0],rndT[rnd][1]);
							}else if( ls.g.nextLayer.data('transition2d') ){
								getTransitionType('2d',ls.g.nextLayer.data('transition2d'));
							}else if( ls.g.nextLayer.data('customtransition2d') ){
								getTransitionType('custom2d',ls.g.nextLayer.data('customtransition2d'));
							}else{
								getTransitionType('2d','1');
							}
						}
					};

					// Needed by the demo page

					var selectCustomTransition = function(){

						if( lsSupport3D( $(el) ) && LSCustomTransition.indexOf('3d') != -1 ){
							getTransitionType('3d',LSCustomTransition.split(':')[1]);
						}else{
							if( LSCustomTransition.indexOf('3d') != -1){
								getTransitionType('2d','all');
							}else{
								getTransitionType('2d',LSCustomTransition.split(':')[1]);
							}
						}
					};

					// Choosing layer transition type (2d, 3d, or both)

					var getTransitionType = function(type,transitionlist){

						var tr = type.indexOf('custom') == -1 ? ls.t : ls.ct;
						var tt = '3d', lt, number;

						if( type.indexOf('2d') != -1 ){
							tt = '2d';
						}

						if( transitionlist.indexOf('last') != -1 ){
							number = tr['t'+tt].length-1;
							lt = 'last';
						}else if( transitionlist.indexOf('all') != -1){
							number = Math.floor(Math.random() * lsCountProp(tr['t'+tt]) );
							lt = 'random from all';
						}else{
							var t = transitionlist.split(',');
							var l = t.length;
							number = parseInt(t[Math.floor(Math.random() * l)])-1;
							lt = 'random from specified';
						}

						slideTransition(tt,tr['t'+tt][number]);

//						$('.test').html('Originals:<br><br>t3D: '+ls.g.nextLayer.data('transition3d')+'<br>t2D: '+ls.g.nextLayer.data('transition2d')+'<br>custom3D: '+ls.g.nextLayer.data('customtransition3d')+'<br>custom2D: '+ls.g.nextLayer.data('customtransition2d')+'<br><br>Support 3D: '+lsSupport3D( $(el) )+'<br><br>Selected transition:<br><br>Type: '+type+' ('+lt+')<br>Number in transition list: '+(number+1)+'<br>Name of the transition: '+tr['t'+tt][number]['name']);
					};

					// The slideTransition function

					var slideTransition = function(type,prop){

						var inner = ls.g.i;

						// sublayersDurationOut - for future usage

						var sublayersDurationOut = ls.g.curLayer.find('*[class*="ls-l"]').length > 0 ? 1000 : 0;

						// Detecting a carousel transition - Transition name must have the carousel string

						var carousel = prop.name.toLowerCase().indexOf('carousel') == -1 ? false : true;

						// Detecting a crossfade transition - Transition name must have the crossfad string

						var crossfade = prop.name.toLowerCase().indexOf('crossfad') == -1 ? false : true;

						// Calculating cols and rows

						var cols = typeof(prop.cols);
						var rows = typeof(prop.rows);

						switch( cols ){
							case 'number':
								cols = prop.cols;
							break;
							case 'string':
								cols = Math.floor( Math.random() * ( parseInt( prop.cols.split(',')[1] ) - parseInt( prop.cols.split(',')[0] ) + 1) ) + parseInt( prop.cols.split(',')[0] );
							break;
							default:
								cols = Math.floor( Math.random() * ( prop.cols[1] - prop.cols[0] + 1) ) + prop.cols[0];
							break;
						}

						switch( rows ){
							case 'number':
								rows = prop.rows;
							break;
							case 'string':
								rows = Math.floor( Math.random() * ( parseInt( prop.rows.split(',')[1] ) - parseInt( prop.rows.split(',')[0] ) + 1) ) + parseInt( prop.rows.split(',')[0] );
							break;
							default:
								rows = Math.floor( Math.random() * ( prop.rows[1] - prop.rows[0] + 1) ) + prop.rows[0];
							break;
						}

						if( ( ls.g.isMobile() == true && ls.o.optimizeForMobile == true ) || ( ls.g.ie78 && ls.o.optimizeForIE78 == true ) ){

							// Reducing cols in three steps

							if( cols >= 15 ){
								cols = 7;
							}else if( cols >= 5 ){
								cols = 4;
							}else if( cols >= 4 ){
								cols = 3;
							}else if( cols > 2 ){
								cols = 2;
							}

							// Reducing rows in three steps

							if( rows >= 15 ){
								rows = 7;
							}else if( rows >= 5 ){
								rows = 4;
							}else if( rows >= 4 ){
								rows = 3;
							}else if( rows > 2 ){
								rows = 2;
							}

							// Reducing more :)

							if( rows > 2 && cols > 2 ){
								rows = 2;
								if( cols > 4){
									cols = 4;
								}
							}
						}

						var tileWidth = ls.g.i.width() / cols;
						var tileHeight = ls.g.i.height() / rows;

						// Init HTML markup for layer transitions

						ls.g.ltContainer.stop(true,true).empty().css({
							display : 'block',
							width : inner.width(),
							height : inner.height()
						});

						// Setting size

						var restW = inner.width() - Math.floor(tileWidth) * cols;
						var restH = inner.height() - Math.floor(tileHeight) * rows;

						var tileSequence = [];

						// IMPROVEMENT v4.1.3 Array-randomizer is now a local function
						// Randomize array function

						tileSequence.randomize = function() {
						  var i = this.length, j, tempi, tempj;
						  if ( i == 0 ) return false;
						  while ( --i ) {
						     j       = Math.floor( Math.random() * ( i + 1 ) );
						     tempi   = this[i];
						     tempj   = this[j];
						     this[i] = tempj;
						     this[j] = tempi;
						  }
						  return this;
						}

						for(var ts=0; ts<cols * rows; ts++){
							tileSequence.push(ts);
						}

						// Setting the sequences of the transition

						switch( prop.tile.sequence ){
							case 'reverse':
								tileSequence.reverse();
							break;
							case 'col-forward':
								tileSequence = lsOrderArray(rows,cols,'forward');
							break;
							case 'col-reverse':
								tileSequence = lsOrderArray(rows,cols,'reverse');
							break;
							case 'random':
								tileSequence.randomize();
							break;
						}

						var curBG = ls.g.curLayer.find('.ls-bg');
						var nextBG = ls.g.nextLayer.find('.ls-bg');

						// IMPROVEMENT v4.6.0 If current and next layer both have no BG, skipping the slide transition

						if( curBG.length == 0 && nextBG.length == 0 ){
							type = '2d';
							prop = $.extend(true, {}, ls.t['t2d'][0]);
							prop.transition.duration = 1
							prop.tile.delay = 0;
						}

						if( type == '3d' ){
							ls.g.totalDuration = ((cols * rows) - 1) * prop.tile.delay;

							var stepDuration = 0;

							if( prop.before && prop.before.duration ){
								stepDuration += prop.before.duration;
							}
							if( prop.animation && prop.animation.duration ){
								stepDuration += prop.animation.duration;
							}
							if( prop.after && prop.after.duration ){
								stepDuration += prop.after.duration;
							}

							ls.g.totalDuration += stepDuration;

							var stepDelay = 0;

							if( prop.before && prop.before.delay ){
								stepDelay += prop.before.delay;
							}
							if( prop.animation && prop.animation.delay ){
								stepDelay += prop.animation.delay;
							}
							if( prop.after && prop.after.delay ){
								stepDelay += prop.after.delay;
							}

							ls.g.totalDuration += stepDelay;

						}else{
							ls.g.totalDuration = ((cols * rows) - 1) * prop.tile.delay + prop.transition.duration;

							// IMPROVEMENT v4.5.0 Creating separated containers for current and next tiles

							ls.g.curTiles = $('<div>').addClass('ls-curtiles').appendTo( ls.g.ltContainer );
							ls.g.nextTiles = $('<div>').addClass('ls-nexttiles').appendTo( ls.g.ltContainer );
						}

						var pn = ls.g.prevNext;

						// Creating cuboids for 3d or tiles for 2d transition (cols * rows)

						for(var tiles=0; tiles < cols * rows; tiles++){

							var rW = tiles%cols == 0 ? restW : 0;
							var rH = tiles > (rows-1)*cols-1 ? restH : 0;

							var tile = $('<div>').addClass('ls-lt-tile').css({
								width : Math.floor(tileWidth) + rW,
								height : Math.floor(tileHeight) + rH
							}).appendTo( ls.g.ltContainer );

							var curTile, nextTile;

							// If current transition is a 3d transition

							if( type == '3d' ){

								tile.addClass('ls-3d-container');

								var W = Math.floor(tileWidth) + rW;
								var H = Math.floor(tileHeight) + rH;
								var D;

								if( prop.animation.direction == 'horizontal' ){
									if( Math.abs(prop.animation.transition.rotateY) > 90 && prop.tile.depth != 'large' ){
										D = Math.floor( W / 7 ) + rW;
									}else{
										D = W;
									}
								}else{
									if( Math.abs(prop.animation.transition.rotateX) > 90 && prop.tile.depth != 'large' ){
										D = Math.floor( H / 7 ) + rH;
									}else{
										D = H;
									}
								}

								var W2 = W/2;
								var H2 = H/2;
								var D2 = D/2;

								// createCuboids function will append cuboids with their style settings to their container

								var createCuboids = function(c,a,w,h,tx,ty,tz,rx,ry){
									TweenLite.set($('<div>'), {
										width: w, height: h,
										x: tx, y: ty, z: tz,
										rotationX: rx, rotationY: ry
									}).target.addClass(c).appendTo(a);
								};

								createCuboids('ls-3d-box',tile,0,0,0,0,-D2,0,0);

								var backRotX = 0
								var topRotX = 0
								var bottomRotX = 0

								if( prop.animation.direction == 'vertical' && Math.abs(prop.animation.transition.rotateX) > 90){
									createCuboids('ls-3d-back',tile.find('.ls-3d-box'),W,H,-W2,-H2,-D2,180,0);
								}else{
									createCuboids('ls-3d-back',tile.find('.ls-3d-box'),W,H,-W2,-H2,-D2,0,180);
								}

								createCuboids('ls-3d-bottom',tile.find('.ls-3d-box'),W,D,-W2,H2-D2,0,-90,0);
								createCuboids('ls-3d-top',tile.find('.ls-3d-box'),W,D,-W2,-H2-D2,0,90,0);
								createCuboids('ls-3d-front',tile.find('.ls-3d-box'),W,H,-W2,-H2,D2,0,0);
								createCuboids('ls-3d-left',tile.find('.ls-3d-box'),D,H,-W2-D2,-H2,0,0,-90);
								createCuboids('ls-3d-right',tile.find('.ls-3d-box'),D,H,W2-D2,-H2,0,0,90);

								curTile = tile.find('.ls-3d-front');

								if( prop.animation.direction == 'horizontal' ){
									if( Math.abs(prop.animation.transition.rotateY) > 90 ){
										nextTile = tile.find('.ls-3d-back');
									}else{
										nextTile = tile.find('.ls-3d-left, .ls-3d-right');
									}
								}else{
									if( Math.abs(prop.animation.transition.rotateX) > 90 ){
										nextTile = tile.find('.ls-3d-back');
									}else{
										nextTile = tile.find('.ls-3d-top, .ls-3d-bottom');
									}
								}

								// Animating cuboids

								var curCubDelay = tileSequence[tiles] * prop.tile.delay;

								var curCub = ls.g.ltContainer.find('.ls-3d-container:eq('+tiles+') .ls-3d-box');

								var tl = new TimelineLite();

								if( prop.before && prop.before.transition ){
									prop.before.transition.delay = prop.before.transition.delay ? (prop.before.transition.delay + curCubDelay)/1000 : curCubDelay/1000;
									tl.to( curCub[0],prop.before.duration/1000,lsConvertTransition( prop.before.transition, prop.before.easing ));
								}else{
									prop.animation.transition.delay = prop.animation.transition.delay ? (prop.animation.transition.delay + curCubDelay)/1000 : curCubDelay/1000;
								}

								tl.to( curCub[0],prop.animation.duration/1000,lsConvertTransition( prop.animation.transition, prop.animation.easing ));

								if( prop.after ){
									if( !prop.after.transition ){
										prop.after.transition = {};
									}
									tl.to( curCub[0],prop.after.duration/1000,lsConvertTransition( prop.after.transition, prop.after.easing, 'after' ));
								}

							}else{

								// If current transition is a 2d transition

								var T1 = L1 = T2 = L2 = 'auto';
								var O1 = O2 = 1;

								if( prop.transition.direction == 'random' ){
									var dir = ['top','bottom','right','left'];
									var direction = dir[Math.floor(Math.random() * dir.length )];
								}else{
									var direction = prop.transition.direction;
								}

								// IMPROVEMENT v4.5.0 Reversing animation directions if slider is moving backwards

								if( prop.name.toLowerCase().indexOf('mirror') != -1 && tiles%2 == 0 ){
									if( pn == 'prev' ){
										pn = 'next';
									}else{
										pn = 'prev';
									}
								}

								if( pn == 'prev' ){

									switch( direction ){
										case 'top':
											direction = 'bottom';
										break;
										case 'bottom':
											direction = 'top';
										break;
										case 'left':
											direction = 'right';
										break;
										case 'right':
											direction = 'left';
										break;
										case 'topleft':
											direction = 'bottomright';
										break;
										case 'topright':
											direction = 'bottomleft';
										break;
										case 'bottomleft':
											direction = 'topright';
										break;
										case 'bottomright':
											direction = 'topleft';
										break;
									}
								}

								switch( direction ){
									case 'top':
										T1 = T2 = -tile.height();
										L1 = L2 = 0;
									break;
									case 'bottom':
										T1 = T2 = tile.height();
										L1 = L2 = 0;
									break;
									case 'left':
										T1 = T2 = 0;
										L1 = L2 = -tile.width();
									break;
									case 'right':
										T1 = T2 = 0;
										L1 = L2 = tile.width();
									break;
									case 'topleft':
										T1 = tile.height();
										T2 = 0;
										L1 = tile.width();
										L2 = 0;
									break;
									case 'topright':
										T1 = tile.height();
										T2 = 0;
										L1 = - tile.width();
										L2 = 0;
									break;
									case 'bottomleft':
										T1 = - tile.height();
										T2 = 0;
										L1 = tile.width();
										L2 = 0;
									break;
									case 'bottomright':
										T1 = - tile.height();
										T2 = 0;
										L1 = - tile.width();
										L2 = 0;
									break;
								}

								ls.g.scale2D = prop.transition.scale ? prop.transition.scale : 1;

								if( carousel == true && ls.g.scale2D != 1 ){

									T1 = T1 / 2;
									T2 = T2 / 2;
									L1 = L1 / 2;
									L2 = L2 / 2;
								}

								// Selecting the type of the transition

//								if( !ls.g.ie78 || ( ls.g.ie78 && !ls.o.optimizeForIE78 ) ||  ( ls.g.ie78 && ls.o.optimizeForIE78 == true && prop.name.toLowerCase().indexOf('crossfade') != -1 ) ){
									switch( prop.transition.type ){
										case 'fade':
											T1 = T2 = L1 = L2 = 0;
											O1 = 0;
											O2 = 1;
										break;
										case 'mixed':
										O1 = 0;
										O2 = 1;
										if( ls.g.scale2D == 1 ){
											T2 = L2 = 0;
										}
										break;
									}
//								}

								// IMPROVEMENT v4.5.0 Implemented Rotation and Scale into 2D Transitions

								if((( prop.transition.rotate || prop.transition.rotateX || prop.transition.rotateY ) || ls.g.scale2D != 1 ) && !ls.g.ie78 && prop.transition.type != 'slide' ){
									tile.css({
										overflow : 'visible'
									});
								}else{
									tile.css({
										overflow : 'hidden'
									});
								}

								if( carousel == true){
									ls.g.curTiles.css({
										overflow: 'visible'
									});
								}else{
									ls.g.curTiles.css({
										overflow: 'hidden'
									});
								}

								if( crossfade == true || prop.transition.type == 'slide' || carousel == true ){
									var tileInCur = tile.appendTo( ls.g.curTiles );
									var tileInNext = tile.clone().appendTo( ls.g.nextTiles );
									curTile = $('<div>').addClass('ls-curtile').appendTo( tileInCur );
								}else{
									var tileInNext = tile.appendTo( ls.g.nextTiles );
								}

								nextTile = TweenLite.set($('<div>'), {
									x : -L1,
									y : -T1,
									opacity : O1
								}).target.addClass('ls-nexttile').appendTo( tileInNext );

								// Animating tiles

								var curTileDelay = tileSequence[tiles] * prop.tile.delay;

								// IMPROVEMENT v4.5.0 Implemented various types of rotations into 2D Transitions

								var r = prop.transition.rotate ? prop.transition.rotate : 0;
								var rX = prop.transition.rotateX ? prop.transition.rotateX : 0;
								var rY = prop.transition.rotateY ? prop.transition.rotateY : 0;

								// Reversing rotation degrees if slider is moving backwards

								if( pn == 'prev' ){
									r = -r;
									rX = -rX;
									rY = -rY;
								}

								TweenLite.fromTo(nextTile[0],prop.transition.duration/1000,{
									rotation : r,
									rotationX : rX,
									rotationY : rY,
									scale : ls.g.scale2D
								},{
									delay : curTileDelay / 1000,
									x : 0,
									y : 0,
									opacity : O2,
									rotation : 0,
									rotationX : 0,
									rotationY : 0,
									scale : 1,
									ease : prop.transition.easing
								});

								// IMPROVEMENT v5.0.0 Smart crossfading for semi-transparent PNG and different size JPG backgrounds

								if(
									crossfade == true && (
										nextBG.length < 1 || (
											nextBG.length > 0 && (
												nextBG.attr('src').toLowerCase().indexOf('png') != -1 || (
													nextBG.width() < ls.g.sliderWidth() || nextBG.height() < ls.g.sliderHeight()
												)
											)
										)
									)
								){
									TweenLite.to(curTile[0],prop.transition.duration/1000,{
										delay : curTileDelay / 1000,
										opacity : 0,
										ease : prop.transition.easing
									});
								}

								if( ( prop.transition.type == 'slide' || carousel == true ) && prop.name.toLowerCase().indexOf('mirror') == -1 ){

									var r2 = 0;

									if( r != 0 ){
										r2 = -r;
									}

									TweenLite.to(curTile[0],prop.transition.duration/1000,{
										delay : curTileDelay / 1000,
										x : L2,
										y : T2,
										rotation : r2,
										scale : ls.g.scale2D,
										opacity: O1,
										ease : prop.transition.easing
									});
								}
							}

							// Appending the background images of current and next layers into the tiles on both of 2d & 3d transitions
							// BUGFIX v5.0.0 added Math.floor to prevent '1px bug' under Safari and Firefox

							if( curBG.length ){
								if( type == '3d' || ( type == '2d' && ( crossfade == true || prop.transition.type == 'slide' || carousel == true ) ) ){
									var tilePos = tile.position();
									curTile.append($('<img>').attr('src', curBG.attr('src')).css({
										width : curBG[0].style.width,
										height : curBG[0].style.height,
										marginLeft : parseFloat(curBG.css('margin-left')) - tilePos.left,
										marginTop : parseFloat(curBG.css('margin-top')) - tilePos.top
									}));
								}else if( ls.g.curTiles.children().length == 0 ){
									ls.g.curTiles.append($('<img>').attr('src', curBG.attr('src')).css({
										width : curBG[0].style.width,
										height : curBG[0].style.height,
										marginLeft : parseFloat(curBG.css('margin-left')),
										marginTop : parseFloat(curBG.css('margin-top'))
									}));

								}
							}

							if( nextBG.length ){
								var tilePos = tile.position();
								nextTile.append($('<img>').attr('src', nextBG.attr('src') ).css({
									width : nextBG[0].style.width,
									height : nextBG[0].style.height,
									marginLeft : parseFloat(nextBG.css('margin-left')) - tilePos.left,
									marginTop : parseFloat(nextBG.css('margin-top')) - tilePos.top
								}));
							}
						}

						// Storing current and next layer elements in a local variable (needed by setTimeout functions in some cases)

						var curLayer = ls.g.curLayer;
						var nextLayer = ls.g.nextLayer;

						// Hiding the background image of the current and next layers (immediately)

						setTimeout(function(){
							curLayer.find('.ls-bg').css({
								visibility : 'hidden'
							});
						},50);

						nextLayer.find('.ls-bg').css({
							visibility : 'hidden'
						});
						ls.g.ltContainer.removeClass('ls-overflow-hidden');

						// Sliding out the sublayers of the current layer
						// (immediately, delay out and duration out properties are not applied to the sublayers during the new layer transitions)

						curSubLayers(sublayersDurationOut);

						// BUGFIX v5.2.0 prevents background flickering in some cases

						if( sublayersDurationOut === 0 ){
							sublayersDurationOut = 10;
						}

						// Hiding current layer after its sublayers animated out

						setTimeout(function(){
							curLayer.css({
								width: 0
							});
						}, sublayersDurationOut );

						// Calculating next layer delay

						var nextLayerTimeShift = parseInt(nextLayer.data('timeshift')) ? parseInt(nextLayer.data('timeshift')) : 0;
						var nextLayerDelay = ls.g.totalDuration + nextLayerTimeShift > 0 ? ls.g.totalDuration + nextLayerTimeShift : 0;

						// Showing next layer and sliding sublayers of the next layer in after the current layer transition ended

						setTimeout(function(){
							if( ls.g.resize == true ){
								ls.g.ltContainer.empty();
								curLayer.removeClass('ls-active');
								ls.makeResponsive( nextLayer, function(){
									ls.g.resize = false;
								});
							}

							// Sliding in / fading in the sublayers of the next layer

							nextSubLayers();

							// NEW FEATURE v4.6.0 Hiding background if the next layer has png BG or has no BG
							// BUGFIX v4.6.1 Changed some properties to prevent flickering

							if( nextLayer.find('.ls-bg').length < 1 || ( nextLayer.find('.ls-bg').length > 0 && nextLayer.find('.ls-bg').attr('src').toLowerCase().indexOf('png') != -1 ) ){

								ls.g.ltContainer.delay(350).fadeOut(300,function(){
									$(this).empty().show();
								});
							}

							// Displaying the next layer (immediately)

							nextLayer.css({
								width : ls.g.sliderWidth(),
								height : ls.g.sliderHeight()
							});
						}, nextLayerDelay );

						// BUGFIX v5.0.1 Added a minimal value of ls.g.totalDuration
						// CHANGED in v5.1.0 due to a fading issue in carousel transition

						if( ls.g.totalDuration < 300 ){
							ls.g.totalDuration = 1000;
						}

						// Changing visibility to visible of the background image of the next layer and overflow to hidden of .ls-lt-container after the transition and calling callback function

						setTimeout(function(){
							ls.g.ltContainer.addClass('ls-overflow-hidden');

							nextLayer.addClass('ls-active');

							if( nextLayer.find('.ls-bg').length ){

								nextLayer.find('.ls-bg').css({
									display : 'none',
									visibility : 'visible'
								});
								if( ls.g.ie78 ){
									nextLayer.find('.ls-bg').css('display','block');
									setTimeout(function(){
										curLayerCallback();
									},500);
								}else{
									nextLayer.find('.ls-bg').fadeIn(500, function(){
										curLayerCallback();
									});
								}
							}else{
								curLayerCallback();
							}

						}, ls.g.totalDuration );
					};



			/* Selecting and running the transition */

					// NEW FEATURE v5.2.0 Starts the slider only if it is in the viewport

					var startInViewport = function(){

						ls.g.nextLayer.find(' > *[class*="ls-l"]').each(function(){

							$(this).css({
								visibility : 'hidden'
							});
						});

						ls.g.sliderTop = $(el).offset().top;

						$(window).load(function(){
							setTimeout(function(){

								ls.g.sliderTop = $(el).offset().top;
							}, 20);
						});

						var eventClass = el.id || 'ls'+Date.now();

						var isSliderInViewport = function(){
							if( $(window).scrollTop() + $(window).height() - ( ls.g.sliderHeight() / 2 ) > ls.g.sliderTop ){
								ls.g.firstSlideAnimated = true;
								if( ls.g.originalAutoStart === true ){
									//ls.g.autoSlideshow = true;
								 	ls.o.autoStart = true;
								 	ls.start();
								}
								nextSubLayers();
								$(window).off('scroll.'+eventClass);
							}
						}
						isSliderInViewport();

						if( !ls.g.firstSlideAnimated ){
							if (ls.g.isMobile())
								$(window).on('scroll.'+eventClass, function(){
									clearTimeout(isSliderInViewport.timeout);
									isSliderInViewport.timeout = setTimeout(function() {
										isSliderInViewport();
									}, 150);
								});
							else
								$(window).on('scroll.'+eventClass, function(){
									isSliderInViewport();
								});
						}
					};

					var tType = ( ( ls.g.nextLayer.data('transition3d') || ls.g.nextLayer.data('transition2d') ) && ls.t ) || ( ( ls.g.nextLayer.data('customtransition3d') || ls.g.nextLayer.data('customtransition2d') ) && ls.ct ) ? 'new' : 'old';

					if( !ls.g.nextLayer.data('transitiontype') ){
						ls.transitionType( ls.g.nextLayer );
					}

					if( ls.g.nextLayer.data('transitiontype') === 'new' ){
						tType = 'new';
					}

					if( ls.o.slideTransition ){
						tType = 'forced';
					}

					if( ls.o.animateFirstSlide && !ls.g.firstSlideAnimated ){

						// BUGFIX v3.5 there is no need to animate 'current' layer if the following conditions are true
						//			   this fixes the sublayer animation direction bug

						if( ls.g.layersNum == 1 ){
							var curDelay = 0;

							// IMPROVEMENT v4.1.0 Calling cbAnimStop(); function if only one layer is in the slider

							ls.o.cbAnimStop(ls.g);

						}else{
							var nextLayerTimeShift = parseInt(ls.g.nextLayer.data('timeshift')) ? parseInt(ls.g.nextLayer.data('timeshift')) : 0;
							var d = tType == 'new' ? 0 : curDuration;
							ls.g.t5 = setTimeout(function(){
								curLayerCallback();
							}, d + Math.abs(nextLayerTimeShift) );
						}

						// curDelay must be 0!

						ls.g.totalDuration = true;

						// Animating SUBLAYERS of the first layer

						if( ls.o.startInViewport === true ){

							startInViewport();
						}else{

							ls.g.firstSlideAnimated = true;
							nextSubLayers();
						}

						// Displaying the first layer (immediately)

						ls.g.nextLayer.css({
							width : ls.g.sliderWidth(),
							height : ls.g.sliderHeight()
						});

						if( !ls.g.ie78 ){
							ls.g.nextLayer.find('.ls-bg').css({
								display : 'none'
							}).fadeIn(ls.o.sliderFadeInDuration);
						}

						ls.g.isLoading = false;
					}else{

						switch(tType){

							// Old transitions (sliding layers)

							case 'old':

								ls.g.totalDuration = false;

								// BUGFIX v4.5.0 Removing elements from ls-lt-container is necessary

								if( ls.g.ltContainer ){
									ls.g.ltContainer.empty();
								}

								// Animating CURRENT LAYER and its SUBLAYERS

								curLayer();
								curSubLayers();

								// Animating NEXT LAYER and its SUBLAYERS

								nextLayer();
								nextSubLayers();
							break;

							// NEW FEATURE v4.0 2D & 3D Layer Transitions

							case 'new':

								if( typeof LSCustomTransition != 'undefined' ){
									selectCustomTransition();
								}else{
									selectTransition();
								}
							break;

							case 'forced':
								slideTransition( ls.o.slideTransition.type, ls.o.slideTransition.obj );
							break;
						}
					}
		};

		ls.transitionType = function( el ){

			var ttype =  el.data('ls') ||
								( 	!el.data('ls') &&
									!el.data('slidedelay') &&
									!el.data('slidedirection') &&
									!el.data('slideoutdirection') &&
									!el.data('delayin') &&
									!el.data('delayout') &&
									!el.data('durationin') &&
									!el.data('durationout') &&
									!el.data('showuntil') &&
									!el.data('easingin') &&
									!el.data('easingout') &&
									!el.data('scalein') &&
									!el.data('scaleout') &&
									!el.data('rotatein') &&
									!el.data('rotateout')
								) ? 'new' : 'old';
			el.data('transitiontype', ttype);
		};

		ls.sublayerShowUntil = function( sublayer ){

			if( !sublayer.data('transitiontype') ){
				ls.transitionType( sublayer );
			}

			// BUGFIX v5.1.0 Removing ls-videohack class before starting transition

			sublayer.removeClass('ls-videohack');

			var prevOrNext = ls.g.curLayer;

			if( ls.g.prevNext != 'prev' && ls.g.nextLayer ){
				prevOrNext = ls.g.nextLayer;
			}

			var chooseDirection = prevOrNext.data('slidedirection') ? prevOrNext.data('slidedirection') : ls.o.slideDirection;

			// Setting the direction of sliding

			var slideDirection = ls.g.slideDirections[ls.g.prevNext][chooseDirection];

			var curSubSlideDir = sublayer.data('slidedirection') ? sublayer.data('slidedirection') : slideDirection;
			var lml, lmt;

			switch(curSubSlideDir){
				case 'left':
					lml = -ls.g.sliderWidth();
					lmt = 0;
					break;
				case 'right':
					lml = ls.g.sliderWidth();
					lmt = 0;
					break;
				case 'top':
					lmt = -ls.g.sliderHeight();
					lml = 0;
					break;
				case 'bottom':
					lmt = ls.g.sliderHeight();
					lml = 0;
					break;
				case 'fade':
					lmt = 0;
					lml = 0;
					break;
			}

			// NEW FEATURE v1.6 added slideoutdirection to sublayers
			// NEW FEATURES 5.0.0 added axis-free transitions with offsetx and offsety properties

			if( sublayer.data('transitiontype') === 'new' ){
				var curSubSlideOutDir = 'new';
			}else{
				var curSubSlideOutDir = sublayer.data('slideoutdirection') ? sublayer.data('slideoutdirection') : false;
			}

			var curSubSplit = sublayer.data('splitout') ? sublayer.data('splitout') : ls.lt.splitOut;
			var curSubShift = sublayer.data('shiftout') ? sublayer.data('shiftout') : ls.lt.shiftOut;

			switch(curSubSlideOutDir){
				case 'left':
					lml = ls.g.sliderWidth();
					lmt = 0;
					break;
				case 'right':
					lml = -ls.g.sliderWidth();
					lmt = 0;
					break;
				case 'top':
					lmt = ls.g.sliderHeight();
					lml = 0;
					break;
				case 'bottom':
					lmt = -ls.g.sliderHeight();
					lml = 0;
					break;
				case 'fade':
					lmt = 0;
					lml = 0;
					break;
				case 'new':
					var xout = sublayer.data('offsetxout');
					if( xout ){
						var cycle = xout.trim().split(/[,\s]+/);
						$.each(cycle, function(i, xout) {
							if( xout === 'left' ){
								cycle[i] = ls.g.sliderWidth();
							}else if( xout === 'right' ){
								cycle[i] = -ls.g.sliderWidth();
							}else{
								cycle[i] = xout.indexOf('%') < 0 ? parseInt(xout) * ls.g.ratio : parseFloat(xout) / 100 * sublayer.outerWidth();
							}
						});
						lml = curSubSplit && cycle.length > 1 ? cycle : cycle[0];
					}else{
						lml = ls.lt.offsetXOut;
					}
					var yout = sublayer.data('offsetyout');
					if( yout ){
						var cycle = yout.trim().split(/[,\s]+/);
						$.each(cycle, function(i, yout) {
							if( yout === 'top' ){
								cycle[i] = ls.g.sliderHeight();
							}else if( yout === 'bottom' ){
								cycle[i] = -ls.g.sliderHeight();
							}else{
								cycle[i] = yout.indexOf('%') < 0 ? parseInt(yout) * ls.g.ratio : parseFloat(yout) / 100 * sublayer.outerHeight();
							}
						});
						lmt = curSubSplit && cycle.length > 1 ? cycle : cycle[0];
					}else{
						lmt = ls.lt.offsetYOut;
					}
					break;
			}

			// NEW FEATURE v4.5.0 Rotating & Scaling sublayers
			// BUGFIX v4.5.5 changing the default value from 0 to 'none' (because of old jQuery, 1.7.2)
			// NEW FEATURES v5.0.0 Added SkewX, SkewY, ScaleX, ScaleY, RotateX & RotateY transitions

			var curSubRotate, curSubRotateX, curSubRotateY, curSubScale, curSubSkewX, curSubSkewY, curSubScaleX, curSubScaleY, curSubClip;

			curSubRotate = sublayer.data('rotateout') ? sublayer.data('rotateout') : ls.lt.rotateOut;
			curSubRotateX = sublayer.data('rotatexout') ? sublayer.data('rotatexout') : ls.lt.rotateXOut;
			curSubRotateY = sublayer.data('rotateyout') ? sublayer.data('rotateyout') : ls.lt.rotateYOut;
			curSubScale = sublayer.data('scaleout') ? sublayer.data('scaleout') : ls.lt.scaleOut;
			curSubSkewX = sublayer.data('skewxout') ? sublayer.data('skewxout') : ls.lt.skewXOut;
			curSubSkewY = sublayer.data('skewyout') ? sublayer.data('skewyout') : ls.lt.skewYOut;
			if( curSubScale === 1 ){
				curSubScaleX = sublayer.data('scalexout') ? sublayer.data('scalexout') : ls.lt.scaleXOut;
				curSubScaleY = sublayer.data('scaleyout') ? sublayer.data('scaleyout') : ls.lt.scaleYOut;
			}else{
				curSubScaleX = curSubScaleY = curSubScale;
			}
			curSubClip = sublayer.data('clipout') ? sublayer.data('clipout') : ls.lt.clipOut;

			var too = sublayer.data('transformoriginout') ? sublayer.data('transformoriginout').split(' ') : ls.lt.transformOriginOut;

			for(var t =0;t<too.length;t++){
				if( too[t].indexOf('%') === -1 && too[t].indexOf('left') !== -1 && too[t].indexOf('right') !== -1 && too[t].indexOf('top') !== -1 && too[t].indexOf('bottom') !== -1 ){
					too[t] = '' + parseInt( too[t] ) * ls.g.ratio + 'px';
				}
			}
			var curSubTransformOrigin = too.join(' ');
			var curSubPerspective = sublayer.data('perspectiveout') ? sublayer.data('perspectiveout') : ls.lt.perspectiveOut;

			// IMPROVEMENT v4.0 Distance (P.level): -1

			var endLeft = parseInt( sublayer.css('left') );
			var endTop = parseInt( sublayer.css('top') );

			var curSubPLevel = parseInt( sublayer.attr('class').split('ls-l')[1] );

			var wh = sublayer.outerWidth() > sublayer.outerHeight() ? sublayer.outerWidth() : sublayer.outerHeight();
			var modX = parseInt( curSubRotate ) === 0 ? sublayer.outerWidth() : wh;
			var modY = parseInt( curSubRotate ) === 0 ? sublayer.outerHeight() : wh;

			if( ( curSubPLevel === -1 && curSubSlideOutDir !== 'new' ) || ( sublayer.data('offsetxout') === 'left' || sublayer.data('offsetxout') === 'right' ) ){
				if( lml < 0 ){
					lml = ls.g.sliderWidth() - endLeft + ( curSubScaleX / 2 - .5 ) * modX + 100;
				}else if( lml > 0 ){
					lml = -(endLeft + ( curSubScaleX / 2 + .5 ) * modX + 100);
				}
			}

			if( ( curSubPLevel === -1 && curSubSlideOutDir !== 'new' ) || ( sublayer.data('offsetyout') === 'top' || sublayer.data('offsetyout') === 'bottom' ) ){
				if( lmt < 0 ){
					lmt = ls.g.sliderHeight() - endTop + ( curSubScaleY / 2 - .5 ) * modY + 100;
				}else if( lmt > 0 ){
					lmt = - (endTop + ( curSubScaleY / 2 + .5 ) * modY + 100);
				}
			}

			if( curSubPLevel === -1 || curSubSlideOutDir === 'new' ){
				var curSubPar = 1;
			}else{
				var curSubParMod = ls.g.curLayer.data('parallaxout') ? parseInt(ls.g.curLayer.data('parallaxout')) : ls.o.parallaxOut;
				var curSubPar = curSubPLevel * curSubParMod;
				lml *= -curSubPar;
				lmt *= -curSubPar;
			}

//			var curSubDelay = parseInt( sublayer.data('showuntil') );

			if( sublayer.data('transitiontype') === 'new' ){
				var duO = ls.lt.durationOut;
				var eO = ls.lt.easingOut;
			}else{
				var duO = ls.o.durationOut;
				var eO = ls.o.easingOut;
			}

			var curSubTime = sublayer.data('durationout') ? parseInt(sublayer.data('durationout')) : duO;

			// BUGFIX v5.2.0 duration cannot be 0

			if( curSubTime === 0 ){ curSubTime = 1 }
			var curSubEasing = sublayer.data('easingout') ? sublayer.data('easingout') : eO;

			var css = {
				transformPerspective : curSubPerspective,
				transformOrigin : curSubTransformOrigin
			};

			var transition = {
				x : lml,
				y : lmt,
				rotation : curSubRotate,
				rotationX : curSubRotateX,
				rotationY : curSubRotateY,
				skewX : curSubSkewX,
				skewY : curSubSkewY,
				scaleX : curSubScaleX,
				scaleY : curSubScaleY,
				ease : curSubEasing,
				onComplete : function(){
					sublayer.data('status', 'outend');
					sublayer.css({visibility: 'hidden', clip: ''});
				}
			};

			if( curSubSlideOutDir == 'fade' || ( !curSubSlideOutDir && curSubSlideDir == 'fade' ) || ( sublayer.data('fadeout') !== 'false' && sublayer.data('transitiontype') === 'new' ) ){
				transition.opacity = 0;
			}

			if (curSubClip) {
				var ow = sublayer.outerWidth(), oh = sublayer.outerHeight();
				css.clip = 'rect(0 '+ow+' '+oh+' 0)';
				transition.clip = gsRect(curSubClip, ow, oh);
			}

			var hover = sublayer.removeClass('ls-mover').data('hover');
			if (hover) {
				hover.kill();
				var t = sublayer[0]._gsTransform;
				if (t.rotation || t.rotationX || t.rotationY || t.scaleX != 1 || t.scaleY != 1) {
					transition.origin = css.transformOrigin;
					delete css.transformOrigin;
				}
			}

			sublayer.data('status', 'out');

			var splitOut = sublayer.is('img, div') ? [] : curSubSplit.split('_');
			if (splitOut[0]) {
				var text = sublayer.data('split'),
						nodes = text[ splitOut[0] ];
				if (splitOut[1] == 'desc') {
					nodes = nodes.slice(0).reverse();
				} else if (splitOut[1] == 'rand') {
					nodes = nodes.slice(0).sort(function() {return 0.5 - Math.random()});
				}
				TweenLite.set(nodes, css);
				var tl = new TimelineLite({paused: true, onComplete: transition.onComplete});
				delete transition.onComplete;

				transition.cycle = {};
				if (transition.x.length) {
					transition.cycle.x = transition.x;
					delete transition.x;
				}
				if (transition.y.length) {
					transition.cycle.y = transition.y;
					delete transition.y;
				}

				tl.staggerTo(nodes, curSubTime/1000, transition, curSubShift/1000);
				tl.play();
			}
			else {
				TweenLite.set(sublayer[0], css);
				TweenLite.to(sublayer[0], curSubTime/1000, transition);
			}
		};

		// scroll-to/down feature
		var $win = $(window);
		var lsScrollUpdate = function() { $win.scrollTop(this.target.y) };
		var lsScrollTo = function(scrollTo) {
			var scrollMax = document.body.scrollHeight - $win.height();
			TweenLite.to({ y: $win.scrollTop() }, 0.5, {
				y: scrollTo > scrollMax ? scrollMax : scrollTo,
				onUpdate: lsScrollUpdate
			});
		};

		ls.$el.on('click', 'a[target=ls-scroll-to]', function(e) {
			e.preventDefault();
			var href = $(this).attr('href');
			if (href.match(/^#[-\w]+$/)) {
				var $el = $(href +', a[name='+ href.slice(1) +']');
				$el.length && lsScrollTo($el.offset().top);
			}
		}).on('click', '.ls-scroll-down, .ls-mouse', function(e) {
			e.preventDefault();
			lsScrollTo(ls.$el.offset().top + ls.$el.outerHeight());
		});

		// initializing
		ls.load();
	};

	var lsConvertTransition = function( t, e, type, undef ){

		if( typeof e === 'undefined' ){
			var e = 'easeInOutQuart';
		}
		var tt = {};

		if( t.rotate !== undef ){
			tt.rotation = t.rotate;
		}
		if( t.rotateY !== undef ){
			tt.rotationY = t.rotateY;
		}
		if( t.rotateX !== undef ){
			tt.rotationX = t.rotateX;
		}
		if( type === 'after' ){
			tt.scaleX = tt.scaleY = tt.scaleZ = 1;
		}else if( t.scale3d !== undef ){
			tt.scaleX = tt.scaleY = tt.scaleZ = t.scale3d;
		}

		if( t.delay ){
			tt.delay = type === 'after' ? t.delay/1000 : t.delay;
		}

		tt.ease = e;

		return tt;
	};

	// Support3D checks the CSS3 3D capability of the browser (based on the idea of Modernizr.js)

	var lsSupport3D = function( el ) {

		var testEl = $('<div>'),
			s3d1 = false,
			s3d2 = false,
			properties = ['perspective', 'OPerspective', 'msPerspective', 'MozPerspective', 'WebkitPerspective'];
			transform = ['transformStyle','OTransformStyle','msTransformStyle','MozTransformStyle','WebkitTransformStyle'];

		for (var i = properties.length - 1; i >= 0; i--){
			s3d1 = s3d1 ? s3d1 : testEl[0].style[properties[i]] != undefined;
		};

		// preserve 3D test

		for (var i = transform.length - 1; i >= 0; i--){
			testEl.css( 'transform-style', 'preserve-3d' );
			s3d2 = s3d2 ? s3d2 : testEl[0].style[transform[i]] == 'preserve-3d';
		};

		// If browser has perspective capability and it is webkit, we must check it with this solution because Chrome can give false positive result if GPU acceleration is disabled

        if (s3d1 && testEl[0].style[properties[4]] != undefined){
			testEl.attr('id','ls-test3d').appendTo( el );
            s3d1 = testEl[0].offsetHeight === 3 && testEl[0].offsetLeft === 9;
			testEl.remove();
        }

        return (s3d1 && s3d2);
	};

	// Order array function

	var lsOrderArray = function(x,y,dir) {
		var i = [];
		if(dir=='forward'){
			for( var a=0; a<x;a++){
				for( var b=0; b<y; b++){
					i.push(a+b*x);
				}
			}
		}else{
			for( var a=x-1; a>-1;a--){
				for( var b=y-1; b>-1; b--){
					i.push(a+b*x);
				}
			}
		}
		return i;
	};

	// CountProp counts the properties in an object

	var lsCountProp = function(obj) {
	    var count = 0;

	    for(var prop in obj) {
	        if(obj.hasOwnProperty(prop)){
	            ++count;
			}
	    }
	    return count;
	};

	// We need the browser function (removed from jQuery 1.9)

	var lsBrowser = function(){

		uaMatch = function( ua ) {
			ua = ua.toLowerCase();

			var match = /(edge)([\/\w.]+)/.exec( ua ) ||
       /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
				/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
				[];

			return {
				browser: match[ 1 ] || "",
				version: match[ 2 ] || "0"
			};
		};

		var matched = uaMatch( navigator.userAgent ), browser = {};

		if ( matched.browser ) {
			browser[ matched.browser ] = true;
			browser.version = matched.version;
		}

		if ( browser.chrome ) {
			browser.webkit = true;
		} else if ( browser.webkit ) {
			browser.safari = true;
		}

		return browser;
	};

	var lsPrefixes = function(obj, method){

		var pfx = ['webkit', 'khtml', 'moz', 'ms', 'o', ''];
		var p = 0, m, t;
		while (p < pfx.length && !obj[m]) {
			m = method;
			if (pfx[p] == '') {
				m = m.substr(0,1).toLowerCase() + m.substr(1);
			}
			m = pfx[p] + m;
			t = typeof obj[m];
			if (t != 'undefined') {
				pfx = [pfx[p]];
				return (t == 'function' ? obj[m]() : obj[m]);
			}
			p++;
		}
	};

	// Global parameters (Do not change these settings!)

	layerSlider.global = {

		version				: '5.x',

		isMobile			: function(){
								if( navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i) ){
									return true;
								}else{
									return false;
								}
							},
		isHideOn3D			: function(el){
								if( el.css('padding-bottom') == 'auto' || el.css('padding-bottom') == 'none' || el.css('padding-bottom') == 0 || el.css('padding-bottom') == '0px' ){
									return true;
								}else{
									return false;
								}
							},

		ie78				: lsBrowser().msie && lsBrowser().version < 9 || lsBrowser().edge ? true : false,
		originalAutoStart	: false,
		paused				: false,
		pausedByVideo		: false,
		autoSlideshow		: false,
		isAnimating			: false,
		layersNum			: null,
		prevNext			: 'next',
		slideTimer			: null,
		sliderWidth			: null,
		sliderHeight		: null,
		numYouTubeCurslide	: 0,
		slideDirections		: {
								prev : {
									left	: 'right',
									right	: 'left',
									top		: 'bottom',
									bottom	: 'top'
								},
								next : {
									left	: 'left',
									right	: 'right',
									top		: 'top',
									bottom	: 'bottom'
								}
							},

		// Default delay time, fadeout and fadein durations of videoPreview images

		v					: {
								d	: 500,
								fo	: 750,
								fi	: 500
							}
	};

	// Layer Transition Defaults

	layerSlider.layerTransitions = {

		offsetXIn			: 80,
		offsetYIn			: 0,
		durationIn			: 1000,
		delayIn				: 0,
		easingIn			: 'easeInOutQuint',
		fadeIn				: true,
		rotateIn			: 0,
		rotateXIn			: 0,
		rotateYIn			: 0,
		scaleIn				: 1,
		scaleXIn			: 1,
		scaleYIn			: 1,
		skewXIn				: 0,
		skewYIn				: 0,
		transformOriginIn	: ['50%','50%','0'],
		perspectiveIn 		: 500,
		splitIn				: '',
		shiftIn				: 50,
		clipIn				: '',

		offsetXOut			: -80,
		offsetYOut			: 0,
		durationOut			: 400,
		showUntil			: 0,
		easingOut			: 'easeInOutQuint',
		fadeOut				: true,
		rotateOut			: 0,
		rotateXOut			: 0,
		rotateYOut			: 0,
		scaleOut			: 1,
		scaleXOut			: 1,
		scaleYOut			: 1,
		skewXOut			: 0,
		skewYOut			: 0,
		transformOriginOut	: ['50%','50%','0'],
		perspectiveOut 		: 500,
		splitOut			: '',
		shiftOut			: 50,
		clipOut				: ''
	};

	layerSlider.slideTransitions = {

		slideDelay			: 4000							// Time before the next slide will be loading.
	};

	// Global settings (can be modified)

	layerSlider.options = {

		// Layout

		responsive			: true,
		responsiveUnder		: 0,
		layersContainer		: 0,
		fullPage			: false,
		appendTo			: '',						// NEW FEATURE 5.5.0

		// Slideshow

		autoStart			: true,
		startInViewport		: true,						// NEW FEATURE v5.2.0
		pauseOnHover		: true,
		firstSlide			: 1,
		animateFirstSlide	: true,
		sliderFadeInDuration: 350,						// NEW FEATURE v5.2.0
		loops				: 0,
		forceLoopNum		: true,
		twoWaySlideshow		: false,
		randomSlideshow		: false,

		// Appearance

		skin				: 'v5',
		skinsPath			: '/layerslider/skins/',
		globalBGColor		: 'transparent',
		globalBGImage		: false,
		globalBGPosition: '0 0',
		globalBGSize: 'auto',
		globalBGRepeat: 'no-repeat',
		globalBGBehaviour: 'scroll',


		// Navigation Area

		navPrevNext			: true,
		navStartStop		: true,
		navButtons			: true,
		keybNav				: true,
		touchNav			: true,
		hoverPrevNext		: true,
		hoverBottomNav		: false,
		showBarTimer		: false,
		showCircleTimer		: true,

		// Thumbnail navigation

		thumbnailNavigation	: 'hover',
		tnContainerWidth	: '60%',
		tnWidth				: 100,
		tnHeight			: 60,
		tnActiveOpacity		: 35,
		tnInactiveOpacity	: 100,

		// Parallax

		parallaxType: 'mouse',
		slideParallax: 0,
		parallaxOrigin: 'top',
		parallaxScrollDuration: 0,
		parallaxScrollOnMobile: false,

		// Videos

		autoPlayVideos		: true,
		autoPauseSlideshow	: 'auto',
		youtubePreview		: 'maxresdefault.jpg',

		// Preload

		imgPreload			: true,
		lazyLoad 			: true,

		// YourLogo

		yourLogo			: false,
		yourLogoStyle		: 'left: -10px; top: -10px;',
		yourLogoLink		: false,
		yourLogoTarget		: '_self',

		// Optimize for IE7 and IE8

		optimizeForMobile	: true,
		optimizeForIE78		: true,

		// NEW FEATURES 5.2.0 Mobile features

		hideOnMobile		: false,
		hideUnder			: 0,
		hideOver			: 1000000,

		staticImage			: '', // will be available in 6.0.0

		// API functions

		cbInit				: function(element){},
		cbStart				: function(data){},
		cbStop				: function(data){},
		cbPause				: function(data){},
		cbAnimStart			: function(data){},
		cbAnimStop			: function(data){},
		cbPrev				: function(data){},
		cbNext				: function(data){},

		// !!! IMPORTANT !!! The following properties are deprecated from version 5.0.0 DO NOT USE THEM.
		// The slider will recognize these properties in the init code or if you add these properties into the style attribute of the layer
		// but we recommend you to use to new html5 data attribute (data-ls) with the new properties

		slideDelay			: 4000,
		slideDirection		: 'right',
		parallaxIn			: .45,
		parallaxOut			: .45,
		durationIn			: 1000,
		durationOut			: 1000,
		easingIn			: 'easeInOutQuint',
		easingOut			: 'easeInOutQuint',
		delayIn				: 0,
		delayOut			: 0
	};
})(window.jq183||jQuery);

jQuery(function($) {
	$(function() {

		var $a = $('a[target=ls-gallery]:first, .ls-imagelightbox:first');
		if ($a.length) {
			var path = $a.closest('.ls-container').data('LayerSlider').o.skinsPath.replace(/skins\/$/, '');
			var ver = $('script[src*=kreatura]').attr('src').match(/(\.min|)\.js\?v=([.0-9]*)$/);
			$('<link type="text/css" rel="stylesheet">')
				.appendTo(document.head)
				.attr('href', path+'css/lightgallery'+ver[1]+'.css?v='+ver[2]);
			$('<script>').load(function() {
				// init ls-gallery after lightgallery script loaded
				$('.ls-container').each(function() {
					var $ls = $(this);
					var $a = $ls.find('a[target=ls-gallery], .ls-imagelightbox');
					if ($a.length) {
						var sliderEl = [], slideEl = {};
						var startIndex = -$ls.find('.ls-lt-container').length;

						$a.each(function() {
							var $this = $(this);
							var href = $this.attr('href') || $this.parent('a').attr('href');
							if (!href || href == '#') {
								$this.data('ls-gallery-index', sliderEl.length);
								sliderEl.push({
									src: $this.siblings('.ls-bg').data('src'),
									subHtml: this.title
								});
							} else {
								var i = startIndex + $this.closest('.ls-slide').index();
								slideEl[i] || (slideEl[i] = []);
								$this.data('ls-gallery-index', slideEl[i].length);
								slideEl[i].push({
									iframe: !href.match(/youtube|vimeo/i) && !href.match(/\.(jpe?g|gif|png|tiff|bmp)$/i),
									src: href,
									subHtml: this.title
								});
							}
							this.title = '';
						});

						if (sliderEl.length) {
							$ls.lightGallery({ autoOpen: false, counter: false, download: false, dynamic: true, dynamicEl: sliderEl });
						}
						var i, $slide = $ls.find('.ls-slide');
						for (i in slideEl) {
							if (slideEl[i].length) {
								$slide.eq(i).lightGallery({ autoOpen: false, counter: false, download: false, iframeMaxWidth: '90%', dynamic: true, dynamicEl: slideEl[i] });
							}
						}
					}
				});

				$(document.body).on('click', 'a[target=ls-gallery], .ls-imagelightbox', function(e) { // open LightGallery
					e.preventDefault();
					var $this = $(this);
					var href = $this.attr('href') || $this.parent('a').attr('href');
					var $lg = $this.closest(!href || href == '#' ? '.ls-container' : '.ls-slide');
					$lg.data('lightGallery').s.index = $this.data('ls-gallery-index');
					$lg.lightGallery();
				}).on('onBeforeOpen.lg', function(e) { // pause slider
					var $ls = $(e.target).closest('.ls-container'), ls = $ls.data('LayerSlider');
					ls.g.isLoading = true; // prevent left & right cursor
					if (ls.g.autoSlideshow) {
						$ls.data('ls-stopped', true);
						$ls.layerSlider('stop');
					}
				}).on('onCloseAfter.lg', function(e) { // resume slider
					var $ls = $(e.target).closest('.ls-container'), ls = $ls.data('LayerSlider');
					ls.g.isLoading = false;
					if ($ls.data('ls-stopped')) {
						$ls.removeData('ls-stopped');
						$ls.layerSlider('start');
					}
				});

			}).appendTo(document.head)
				.attr('src', path+'js/lightgallery'+ver[1]+'.js?v='+ver[2]);
		}

	});
});

(window.lsjq||jQuery)(document).ready(function($) {
	if(typeof $.fn.layerSlider == "undefined") { 
		lsShowNotice('layerslider_13','jquery'); 
	} else {
		$("#layerslider_13").layerSlider({responsive: false, responsiveUnder: 1280, layersContainer: 1280, startInViewport: false, globalBGSize: 'cover', thumbnailNavigation: 'disabled'})
	}
});