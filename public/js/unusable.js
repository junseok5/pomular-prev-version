






let mode = 0; // 0 is video, 1 is audio

function seekedSkip(event) {
  removeViewSubtitle()
  let curTime = Math.floor(event.currentTime);
  subCount = binarySearch(subtitle, curTime);
  console.log(subCount);
  sectionIndexEvent()
  currentSectionTimeEvent(curTime);
  changeSubCountEvent();
}

// function autoSkipSavedSection() {
//   let mediaSectionInfo = localStorage.mediaSectionInfo;
//   if (mediaSectionInfo) {
//     mediaSectionInfo = JSON.parse(mediaSectionInfo);
//     skipSpecifiedSection(mediaSectionInfo.savedSection);
//   }
// }

getMediaMode();

function getMediaMode() {
  let mediaMode = localStorage.mediaMode;
  if (mediaMode) {
    if (mediaMode === "video") setVideoMode();
    else if (mediaMode === "audio") setAudioMode();
  }
}

function setVideoMode() {
  mode = 0;
  audio.removeClass('selected');
  video.addClass('selected');
  localStorage.mediaMode = "video";
}

function setAudioMode() {
  mode = 1;
  video.removeClass('selected');
  audio.addClass('selected');
  localStorage.mediaMode = "audio";
}


// youtube script test

let ysrt = [];
let ysrtDom;
let ysrtDomArray;
$.ajax({
  url: "https://video.google.com/timedtext?hl=en&lang=en&name=&v=-I3e6Mkfp7M&t=314s",
  success: function(result){
    console.log("ajax test start!");
    ysrtDom = result;
    ysrtDomArray = ysrtDom.documentElement.getElementsByTagName('text');
    console.log(ysrtDomArray);
    console.log(ysrtDomArray[0].attributes.start.value);
    console.log(ysrtDomArray[0].attributes.dur.value);
    ysrtSave(ysrtDomArray);
  }
});
function ysrtSave(arr) {
  for (let items = 0; items < arr.length; items++) {
    console.log(arr.length)
    ysrt.push({
      start: arr[items].attributes.start.value,
      dur: arr[items].attributes.dur.value,
      textContent: arr[items].textContent
    });
  }
  console.log(ysrt);
}


function getLocalStorageInfo() {
  let mediaSubtitleInfo = localStorage.mediaSubtitleInfo;
  let mediaSubcountInfo = localStorage.mediaSectionInfo;
  if (mediaSubtitleInfo && mediaSubcountInfo) {
    mediaSubtitleInfo = JSON.parse(mediaSubtitleInfo);
    mediaSubcountInfo = JSON.parse(mediaSubcountInfo);
    if (mediaSubtitleInfo.name === fileName) {
      subtitle = mediaSubtitleInfo.subtitle;
      setSubtitleInfo();
    }
    if (mediaSubcountInfo.name === fileName) {
      subCount = mediaSubcountInfo.savedSection;
      skipSpecifiedSection(subCount);
      sectionIndexEvent();
      changeSubCountEvent();
    }
  }
}

function adjustScreenSize() {
  if (!curScreenStatus) { // 전체화면으로 바꾸기
    view.css({
      "position": "fixed",
      "width": "100%",
      "height": "100%",
      "left": "0",
      "top": "0"
    });
    mediaView.css({
      "position": "absolute",
      "width": "100%",
      "height": "100%",
      "left": "0",
      "top": "0"
    });
    media.css({
      "position": "absolute",
      "left": "50%",
      "top": "50%",
      "transform": "translateX(-50%) translateY(-50%)"
    });
    mediaControl.hide();
    curScreenStatus = true;
    fullScreen();

  } else {
    view.css({
      "position": "relative"
    });
    mediaView.css({
      "position": "relative",
      "height": "auto"
    });
    media.css({
      "position": "relative",
      "left": "0",
      "top": "0",
      "transform": "none"
    });
    mediaControl.show();
    curScreenStatus = false;
    escapeFullScreen();
  }
}

function fullScreen() {
  let el = document.documentElement
  , rfs = // for newer Webkit and Firefox
         el.requestFullScreen
      || el.webkitRequestFullScreen
      || el.mozRequestFullScreen
      || el.msRequestFullScreen
  ;
  if (typeof rfs!="undefined" && rfs){
    rfs.call(el);
  } else if(typeof window.ActiveXObject!="undefined"){
    // for Internet Explorer
    let wscript = new ActiveXObject("WScript.Shell");
    if (wscript!=null) {
       wscript.SendKeys("{F11}");
    }
  }
}

function escapeFullScreen() {
  document.webkitCancelFullScreen();
}
