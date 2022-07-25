const express = require('express');
const axios = require('axios');
const fs = require("fs"); 
var SibApiV3Sdk = require('sib-api-v3-sdk');

const app = express();
const jsonParser = express.json();

const cgUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=uah' // Посилання, щоб отримати актуальний курс в грн
const db = './emails.txt'; // Адрес файла, який ми будемо використовувати, як БД

// Сервіс для відправки листів sendinblue.com
const API_KEY = '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'
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = API_KEY;

// Перевіряємо чи існує наша БД (файлова)
if(!fs.existsSync(db)) {
	fs.writeFile(db, '', (err) => {
		if (err) throw err;
	});
}


// Функція, яка отримує актуальну ціну біткоїна
async function getBTCprice() {
	try {
	    const body = await axios.get(cgUrl);
	    return body.data.bitcoin['uah'].toString();
	}
	catch (e) { // Якщо помилка вертаємо "null"
		return null;
	}
}

// Функція, яка отримує дані з файлової БД
function readDB() {
	var subscribers = fs.readFileSync(db, "utf8",{ flag: 'wx' }).toString().split("\n");
	if(subscribers[0] == '') subscribers = [];
	return subscribers;
}

app.get('/api/rate', async (req, res) => { 
	var price = await getBTCprice(); // Отримуємо ціну бтс
	if(price) {
		res.status(200).send(price); // Вертаємо користувачеві ціну
	} else {
		res.status(400).send(); // У разі помилки вертаємо статус 400
	}
});

app.post("/api/subscribe", jsonParser, (req, res) => {
	if(!req.body) return res.sendStatus(400);
	var email = req.body.email;
	var subscribers = readDB();

	if(!subscribers.includes(email)){ // Провіряємо чи пошта вже є в списку
		subscribers.push(email);
	    fs.writeFileSync(db, subscribers.join('\n')); // Якщо немає, то записуємо
	    res.status(200).send();
	}
	else{
	    res.status(409).send(); // Якщо є, то вертаємо 409
	}
});

app.post("/api/sendEmails", async (req, res) => {
	var subscribers = readDB();
	var price = await getBTCprice(); // Отримуємо ціну бтс
	for(subscriber in subscribers){ // Для відправки використовую сервіс sendinblue.com
		// Також щоб, не робити Bulk Email, то для кожного відправляємо лист окремо
		new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
			"sender":{ "email":"genesistestcase@gmail.com", "name":"Тестове завдання - Ігор Дмитров"},
			"subject":"Актуальна ціна біткоїна",
			"textContent": price,
			'to' : [{'email': subscribers[subscriber]}],
		}).then(function(data) {
		console.log(data);
		}, function(error) {
		console.error(error);
		});
	}
	res.status(200).send();

});

app.listen(80, () => {
    console.log('Application listening on port 80!');
});