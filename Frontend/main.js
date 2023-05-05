const firebaseConfig = {
    apiKey: "AIzaSyAkOdaYrOQLwcdlL6ImP19-nQjAVe5pc2w",
    authDomain: "hunter-26808.firebaseapp.com",
    projectId: "hunter-26808",
    storageBucket: "hunter-26808.appspot.com",
    messagingSenderId: "579835832171",
    appId: "1:579835832171:web:1daaaecdef89f83b57ce2e",
    measurementId: "G-F4LS4GPEKQ"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

var ref = db.collection('Jobs');

ref.get().then(querySnapshot => {
  querySnapshot.forEach(doc => {
    var data = doc.data();

    // 1. build an html element
    var jobBox = `
        <div class="job-box">
            <div class="date">Date~</div>
            <div class="details">
                <div class="job-title">${data.title}</div>
                <div class="more">
                    <div class="text first">${data.seniority}</div>
                    <div class="text sec">${data.salary}</div>
                    <div class="text thir">${data.location}</div>
                </div>
            </div>   
        </div>
    `;

    // 2. insert html
    $('.job-groups').append(jobBox);

    console.log(doc.id, doc.data());
  });
});

