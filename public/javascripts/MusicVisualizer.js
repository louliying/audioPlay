/*
	obj是个json, 配置文件
	obj.size
	obj.visualizer   绘制canvas function
*/
function MusicVisualizer(obj){
	this.source = null;  //放置 buffer
	this.count = 0;  //放放置当前播放第几首

	this.analyser = MusicVisualizer.ac.createAnalyser(); //audio流分析源
	this.size = obj.size;
	this.analyser.fftSize = this.size * 2;

	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"]();  //音频对象的音量控制
	this.gainNode.connect(MusicVisualizer.ac.destination);

	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest();//ajax对象 

	this.visualizer = obj.visualizer;

	this.visualize();
}

MusicVisualizer.ac = new (window.AudioContext || window.webkitAudioContext)();  //音频对象 

// ajax异步取得音频文件
MusicVisualizer.prototype.load = function(url,cb){
	var self = this;
	this.xhr.open("GET",url);
	this.xhr.responseType = "arraybuffer"; //返回类型为arraybuffer
	this.xhr.onload = function(){  //定义 ajax返回后事件
		cb(self.xhr.response);  //触发回事件，把ajax返回数据以参数传回
	}
	this.xhr.send(); // ajax四步曲的最后一步，发送

}
MusicVisualizer.prototype.decode = function(arraybuffer, cb){  //音频解码事件
	MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){   //ac.decodeAudioData()将音频arraybuffer转成二进制， 第二个参数是成功后执行事件， 第三个参数是err后执行事件
		cb(buffer);//buffer是解码后的文件流
	},function(err){
		console.log(err);
	})
}
MusicVisualizer.prototype.play = function(url){  //
	var n = ++this.count;
	var self = this;
	this.source && this.stop();
	this.load(url,function(arraybuffer){
		if(n !== self.count){
			return;
		}
		self.decode(arraybuffer,function(buffer){
			if(n !== self.count){
				return;
			}
			var bs = MusicVisualizer.ac.createBufferSource();  //创建 bufferSource
			bs.connect(self.analyser);
			bs.buffer = buffer;
			bs[bs.start ? "start" : "noteOn"](0);
			self.source = bs;
		});
	});
}

MusicVisualizer.prototype.stop = function(){
	this.source[this.source.stop ? "stop" : "noteOff"](0);
}

MusicVisualizer.prototype.changeVolume = function(percent){
	this.gainNode.gain.value = percent * percent;
}

MusicVisualizer.prototype.visualize = function(){
	var self = this;
	//new Uint8Array(analyser.frequencyBinCount)
	var arr = new Uint8Array(this.analyser.frequencyBinCount);

	requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame;

	function v(){
		self.analyser.getByteFrequencyData(arr);
		self.visualizer(arr);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);
}
