/**
 * Created by derya on 06/11/13.
 */

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'app_user',
    password : '123$'
});

exports.read = function(callback){
    //connection.connect();


    connection.query('SELECT * from predictionAI.currencyhistorical order by Date Desc', function(err, rows, fields) {
        if (err) throw err;

        //console.log('The solution is: ', rows[0].solution);

        callback(rows);
    });

    //connection.end();
}
