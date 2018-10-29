function Timeout(options){
	this.countdown = 10
	this.rate = 1000
	this.timer = null

	for(let key in options){
		this[key] = options[key]
	}
	
	this.start = (countdown)=> {
		if(countdown) this.countdown = countdown
		this.started && this.started();
		settime(this);
	}

	this.stop = ()=> {
		clearTimeout(this.timer)
		this.timer = null
		this.stoped && this.stoped();
	}

	this.start();
}

function settime(o){
	if (o.countdown === 0) {
		return o.stop() 
	}else{
		o.timer = setTimeout(()=>{
			o.countdown--;
			settime(o)
		},o.rate) ;
		o.progress && o.progress(o.countdown);
	};
	
}

export default options => new Timeout(options)