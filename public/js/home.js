const video = $('.video-mode');
const audio = $('.audio-mode');
const view = $('#view');
const mediaControl = $('.mediaControl');
let fileName;
let mediaView
let media;
let mediaDom;
let sectionTime;
let currentTime;
let totalTime;
let sectionView;
let currentSection;
let totalSection;
let controlMenu;
let menuIcon;
let controlView;
let forward;
let stopPlay;
let stopPlayIcon;
let stopPlayImg;
let backward;
let controlSubtitleView
let subtitleChk;
let subView;
let screenSize;
let selectSubtitle;
let objectURL;

let curmode = -1;
let isSubtitle = -1;
let subtitle = [{time: 0, script: ''}];
let subtitleIndexLength = -1;
let viewNum = 0;
let viewLimit = 1;
let subCount = 0;
let temCurSection = -1;
let mediaControlMenuStatus = true;
let curScreenStatus = false;

let ysrt = [];
let ysrtDom;
let ysrtDomArray;
$.ajax({
  url: "https://video.google.com/timedtext?hl=en&lang=en&name=&v=-I3e6Mkfp7M&t=314s",
  success: function(result){
    console.log("ajax test start!");
    console.log(result)
    ysrtDom = result;
    ysrtDomArray = ysrtDom.documentElement.getElementsByTagName('text');
    // console.log(ysrtDomArray);
    // console.log(ysrtDomArray[0].attributes.start.value);
    // console.log(ysrtDomArray[0].attributes.dur.value);
    // ysrtSave(ysrtDomArray);
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


function mediaDomDefinition() {
  mediaView = $('.media-view');
  mediaDom = $('#mediaDom');
  sectionTime = $('.section-time');
  currentTime = $('.current-time');
  totalTime = $('.total-time');
  sectionView = $('.section-view');
  currentSection = $('.current-section');
  totalSection = $('.total-section');
  controlMenu = $('.control-menu');
  menuIcon = $('.menu-icon');
  controlView = $('.control-view');
  forward = $('.forward');
  stopPlay = $('.stop-play');
  stopPlayIcon = $('#stop-play-icon');
  stopPlayImg = $('#stop-play-img');
  backward = $('.backward');
  controlSubtitleView = $('.control-subtitle-view');
  subtitleChk = $('.subtitle-chk');
  subView = $('.sub-view');
  screenSize = $('.screen-size');
  selectSubtitle = $('#select-subtitle');
}

function settingObjectURL() {
  if (viewNum == viewLimit) {
    alert("There is a limit of 1 video / audio.");
    return
  }
  const mediaFile = $('#mediaFile');
  const path = mediaFile.val();
  const file = mediaFile[0].files[0];
  console.log(file.name);
  fileName = file.name;
  objectURL = URL.createObjectURL(file);

  let viewDom = `
  <div class="media-view">
    <div class="media" onclick="skipForwardEvent()">
      <div class="sub-view"></div>
    </div>
    <div class="section-time">
      <div class="current-time">0:00</div>
      <div class="division">/</div>
      <div class="total-time">0:00</div>
    </div>
    <div class="section-view">
      <div class="current-section">0</div>
      <div class="division">/</div>
      <div class="total-section">0</div>
    </div>
    <div class="control-menu" onclick="viewMediaControlMenu()">
      <div class="menu-icon"></div>
      <div class="menu-icon"></div>
      <div class="menu-icon"></div>
    </div>
    <div class="control-view">
      <div class="forward gradient" onclick="skipForwardEvent()">
        <i class="material-icons">skip_previous</i>
      </div>
      <div class="stop-play gradient" onclick="videoPlayEvent()">
        <i id="stop-play-icon" class="material-icons">play_arrow</i>
      </div>
      <div class="backward gradient" onclick="skipBackwardEvent()">
        <i class="material-icons">skip_next</i>
      </div>
    </div>
    <div class="control-subtitle-view">
      <div class="cs-text">자막</div>
      <label class="switch" onclick="subtitleOnOff()">
        <input type="checkbox" class="subtitle-chk" checked />
        <span class="slider round"></span>
      </label>
    </div>
    <div class="screen-size" onclick="adjustScreenSize()">
      <i class="material-icons view-icon-size">crop_free</i>
    </div>
  </div>
  `;

  let selectSubtitleDom = `
    <div id="select-subtitle" class="selectFile">
      <label id="skipLabel">
        Import subtitle file(txt)
        <input type="file" accept='.src, .smi' onchange="readSRT(event)" />
      </label>
    </div>
  `; //text/plain

  let appendMediaDom = '';

  if (mode === 0) { // video mode
    appendMediaDom = `
    <video id="mediaDom" controls>
      <source src="` + objectURL + `" type="video/mp4" />
      <source src="` + objectURL + `" type="video/ogg" />
      <source src="` + objectURL + `" type="video/webm" />
      이 브라우저는 비디오를 지원하지 않습니다.
    </video>
    `;

  } else if (mode === 1) {  // Audio mode
    appendMediaDom = `
    <audio id="mediaDom">
      <source src="` + objectURL + `" type="audio/mp4" />
      <source src="` + objectURL + `" type="audio/ogg" />
      <source src="` + objectURL + `" type="audio/mp3" />
      <source src="` + objectURL + `" type="audio/webm" />
      이 브라우저는 비디오를 지원하지 않습니다.
    </audio>
    `;

  } else {
    alert('Error!');
    return;
  }

  view.append(viewDom);
  media = $('.media');
  media.append(appendMediaDom);
  mediaControl.append(selectSubtitleDom);
  mediaDomDefinition();
  viewNum++;

  getLocalStorageInfo();
}

function setSubtitleInfo() {
  isSubtitle = 1;
  subtitleIndexLength = subtitle.length - 1;
  mediaDom.attr("ontimeupdate", "autoSetSkip(this)");
  // mediaDom.attr("onseeked", "seekedSkip(this)");
  endSectionTimeEvent();
  changeSubtitleView();
  sectionIndexEvent();
}

function skipSpecifiedSection(section) {
  if (section < 0 || section > subtitleIndexLength) return;
  const currentTime = Math.floor(mediaDom[0].currentTime);
  mediaDom[0].currentTime = subtitle[section].time;
  currentSectionTimeEvent(currentTime);
}

function viewMediaControlMenu() {
  if (mediaControlMenuStatus) {
    menuIcon.css('background-color', '#fff');
    controlView.fadeOut('fast');
    controlSubtitleView.fadeOut('fast');
    screenSize.fadeOut('fast');
    mediaControlMenuStatus = 0;
  } else {
    menuIcon.css('background-color', '#1DDB16');
    controlView.fadeIn('slow');
    controlSubtitleView.fadeIn('slow');
    screenSize.fadeIn('slow');
    mediaControlMenuStatus = 1;
  }
}

function subtitleOnOff() {
  subtitleChk.is(":checked") ? subView.fadeIn('slow') : subView.fadeOut('slow');
}



function autoSetSkip(event) {
  let curTime = Math.floor(event.currentTime);
  currentSectionTimeEvent(curTime);
  if (subCount === subtitleIndexLength) return;
  if (curTime === subtitle[subCount + 1].time) {
    subCount++;
    let mediaSectionInfo = {
      name: fileName,
      savedSection: subCount
    }
    localStorage.mediaSectionInfo = JSON.stringify(mediaSectionInfo);
    sectionIndexEvent();
    changeSubCountEvent();
  }
  console.log(subCount);
}

// 자막 .srt 파일 읽기
function readSRT(event) {
  let input = event.target;
  let reader = new FileReader();

  reader.onload = () => {
    let text = reader.result;
    let splitEnter = text.split('\n');

    let insertMode = 0; // 0: skip(index), 1: time, 2: content
    let start;
    let end;
    let content = "";
    let whiteSpaceCheck = /^\s*$/;
    for ( i in splitEnter ) {
      if (!whiteSpaceCheck.test(splitEnter[i])) {
          if (insertMode === 0) {
            insertMode = 1;
            continue;
          }
          else if (insertMode === 1) {
              let timeSplit = splitEnter[i].split(' --> ');
              start = timeSplit[0].split(',')[0];
              end = timeSplit[1].split(',')[0];
              insertMode = 2;
          }
          else if (insertMode === 2) {
              content += splitEnter[i] + "\n";
          }
      } else {
          if (insertMode === 0) continue;
          let obj = {start: start, end: end, textContent: content};
          subtitle.push(obj);
          content = "";
          insertMode = 0;
      }
    }
    console.log(subtitle);
    arrayUnitConverter(subtitle);
  }

  reader.readAsText(input.files[0]);
}

// 자막 데이터 읽기
function skipData(event) {
  let input = event.target;
  let reader = new FileReader();
  reader.onload = () => {
    let text = reader.result;
    console.log(text);
    let sptSpacing = text.split('\n');
    let pushCount = 1;
    let temScript = '';
    for (i in sptSpacing) {
      let sptTab = sptSpacing[i].split('\t');
      if (sptTab[2] === undefined) {
        let whiteSpaceCheck = /^\s*$/;
        if (whiteSpaceCheck.test(sptTab[1])) continue;
        let obj = {time: sptTab[0], script: sptTab[1]};
        subtitle.push(obj);
        temScript = sptTab[1];
        pushCount++;
      } else {
        temScript = '\n' + sptTab[2];
        subtitle[pushCount - 1].script += temScript;
      }
    }
    subtitle.pop(); // 배열 마지막 요소 삭제 (자막 텍스트 파일 마지막은 항상 공백이기 때문)
    arrayUnitConverter(subtitle);
    console.log(subtitle);
    setSubtitleInfo();
    let mediaSubtitleInfo = {
      name: fileName,
      subtitle: subtitle
    }
    localStorage.mediaSubtitleInfo = JSON.stringify(mediaSubtitleInfo);
    console.log(JSON.parse(localStorage.mediaSubtitleInfo));
  };

  reader.readAsText(input.files[0]);
}

function sectionIndexEvent() {
  currentSection.text(subCount + 1);
  totalSection.text(subtitleIndexLength + 1);
}

function currentSectionTimeEvent(curtime) {
  let subtitleTime = subtitle[subCount].time;
  let curSectionTime = curtime - subtitleTime;
  if (curSectionTime === temCurSection || curSectionTime < 0) return;
  temCurSection = curSectionTime;
  let result = reverseUnitConverter(curSectionTime);
  currentTime.text(result);
}

function endSectionTimeEvent() {
  if (subtitle[subCount + 1] === undefined) return;
  endSectionTime = subtitle[subCount + 1].time - subtitle[subCount].time;
  let result = reverseUnitConverter(endSectionTime);
  totalTime.text(result);
}

$(document).keypress((event) => {
  let keyCode = event.which || event.keyCode;
  console.log(keyCode)
  if (keyCode === 97) {
    if (isSubtitle === -1) return;
    skipForwardEvent();
  } else if (keyCode === 100) {
    if (isSubtitle === -1) return;
    skipBackwardEvent();
  } else if (keyCode === 115) {
    playEvent(mediaDom[0]);
  }
});

function playEvent(media) {
  if (media.paused) {
    media.play();
    stopPlayIcon.text("pause");
  } else {
    media.pause();
    stopPlayIcon.text("play_arrow");
  }
}

function videoPlayEvent() {
  playEvent(mediaDom[0]);
}

function skipForwardEvent() {
  if ((subCount - 1) < 0 || isSubtitle === -1) return;
  const currentTime = Math.floor(mediaDom[0].currentTime);
  if (currentTime - subtitle[subCount].time >= 1) {
    mediaDom[0].currentTime = subtitle[subCount].time;
  } else {
    mediaDom[0].currentTime = subtitle[--subCount].time;
    sectionIndexEvent();
    changeSubCountEvent();
  }
}

function skipBackwardEvent() {
  if (subCount === subtitleIndexLength || isSubtitle === -1) return;
  mediaDom[0].currentTime = subtitle[++subCount].time;
  sectionIndexEvent();
  changeSubCountEvent();
}

function changeSubtitleView() {
  subView.text(subtitle[subCount].script);
}

function removeViewSubtitle() {
  subView.text('');
}

function changeSubCountEvent() {
  endSectionTimeEvent();
  changeSubtitleView();
}

// second -> hour:minute:second
function reverseUnitConverter(time) {
  if (time < 0) return;
  let result = '';
  let second = addZero(time % 60);
  let minute = Math.floor(time / 60);
  let hour = Math.floor(minute / 60);

  if (hour === 0) {
    if (minute === 0) {
      result = '0:' + second;
    } else {
      result = minute + ':' + second;
    }
  } else {
    minute = addZero(minute);
    result = hour + ':' + minute + ':' + second;
  }
  return result;
}

function addZero(time) {
  if (time < 10)
    return '0' + time;
  return time;
}

// array unitConverter
function arrayUnitConverter(arr) {
  for (let i = 1; i < arr.length; i++) {
    let time = arr[i].start;
    arr[i].start = unitConverter(time);
  }
  for (let i = 1; i < arr.length; i++) {
    let time = arr[i].end;
    arr[i].end = unitConverter(time);
  }
}

// hour:minute:second -> second
function unitConverter(time) {
  let sptTime = time.split(':');
  let hour = parseInt(sptTime[0]);
  let minute = parseInt(sptTime[1]);
  let second = parseInt(sptTime[2]);
  let result = (hour * 3600) + (minute * 60) + second;
  return result;
}

// subtitle[index].time
function binarySearch(arr, data) {
  let upperBound = arr.length - 1;
  let lowerBound = 0;
  let mid = -1;
  while (lowerBound <= upperBound) {
    mid = Math.floor((upperBound + lowerBound) / 2);
    if (arr[mid].time < data) {
      lowerBound = mid + 1;
    }
    else if (arr[mid].time > data) {
      upperBound = mid - 1;
    }
    else {
      return mid;
    }
  }
  if (lowerBound === mid && (mid - 1) !== -1) mid = mid - 1;
  return mid;
}
