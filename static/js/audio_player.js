function returnId(id) {
    return document.getElementById(id);
}

var song_title = returnId("song_title"),
    current_time = returnId("current_time"),
    fill_bar = returnId("fill"),
    seek_bar = returnId("seek_bar"),
    fill_volume = returnId("fill_volume"),
    volume_bar = returnId("volume_bar"),
    duration = returnId("duration"),
    play_btn = returnId("play_btn"),
    volume_btn = returnId("volume_btn"),
    download_btn = returnId("download_btn"),
    audio_analyser = returnId('audio_analyser'),
    frequency_canvas = returnId('frequency_canvas'),
    sine_canvas = returnId('sine_canvas'),
    spec_canvas = returnId('spec_canvas'),
    audio_player = returnId('audio_player'),
    close_btn = returnId('close_btn');

var ctx = frequency_canvas.getContext('2d'), sine_ctx = sine_canvas.getContext('2d'), spec_ctx = spec_canvas.getContext('2d'),
    cur_time = 20, song, analyser, source, audioContext, currentSong = null, timer, show_song_duration, update_slider;
let fbc_array, sine_array, spec_array;
var gradient = ctx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(1, '#ffff00');
gradient.addColorStop(0.50, '#fb5911');
gradient.addColorStop(0.25, '#00f7ff');
gradient.addColorStop(0, '#00ccff');

var hot = new chroma.scale(
    ['#000000', '#ff0000', '#ffff00', '#ffffff'],
    [0, .25, .75, 1]
).mode('rgb')
    .domain([0, 300])
var tempCanvas;


close_btn.addEventListener('click', async function (e) {
    if (audioContext.state == 'running') {
        await audioContext.close();
    }
    console.log("Closing Audio Player");
    audio_analyser.classList.add('d-none');
    audio_player.classList.add('d-none');
    currentSong = null;
    clearInterval(show_song_duration);
    clearInterval(update_slider);
    window.cancelAnimationFrame(frameLooper);
    window.cancelAnimationFrame(sinelooper);
    window.cancelAnimationFrame(draw_spectogram);
});

function update_song_slider() {
    var cur_time = Math.round(song.currentTime);
    var position = cur_time / song.duration;
    fill_bar.style.width = position * 100 + "%";
    current_time.textContent = convert_to_time(cur_time);
}

function convert_to_time(secs) {
    var min = Math.floor(secs / 60);
    var sec = secs % 60;
    min = (min < 10) ? "0" + min : min;
    sec = (sec < 10) ? "0" + sec : sec;
    return (min + ":" + sec);
}

function showDuration() {
    var d = Math.floor(song.duration);
    duration.textContent = convert_to_time(d);
}

async function play_stream(stream) {
    if (song != null && song.paused) {
        song = null;
        current_song = null;
        audio_player.classList.add("d-none");
        clearInterval(show_song_duration);
        clearInterval(update_slider);
        window.cancelAnimationFrame(frameLooper);
        window.cancelAnimationFrame(sinelooper);
        window.cancelAnimationFrame(draw_spectogram);
    }
    if (audioContext != undefined && audioContext.state == 'running') {
        console.log("Closing AudioContext and Player..");
        await audioContext.close();
        audio_analyser.classList.add('d-none');
        song = null;
        current_song = null;
    }
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    var distortion = audioContext.createWaveShaper();
    var gainNode = audioContext.createGain();
    var filter = audioContext.createBiquadFilter();
    var convolver = audioContext.createConvolver();


    // Create the audio graph.              
    source.connect(analyser);
    analyser.connect(distortion);
    distortion.connect(filter);
    filter.connect(convolver);
    convolver.connect(gainNode);
    gainNode.connect(audioContext.destination);
    // Create and specify parameters for the low-pass filter.
    filter.frequency.value = 1000;
    filter.gain.value = 25;
    fbc_array = new Uint8Array(analyser.frequencyBinCount);
    sine_array = new Uint8Array(1024);
    audio_analyser.classList.remove('d-none');
    frameLooper();
    sinelooper();
    draw_spectogram();
}

async function stop_stream() {
    if (audioContext != undefined && audioContext.state == 'running') {
        await audioContext.close();

    }
    console.log("Recording Stopped..");
    audio_analyser.classList.add('d-none');
    window.cancelAnimationFrame(frameLooper);
    window.cancelAnimationFrame(sinelooper);
    window.cancelAnimationFrame(draw_spectogram);
}

async function play_song_file(cur_song) {
    try {
        if (song != null && song.paused) {
            song = null;
            current_song = null;
            audio_player.classList.add("d-none");
            await clearInterval(show_song_duration);
            await clearInterval(update_slider);
            window.cancelAnimationFrame(frameLooper);
            window.cancelAnimationFrame(sinelooper);
            window.cancelAnimationFrame(draw_spectogram);
        }
        if (cur_song != null && cur_song != undefined) {
            if (currentSong == null) {
                audio_player.classList.remove('d-none');
                song = new Audio();
                audioContext = new AudioContext();
                currentSong = cur_song;
                song.src = "static/uploads/" + cur_song;
                source = audioContext.createMediaElementSource(song);
                show_song_duration = await setInterval(showDuration, 1000);
                update_slider = await setInterval(update_song_slider, 100);
                analyser = audioContext.createAnalyser();

                // Create the audio graph.              
                source.connect(analyser);
                analyser.connect(audioContext.destination);

                /*for(var ele in analyser){
                    console.log(ele+":"+analyser[ele]);
                }  */
                tempCanvas = document.createElement("canvas"),
                    tempCtx = tempCanvas.getContext("2d");
                tempCanvas.width = spec_canvas.width;
                tempCanvas.height = spec_canvas.height;

                fbc_array = new Uint8Array(analyser.frequencyBinCount);
                sine_array = new Uint8Array(analyser.fftSize);
                spec_array = new Uint8Array(analyser.frequencyBinCount);

                song.addEventListener('ended', async function () {
                    if (audioContext.state == 'running') {
                        await audioContext.close();
                    }
                    console.log("Audio ended");
                    audio_analyser.classList.add('d-none');
                    audio_player.classList.add('d-none');
                    currentSong = null;
                    await clearInterval(show_song_duration);
                    await clearInterval(update_slider);
                    window.cancelAnimationFrame(frameLooper);
                    window.cancelAnimationFrame(sinelooper);
                });
                audio_analyser.classList.remove('d-none');

                var percent = fill_volume.offsetWidth / volume_bar.offsetWidth;
                song.volume = percent;
                play_btn.innerHTML = "<i class='fas fa-pause'></i>";
                song_title.innerHTML = '<marquee>' + cur_song + '</marqee>';
                /*
                song.addEventListener('loadedmetadata', function() {
                    if (song.duration === Infinity) {
                        // set it to bigger than the actual duration
                        song.currentTime = 1e101;
                        song.ontimeupdate = function() {
                            this.ontimeupdate = () => {
                                return;
                            }
                            console.log(' after workaround: ' + song.duration);
                            song.currentTime = 0;
                        }                            
                    }
                });  
                */
                song.play();
                ctx.clearRect(0, 0, frequency_canvas.width, frequency_canvas.height);
                sine_ctx.clearRect(0, 0, sine_canvas.width, sine_canvas.height);
                frameLooper();
                sinelooper();
                draw_spectogram();
            }
            else {
                /* currentSong == cur_song */
                if (audioContext.state == 'running') {
                    await audioContext.close();
                }
                audio_analyser.classList.add('d-none');
                audio_player.classList.add('d-none');
                await clearInterval(show_song_duration);
                await clearInterval(update_slider);
                currentSong = null;
                console.log("Running again");
                play_song_file(cur_song);
            }

        }
        else {
            console.log("song is Undefined");
            return;
        }
    }
    catch (error) {
        console.log(error);
        return;
    }
}

async function play_src(cur_song) {
    try {
        if (song != null && song.paused) {
            song = null;
            current_song = null;
            audio_player.classList.add("d-none");
            clearInterval(show_song_duration);
            clearInterval(update_slider);
            window.cancelAnimationFrame(frameLooper);
            window.cancelAnimationFrame(sinelooper);
            window.cancelAnimationFrame(draw_spectogram);
        }
        if (cur_song != null && cur_song != undefined) {
            if (currentSong == null) {
                audio_player.classList.remove('d-none');
                song = new Audio();
                audioContext = new AudioContext();
                currentSong = cur_song;
                song.src = window.URL.createObjectURL(currentSong);
                source = audioContext.createMediaElementSource(song);
                song_title.innerHTML = '<marquee>' + cur_song.name + '</marqee>';
                analyser = audioContext.createAnalyser();
                // Create the audio graph.              
                source.connect(analyser);
                analyser.connect(audioContext.destination);

                /*for(var ele in analyser){
                    console.log(ele+":"+analyser[ele]);
                }  */
                tempCanvas = document.createElement("canvas"),
                    tempCtx = tempCanvas.getContext("2d");
                tempCanvas.width = spec_canvas.width;
                tempCanvas.height = spec_canvas.height;

                fbc_array = new Uint8Array(analyser.frequencyBinCount);
                sine_array = new Uint8Array(analyser.fftSize);
                spec_array = new Uint8Array(analyser.frequencyBinCount);

                song.addEventListener('ended', async function () {
                    if (audioContext.state == 'running') {
                        await audioContext.close();
                    }
                    console.log("Audio ended");
                    audio_analyser.classList.add('d-none');
                    audio_player.classList.add('d-none');
                    currentSong = null;
                    await clearInterval(show_song_duration);
                    await clearInterval(update_slider);
                    window.cancelAnimationFrame(frameLooper);
                    window.cancelAnimationFrame(sinelooper);
                });
                audio_analyser.classList.remove('d-none');

                var percent = fill_volume.offsetWidth / volume_bar.offsetWidth;
                song.volume = percent;
                play_btn.innerHTML = "<i class='fas fa-pause'></i>";
                show_song_duration = setInterval(showDuration, 1000);
                update_slider = setInterval(update_song_slider, 100);
                /*
                song.addEventListener('loadedmetadata', function() {
                    if (song.duration === Infinity) {
                        // set it to bigger than the actual duration
                        song.currentTime = 1e101;
                        song.ontimeupdate = function() {
                            this.ontimeupdate = () => {
                                return;
                            }
                            console.log(' after workaround: ' + song.duration);
                            song.currentTime = 0;
                        }                            
                    }
                });  
                */
                song.play();
                ctx.clearRect(0, 0, frequency_canvas.width, frequency_canvas.height);
                sine_ctx.clearRect(0, 0, sine_canvas.width, sine_canvas.height);
                frameLooper();
                sinelooper();
                draw_spectogram();
            }
            else {
                /* currentSong == cur_song */
                if (audioContext.state == 'running') {
                    await audioContext.close();
                }
                audio_analyser.classList.add('d-none');
                audio_player.classList.add('d-none');
                await clearInterval(show_song_duration);
                await clearInterval(update_slider);
                currentSong = null;
                console.log("Running again");
                play_song(cur_song);
            }

        }
        else {
            console.log("song is Undefined");
            return;
        }
    }
    catch (error) {
        console.log(error);
        return;
    }
}

async function play_song(cur_song) {
    try {
        if (song != null && song.paused) {
            song = null;
            current_song = null;
            audio_player.classList.add("d-none");
            clearInterval(show_song_duration);
            clearInterval(update_slider);
            window.cancelAnimationFrame(frameLooper);
            window.cancelAnimationFrame(sinelooper);
            window.cancelAnimationFrame(draw_spectogram);
        }
        if (cur_song != null && cur_song != undefined) {
            if (currentSong == null) {
                audio_player.classList.remove('d-none');
                song = new Audio();
                audioContext = new AudioContext();
                currentSong = cur_song;
                var file_url = window.URL.createObjectURL(currentSong);
                song.src = file_url;
                source = audioContext.createMediaElementSource(song);
                song_title.innerHTML = '<marquee>' + cur_song.name + '</marqee>';
                analyser = audioContext.createAnalyser();
                // Create the audio graph.              
                source.connect(analyser);
                analyser.connect(audioContext.destination);

                /*for(var ele in analyser){
                    console.log(ele+":"+analyser[ele]);
                }  */
                tempCanvas = document.createElement("canvas"),
                    tempCtx = tempCanvas.getContext("2d");
                tempCanvas.width = spec_canvas.width;
                tempCanvas.height = spec_canvas.height;

                fbc_array = new Uint8Array(analyser.frequencyBinCount);
                sine_array = new Uint8Array(analyser.fftSize);
                spec_array = new Uint8Array(analyser.frequencyBinCount);

                song.addEventListener('ended', async function () {
                    if (audioContext.state == 'running') {
                        await audioContext.close();
                    }
                    console.log("Audio ended");
                    audio_analyser.classList.add('d-none');
                    audio_player.classList.add('d-none');
                    currentSong = null;
                    await clearInterval(show_song_duration);
                    await clearInterval(update_slider);
                    window.cancelAnimationFrame(frameLooper);
                    window.cancelAnimationFrame(sinelooper);
                });
                audio_analyser.classList.remove('d-none');

                var percent = fill_volume.offsetWidth / volume_bar.offsetWidth;
                song.volume = percent;
                play_btn.innerHTML = "<i class='fas fa-pause'></i>";
                show_song_duration = setInterval(showDuration, 1000);
                update_slider = setInterval(update_song_slider, 100);
                /*
                song.addEventListener('loadedmetadata', function() {
                    if (song.duration === Infinity) {
                        // set it to bigger than the actual duration
                        song.currentTime = 1e101;
                        song.ontimeupdate = function() {
                            this.ontimeupdate = () => {
                                return;
                            }
                            console.log(' after workaround: ' + song.duration);
                            song.currentTime = 0;
                        }                            
                    }
                });  
                */
                song.play();
                ctx.clearRect(0, 0, frequency_canvas.width, frequency_canvas.height);
                sine_ctx.clearRect(0, 0, sine_canvas.width, sine_canvas.height);
                frameLooper();
                sinelooper();
                draw_spectogram();
            }
            else {
                /* currentSong == cur_song */
                if (audioContext.state == 'running') {
                    await audioContext.close();
                }
                audio_analyser.classList.add('d-none');
                audio_player.classList.add('d-none');
                await clearInterval(show_song_duration);
                await clearInterval(update_slider);
                currentSong = null;
                console.log("Running again");
                play_song(cur_song);
            }

        }
        else {
            console.log("song is Undefined");
            return;
        }
    }
    catch (error) {
        console.log(error);
        return;
    }
}

function play(btn) {
    if (song.paused) {
        console.log("Playing");
        song.play();
        play_btn.innerHTML = "<i class='fas fa-pause'></i>";
        audio_analyser.classList.remove('d-none');
    } else {
        console.log("Paused");
        song.pause();
        play_btn.innerHTML = "<i class='fas fa-play'></i>";
        audio_analyser.classList.add('d-none');
    }
}

seek_bar.addEventListener("click", function (e) {
    var percent = e.offsetX / this.offsetWidth;
    song.currentTime = percent * song.duration;
    e.target.value = Math.floor(percent / 100);
    fill_bar.style.width += Math.floor(percent / 100);
});

volume_bar.addEventListener("click", function (e) {
    var percent = e.offsetX / this.offsetWidth;
    song.volume = percent;
    if (song.muted == true) {
        song.muted = false;
        volume_btn.innerHTML = "<i class='fas fa-volume-up'></i>";
    }
    fill_volume.style.width = Math.floor(percent * this.offsetWidth) + "px";
});

function mute_unmute(volume_manage) {
    if (song.muted == true) {
        console.log("Audio unmuted");
        song.muted = false;
        volume_manage.innerHTML = "<i class='fas fa-volume-up'></i>";
    } else {
        console.log("Audio Muted");
        song.muted = true;
        volume_manage.innerHTML = "<i class='fas fa-volume-mute'></i>";
    }
}

function download_audio() {
    try {
        var link = document.createElement('a');
        var url = currentSong, filename = currentSong;
        link.href = url;
        link.download = filename;
        link.click();
    }
    catch (error) {
        console.log("Error: " + error);
    }
}

function frameLooper() {
    analyser.getByteFrequencyData(fbc_array);
    window.requestAnimationFrame(frameLooper);
    ctx.fillStyle = '#0b0c10'; //background-color
    ctx.fillRect(0, 0, frequency_canvas.width, frequency_canvas.height);
    ctx.beginPath();
    let bar_x = 0;
    let bar_height;
    const bar_width = (frequency_canvas.width / analyser.frequencyBinCount) * 2;
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
        bar_x = i * 2;
        bar_height = -(fbc_array[i] / 2);
        /*var red = bar_height + (25 * (i/fbc_array[i]));
        var green = 250 * (i/fbc_array[i]);
        var blue = 50;
        ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';//bar-color*/
        ctx.fillStyle = gradient;
        ctx.fillRect(bar_x, frequency_canvas.height, bar_width, bar_height);
    }
}

function sinelooper() {
    window.requestAnimationFrame(sinelooper);
    analyser.getByteTimeDomainData(sine_array);

    sine_ctx.fillStyle = "#0b0c10";
    sine_ctx.fillRect(0, 0, sine_canvas.width, sine_canvas.height);
    sine_ctx.lineWidth = 2;
    sine_ctx.strokeStyle = "#00f7ff";
    sine_ctx.beginPath();

    // draw wave
    const sliceWidth = sine_canvas.width * 1.0 / analyser.fftSize;
    let x = 0;

    for (let i = 0; i < analyser.fftSize; i++) {
        const v = sine_array[i] / 128.0; // byte / 2 || 256 / 2
        const y = v * sine_canvas.height / 2;

        if (i === 0) {
            sine_ctx.moveTo(x, y);
        } else {
            sine_ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    sine_ctx.lineTo(sine_canvas.width, sine_canvas.height / 2);
    sine_ctx.stroke();
}

function draw_spectogram() {
    analyser.getByteFrequencyData(spec_array);
    window.requestAnimationFrame(draw_spectogram);
    tempCtx.drawImage(spec_canvas, 0, 0, spec_canvas.width, spec_canvas.height);
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
        var value = spec_array[i];
        spec_ctx.fillStyle = hot(value).hex();

        // draw the line at the right side of the canvas
        spec_ctx.fillRect(spec_canvas.width - 1, spec_canvas.height - i, 1, 1);
    }

    // set translate on the canvas
    spec_ctx.translate(-1, 0);
    // draw the copied image
    spec_ctx.drawImage(tempCanvas, 0, 0, spec_canvas.width, spec_canvas.height, 0, 0, spec_canvas.width, spec_canvas.height);

    // reset the transformation matrix
    spec_ctx.setTransform(1, 0, 0, 1, 0, 0);
}