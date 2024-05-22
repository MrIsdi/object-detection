// Navigate component start
let btnComponentWebcam = document.getElementById("btn-component-webcam"),
  btnComponentImage = document.getElementById("btn-component-image"),
  componentWebcam = document.getElementById("component-webcam"),
  componentImage = document.getElementById("component-image");

btnComponentWebcam.onclick = () => {
  componentWebcam.classList.add("flex");
  componentWebcam.classList.remove("hidden");
  componentImage.classList.add("hidden");
  componentImage.classList.remove("flex");
};
btnComponentImage.onclick = () => {
  componentWebcam.classList.remove("flex");
  componentWebcam.classList.add("hidden");
  componentImage.classList.remove("hidden");
  componentImage.classList.add("flex");
};
// Navigate component end

// Aside menu start
let btnAsideMenu = document.getElementById("btn-aside-menu"),
  btnMenu = document.getElementById("btn-menu"),
  asideMenu = document.getElementById("aside-menu"),
  mainMenu = document.getElementById("main-menu");

window.onresize = () => {
  console.log(window.innerWidth == 375);
};
btnAsideMenu.onclick = () => {
  if (window.innerWidth <= 768) {
    if (asideMenu.classList.toString().includes("left-[-100%]")) {
      asideMenu.classList.replace("left-[-100%]", "left-0");
    } else if (asideMenu.classList.toString().includes("left-0")) {
      asideMenu.classList.replace("left-0", "left-[-100%]");
    }
  } else {
    if (asideMenu.classList.toString().includes("md:left-0")) {
      asideMenu.classList.replace("md:left-0", "md:left-[-100%]");
      mainMenu.classList.replace("md:left-[286px]", "md:left-0");
      mainMenu.classList.replace("md:w-[calc(100%-286px)]", "md:w-full");
    } else if (asideMenu.classList.toString().includes("md:left-[-100%]")) {
      asideMenu.classList.replace("md:left-[-100%]", "md:left-0");
      mainMenu.classList.replace("md:left-0", "md:left-[286px]");
      mainMenu.classList.replace("md:w-full", "md:w-[calc(100%-286px)]");
    }
  }
};
btnMenu.onclick = () => {
  if (window.innerWidth <= 768) {
    if (asideMenu.classList.toString().includes("left-[-100%]")) {
      asideMenu.classList.replace("left-[-100%]", "left-0");
    } else if (asideMenu.classList.toString().includes("left-0")) {
      asideMenu.classList.replace("left-0", "left-[-100%]");
    }
  } else {
    if (asideMenu.classList.toString().includes("md:left-0")) {
      asideMenu.classList.replace("md:left-0", "md:left-[-100%]");
      mainMenu.classList.replace("md:left-[286px]", "md:left-0");
      mainMenu.classList.replace("md:w-[calc(100%-286px)]", "md:w-full");
    } else if (asideMenu.classList.toString().includes("md:left-[-100%]")) {
      asideMenu.classList.replace("md:left-[-100%]", "md:left-0");
      mainMenu.classList.replace("md:left-0", "md:left-[286px]");
      mainMenu.classList.replace("md:w-full", "md:w-[calc(100%-286px)]");
    }
  }
};
// Aside menu end

// File image upload start
let btnFileImage = document.getElementById("btn-file-image"),
  fileImage = document.getElementById("file-image");

btnFileImage.onclick = () => {
  fileImage.click();
};

fileImage.onchange = () => {
  let file = fileImage.files[0];
  let reader = new FileReader();
  reader.onload = (e) => {
    let img = document.getElementById("image");
    img.src = e.target.result;
    img.classList.add("block");
    img.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
  console.log("image loaded");
};

// File image upload end

// Process data input start
function process_input(img = null, video = null, modelWidth, modelHeight) {
  const mat = img !== null ? cv.imread(img) : video;
  const matC3 = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC3); // new image matrix
  cv.cvtColor(mat, matC3, cv.COLOR_RGBA2BGR); // RGBA to BGR
  // padding image to [n x n] dim
  const maxSize = Math.max(matC3.rows, matC3.cols); // get max size from width and height
  const xPad = maxSize - matC3.cols, // set xPadding
    xRatio = maxSize / matC3.cols; // set xRatio
  const yPad = maxSize - matC3.rows, // set yPadding
    yRatio = maxSize / matC3.rows; // set yRatio
  const matPad = new cv.Mat(); // new mat for padded image
  cv.copyMakeBorder(matC3, matPad, 0, yPad, 0, xPad, cv.BORDER_CONSTANT); // padding black

  const input = cv.blobFromImage(
    matPad,
    1 / 255.0, // normalize
    new cv.Size(modelWidth, modelHeight), // resize to model input size
    new cv.Scalar(0, 0, 0),
    true, // swapRB
    false // crop
  ); // preprocessing image matrix

  // release mat opencv
  matC3.delete();
  matPad.delete();

  return [input, xRatio, yRatio];
}
// Process data input end

// Bounding box start
function boundingBox(canvas, boxes) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas

  const colors = new Colors();

  // font configs
  const font = `${Math.max(
    Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
    14
  )}px Arial`;
  ctx.font = font;
  ctx.textBaseline = "top";

  boxes.forEach((box) => {
    const klass = labels[box.label];
    const color = colors.get(box.label);
    const score = (box.probability * 100).toFixed(1);
    const [x1, y1, width, height] = box.bounding;

    // draw box.
    ctx.fillStyle = Colors.hexToRgba(color, 0.2);
    ctx.fillRect(x1, y1, width, height);
    // draw border box
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(
      Math.min(ctx.canvas.width, ctx.canvas.height) / 200,
      2.5
    );
    ctx.strokeRect(x1, y1, width, height);

    // draw the label background.
    ctx.fillStyle = color;
    const textWidth = ctx.measureText(klass + " - " + score + "%").width;
    const textHeight = parseInt(font, 10); // base 10
    const yText = y1 - (textHeight + ctx.lineWidth);
    ctx.fillRect(
      x1 - 1,
      yText < 0 ? 0 : yText,
      textWidth + ctx.lineWidth,
      textHeight + ctx.lineWidth
    );

    // Draw labels
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      klass + " - " + score + "%",
      x1 - 1,
      yText < 0 ? 1 : yText + 1
    );
  });
}
// Bounding box end

// Color start
class Colors {
  // ultralytics color palette https://ultralytics.com/
  constructor() {
    this.palette = [
      "#FF3838",
      "#FF9D97",
      "#FF701F",
      "#FFB21D",
      "#CFD231",
      "#48F90A",
      "#92CC17",
      "#3DDB86",
      "#1A9334",
      "#00D4BB",
      "#2C99A8",
      "#00C2FF",
      "#344593",
      "#6473FF",
      "#0018EC",
      "#8438FF",
      "#520085",
      "#CB38FF",
      "#FF95C8",
      "#FF37C7",
    ];
    this.n = this.palette.length;
  }

  get = (i) => this.palette[Math.floor(i) % this.n];

  static hexToRgba = (hex, alpha) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgba(${[
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ].join(", ")}, ${alpha})`
      : null;
  };
}
// Color end

// Label YOLO start
const labels = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign",
  "parking meter",
  "bench",
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
  "backpack",
  "umbrella",
  "handbag",
  "tie",
  "suitcase",
  "frisbee",
  "skis",
  "snowboard",
  "sports ball",
  "kite",
  "baseball bat",
  "baseball glove",
  "skateboard",
  "surfboard",
  "tennis racket",
  "bottle",
  "wine glass",
  "cup",
  "fork",
  "knife",
  "spoon",
  "bowl",
  "banana",
  "apple",
  "sandwich",
  "orange",
  "broccoli",
  "carrot",
  "hot dog",
  "pizza",
  "donut",
  "cake",
  "chair",
  "couch",
  "potted plant",
  "bed",
  "dining table",
  "toilet",
  "tv",
  "laptop",
  "mouse",
  "remote",
  "keyboard",
  "cell phone",
  "microwave",
  "oven",
  "toaster",
  "sink",
  "refrigerator",
  "book",
  "clock",
  "vase",
  "scissors",
  "teddy bear",
  "hair drier",
  "toothbrush",
];
// Label YOLO end

// Get data array unique start
function getUniqueValues(array, property) {
  const uniqueValues = [];
  const uniqueObject = {};

  array.forEach((item) => {
    const value = item[property];
    if (!uniqueObject[value]) {
      uniqueObject[value] = true;
      uniqueValues.push(item);
    }
  });

  return uniqueValues;
}

function countUniqueValues(array, property) {
  const counts = {};

  array.forEach((item) => {
    const value = item[property];
    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
}
// Get data array unique end

// Render card start
function renderCard(boxes) {
  const cardTitle = document.getElementById("card-title");
  cardTitle.classList.toggle("hidden");
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = "";
  const data = getUniqueValues(boxes, "label");
  const count = countUniqueValues(boxes, "label");
  if (window.innerWidth <= 768) {
    cardContainer.classList.add(`mb-${data.length * 12}`);
  }

  data.forEach(function (box) {
    cardContainer.innerHTML += `
        <div class="w-[200px] h-[250px] p-2 flex flex-col backdrop-blur bg-[rgba(255,255,255,0)] shadow-[0_4px_30px_rgba(0, 0, 0, 0.1)] border border-[rgba(255,255,255,0.3)] rounded-2xl">
        <p class="text-white font-bold text-center text-4xl py-4">${
          count[box.label]
        }</p>  
        <img
            src="https://source.unsplash.com/random/100×100/?${
              labels[box.label]
            }"
            alt=""
            class="w-[100px] h-[100px] object-cover rounded-full mb-4 mx-auto"
          />
          <div class="flex justify-between text-white font-bold">
            <p>${
              labels[box.label].charAt(0).toUpperCase() +
              labels[box.label].slice(1)
            }</p>
            <p>${(box.probability * 100).toFixed(1)}</p>
          </div>
        </div>;
        `;
  });
}
// Render card end

// Video capture start
let mediaStream;
let isCamera = false;
async function startVideo() {
  let video = document.getElementById("video");
  let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  if ("srcObject" in video) {
    video.srcObject = mediaStream;
    isCamera = true;
  } else {
    video.src = URL.createObjectURL(mediaStream);
  }
  video.onloadedmetadata = () => {
    video.play();
  };

  let cap = new cv.VideoCapture(video);
  if (isCamera) {
    setTimeout(() => {
      processVideo(frame, cap);
    }, 0);
  }
}
async function stopVideo(mediaStream) {
  mediaStream.getTracks().forEach((track) => {
    if (track.readyState == "live") {
      track.stop();
    }
  });
  isCamera = false;
}
// Video capture end

// Process video start
async function processVideo(frame, cap) {
  let begin = Date.now();
  const canvas = document.getElementById("canvas-video");
  const FPS = 30;
  cap.read(frame);
  const model = await ort.InferenceSession.create("../model/yolov8n.onnx");
  const nms = await ort.InferenceSession.create("../model/nms-yolov8.onnx");
  const [data, xRatio, yRatio] = process_input(
    (img = null),
    (video = frame),
    (modelWidth = 640),
    (modelHeight = 640)
  );
  const topk = 100;
  const iouThreshold = 0.45;
  const scoreThreshold = 0.25;
  const input = new ort.Tensor(
    Float32Array.from(data.data32F),
    [1, 3, 640, 640]
  );
  const config = new ort.Tensor(
    "float32",
    new Float32Array([topk, iouThreshold, scoreThreshold])
  );

  const { output0 } = await model.run({ images: input });
  const { selected } = await nms.run({
    detection: output0,
    config: config,
  });

  let boxes = [];
  for (let idx = 0; idx < selected.dims[1]; idx++) {
    const data = selected.data.slice(
      idx * selected.dims[2],
      (idx + 1) * selected.dims[2]
    ); // get rows
    const box = data.slice(0, 4);
    const scores = data.slice(4); // classes probability scores
    const score = Math.max(...scores); // maximum probability scores
    const label = scores.indexOf(score); // class id of maximum probability scores

    const [x, y, w, h] = [
      (box[0] - 0.5 * box[2]) * xRatio, // upscale left
      (box[1] - 0.5 * box[3]) * yRatio, // upscale top
      box[2] * xRatio, // upscale width
      box[3] * yRatio, // upscale height
    ]; // keep boxes in maxSize range

    boxes.push({
      label: label,
      probability: score,
      bounding: [x, y, w, h], // upscale box
    }); // update boxes to draw later
  }

  boxess = boxes;
  renderCard(boxes);
  boundingBox(canvas, boxes);
  data.delete();
  let delay = 1000 / FPS - (Date.now() - begin);
  if (isCamera) {
    setTimeout(() => {
      processVideo(frame, cap);
    }, delay);
  }
}
// Process video end

function onOpenCvReady() {
  cv["onRuntimeInitialized"] = () => {
    console.log("onOpenCvReady");

    document.getElementById("btn-show-image").onclick = async () => {
      const image = document.getElementById("image");
      const canvas = document.getElementById("canvas-image");

      const model = await ort.InferenceSession.create("../model/yolov8n.onnx");
      const nms = await ort.InferenceSession.create("../model/nms-yolov8.onnx");
      const [data, xRatio, yRatio] = process_input(
        (img = image),
        (video = null),
        (modelHeight = 640),
        (modelHeight = 640)
      );
      const topk = 100;
      const iouThreshold = 0.45;
      const scoreThreshold = 0.25;
      const input = new ort.Tensor(
        Float32Array.from(data.data32F),
        [1, 3, 640, 640]
      );
      const config = new ort.Tensor(
        "float32",
        new Float32Array([topk, iouThreshold, scoreThreshold])
      );

      const { output0 } = await model.run({ images: input });
      const { selected } = await nms.run({
        detection: output0,
        config: config,
      });

      let boxes = [];
      for (let idx = 0; idx < selected.dims[1]; idx++) {
        const data = selected.data.slice(
          idx * selected.dims[2],
          (idx + 1) * selected.dims[2]
        ); // get rows
        const box = data.slice(0, 4);
        const scores = data.slice(4); // classes probability scores
        const score = Math.max(...scores); // maximum probability scores
        const label = scores.indexOf(score); // class id of maximum probability scores

        const [x, y, w, h] = [
          (box[0] - 0.5 * box[2]) * xRatio, // upscale left
          (box[1] - 0.5 * box[3]) * yRatio, // upscale top
          box[2] * xRatio, // upscale width
          box[3] * yRatio, // upscale height
        ]; // keep boxes in maxSize range

        boxes.push({
          label: label,
          probability: score,
          bounding: [x, y, w, h], // upscale box
        }); // update boxes to draw later
      }

      renderCard(boxes);
      boundingBox(canvas, boxes);
      data.delete();
    };

    document.getElementById("btn-on-camera").onclick = async () => {
      await startVideo();
    };
    document.getElementById("btn-off-camera").onclick = async () => {
      await stopVideo(mediaStream);
    };
  };
}
