import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  runTransaction,
  setDoc,
  CollectionReference,
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

async function submitPoints(points: number) {
  if (points === 0) {
    return;
  }

  try {
    await addDoc(collection(db, "inputs"), {
      "ipm-id": ipmId,
      "points": points
    });

    document.querySelector<HTMLInputElement>("#points")!.value = "0";
    document.querySelector<HTMLOutputElement>("#points-output")!.value = "0";
    console.log("Transaction successfully committed!");
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
}

async function clearPoints() {
  const q = query(collection(db, "inputs"), where("ipm-id", "==", ipmId));
  await getDocs(q).then((querySnapshot) => {
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref)
    });
  });
}

document.querySelector("#submit")!.addEventListener("click", () => {
  const points = parseFloat(
    document.querySelector<HTMLInputElement>("#points")!.value
  );
  submitPoints(points);
});

document.querySelector("#clear")!.addEventListener("click", () => {
  clearPoints();
});

document.querySelector("#points")!.addEventListener("input", (e) => {
  const points = parseFloat((e.target as HTMLInputElement).value);
  document.querySelector<HTMLOutputElement>("#points-output")!.value =
    points.toString();
});


const q = query(collection(db, "inputs"), where("ipm-id", "==", ipmId));
onSnapshot(q, (querySnapshot) => {
  var totalPoints = 0;
  var numInputs = 0;
  querySnapshot.forEach((doc) => {
    var points = doc.data().points;
    totalPoints += points;
    numInputs += 1;
  });

  if (numInputs === 0) {
    document.querySelector<HTMLOutputElement>("#average-points")!.value = "0";
    return;
  }

  document.querySelector<HTMLOutputElement>("#average-points")!.value = (
    Math.round((totalPoints / numInputs) * 100) / 100
  ).toString();

});