import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  runTransaction,
  setDoc,
  CollectionReference,
  onSnapshot
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

const ipmsRef = collection(db, "ipms") as CollectionReference<{
  numInputs: number;
  totalPoints: number;
}>;

const url = new URL(window.location.href);
const ipmId = url.searchParams.get("ipm-id");

if (ipmId === null || ipmId === "") {
  window.location.replace("/index.html");
}

const ipmRef = doc(ipmsRef, ipmId!);

try {
  await runTransaction(db, async (transaction) => {
    const ipmDocSnapshot = await transaction.get(ipmRef);

    if (!ipmDocSnapshot.exists()) {
      transaction.set(ipmRef, {
        numInputs: 0,
        totalPoints: 0
      });
    }
  });
} catch (e) {
  console.log("Transaction failed: ", e);
}

async function submitPoints(points: number) {
  if (points === 0) {
    return;
  }

  try {
    await runTransaction(db, async (transaction) => {
      const ipmDocSnapshot = await transaction.get(ipmRef);
      if (!ipmDocSnapshot.exists()) {
        throw "Document does not exist!";
      }

      const numInputs = ipmDocSnapshot.data().numInputs + 1;
      const totalPoints = ipmDocSnapshot.data().totalPoints + points;
      transaction.update(ipmRef, {
        numInputs: numInputs,
        totalPoints: totalPoints
      });
    });

    document.querySelector<HTMLInputElement>("#points")!.value = "0";
    console.log("Transaction successfully committed!");
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
}

function clearPoints() {
  setDoc(ipmRef, {
    numInputs: 0,
    totalPoints: 0
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

onSnapshot(ipmRef, (snapshot) => {
  const data = snapshot.data()!;

  if (data.numInputs === 0) {
    document.querySelector<HTMLOutputElement>("#average-points")!.value = "0";
    return;
  }

  document.querySelector<HTMLOutputElement>("#average-points")!.value = (
    data.totalPoints / data.numInputs
  ).toString();
});