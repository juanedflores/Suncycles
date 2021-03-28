/*
 * [CONTROL CENTER]
 */
// Scene Cues
Juan_Video1 = "o0swvMyxlBI";
Juan_Video0 = "PtOS9r1keIg";
Juan_Video2 = "8FoLSXSmbek";
Juan_Video3 = "OE_YeuGwjLU";
Juan_Video4 = "6QvdgJa3ca0";
Juan_Video5 = "mz86Fgkwp0o";
Juan_Video6 = "aNAaa17TItk";
Juan_Video7 = "npnvgHoVFMk";
Isaac_Video1 = "5RwtXDW-kyc";
Isaac_Video0 = "dbHS4Yybo-U";
Isaac_Video2 = "7aHJsnuM-as";
Isaac_Video3 = "avnXMTniytY";
Isaac_Video4 = "8k0eUwyuS20";
Isaac_Video5 = "6JBINeMUem8";
JuanExtraPlaylist = ["ijlcCf-P0zU, 9hNA-XdOZwo"];
IsaacExtraPlaylist = ["eQR-ls-4RzM", "WW8p-eYJ6k4", "mzQMzA2A8hM"];
duration = 600;
scene1_end = 0.14; // s1 min duration: 8 seconds = 0.013
scene2_end = 0.35; // s2 in duration: 14 seconds + 50 seconds back cam cue = 0.10
scene2_juanBackCamCue = 50000;
scene3_end = 0.52; // s3 min duration: 10 seconds. = 0.01
scene4_end = 0.59; // s4 in duration: 12 seconds. = 0.02
scene5_end = 0.82; // s5 min duration: 70 seconds = 0.116
scene6_end = 0.92;
finalFadeOut = 0.92;
// Video Size & Position Cues
dims1_end = scene1_end + 0.1083;
dims2_end = scene2_end;
dims3_end = scene3_end + 0.01;
dims4_end = scene5_end + 0.01;
dims5_end = 1.0;

/////////////////////////////////////////////////////////////////////////////
let scene_num = 0;
$(document).ready(function () {
  var callScene = window["scene" + String(scene_num) + "VideoDims"];
  callScene();
  sizeTheVideo();
  $(window).resize(function () {
    var callScene = window["scene" + String(scene_num) + "VideoDims"];
    callScene();
    sizeTheVideo();
  });
});

var progress = 0;
var progress_cachedValue = progress;
function checkProgress() {
  if (progress == progress_cachedValue) {
    //we want it to match
    setTimeout(checkProgress, 50); //wait 50 millisecnds then recheck
    return;
  }
  progress_cachedValue = progress;
  // get API
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
checkProgress();

var player_Juan;
var player_Isaac;
var player_Juan_extra1;
var player_Isaac_extra1;
var playJuanID;
var playIsaacID;
var playJuanExtraID;
var playIsaacExtraID;
var cueVideo = false;
function onYouTubeIframeAPIReady() {
  playJuanID = Juan_Video1;
  playIsaacID = Isaac_Video1;
  playJuanExtraID = JuanExtraPlaylist;
  playIsaacExtraID = IsaacExtraPlaylist;
  if (progress > scene1_end && progress < scene2_end) {
    scene2_bool = true;
    scene1_bool = true;
    playJuanID = Juan_Video2;
    playIsaacID = Isaac_Video2;
    cueVideo = true;
  } else if (
    progress > scene1_end + scene2_juanBackCamCue / 1000 / duration &&
    progress < scene3_end
  ) {
    scene2_bool = true;
    scene1_bool = true;
    playJuanID = Juan_Video3;
    playIsaacID = Isaac_Video3;
  } else if (progress > scene3_end && progress < scene4_end) {
    scene4_bool = true;
    scene1_bool = true;
    playJuanID = Juan_Video4;
    playIsaacID = Isaac_Video3;
  }
  console.log("playingID: " + playJuanID);

  player_Juan = new YT.Player("video_Juan", {
    height: "390",
    width: "640",
    videoId: playJuanID,
    events: {
      onReady: onPlayerReadyJuan,
      onStateChange: onPlayerStateChange,
    },
  });

  player_Isaac = new YT.Player("video_Isaac", {
    height: "390",
    width: "640",
    videoId: playIsaacID,
    events: {
      onReady: onPlayerReadyIsaac,
      onStateChange: onPlayerStateChange,
    },
  });

  player_Juan_extra1 = new YT.Player("video_Juan_extra1", {
    height: "390",
    width: "640",
    videoId: playJuanExtraID,
    events: {
      onReady: onPlayerReadyJuanExtra,
      onStateChange: onPlayerStateChange,
    },
  });

  player_Isaac_extra1 = new YT.Player("video_Isaac_extra1", {
    height: "390",
    width: "640",
    videoId: playIsaacExtraID,
    events: {
      onReady: onPlayerReadyIsaacExtra,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReadyJuan(event) {
  // Adjust player size.
  scene1VideoDims();
  // Start the script.
  startScenes();

  // Where to start video depending on when the user enters.
  let secondsToSeek = 0;
  if (playJuanID == Juan_Video1 && progress < scene1_end) {
    secondsToSeek = scene1_end * duration - progress * duration;
  } else if (playJuanID == Juan_Video2 && progress < scene2_end) {
    secondsToSeek = scene2_end * duration - progress * duration;
  } else if (playJuanID == Juan_Video3 && progress < scene3_end) {
    secondsToSeek = scene3_end * duration - progress * duration;
  } else if (playJuanID == Juan_Video4 && progress < scene4_end) {
    secondsToSeek = scene4_end * duration - progress * duration;
  }
  console.log("seek to: " + secondsToSeek);
  event.target.seekTo(Math.floor(secondsToSeek), true);

  // Volume
  // fadeVolume(player_Juan, 0, 50, 1000, 2);
  if (progress < 0.01) {
    player_Juan.playVideo();
    player_Juan.setVolume(0);
  }
  player_Juan.setVolume(0);

  if (cueVideo) {
    // Juan Back video should cue later.
    let secondsTillCue =
      scene2_juanBackCamCue / 1000 / duration -
      scene1_end +
      progress * duration;
    console.log("seconds2cue: " + secondsTillCue);
    setTimeout(function () {
      // After 50 seconds, start to fade out the frame.
      basicVideoTransition(
        player_Juan,
        ".videoContainerJuanMain iframe",
        Juan_Video3,
        20,
        400
      );
    }, Math.floor(secondsTillCue) * 1000);
  }
}

function onPlayerReadyIsaac(event) {
  // Where to start video depending on where user enters.
  let secondsToSeek = 0;
  // if (playIsaacID == Isaac_Video1 && progress < scene1_end) {
  //   secondsToSeek = scene1_end * duration - progress * duration;
  // } else if (playIsaacID == Isaac_Video2 && progress < scene2_end) {
  //   secondsToSeek = scene2_end * duration - progress * duration;
  // } else if (playIsaacID == Isaac_Video3 && progress < scene3_end) {
  //   secondsToSeek = scene3_end * duration - progress * duration;
  // }
  event.target.seekTo(Math.floor(secondsToSeek), true);

  // Volume
  if (progress < 0.01) {
    player_Isaac.playVideo();
    player_Isaac.setVolume(0);
  }
  player_Isaac.setVolume(0);
}

function onPlayerReadyJuanExtra() {}

function onPlayerReadyIsaacExtra() {}

function onPlayerStateChange(event) {}

// [ SCENES ] ////////////////////////////
let scene1_bool = false;
let scene2_bool = false;
let scene3_bool = false;
let scene4_bool = false;
let scene5_bool = false;
let scene6_bool = false;
let scene7_bool = false;
let finalScene_bool = false;

function scene0() {
  console.log("scene0");
  async function Tutor() {
    await sleep(3000);
  }
  Tutor();
  $(".videoContainerJuanExtra iframe").fadeOut(4000);
  $(".videoContainerIsaacExtra iframe").fadeOut(4000);
}

function scene1() {
  console.log("[SCENE 1]");
  // duration:
  if (restarted) {
    player_Juan.loadVideoById({
      videoId: Juan_Video1,
      startSeconds: 0,
      endSeconds: 500,
    });

    player_Isaac.loadVideoById({
      videoId: Isaac_Video1,
      startSeconds: 0,
      endSeconds: 400,
    });
  }
  // fade in volume from 0 to 30.
  setTimeout(function () {
    fadeVolume(player_Juan, 30, 20000, 1);
    fadeVolume(player_Isaac, 30, 20000, 1);
  }, 2000);

  // Fade in main videos.
  setTimeout(function () {
    $(".videoContainerJuanMain iframe").fadeIn(4000);
    $(".videoContainerIsaacMain iframe").fadeIn(4000);
  }, 5000);

  /*
   * [Trigger in more landscape/context shots]
   */
  // 12 seconds in, switch Isaac to mercado static.
  // duration 122, start 80, end 40 seconds later.
  setTimeout(function () {
    basicVideoTransition(
      player_Isaac,
      ".videoContainerIsaacMain iframe",
      Isaac_Video0,
      80,
      121,
      0.5
    );

    setTimeout(function () {
      fadeVolume(player_Isaac, 5, 5000, 1);
    }, 12000);

    setTimeout(function () {
      basicVideoTransition(
        player_Isaac,
        ".videoContainerIsaacMain iframe",
        Isaac_Video5,
        6,
        170,
        0.5
      );
    }, 40000);
  }, 30000);

  // 15 seconds in, switch Juan to street view.
  // duration 462, start 80, end 20 seconds later.
  setTimeout(function () {
    basicVideoTransition(
      player_Juan,
      ".videoContainerJuanMain iframe",
      Juan_Video0,
      20,
      571
    );
    setTimeout(function () {
      fadeVolume(player_Juan, 10, 5000, 1);
    }, 2000);
  }, 44000);

  // setTimeout(function () {
  //   scene2();
  // }, 54000);

  scene1_bool = true;
}

function scene2() {
  console.log("[SCENE 2]");
  if (!scene2_bool) {
    basicVideoTransition(
      player_Juan,
      ".videoContainerJuanMain iframe",
      Juan_Video2,
      2,
      60
    );

    setTimeout(function () {
      basicVideoTransition(
        player_Isaac,
        ".videoContainerIsaacMain iframe",
        Isaac_Video2,
        2,
        571
      );
    }, 14000);

    /*
     * [Fade out Juan cam first.. then fade in back cam]
     */
    setTimeout(function () {
      // After 50 seconds, start to fade out the frame.
      basicVideoTransition(
        player_Juan,
        ".videoContainerJuanMain iframe",
        Juan_Video3,
        2 + scene2_juanBackCamCue / 1000,
        400
      );
    }, scene2_juanBackCamCue);
  }

  scene2_bool = true;
}

function scene3() {
  console.log("[SCENE 3]");

  if (!scene3_bool) {
    // detail shots
    player_Juan_extra1.loadPlaylist({
      playlist: JuanExtraPlaylist,
      index: 0,
      startSeconds: 0,
    });
    player_Juan_extra1.setLoop(true);
    player_Juan_extra1.mute();

    player_Isaac_extra1.loadPlaylist({
      playlist: IsaacExtraPlaylist,
      index: 0,
      startSeconds: 0,
    });
    player_Isaac_extra1.setLoop(true);
    player_Isaac_extra1.mute();

    setTimeout(function () {
      $(".videoContainerJuanExtra iframe").fadeIn(6000);
      $(".videoContainerIsaacExtra iframe").fadeIn(6000);
    }, 4000);
  }

  scene3_bool = true;
}

function scene4() {
  console.log("[SCENE 4]");

  if (!scene4_bool) {
    // fade out images.
    $(".videoContainerJuanExtra iframe").fadeOut(2000);
    $(".videoContainerIsaacExtra iframe").fadeOut(2000);
    $(".videoContainerJuanMain iframe").fadeOut(6000);
    $(".videoContainerIsaacMain iframe").fadeOut(6000);

    // load Juan overhead cam and make videos large & centered in each section.
    setTimeout(function () {
      basicVideoTransition(
        player_Juan,
        ".videoContainerJuanMain iframe",
        Juan_Video4,
        (scene3_end - scene1_end) * 600 + 1,
        1000,
        0,
        1.0
      );

      videoTransition(
        player_Isaac,
        ".videoContainerIsaacMain iframe",
        100,
        0,
        1.0,
        false
      );
    }, 6000);

    // Housekeeping...
    setTimeout(function () {
      // stop the extra videos
      player_Juan_extra1.stopVideo();
      player_Isaac_extra1.stopVideo();
    }, 2000);

    scene4_bool = true;
  }
}

/*
 * [Drone]
 */
function scene5() {
  if (!scene5_bool) {
    // cue in drone shot for Juan.
    // duration: 59 + 50 = 1:49.
    basicVideoTransition(
      player_Juan,
      ".videoContainerJuanMain iframe",
      Juan_Video5,
      116,
      270,
      1.0,
      1.0
    );

    setTimeout(function () {
      videoTransition(
        player_Juan,
        ".videoContainerJuanMain iframe",
        3000,
        0.5,
        0.5
      );
      setTimeout(function () {
        player_Juan.seekTo(215, true); // 3:34 of the video.
      }, 3000);

      setTimeout(function () {
        // fade back to Juan cam.
        basicVideoTransition(
          player_Juan,
          ".videoContainerJuanMain iframe",
          Juan_Video6,
          (scene4_end - scene1_end) * 600 + 64 + 29,
          800,
          1.0,
          1.0
        );
      }, 50000); // max can be around 55 minutes.
    }, 59000); // 2:55 of the video.
  }

  scene5_bool = true;
}

function scene6() {
  if (!scene6_bool) {
    // four square.
    $(".videoContainerJuanMain iframe").fadeOut(3000);
    $(".videoContainerIsaacMain iframe").fadeOut(3000);

    setTimeout(function () {
      player_Juan.loadVideoById({
        videoId: Juan_Video7,
        startSeconds: 20,
        endSeconds: 660,
      });
    }, 3000);

    videoTransition(
      player_Isaac,
      ".videoContainerJuanMain iframe",
      3000,
      0.5,
      0.5,
      false
    );

    player_Juan_extra1.loadVideoById({
      videoId: Juan_Video6,
      startSeconds: (scene5_end - scene1_end) * 600 + 1,
      endSeconds: 660,
    });
    player_Isaac_extra1.loadVideoById({
      videoId: Isaac_Video3,
      startSeconds: scene5_end * 600,
      endSeconds: 1080,
    });

    setTimeout(function () {
      $(".videoContainerJuanExtra iframe").fadeIn(3000);
      $(".videoContainerIsaacMain iframe").fadeIn(3000);
      setTimeout(function () {
        $(".videoContainerJuanMain iframe").fadeIn(3000);
        $(".videoContainerIsaacExtra iframe").fadeIn(3000);
      }, 5000);
    }, 6000);
  }
  scene6_bool = true;
}

function finalSceneFadeout() {
  if (!finalScene_bool) {
    // fade out images.
    $(".videoContainerJuanMain iframe").fadeOut(10000);
    $(".videoContainerIsaacMain iframe").fadeOut(10000);
    $(".videoContainerJuanExtra iframe").fadeOut(10000);
    $(".videoContainerIsaacExtra iframe").fadeOut(10000);
    // fade out sound after images.
    setTimeout(function () {
      fadeVolume(player_Juan, 0, 10000, 1);
      fadeVolume(player_Isaac, 0, 10000, 1);
    }, 10000);
  }
}

let restarted;
function startScenes() {
  setInterval(function () {
    console.log("maininterval. Progress: " + String(progress));
    if (progress < scene1_end) {
      if (!scene1_bool) {
        // Landscape of roofs.
        scene1();
      }
    } else if (progress < scene2_end) {
      if (!scene2_bool) {
        // Comes in the performers. They set up.
        // Juan fade out first.. Transitions to back cam.
        // after back cam comes in, make the video width wider.
        scene2();
      }
    } else if (progress < scene3_end) {
      if (!scene3_bool) {
        // Performer cams move up and become slightly smaller,
        // in come the detail shots. They fade in.
        scene3();
      }
    } else if (progress < scene4_end) {
      if (!scene4_bool) {
        // Juan Overhead. Isaac ...
        // Biggest size, centered in their sections.
        scene4();
      }
    } else if (progress < scene5_end) {
      if (!scene5_bool) {
        // cue in drone shot..
        scene5();
      }
    } else if (progress < scene6_end) {
      if (!scene6_bool) {
        // Four square grid..
        // Top two webcam shot.
        // Bottom two screencaptures or details or landscape.
        scene6();
      }
    } else if (progress > finalFadeOut && progress < 1.0) {
      console.log("RESTARTING...");
      finalSceneFadeout();
      finalScene_bool = true;
      scene1_bool = false;
      scene2_bool = false;
      scene3_bool = false;
      scene4_bool = false;
      scene5_bool = false;
      scene6_bool = false;
      restarted = true;
    }

    /*
     * VIDEO DIMS
     */
    if (progress > 0 && progress < dims1_end) {
      console.log("scene1dims");
      scene1VideoDims();
      // scene5VideoDims();
    } else if (progress > dims1_end && progress < dims2_end) {
      console.log("scene2dims");
      scene2VideoDims();
    } else if (progress > dims2_end && progress < dims3_end) {
      console.log("scene3dims");
      scene3VideoDims();
    } else if (progress > dims3_end && progress < dims4_end) {
      console.log("scene4dims");
      scene4VideoDims();
    } else if (progress > dims4_end && progress < dims5_end) {
      console.log("scene5dims");
      scene5VideoDims();
    }
    playVideoIfNotPlaying();
  }, 1000);
}
function scene0VideoDims() {
  console.log("scene0VideoDims");
}

function scene1VideoDims() {
  $(".videoContainerJuanExtra iframe").fadeOut(1000);
  $(".videoContainerIsaacExtra iframe").fadeOut(1000);
  var mainContainer = document.getElementById("mainContainer");
  mainContainer.style.padding = "0";
  var xJuan = document.getElementById("juanmain");
  var xIsaac = document.getElementById("isaacmain");
  let widthPixels = getPercentPixelsWidth(0.3);
  let topPixels = getPercentPixelsHeight(0.08);
  xJuan.style.width = widthPixels;
  xJuan.style.height = widthPixels;
  xJuan.style.top = topPixels;
  xIsaac.style.width = widthPixels;
  xIsaac.style.height = widthPixels;
  xIsaac.style.top = topPixels;
  document.getElementById("video_Juan").style.right = "0%";
  document.getElementById("video_Isaac").style.left = "0%";
  document.getElementById("juanmain").style.right = "0%";
  document.getElementById("isaacmain").style.left = "0%";
  sizeTheVideo();
  scene_num = 1;
}

function scene2VideoDims() {
  // Make both videos wider.
  $(".videoContainerJuanExtra iframe").fadeOut(1000);
  $(".videoContainerIsaacExtra iframe").fadeOut(1000);
  var xJuan = document.getElementById("juanmain");
  var xIsaac = document.getElementById("isaacmain");
  let widthPixels = getPercentPixelsWidth(0.4);
  xJuan.style.width = widthPixels;
  xIsaac.style.width = widthPixels;
  scene_num = 2;
}

function scene3VideoDims() {
  var mainContainer = document.getElementById("mainContainer");
  mainContainer.style.padding = "3% 0 0 0";
  let xJuan = document.getElementById("juanmain");
  let xIsaac = document.getElementById("isaacmain");
  let widthPixels = getPercentPixelsWidth(0.3);
  let heightPixels = getPercentPixelsWidth(0.17);
  let topPixels = getPercentPixelsWidth(0.01);
  xJuan.style.height = heightPixels;
  xJuan.style.width = widthPixels;
  xJuan.style.top = topPixels;
  xIsaac.style.height = heightPixels;
  xIsaac.style.width = widthPixels;
  xIsaac.style.top = topPixels;

  var xJuanExtra = document.getElementById("juanextra");
  var xIsaacExtra = document.getElementById("isaacextra");
  xJuanExtra.style.width = "300px";
  xJuanExtra.style.height = "300px";
  xJuanExtra.style.top = "100px";
  xJuanExtra.style.right = "80%";
  xIsaacExtra.style.width = "300px";
  xIsaacExtra.style.height = "300px";
  xIsaacExtra.style.top = "100px";
  xIsaacExtra.style.left = "80%";

  sizeTheVideo();
  scene_num = 3;
}

function scene4VideoDims() {
  $(".videoContainerJuanExtra iframe").fadeOut(4000);
  $(".videoContainerIsaacExtra iframe").fadeOut(4000);
  var xJuan = document.getElementById("juanmain");
  var xIsaac = document.getElementById("isaacmain");
  let widthPixels = getPercentPixelsWidth(0.46);
  let heightPixels = getPercentPixelsWidth(0.25);
  let topPixels = getPercentPixelsWidth(0.08);
  xJuan.style.width = widthPixels;
  xJuan.style.height = heightPixels;
  xJuan.style.top = topPixels;
  xIsaac.style.width = widthPixels;
  xIsaac.style.height = heightPixels;
  xIsaac.style.top = topPixels;
  document.getElementById("juanmain").style.right = "2%";
  document.getElementById("isaacmain").style.left = "2%";
  sizeTheVideo();
  scene_num = 4;
}

function scene5VideoDims() {
  var mainContainer = document.getElementById("mainContainer");
  mainContainer.style.padding = "3% 0 0 0";
  var xJuan = document.getElementById("juanmain");
  var xIsaac = document.getElementById("isaacmain");
  let widthPixels = getPercentPixelsWidth(0.2);
  // let heightPixels = getPercentPixelsWidth(0.15);
  let heightPixels = getPercentPixelsWidth(0.2);
  xJuan.style.right = "0";
  xIsaac.style.left = "0";
  xJuan.style.width = widthPixels;
  xJuan.style.height = heightPixels;
  xJuan.style.top = 0;
  xIsaac.style.width = widthPixels;
  xIsaac.style.height = heightPixels;
  xIsaac.style.top = 0;

  var mainContainer2 = document.getElementById("mainContainer2");
  mainContainer2.style.padding = 0;
  var xJuanExtra = document.getElementById("juanextra");
  var xIsaacExtra = document.getElementById("isaacextra");
  xJuanExtra.style.width = widthPixels;
  xJuanExtra.style.height = heightPixels;
  xJuanExtra.style.top = 0;
  xJuanExtra.style.right = "0%";
  xIsaacExtra.style.width = widthPixels;
  xIsaacExtra.style.height = heightPixels;
  xIsaacExtra.style.top = 0;
  xIsaacExtra.style.left = "0%";
  sizeTheVideo();
  scene_num = 5;
}

//////// [Quality of life functions] ///////////////////////
function sizeTheVideo() {
  // - 1.78 is the aspect ratio of the video
  // - This will work if your video is 1920 x 1080
  // - To find this value divide the video's native width by the height eg 1920/1080 = 1.78
  var aspectRatio = 1.78;

  var video = $(".videoContainerJuanMain iframe");
  var videoHeight = video.outerHeight();
  var newWidth = videoHeight * aspectRatio;
  var halfNewWidth = newWidth / 2;

  //Define the new width and centrally align the iframe
  video.css({
    width: newWidth + "px",
    left: "50%",
    "margin-left": "-" + halfNewWidth + "px",
  });

  var video2 = $(".videoContainerIsaacMain iframe");
  var videoHeight2 = video2.outerHeight();
  var newWidth2 = videoHeight2 * aspectRatio;
  var halfNewWidth2 = newWidth2 / 2;

  //Define the new width and centrally align the iframe
  video2.css({
    width: newWidth2 + "px",
    left: "50%",
    "margin-left": "-" + halfNewWidth2 + "px",
  });

  var video3 = $(".videoContainerJuanExtra iframe");
  var videoHeight3 = video3.outerHeight();
  var newWidth3 = videoHeight3 * aspectRatio;
  var halfNewWidth3 = newWidth3 / 2;

  //Define the new width and centrally align the iframe
  video3.css({
    width: newWidth3 + "px",
    left: "50%",
    "margin-left": "-" + halfNewWidth3 + "px",
  });

  var video4 = $(".videoContainerIsaacExtra iframe");
  var videoHeight4 = video4.outerHeight();
  var newWidth4 = videoHeight4 * aspectRatio;
  var halfNewWidth4 = newWidth4 / 2;

  //Define the new width and centrally align the iframe
  video4.css({
    width: newWidth4 + "px",
    left: "50%",
    "margin-left": "-" + halfNewWidth4 + "px",
  });
}

function fadeVolume(player, volume_goal, transitionTime, step = 1) {
  let player_vol;
  player_vol = player.getVolume();
  var time_delay = transitionTime / (Math.abs(volume_goal - player_vol) / step);
  function fadeInVolume() {
    vol_diff = Math.abs(volume_goal - player_vol);
    if (vol_diff > 1) {
      if (volume_goal > player_vol) {
        player_vol += step;
      } else if (volume_goal < player_vol) {
        player_vol -= step;
      }

      player.setVolume(player_vol);
      console.log("volume: " + player_vol);
      setTimeout(fadeInVolume, time_delay);
      return;
    } else {
      player.setVolume(volume_goal);
      console.log("Finished fading");
    }
  }
  fadeInVolume();
}

function getPercentPixelsWidth(factor) {
  let pixelsWidth = $(window).width() * factor;
  return pixelsWidth;
}

function getPercentPixelsHeight(factor) {
  let pixelsHeight = $(window).height() * factor;
  return pixelsHeight;
}

/*
 * A basic video transition of one video to another.
 */
function basicVideoTransition(
  player,
  selectorString,
  videoIDString,
  start,
  end,
  fadeoutMultiplier = 1.0,
  fadeinMultiplier = 1.0
) {
  // fade out image
  $(selectorString).fadeOut(6000 * fadeoutMultiplier);
  // fade out volume
  fadeVolume(player, 0, 6000 * fadeoutMultiplier, 1);
  // setTimeout set to activate when video is completely faded out.
  setTimeout(function () {
    // load video when faded out.
    player.loadVideoById({
      videoId: videoIDString,
      startSeconds: start,
      endSeconds: end,
    });
    // 4.5 seconds after loading, fade it in.
    setTimeout(function () {
      $(selectorString).fadeIn(6000 * fadeinMultiplier);
      fadeVolume(player, 30, 6000 * fadeoutMultiplier, 1);
    }, 6500);
  }, 6000 * fadeoutMultiplier);
}

function videoTransition(
  player,
  selectorString,
  delay,
  fadeoutMultiplier,
  fadeinMultiplier,
  fadeSound = true
) {
  // Fade out image.
  $(selectorString).fadeOut(6000 * fadeoutMultiplier);
  // fade out volume
  if (fadeSound) {
    fadeVolume(player, 0, 6000 * fadeoutMultiplier, 1);
  }
  // Fade in.
  setTimeout(function () {
    $(selectorString).fadeIn(6000 * fadeinMultiplier);
    if (fadeSound) {
      fadeVolume(player, 30, 6000 * fadeinMultiplier, 1);
    }
  }, 6000 * fadeoutMultiplier + delay);
}

function playVideoIfNotPlaying() {
  // If video is not playing, play it.
  juanState = player_Juan.getPlayerState();
  isaacState = player_Isaac.getPlayerState();
  juanExtraState = player_Juan_extra1.getPlayerState();
  isaacExtraState = player_Isaac_extra1.getPlayerState();
  if (juanState == -1 || juanState == 5) {
    player_Juan.playVideo();
  }
  if (isaacState == -1 || isaacState == 5) {
    player_Isaac.playVideo();
  }
  if (juanExtraState == 1) {
    // Playlist videos fade out when need to transition.
    juanExtraDuration = player_Juan_extra1.getDuration();
    juanCurrentTime = player_Juan_extra1.getCurrentTime();

    console.log(
      "durationJ: " +
        juanExtraDuration +
        ", juanCurrentTime: " +
        juanCurrentTime
    );
    if (juanCurrentTime > juanExtraDuration * 0.94) {
      console.log("playlist transition..");
      videoTransition(
        player_Juan_extra1,
        ".videoContainerJuanExtra iframe",
        6000,
        0.25,
        1.0
      );
    }
  }
  if (isaacExtraState == 1) {
    // Playlist videos fade out when need to transition.
    isaacExtraDuration = player_Isaac_extra1.getDuration();
    isaacCurrentTime = player_Isaac_extra1.getCurrentTime();

    if (isaacCurrentTime > isaacExtraDuration * 0.94) {
      console.log("playlist transition..");
      videoTransition(
        player_Isaac_extra1,
        ".videoContainerIsaacExtra iframe",
        6000,
        0.25,
        1.0
      );
    }
  }
}

// url = "http://localhost:5000/output";
// // url = "https://suncycles-phages.herokuapp.com/output";
// date = "";
// brightness = 0;
// progress = 0.0;

// brightness_interval = setInterval(() => {
//   fetch(url)
//     .then(res => res.json())
//     .then(out => {
//       brightness = out["brightness"];
//       progress = out["progress"];
//     })
//     .catch(err => {
//       throw err;
//     });
// }, 2000);
