import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  deleteDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBB0x8USzICIxzLPlufjaUZEnU1it-YKFk",
  authDomain: "ipm-vote.firebaseapp.com",
  projectId: "ipm-vote",
  storageBucket: "ipm-vote.appspot.com",
  messagingSenderId: "993739093616",
  appId: "1:993739093616:web:582b89ac77563c67f926b5",
  measurementId: "G-0TCXQDZZHP"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const url = new URL(window.location.href);
const ipmId = url.searchParams.get("ipm-id");

if (ipmId === null || ipmId === "") {
  window.location.replace("/index.html");
}

var fibbonaci = function (n: number): number {
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  return fibbonaci(n - 1) + fibbonaci(n - 2);
};

async function submitPoints(points: number) {
  if (points === 0) {
    return;
  }

  try {
    await addDoc(collection(db, "inputs"), {
      "ipm-id": ipmId,
      points: points
    });

    document.querySelector<HTMLInputElement>("#points")!.value = "0";
    document.querySelector<HTMLOutputElement>("#points-output")!.value = "0";
    console.log("Transaction successfully committed!");
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
}

async function clearPoints() {
  if (confirm("Clear all points?")) {
    const q = query(collection(db, "inputs"), where("ipm-id", "==", ipmId));
    await getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    });
  }
}

document.querySelector("#submit")!.addEventListener("click", () => {
  const points = parseFloat(
    document.querySelector<HTMLInputElement>("#points")!.value
  );
  submitPoints(fibbonaci(points));
});

document.querySelector("#clear")!.addEventListener("click", () => {
  clearPoints();
});

document.querySelector("#points")!.addEventListener("input", (e) => {
  const points = parseFloat((e.target as HTMLInputElement).value);
  document.querySelector<HTMLOutputElement>("#points-output")!.value =
    fibbonaci(points).toString();
});

var mode = function (arr: number[]): number {
  var newarr = arr.slice();
  newarr.sort((a, b) => a - b);
  var modeMap: { [key: number]: number } = {};
  var maxEl = newarr[0],
    maxCount = 1;
  for (var i = 0; i < newarr.length; i++) {
    var el = newarr[i];
    if (modeMap[el] == null) modeMap[el] = 1;
    else modeMap[el]++;
    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    } else if (modeMap[el] === maxCount) {
      maxEl = Math.min(maxEl, el);
    }
  }
  return maxEl;
};

const q = query(collection(db, "inputs"), where("ipm-id", "==", ipmId));
onSnapshot(q, (querySnapshot) => {
  var allPoints: number[] = [];
  var numInputs = 0;
  querySnapshot.forEach((doc) => {
    var points = doc.data().points;
    allPoints.push(points);
    numInputs++;
  });

  if (numInputs === 0) {
    document.querySelector("#points-list")!.innerHTML =
      "Inputs will appear here";
    document.querySelector<HTMLOutputElement>("#num-points")!.value = "0";
    document.querySelector<HTMLOutputElement>("#mode-points")!.value = "0";
    document.querySelector<HTMLOutputElement>("#min-points")!.value = "0";
    document.querySelector<HTMLOutputElement>("#max-points")!.value = "0";
    return;
  }

  allPoints.sort((a, b) => a - b);

  var modePoints = mode(allPoints)!;
  var minPoints = allPoints[0];
  var maxPoints = allPoints[allPoints.length - 1];

  document.querySelector("#points-list")!.innerHTML = allPoints
    .toString()
    .replaceAll(",", ", ");
  document.querySelector<HTMLOutputElement>("#num-points")!.value =
    numInputs.toString();
  document.querySelector<HTMLOutputElement>("#mode-points")!.value =
    modePoints.toString();
  document.querySelector<HTMLOutputElement>("#min-points")!.value =
    minPoints.toString();
  document.querySelector<HTMLOutputElement>("#max-points")!.value =
    maxPoints.toString();
});
