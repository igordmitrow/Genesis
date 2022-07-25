var request = require('request');

// request.post(
//     'http://localhost:80/api/subscribe',
//     { json: { email: 'purupuru137@gmail.com' } },
//     function (error, response, body) {
//         console.log(response.statusCode)
//         if (!error && response.statusCode == 200) {
//             console.log(body);
//         }
//     }
// );

request.post(
    'http://localhost:80/api/sendEmails',
    function (error, response, body) {
        console.log(response.statusCode)
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    }
);