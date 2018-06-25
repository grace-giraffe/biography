if (typeof Object.keys === 'undefined') {
    Object.keys = function (obj) {
        var keys = [], k;
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    };
}

var runInteractionTracker = function(options) {
    var jQueryLocal;
    var jQueryLoadHandler = function() { jQueryLocal = window.jQuery.noConflict(true); }
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute("type","text/javascript");
    scriptTag.setAttribute("src", location.protocol + "//c2.rfihub.net/static/js/jquery-latest.min.js");
    if (scriptTag.readyState) {
	scriptTag.onreadystatechange = function () { // For old versions of IE
	    if (this.readyState == 'complete' || this.readyState == 'loaded') {
	        jQueryLoadHandler();
	    }
        };
    } else { // Other browsers
	scriptTag.onload = jQueryLoadHandler;
    }
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);


    var base64KeyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var CHUNK_SIZE = 6;

    var loadTime = Date.now();

    var numBits = options && options.numBits ? options.numBits : 12;
    var timeToIgnoreAfterClick = options && options.timeToIgnoreAfterClick ? options.timeToIgnoreAfterClick : 1000;
    var maxEventRefires = options && options.maxEventRefires ? options.maxEventRefires : 5000 / 150;
    var maxNumCountsSent = options && options.maxNumCountsSent ? options.maxNumCountsSent : 10;
    var numValueBits = options && options.numValueBits ? options.numValueBits : 4;
    var valueFidelity = (1 << numValueBits);
    var showCanvas = options && options.showCanvas;
    var mouseMovePixel = options && options.mouseMovePixel ? options.mouseMovePixel : 'http://www.test.com/a.gif&t=move';
    var clickPixel = options && options.clickPixel ? options.clickPixel : 'http://www.test.com/a.gif&t=click';
    var viewabilityPixel = options && options.viewabilityPixel ? options.viewabilityPixel : 'http://www.test.com/a.gif&t=view';
    var sendIntervalMillis = options && options.sendIntervalMillis ? options.sendIntervalMillis : 1000;
    var checkViewabilityIntervalMillis = options && options.checkViewabilityIntervalMillis ? options.checkViewabilityIntervalMillis : 100;
    var maxSecondsSinceLoad = options && options.maxSecondsSinceLoad ? options.maxSencondsSinceLoad : 60 * 5; // five minutes
    var maxInitAttempts = options && options.maxInitAttempts ? options.maxInitAttempts : 100;
    var sampleNonViewableProb = options && options.sampleNonViewableProb ? options.sampleNonViewableProb : 1;
    var isSendingOutOfView = Math.random() < sampleNonViewableProb;
    var adInstanceId = options && options.adInstanceId ? options.adInstanceId : "rfi";
    var maxViewabilityResends = options && options.maxViewabilityResends ? options.maxViewabilityResends : 2;
    var initialTimeToResend = options && options.initialTimeToResend ? options.initialTimeToResend : 1000;
    var timeToResendFactor = options && options.timeToResendFactor ? options.timeToResendFactor : 3;
    var maxViewabilitySends = options && options.maxViewabilitySends ? options.maxViewabilitySends : 20;
    var initialTimeToMouseResend = options && options.initialTimeToMouseResend ? options.initialTimeToMouseResend : 1000;
    var timeToMouseResendFactor = options && options.timeToMouseResendFactor ? options.timeToMouseResendFactor : 1.25;
    var fracConsideredInView = options && options.fracConsideredInView ? options.fracConsideredInView : 0.5;
    var recordMouseMovement = options && typeof options.recordMouseMovement !== 'undefined' ? options.recordMouseMovement : true;

    var fidelityAttempts;
    var numBitsX;
    var numBitsY;
    var adWidth;
    var adHeight;
    var rfiTagSpan;
    var jQueryLocal;
    var jQRfiTagSpan;
    var spanOffSet;
    var canvas;

    var findSpan = function() {
        var spans = window.document.getElementsByTagName("span");
        for (var key in spans) {
            if (spans[key] && spans[key].id && spans[key].id.indexOf(adInstanceId) >= 0) {
                return spans[key];
            }
        }
    }

    var tryToCreateCanvas = function(width, height, parentElement) {
        if (showCanvas) {
            canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.style.zIndex = 100;
            canvas.style.position = "absolute";
            canvas.style.left = "0px";
            canvas.style.top = "0px";

            if(typeof G_vmlCanvasManager  != 'undefined' ) {
                canvas = G_vmlCanvasManager.initElement(canvas);
            }

            if (canvas.getContext) {
                parentElement.appendChild(canvas);
            } else {
                showCanvas = false;
            }
        }
    }

    var attemptToSetFidelities = function() {
        rfiTagSpan = findSpan();
        if (typeof rfiTagSpan !== 'undefined'
                && typeof jQueryLocal !== 'undefined') {
	    jQRfiTagSpan = jQueryLocal(rfiTagSpan);
            if (jQRfiTagSpan.offset()['left'] >= 0) {
		adWidth = jQRfiTagSpan.width();
		adHeight = jQRfiTagSpan.height();
		tryToCreateCanvas(adWidth, adHeight, rfiTagSpan);
                if (recordMouseMovement) {
		    jQRfiTagSpan.mousemove(count);
		    jQRfiTagSpan.mouseout(clearTimeout);
		    jQRfiTagSpan.mouseup(recordClick);
                }
		var widthFactor = Math.log(adWidth);
		var heightFactor = Math.log(adHeight);
		numBitsX = Math.round(numBits * widthFactor / (widthFactor + heightFactor));
		numBitsY = numBits - numBitsX;
		spanOffset = jQRfiTagSpan.offset();
		window.clearInterval(fidelityInterval);
	    }
        } else if (fidelityAttempts && fidelityAttempts > maxInitAttempts) {
            window.clearInterval(fidelityInterval);
        }
        if (typeof fidelityAttempts !== 'undefined') {
            fidelityAttempts++;
        } else {
            fidelityAttempts = 1;
        }
    };

    var fidelityInterval = window.setInterval(attemptToSetFidelities, 100);

    var totalWeight = 0;
    var maxWeight = 0;
    var counts = {};

    var refireTimeout;
    var lastEventX;
    var lastEventY;
    var numFiresOfLastEvent = 0;

    var count = function(e) {
        if (refireTimeout) {
            window.clearTimeout(refireTimeout);
        }
        if (!numBitsX || !numBitsY || !spanOffset) {
            return;
        }
        var elementX = e.pageX - spanOffset.left;
        var elementY = e.pageY - spanOffset.top;
        if (elementX == lastEventX && elementY == lastEventY) {
            numFiresOfLastEvent++;
        } else {
            numFiresOfLastEvent = 0;
        }
        lastEventX = elementX;
        lastEventY = elementY;
        var secondsSinceLoad = Math.round((Date.now() - loadTime) / 1000);
        if (numFiresOfLastEvent > maxEventRefires
                || numMouseEventsSent > maxNumCountsSent
                || (lastClickTime && Date.now() - lastClickTime < timeToIgnoreAfterClick)
                || secondsSinceLoad > maxSecondsSinceLoad) {
            return;
        }
        var xFidelity = (1 << numBitsX);
        var yFidelity = (1 << numBitsY);
        var xFrac = Math.max(0, (elementX - 1) / adWidth);
        var yFrac = Math.max(0, (elementY - 1) / adHeight);
        var key = Math.floor(xFrac * xFidelity) + "_" + Math.floor(yFrac * yFidelity);
        if (counts[key]) {
            counts[key] = Math.min(maxEventRefires, counts[key] + 1);
        } else {
            counts[key] = 1;
        }
        totalWeight++;
        maxWeight = Math.max(maxWeight, counts[key]);
        refireTimeout = window.setTimeout(function() { count(e); }, 150);
    };

    var generatePaddedBitString = function(bitString, numBits) {
        var curBitStringRep = bitString.toString(2);
        while (curBitStringRep.length < numBits) {
            curBitStringRep = "0" + curBitStringRep;
        }
        return curBitStringRep;
    };

    var numMouseEventsSent = 0;
    var lastSentTotalWeight = 0;
    var lastSendTime = 0;
    var lastMouseSendTime = 0;
    var timeTillNextResend = initialTimeToResend;
    var timeTillNextMouseResend = initialTimeToMouseResend;
    var numViewabilityResends = 0;
    var numViewabilitySends = 0;
    var haveSentOutOfView = false;

    var checkAndSendCounts = function() {
        var secondsSinceLoad = Math.round((Date.now() - loadTime) / 1000);
        if (totalWeight != 0 && Date.now() - lastMouseSendTime > timeTillNextMouseResend) {
            var bitStrings = new Array();
            var curIndexOfBitString = 0;
            for (var key in counts) {
                var compressedVal = Math.round((counts[key] / maxWeight) * (valueFidelity - 1));
                var keySplit = key.split("_");
                bitStrings.push(generatePaddedBitString(parseInt(keySplit[0]), numBitsX));
                bitStrings.push(generatePaddedBitString(parseInt(keySplit[1]), numBitsY));
                bitStrings.push(generatePaddedBitString(compressedVal, numValueBits));
            }
            var curBitString = bitStrings.join('');
            var encodedString = encode(secondsSinceLoad, totalWeight, maxWeight, numBitsX, numBitsY, numValueBits, curBitString);
            var decodedMap = decode(encodedString);
            if (showCanvas) {
                renderHeatMap(canvas, decodedMap);
            }
            firePixel(mouseMovePixel, encodedString);
            lastMouseSendTime = Date.now();
            timeTillNextMouseResend *= timeToMouseResendFactor;
            totalWeight = 0;
            counts = {};
            numMouseEventsSent++;
        }
        var isInView = lastViewableFrac >= fracConsideredInView;
        if (typeof lastViewabilityCounts === 'undefined'
                || keyString(viewabilityCounts) != keyString(lastViewabilityCounts)) {
            if (isInView || !haveSentOutOfView) {
                sendViewabilityCounts(viewabilityCounts);
            }
            lastViewabilityCounts = viewabilityCounts;
            viewabilityCounts = {};
            timeTillNextResend = initialTimeToResend;
            lastSendTime = Date.now();
            numViewabilityResends = 0;
            if (isInView) { haveSentOutOfView = false; }
            else { haveSentOutOfView = true; }
        } else if (Object.keys(lastViewabilityCounts).length > 0 && Date.now() - lastSendTime > timeTillNextResend) {
            if (numViewabilityResends < maxViewabilityResends
                && numViewabilitySends < maxViewabilitySends
                && (isInView || !haveSentOutOfView)) {
                sendViewabilityCounts(viewabilityCounts);
                if (!isInView) { haveSentOutOfView = true; }
            }
            numViewabilityResends++;
            timeTillNextResend *= timeToResendFactor;
            lastSendTime = Date.now();
            lastViewabilityCounts = viewabilityCounts;
            viewabilityCounts = {};
            if (isInView) { haveSentOutOfView = false; }
        }

        if (numMouseEventsSent > maxNumCountsSent
                || secondsSinceLoad > maxSecondsSinceLoad) {
            window.clearInterval(checkAndSendInterval);
            window.clearInterval(checkViewabilityInterval);
        }
    };

    var sendViewabilityCounts = function(viewabilityCounts) {
        var sb = new Array();
        var secondsSinceLoad = Math.round((Date.now() - loadTime) / 1000);
        for (v in viewabilityCounts) {
            sb.push("sL:" + secondsSinceLoad + ",oV:" + (isSendingOutOfView ? "1" : "0") + "," + v + ",c:" + viewabilityCounts[v]);
        }
        firePixel(viewabilityPixel, sb.join('='));
        numViewabilitySends++;
    };

    var encodeWithBase64 = function(intVal) {
        var desiredLength = (Math.floor(intVal.toString(2).length / CHUNK_SIZE) + 1) * CHUNK_SIZE;
        var bitString = generatePaddedBitString(intVal, desiredLength);
        var numChars = bitString.length / CHUNK_SIZE;
        var base64StringBuilder = new Array();
        for (var curCharIndex = 0; curCharIndex < numChars; curCharIndex++) {
            var bitChunk = bitString.substring(curCharIndex * CHUNK_SIZE, (curCharIndex + 1) * CHUNK_SIZE);
            base64StringBuilder.push(base64KeyStr.charAt(parseInt(bitChunk, 2)));
        }
        return base64StringBuilder.join('');
    };

    var decodeWithBase64 = function(encodedVal) {
        var bitStringBuilder = new Array();
        for (var curCharIndex = 0; curCharIndex < encodedVal.length; curCharIndex++) {
            var curIntVal = base64KeyStr.indexOf(encodedVal.charAt(curCharIndex));
            bitStringBuilder.push(generatePaddedBitString(curIntVal.toString(2), CHUNK_SIZE));
        }
        return parseInt(bitStringBuilder.join(''), 2);
    };

    var encode = function(secondsSinceLoad, totalWeight, maxWeight, numBitsX, numBitsY, numValueBits, bitString) {
        var encodedStringBuilder = new Array();

        encodedStringBuilder.push(encodeWithBase64(secondsSinceLoad) + "=");

        encodedStringBuilder.push(encodeWithBase64(totalWeight) + "=");

        encodedStringBuilder.push(encodeWithBase64(maxWeight) + "=");

        encodedStringBuilder.push(encodeWithBase64(numBitsX) + "=");

        encodedStringBuilder.push(encodeWithBase64(numBitsY) + "=");

        encodedStringBuilder.push(encodeWithBase64(numValueBits) + "=");

        var numChars = Math.floor(bitString.length / CHUNK_SIZE) + 1;
        for (var i = 0; i < numChars; i++) {
            var start = i * CHUNK_SIZE;
            var end = Math.min(bitString.length, (i + 1) * CHUNK_SIZE);
            var bitStringChunk = bitString.substring(start, end);
            while (bitStringChunk.length < CHUNK_SIZE) {
                bitStringChunk += "0";
            }
            var intVal = parseInt(bitStringChunk, 2);
            encodedStringBuilder.push(base64KeyStr.charAt(intVal));
        }

        return encodedStringBuilder.join('');
    };

    var lastClickTime;

    var recordClick = function(e) {
        clearTimeout(e);
        lastClickTime = Date.now();
        if (!numBitsX || !numBitsY) {
            return;
        }
        var xFidelity = (1 << numBitsX);
        var yFidelity = (1 << numBitsY);
        var elementX = e.pageX - spanOffset.left;
        var elementY = e.pageY - spanOffset.top;
        var xFrac = Math.max(0, (elementX - 1) / adWidth);
        var yFrac = Math.max(0, (elementY - 1) / adHeight);
        var xPos = Math.floor(xFrac * xFidelity);
        var yPos = Math.floor(yFrac * yFidelity);
        var bitString = new Array();
        bitString.push(generatePaddedBitString(xPos, numBitsX));
        bitString.push(generatePaddedBitString(yPos, numBitsY));
        bitString.push(generatePaddedBitString(1, 1));
        var secondsSinceLoad = Math.round((Date.now() - loadTime) / 1000);
        var encodedString = encode(secondsSinceLoad, 1, 1, numBitsX, numBitsY, 1, bitString.join(''));
        var decodedMap = decode(encodedString);
        firePixel(clickPixel, encodedString);
        if (showCanvas) { renderHeatMap(canvas, decodedMap); }
        return true;
    };

    var chompWithBase64 = function(encodedString, separator) {
        var separatorIndex = encodedString.indexOf("=");
        var val = decodeWithBase64(encodedString.substring(0, separatorIndex));
        encodedString = encodedString.substring(separatorIndex + 1);
        return {val: val, chompedString: encodedString};
    };

    var decode = function(encodedString) {
        var retMap = {};
        var chompResult;

        chompResult = chompWithBase64(encodedString, '=');
        var secondsSinceLoad = chompResult['val'];

        chompResult = chompWithBase64(chompResult['chompedString'], '=');
        var totalWeight = chompResult['val'];

        chompResult = chompWithBase64(chompResult['chompedString'], '=');
        var maxWeight = chompResult['val'];

        chompResult = chompWithBase64(chompResult['chompedString'], '=');
        var numBitsX = chompResult['val'];

        chompResult = chompWithBase64(chompResult['chompedString'], '=');
        var numBitsY = chompResult['val'];

        chompResult = chompWithBase64(chompResult['chompedString'], '=');
        var numValueBits = chompResult['val'];

        encodedString = chompResult['chompedString'];

        var bitStrings = new Array();
        for (var curChar = 0; curChar < encodedString.length; curChar++) {
            var intVal = base64KeyStr.indexOf(encodedString.charAt(curChar));
            bitStrings.push(generatePaddedBitString(intVal, CHUNK_SIZE));
        }
        var bitString = bitStrings.join('');
        var curIndex = 0;
        var stringToLog = "[" + totalWeight + ", " + maxWeight +"]";
        while (curIndex + numBitsX + numBitsY + numValueBits <= bitString.length) {
            var xVal = parseInt(bitString.substring(curIndex, curIndex + numBitsX), 2);
            curIndex += numBitsX;
            var yVal = parseInt(bitString.substring(curIndex, curIndex + numBitsY), 2);
            curIndex += numBitsY;
            var val = parseInt(bitString.substring(curIndex, curIndex + numValueBits), 2);
            curIndex += numValueBits;
            retMap[xVal + "x" + yVal] = val;
            stringToLog += (xVal + "x" + yVal + " = " + val + "; ");
        }
        retMap['secondsSinceLoad'] = secondsSinceLoad;
        retMap['totalWeight'] = totalWeight;
        retMap['maxWeight'] = maxWeight;
        return retMap;
    };

    var renderHeatMap = function(canvas, heatMap) {
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, adWidth, adHeight);
        var xFidelity = ((1 << numBitsX) - 1) + 1;
        var yFidelity = ((1 << numBitsY) - 1) + 1;
        var totalWeight = heatMap['totalWeight'];
        var maxWeight = heatMap['maxWeight'];
        for (var key in heatMap) {
            if (key != 'totalWeight') {
                var val = (heatMap[key] + 1) / valueFidelity;
                var keySplit = key.split('x');
                var xStart = Math.floor((keySplit[0] / xFidelity) * adWidth);
                var xEnd = xStart + Math.floor((1 / xFidelity) * adWidth);
                var yStart = Math.floor((keySplit[1] / yFidelity) * adHeight);
                var yEnd = yStart + Math.floor((1 / yFidelity) * adHeight);
                var colorIntensityVal = val;
                if (!isNaN(xStart)
                        && !isNaN(xEnd)
                        && !isNaN(yStart)
                        && !isNaN(yEnd)
                        && !isNaN(colorIntensityVal)) {
                    ctx.fillStyle = "rgba(255, 0, 0," + colorIntensityVal +")";
                    ctx.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
                }
            }
        }
    };

    function firePixel(src, data) {
        if (src && src != 'undefined' && data && data != 'undefined' && data != '') {
	    if (location.protocol === 'https:') {
		src = src.replace('http:', 'https:');
	    }
            new Image().src = src + '&d=' + data + '&r=' + Math.random();
        }
    };

    var isInIFrame = window.top !== window.self;
    var checkViewability = function(obj) {
        var ret = {};
       
        if (typeof window.mozInnerScreenY === 'undefined'
                || typeof window.mozInnerScreenX === 'undefined'
                || typeof jQueryLocal === 'undefined') {
            return ret;
        }
        var jQueryObj = jQueryLocal(obj);
        var topPadding = isInIFrame ? 119 : window.mozInnerScreenY - window.screenY;
        var leftPadding = isInIFrame ? 11 : window.mozInnerScreenX - window.screenX;
        var rightPadding = isInIFrame ? 41 : window.outerWidth - jQueryLocal(window).width() - leftPadding;
        var bottomPadding = 41;//isInIFrame ? 41 : window.outerHeight - jQueryLocal(window).height() - topPadding;
        ret['isInIFrame'] = isInIFrame;
        ret['screenWidth'] = window.screen.availWidth;
        ret['screenHeight'] = window.screen.availHeight;
        ret['viewportWidth'] = window.outerWidth - (leftPadding + rightPadding);
        ret['viewportHeight'] = window.outerHeight - (topPadding + bottomPadding);
        ret['objWidth'] = jQueryObj.width();
        ret['objHeight'] = jQueryObj.height();
        ret['viewportScreenX'] = window.screenX + leftPadding;
        ret['viewportScreenY'] = window.screenY + topPadding;
        ret['leftPadding'] = leftPadding;
        ret['topPadding'] = topPadding;
        ret['rightPadding'] = rightPadding;
        ret['bottomPadding'] = bottomPadding;
        ret['mozInnerScreenX'] = window.mozInnerScreenX;
        ret['mozInnerScreenY'] = window.mozInnerScreenY;
        ret['objScreenX'] = jQueryObj.offset()['left'] + window.mozInnerScreenX - jQueryLocal(window).scrollLeft();
        ret['objScreenY'] = jQueryObj.offset()['top'] + window.mozInnerScreenY - jQueryLocal(window).scrollTop();
        ret['objViewableScreenX'] = Math.max(leftPadding,
                Math.max(ret['objScreenX'],
                    Math.min(ret['objScreenX'] + ret['objWidth'],
                        ret['viewportScreenX'])));
        ret['objViewableScreenY'] = Math.max(topPadding,
                Math.max(ret['objScreenY'],
                    Math.min(ret['objScreenY'] + ret['objHeight'],
                        ret['viewportScreenY'])));
        ret['objViewableScreenX2'] = Math.max(ret['objViewableScreenX'],
                Math.min(ret['screenWidth'],
                    Math.min(ret['viewportScreenX'] + ret['viewportWidth'],
                        ret['objScreenX'] + ret['objWidth'])));
        ret['objViewableScreenY2'] = Math.max(ret['objViewableScreenY'],
                Math.min(ret['screenHeight'],
                    Math.min(ret['viewportScreenY'] + ret['viewportHeight'],
                        ret['objScreenY'] + ret['objHeight'])));
        ret['objViewableWidth'] = ret['objViewableScreenX2'] - ret['objViewableScreenX'];
        ret['objViewableHeight'] = ret['objViewableScreenY2'] - ret['objViewableScreenY'];
        ret['objViewableFrac'] = (ret['objViewableWidth'] * ret['objViewableHeight']) / (ret['objWidth'] * ret['objHeight']);
        ret['objViewableFracX'] = ret['objViewableWidth'] / ret['objWidth'];
        ret['objViewableFracY'] = ret['objViewableHeight'] / ret['objHeight'];
        return ret;
    };

    var keyString = function(viewabilityCounts) {
        var stringBuilder = new Array();
        for (k in viewabilityCounts) { if (k != 'toString' && k != 'keySet') { stringBuilder.push(k); }}
        return stringBuilder.join(',');
    };

    function Payload() {}
    Payload.prototype.toString = function() {
        var stringBuilder = new Array();
        for (k in this) { if (k != 'toString' && k != 'keySet') { stringBuilder.push(k + ":" + this[k]); }}
        return stringBuilder.join(',');
    };

    var viewabilityCounts = {};
    var lastViewableFrac = 0;
    var recordViewability = function() {
        if (typeof rfiTagSpan === 'undefined') {
            return;
        }
        try {
            var vData = checkViewability(rfiTagSpan);
            if (typeof vData === 'undefined'
                    || typeof vData['objViewableFrac'] === 'undefined') {
                return;
            }
            if (isSendingOutOfView
                    || vData['objViewableFrac'] != lastViewableFrac
                    || vData['objViewableFrac'] > 0) {
                var payload = new Payload();
                payload['sW'] = vData['screenWidth'];
                payload['sH'] = vData['screenHeight'];
                payload['iF'] = vData['isInIFrame'];
                payload['tP'] = vData['topPadding'];
                payload['vX'] = vData['viewportScreenX'];
                payload['vY'] = vData['viewportScreenY'];
                payload['vW'] = vData['viewportWidth'];
                payload['vH'] = vData['viewportHeight'];
                payload['aX'] = vData['objScreenX'];
                payload['aY'] = vData['objScreenY'];
                payload['aW'] = vData['objWidth'];
                payload['aH'] = vData['objHeight'];
                payload['vP'] = Math.round(vData['objViewableFrac'] * 100);
                if (payload in viewabilityCounts) {
                    viewabilityCounts[payload] += 1;
                } else {
                    viewabilityCounts[payload] = 1;
                }
                lastViewableFrac = vData['objViewableFrac'];
            }
        } catch (err) {
            // ignore
        }
    };

    var checkViewabilityInterval = window.setInterval(recordViewability, checkViewabilityIntervalMillis);
    var checkAndSendInterval = window.setInterval(checkAndSendCounts, sendIntervalMillis);
    var clearTimeout = function(e) { if (refireTimeout) { window.clearTimeout(refireTimeout); }};
};
