// declare 宣告
// assign

// GET, POST, PUT/PATCH, DELETE => HTTP Method
// Read, Create, Update, Delete => CRUD

// Selenium
const { getElements } = require('domutils');
const { Builder, By, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function crawl(numOfJobs){
  //const driver = await new Builder().forBrowser('chrome').build();
  
  const service = await new chrome.ServiceBuilder('/Users/vicky/Desktop/chromedriver_mac64/chromedriver').build();
  let options = await new chrome.Options()
	let driver = await chrome.Driver.createSession(options, service);

  // open a website
  await driver.get("https://www.104.com.tw/jobs/main/");

  const searchArea = await driver.findElement(By.xpath('//*[@id="icity"]'));
  await searchArea.click();

  await driver.sleep(2000);

  const searchTp= await driver.findElement(By.xpath('/html/body/div[12]/div/div[2]/div/div[2]/div[2]/div/li[1]/a/span[1]/input'));
  await searchTp.click();
 
  const searchConer=await driver.findElement(By.xpath('/html/body/div[12]/div/div[2]/div/div[3]/button'));
  await searchConer.click();

  const searchPart=await driver.findElement(By.xpath('//*[@id="ijob"]'));
  await searchPart.click();

  await driver.sleep(1000);

  const searchjob=await driver.findElement(By.xpath('/html/body/div[12]/div/div[2]/div/div[2]/div[1]/li[11]/a'));
  await searchjob.click();

  const searchArt=await driver.findElement(By.xpath('/html/body/div[12]/div/div[2]/div/div[2]/div[2]/div/li[1]/a/span[1]/input'));
  await searchArt.click();
  await searchConer.click();
   
  const searchInput = await driver.findElement(By.xpath('//*[@id="ikeyword"]'));
  await searchInput.sendKeys("UI");
  
  const searchBtn= await driver.findElement(By.xpath('/html/body/article[1]/div/div/div[4]/div/button'));
  await searchBtn.click();

  

  var resObjs = []; // store many jobs detail // array
  for(let i=1; i<=numOfJobs; i++)
  {
    let resObj = {}; // object
    let xpath = `//*[@id="js-job-content"]/article[${i}]/div[1]/h2/a`;
    
    let titleEle = await driver.findElement(By.xpath(xpath));
    let title = await titleEle.getText();
    resObj["title"] = title;

    // use driver navigate to change page or it will remain in the original page
    // need to navigate back or you can store all the link in an array then navigate
    // await titleEle.click(); //enter into jobs detail, use navigate, instead
    let url = await titleEle.getAttribute("href");   
    resObj["104url"] = url; 
    driver.navigate().to(url);

    await driver.manage().setTimeouts( { implicit: 10000 } );

    let seniorityEle = await driver.findElement(By.xpath('//*[@id="app"]/div/div[2]/div/div[1]/div[2]/div[2]/div[1]/div[2]/div'));
    let seniority= await seniorityEle.getText();
    resObj["seniority"] = seniority;

    let salaryEle = await driver.findElement(By.xpath('//*[@id="app"]/div/div[2]/div/div[1]/div[1]/div[2]/div[3]/div[2]/div/p'));
    let salary=await salaryEle.getText();
    resObj["salary"]=salary;

    let locationEle = await driver.findElement(By.xpath('//*[@id="app"]/div/div[2]/div/div[1]/div[1]/div[2]/div[5]/div[2]/div/div/span[1]'));
    let location= await locationEle.getText();
    resObj["location"]=location;

    let updateEle = await driver.findElement(By.xpath('//*[@id="app"]/div/div[1]/div[2]/div/div/div[1]/h1/span/span'));
    let update= await updateEle.getText();
    resObj["update"]=update;


    /*
    {
      "title": "國際部_數位廣告短影片製作人員F",
      "salary": ...
    }
    */

    resObjs.push(resObj);

    await driver.navigate().back();
    await driver.manage().setTimeouts( { implicit: 10000 } );
  }

  return resObjs;

  //*[@id="js-job-content"]/article[1]/div[1]/h2/a
  //*[@id="js-job-content"]/article[2]/div[1]/h2/a
  //*[@id="js-job-content"]/article[3]/div[1]/h2/a

  //await driver.quit();
};

// Firebase
// initialization
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

var serviceAccount = require("/Users/vicky/Desktop/104Hunter/Crawler/hunter-26808-firebase-adminsdk-ogx26-ca7a177b05.json");
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// CRUD => Create, Retreive, Update, Delete
// testing get data
// async function getData()
// {
//   const stuRef = db.collection('Students');
//   const snapshot = await stuRef.where('name','==','Jack').get();

//   if(snapshot.empty)
//   {
//     console.log("empty !");
//   }else{
//     snapshot.forEach(doc => {
//       console.log(doc.id, "=>", doc.data());
//     })
//   }
// }

// getData();

// async function setData()
// {
//   const newsRef = db.collection("Students");
//   await newsRef.doc("news").set({
//     mobile: "0900" , 
//     FB:"www.facebook.com",
//     Email:"waymaymay@gmail.com"
//   })
// }
// setData();

// Async => async,await ; Prmoise
// 1. crawl the job data
const crawlDataNums = 10;
crawl(crawlDataNums)
.then(async (jobsDetails) => {
  //console.log(jobsDetails); // array
  // for(let i=0; i<jobsDetails.length; i++)
  // {
  //   console.log(`${jobsDetails[i].title}-${i}`);
  // }

  // 2. delete original data if they exist
  let jobRef = db.collection("Jobs"); // get the Jobs collection
  let snapshot = await jobRef.get(); // get all the documents(datas) in the collection store into a snapshot
  const batch = db.batch(); // batch => a container of writing command
  snapshot.docs.forEach(doc => { // read each data in Jobs collection
    batch.delete(doc.ref); // store the delete command into batch
  });
  await batch.commit(); // commit command

  // 3. store into database
  const jobsRef = db.collection("Jobs"); // will automatically create a collection if the given don't exist
  for(let i=0; i<jobsDetails.length; i++){
    title = jobsDetails[i].title.replaceAll("/", "-");
    await jobsRef.doc(`${title}-${i}`).set(jobsDetails[i])
  }

  console.log(`Successfully insert ${jobsDetails.length} datas`);
}); // call function <-- entry point

/*
var let const

array, object
[]     {}

[12, 25, "abc", {"name": "mary"}, [1.2, 4]]
{
  "name": "mary",
  "age": 12
}

function(a,b,c){}, (a,b,c) => {}

async await, (some async function...).then(()=>{})
*/
