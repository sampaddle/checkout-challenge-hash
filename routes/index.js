var app = require('express');
var router = app.Router();
const serial = require("generate-serial-key");
const crypto = require('crypto');
const Serialize = require('php-serialize');
const bodyParser = require("body-parser");
const { resolveInclude } = require('ejs');
const axios = require('axios');
const { resolveNaptr } = require('dns');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/hello', function(req, res) {

  if (validateWebhook(req.body)) {
    console.log('WEBHOOK_VERIFIED');
    const serial_no = serial.generate();
    console.log(serial_no);
    res.send('I can send anything I want back');
  } else {
    res.sendStatus(403);
    console.log('WEBHOOK_NOT_VERIFIED')
  }

// const serial_no = serial.generate();
// console.log(serial_no);
// console.log(req.body);
// res.send('I can send anything I want back');
})


router.post('/checkout', function (req, res) {
  console.log(req.body.hash);
  axios.get(`https://sandbox-checkout.paddle.com/api/1.0/order/?checkout_id=${req.body.hash}`)
  .then((response) => {
    console.log(response.data);
    console.log(response.data.order.receipt_url);
    console.log(response.data.order.customer.email);
    console.log(response.data.order.total);
    console.log(response.data.order.currency);
    console.log(response.data.lockers[0].license_code);

    res.send({
      receipt_url: response.data.order.receipt_url,
      email: response.data.order.customer.email,
      total: response.data.order.total,
      currency: response.data.order.currency,
      license_code: response.data.lockers[0].license_code
    });
  })
})

//how I think this will work
// 1. force redirect from purchase page on checkout complete, passing in checkout hash via url
// 2. in the thanks route, use the checkout hash to make the API call ( no front end required)
// 3. use templating language to fill in the pieces of data. 

router.get('/thanks', function (req, res) {
  res.render('thanks', {test: "this is a test object"});
  console.log(req.query.id);
})

// Public key from your paddle dashboard
const pubKey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAri83OzWHRny/VBSTzIPM
gla3t4YAbRFciQWet1zJ7Z1e43w4MXpKxvAtttO2oiZoY5T/q/tLUmcO35rwHkm0
e5dShjPjcBykXPM2bL/p9/k98sCqcCGAKLl0Z48KHrU3Xk6nqia+GkxkpehJarl4
XwpDYXvdrmXltRNdr4vpN9qr96Nay2//anWU3zz7azb4QFhOeAfXPv1KQAbkanG3
6RxZodm0CnFnmvyTCpYkUP41+cD3+6P6Y2f2dc1JGWkXTj6Noit99bPCdOP5VHLR
1JTfCqC9JaJfpgLQ9uCGNej9b02gjye8/Vn0n+rSCDTKJ32M5VVH4pgs8/6wq5Qy
RqbXC6JrV/Mem3zsplljMO9Kajdq+dSJ8PKE9l3QKhViKOtWJlJellrJpKJp/pWq
HDXuZqoPAGK3h7AMU4hqGxJLDLkZY+GZPHXjeAgHpdAR5zhVhVuRA+Dp1XhdytCU
/y5FMbTcjSKXT8de48PjaS/O2RWoKP5gr9tbKcvDgbV7NzdJJpLpvd6zCMxkMlIz
JNoXIPSuvbg2yHYfxmfAsxB5iMzqHLvq1mf7shO5PCeWX1w2lJFsCYX+qgvOba4+
Q6eJkHsq9M1WNg5n6N3pPLs+AUnlsFAx43p10sOoHv3qdhyBUv/SCDTifl6pHGg/
20sSRVNh3ydIER4xjsdlMD8CAwEAAQ==
-----END PUBLIC KEY-----`

function ksort(obj){
  const keys = Object.keys(obj).sort();
  let sortedObj = {};
  for (let i in keys) {
    sortedObj[keys[i]] = obj[keys[i]];
  }
  return sortedObj;
}

function validateWebhook(jsonObj) {
  // Grab p_signature
  const mySig = Buffer.from(jsonObj.p_signature, 'base64');
  // Remove p_signature from object - not included in array of fields used in verification.
  delete jsonObj.p_signature;
  // Need to sort array by key in ascending order
  jsonObj = ksort(jsonObj);
  for (let property in jsonObj) {
      if (jsonObj.hasOwnProperty(property) && (typeof jsonObj[property]) !== "string") {
          if (Array.isArray(jsonObj[property])) { // is it an array
              jsonObj[property] = jsonObj[property].toString();
          } else { //if its not an array and not a string, then it is a JSON obj
              jsonObj[property] = JSON.stringify(jsonObj[property]);
          }
      }
  }
  // Serialise remaining fields of jsonObj
  const serialized = Serialize.serialize(jsonObj);
  // verify the serialized array against the signature using SHA1 with your public key.
  const verifier = crypto.createVerify('sha1');
  verifier.update(serialized);
  verifier.end();

  const verification = verifier.verify(pubKey, mySig);
  // Used in response if statement
  return verification;
}

module.exports = router;
