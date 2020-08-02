/*
  Copyright 2019 Square Inc.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
      http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const squareConnect = require('square-connect');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 8000;

// Set the Access Token
const accessToken = 'EAAAEJ8uno0ICFFjq8-i9GVzg0nlq-Ab22QJ2uIu9qObYbYjIIVklfGERhDODaN-';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

// Set Square Connect credentials and environment
const defaultClient = squareConnect.ApiClient.instance;

// Configure OAuth2 access token for authorization: oauth2
const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = accessToken;

// Set 'basePath' to switch between sandbox env and production env
// sandbox: https://connect.squareupsandbox.com
// production: https://connect.squareup.com
defaultClient.basePath = 'https://connect.squareupsandbox.com';

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//---NODEMAILER ---

async function mailerStart(){

  let transporter = nodemailer.createTransport({
    host: "mail.aboveall-media.tech",
    port: "465",
    secure: true,
      auth: {
        user: "media@aboveall-media.tech",
        pass: "WCKI9m%}uV,K"
      }
  });


  let info= {
    from: '"[MEDIA PORTAL DOWNLOAD]- Online Order" <media@aboveall-media.tech' ,
    to: "leatkins@aboveall-media.tech",
    subject: "::NEW ORDER - GENERATED::",
    html: "<h1>Order Information</h1><hr><h3>Version Downloaded: </h3><p>" + data.version + "<hr></p><p><strong>Customer Name: </strong>" +  data.fname + " " + data.lname + "</p><p><strong>E-mail Address: </strong> " + data.email + "</p>"

  }

  transporter.sendMail(info, function(err, data ){
    if (err){
      console.log("An Error occurred sending the email", err);
    }else {
      console.log("Email sucessfully delivered");
    }
  });
}



//--NODEMAILER - END ---

app.post('/customerInformation', urlencodedParser, function (req, res){
	console.log(req.body);
	data=req.body;

});

app.post('/process-payment', async (req, res) => {
  const request_params = req.body;
	console.log(req.body);



  // length of idempotency_key should be less than 45
  const idempotency_key = crypto.randomBytes(22).toString('hex');

  // Charge the customer's card
  const payments_api = new squareConnect.PaymentsApi();
  const request_body = {
    source_id: request_params.nonce,
    amount_money: {
      amount: req.body.amount, // $1.00 charge
      currency: 'USD'
    },
    idempotency_key: idempotency_key
  };

  try {
    const response = await payments_api.createPayment(request_body);
    res.status(200).json({
      'title': 'Payment Successful',
      'result': response
    });
	  mailerStart();
  } catch(error) {
    res.status(500).json({
      'title': 'Payment Failure',
      'result': error.response.text
    });
  }
});

app.listen(
  port,
  () => console.log(`listening on - http://localhost:${port}`)
);
