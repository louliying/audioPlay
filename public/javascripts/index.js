function $(str){
	return document.querySelectorAll(str);
}
var oLis = $("#list li");
var size = 128;

var box = $("#box")[0];
var height, width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var Dots = [];
var line;

var mv = new MusicVisualizer({
	size:size,
	visualizer:draw
})
for(var i = 0, iLen = oLis.length; i < iLen; i++){
	oLis[i].onclick = function(){
		for(var j = 0; j < iLen; j++){
			oLis[j].className = "";
		}
		this.className = "selected";
		//load("/media/" + this.title);
		mv.play("/media/" + this.title);
	}
}

/*var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext || window.webkitAudioContext)();  //音频对象 
var gainNode = ac[ac.createGain ? "createGain" : "createGainNode"]();  //音频对象的音量控制
gainNode.connect(ac.destination);

var analyser = ac.createAnalyser();
var size = 128;
analyser.fftSize = size * 2;
analyser.connect(gainNode);

var source = null;
var count = 0;*/


function random(m,n){
	return Math.round(Math.random()*(n-m) + m);
}
function getDots(){
	Dots = [];
	for(var i=0; i < size; i++){
		var x = random(0,width);
		var y = random(0, height);
		var color = "rgba(" + random(0,255) + "," + random(0,255) + "," + random(0,255) + ", 0)";
		Dots.push({
			x:x,
			y:y,
			dx: random(1,4),  //dot点往右移动
			color:color,
			cap:0   //小点点距离柱形位置
		});
	}
}

function resize(){
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.height = height;
	canvas.width = width;
	line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");
	
	getDots();
}
resize();
window.onresize = resize;

function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w = width / size;
	var cw = w * 0.6;
	var capH = cw > 10 ? 10 : cw;  //小点点的高大高度为10px
	ctx.fillStyle = line;
	for(var i=0; i < size; i++) {
		var o = Dots[i];
		if(draw.type == "column"){
			var h = arr[i] / 256 * height;
			ctx.fillRect(w*i, height - h, cw, h);  //绘柱形
			ctx.fillRect(w*i,height - (o.cap + capH), cw, capH); //绘柱形上面的小点
			o.cap--;  //小点离柱形的距离 -- 
			if(o.cap < 0 ){ //
				o.cap = 0;
			}
			if(h > 0 && o.cap < h + 40){  //小点离柱子距离不小于40
				o.cap = h + 40 > height - capH ? height - capH : h + 40;
			}
			//ctx.fillRect(w*i, height - h, w*0.6, h);
		}else if(draw.type == "dot"){
			ctx.beginPath();			
			//var r = arr[i] / 256 * 50;
			var r = 10 + arr[i] / 256 * ( height > width ? width : height) / 30; //半径最小值 为10，取屏幕宽高小的那个
			ctx.arc(o.x, o.y, r, 0, Math.PI*2, true);
			var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
			g.addColorStop(0, "#fff");
			g.addColorStop(1, o.color);
			ctx.fillStyle = g;
			ctx.fill();
			o.x += o.dx;
			o.x = o.x > width ? 0 : o.x;  //移到屏幕最右后，置为0重来过
			//ctx.strokeStyle = "#fff";
			//ctx.stroke();
		}
		
	}
}
draw.type = "column";
var types = $("#type li");
for(var i=0, iLen = types.length; i < iLen; i++){
	types[i].onclick = function(){
		for(var j = 0; j < iLen; j++){
			types[j].className = "";
		}
		this.className = "selected";
		draw.type = this.getAttribute("data-type");
		//alert(draw.type);
	}
}
/*function load(url){
	var n = ++count;
	source && source[source.stop ? "stop" : "noteOff"]();
	xhr.abort();
	xhr.open("GET",url);
	xhr.responseType = "arraybuffer";
	xhr.onload = function(){
		//console.log(xhr.response);
		if(n != count) return;
		ac.decodeAudioData(xhr.response,function(buffer){
			if(n != count) return;
			var bufferSource = ac.createBufferSource();
			bufferSource.buffer = buffer;
			//bufferSource.connect(ac.destination);
			//bufferSource.connect(gainNode);
			bufferSource.connect(analyser);
			bufferSource[bufferSource.start ? "start" : "noteOn"](0);
			source = bufferSource;
		},function(err){
			console.log(err);
		})
	}
	xhr.send();
}
*/
/*function visualizer(){
	var arr = new Uint8Array(analyser.frequencyBinCount);

	requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame;

	function v(){
		analyser.getByteFrequencyData(arr);
		//console.log(arr);
		draw(arr);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);	
}
visualizer();*/

/*function changeVolume(percent){
	gainNode.gain.value = percent * percent;
}
*/
window.onload = function(){
	$("#volume")[0].onchange = function(){
		mv.changeVolume(this.value/this.max);
	}
	$("#volume")[0].onchange();
}
